import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  X, 
  Zap, 
  Square,
  Loader2,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';
import { speechController, SpeechStatus } from '../utils/speechController';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AskComputerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const AskComputerVoiceModal: React.FC<AskComputerProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
}) => {
  const [query, setQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>({
    isSpeaking: false,
    isSynthesizing: false,
    error: null,
  });
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Aoede');
  const [speechRate, setSpeechRate] = useState<number>(speechController.getSpeechRate());

  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'How does warp drive work compared to real physics?',
    'Is human quantum teleportation possible?',
    'Is antimatter real and how is it contained today?',
    'Why did Earth spices evolve capsaicin?',
    'Explain the Prime Directive vs NASA planetary protection',
    'Could dilithium exist in the real periodic table?',
  ];

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, streamingResponse]);

  // Subscribe to detailed global speech controller state & speed rate
  useEffect(() => {
    const unsubscribeStatus = speechController.subscribeDetailed((status) => {
      setSpeechStatus(status);
    });
    const unsubscribeRate = speechController.subscribeRate((r) => {
      setSpeechRate(r);
    });
    return () => {
      unsubscribeStatus();
      unsubscribeRate();
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          lcarsAudio.playChime();
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      speechController.stopAllSpeech();
    };
  }, []);

  // Seed initial topic only when opened with a specific topic
  useEffect(() => {
    if (initialTopic && isOpen) {
      setQuery(`Explain the scientific physics and canon of: ${initialTopic}`);
    }
  }, [initialTopic, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      lcarsAudio.playBeep(440, 0.08);
    } else {
      speechController.stopAllSpeech();
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const handleStopSpeech = () => {
    speechController.stopAllSpeech();
    lcarsAudio.playBeep(440, 0.05);
  };

  const handleSpeakText = (text: string) => {
    if (!text) return;
    lcarsAudio.playChime();
    speechController.speakText(text, selectedVoice);
  };

  // Ultra-Fast Real-Time Streaming SSE Submit with Multi-turn Cross-Questioning History
  const handleStreamSubmit = async (overridePrompt?: string) => {
    const textToSubmit = (overridePrompt ?? query).trim();
    if (!textToSubmit || isLoading) return;

    speechController.stopAllSpeech();

    const priorHistory = [...chatHistory];
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Immediately show the user's message in the UI
    setChatHistory([...priorHistory, userMessage]);

    // 2. Clear the message input box immediately
    setQuery('');

    // 3. Prepare streaming state
    setIsLoading(true);
    setStreamingResponse('');
    lcarsAudio.playChime();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Only pass initialTopic if the query actually mentions it or is the first seeded prompt
    const topicRelevant =
      initialTopic &&
      textToSubmit.toLowerCase().includes(initialTopic.toLowerCase().slice(0, 12))
        ? initialTopic
        : undefined;

    const historyPayload = priorHistory.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          contextTopic: topicRelevant,
          history: historyPayload,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let lineBuffer = '';
      let committed = false;

      const commitAssistantReply = (finalText: string) => {
        if (committed || !finalText.trim()) return;
        committed = true;
        const cleanText = finalText.trim();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: cleanText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
        setStreamingResponse('');

        if (autoSpeak && cleanText) {
          speechController.speakText(cleanText, selectedVoice);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        // Keep the last potentially incomplete line in lineBuffer
        lineBuffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulated += data.text;
                setStreamingResponse(accumulated);
              }
              if (data.done) {
                commitAssistantReply(accumulated);
              }
            } catch {
              // ignore malformed partial JSON
            }
          }
        }
      }

      // Flush any remaining buffered line
      if (lineBuffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(lineBuffer.trim().slice(6));
          if (data.text) accumulated += data.text;
        } catch {
          // ignore
        }
      }

      if (!committed && accumulated.trim()) {
        commitAssistantReply(accumulated);
      } else if (!committed) {
        throw new Error('Empty stream response');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        try {
          // Fallback to standard /api/chat endpoint with the exact question and history
          const backupRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage.text,
              contextTopic: topicRelevant,
              history: historyPayload,
            }),
          });
          const backupData = await backupRes.json();
          const replyText =
            backupData?.text ||
            `Unable to reach the Federation Subspace Relay for "${userMessage.text}". Please try your inquiry again.`;
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatHistory((prev) => [...prev, assistantMessage]);
          setStreamingResponse('');
          if (autoSpeak) speechController.speakText(replyText, selectedVoice);
        } catch {
          const errorReply = `Subspace communication link interrupted while processing "${userMessage.text}". Please re-engage your query.`;
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: errorReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatHistory((prev) => [...prev, assistantMessage]);
          setStreamingResponse('');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setStreamingResponse('');
    speechController.stopAllSpeech();
    lcarsAudio.playBeep(440, 0.05);
  };

  if (!isOpen) return null;

  const isSpeaking = speechStatus.isSpeaking;
  const isSynthesizing = speechStatus.isSynthesizing;

  const lastAssistantMessage = [...chatHistory]
    .reverse()
    .find((m) => m.role === 'assistant');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl h-[92vh] max-h-[720px] flex flex-col bg-[#08090f] border-2 border-[#f5b335] rounded-xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header with Title and Global Controls */}
        <div className="flex items-center justify-between bg-[#141522] px-3 py-2 border-b-2 border-[#e8732a]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-6 bg-[#f5b335] rounded-l" />
            <div className="w-8 h-6 bg-[#e8732a]" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f6e6b4] lcars-title ml-1 flex items-center gap-1.5">
              <span>STARFLEET COMPUTER // AI SCIENCE GUIDE</span>
              <span className="text-[10px] text-[#f5b335] font-mono hidden sm:inline">(MULTI-TURN DIALOGUE)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Pause Speech Button (Active when speaking or synthesizing) */}
            {(isSpeaking || isSynthesizing) && (
              <button
                onClick={handleStopSpeech}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-[10px] uppercase rounded animate-pulse shadow-lg cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>PAUSE AI VOICE</span>
              </button>
            )}

            {/* Clear History Button */}
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase font-bold text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">RESET</span>
              </button>
            )}

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                if (!next) speechController.stopAllSpeech();
                lcarsAudio.playBeep(640, 0.05);
              }}
              title="Toggle Auto-Speak"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                autoSpeak ? 'bg-[#f5b335] text-black' : 'bg-[#181824] text-gray-400 border border-white/10'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span className="hidden sm:inline">AUTO-VOICE: {autoSpeak ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                speechController.stopAllSpeech();
                lcarsAudio.playBeep(440, 0.05);
                onClose();
              }}
              className="p-1 text-[#f5b335] hover:text-white rounded hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area: Chat History & Current Telemetry */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          
          {/* Quick Inquiry Chips (when history is fresh or empty) */}
          <div className="space-y-1 bg-[#0f101b] p-2.5 rounded-lg border border-[#f5b335]/20">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#f5b335]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f5b335]" />
                FAST SCIENTIFIC INQUIRIES (TAP TO ENGAGE & CROSS-EXAMINE):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Voice Model Selector */}
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-[#12131f] border border-[#f5b335]/40 text-[#f5b335] text-[10px] rounded px-1.5 py-0.5 font-mono uppercase focus:outline-none cursor-pointer"
                  title="Gemini TTS Voice Model"
                >
                  <option value="Aoede">VOICE: AOEDE (COMPUTER)</option>
                  <option value="Kore">VOICE: KORE (CALM OPS)</option>
                  <option value="Puck">VOICE: PUCK (TACTICAL)</option>
                  <option value="Zephyr">VOICE: ZEPHYR (SCIENCE)</option>
                </select>

                {/* Fast Speech Speed Cadence Selector */}
                <select
                  value={speechRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSpeechRate(val);
                    speechController.setSpeechRate(val);
                  }}
                  className="bg-[#12131f] border border-[#f5b335]/40 text-[#f6e6b4] font-bold text-[10px] rounded px-1.5 py-0.5 font-mono uppercase focus:outline-none cursor-pointer"
                  title="Adjust AI Voice Speed / Cadence"
                >
                  <option value="1">SPEED: 1.0x (NORMAL)</option>
                  <option value="1.15">SPEED: 1.15x (FAST - LCARS)</option>
                  <option value="1.25">SPEED: 1.25x (FASTER)</option>
                  <option value="1.5">SPEED: 1.5x (RAPID)</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStreamSubmit(prompt)}
                  className="px-2.5 py-1 text-[11px] bg-[#141525] hover:bg-[#f5b335] hover:text-black text-[#f6e6b4] border border-[#f5b335]/30 rounded-full font-mono transition-all text-left cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Thread */}
          {chatHistory.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-gray-500 font-mono">
              <MessageSquare className="w-8 h-8 text-[#f5b335]/40 animate-pulse" />
              <div className="text-xs text-[#f5b335]/80 uppercase tracking-widest font-bold">
                ISOLINEAR DATABASE READY FOR QUERY
              </div>
              <p className="text-[11px] max-w-md text-gray-400">
                Ask any question regarding warp propulsion, quantum mechanics, subatomic particles, xenobiology, or Federation starships. Responses are delivered in one concise paragraph with continuous memory for follow-up cross-questions.
              </p>
            </div>
          )}

          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col space-y-1 ${
                item.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {item.role === 'user' ? (
                // User Question Bubble
                <div className="max-w-[85%] sm:max-w-[80%] bg-[#1a1c2e] border-l-4 border-[#e8732a] text-[#f6e6b4] p-2.5 rounded-lg font-mono text-xs shadow-md">
                  <div className="text-[10px] text-[#e8732a] font-bold uppercase tracking-wider mb-1 flex items-center justify-between gap-3">
                    <span>OFFICER INQUIRY</span>
                    <span className="text-gray-400 font-normal">{item.timestamp}</span>
                  </div>
                  <div className="font-sans text-xs sm:text-sm text-gray-100">{item.text}</div>
                </div>
              ) : (
                // Computer Answer Bubble (Single Paragraph)
                <div className="max-w-[95%] sm:max-w-[90%] bg-black/90 border border-[#f5b335]/40 border-l-4 border-l-[#f5b335] text-[#f6e6b4] p-3 rounded-lg font-mono text-xs leading-relaxed shadow-lg relative">
                  <div className="flex items-center justify-between text-[10px] text-[#f5b335] border-b border-white/10 pb-1 mb-2">
                    <span className="flex items-center gap-1 font-bold">
                      <Zap className="w-3 h-3 text-[#f5b335]" />
                      <span>ISOLINEAR RESPONSE // LCARS TELEMETRY</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-normal">{item.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleSpeakText(item.text)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-[#f5b335]/20 hover:bg-[#f5b335] text-[#f5b335] hover:text-black border border-[#f5b335]/40 rounded font-mono text-[10px] font-bold transition-all cursor-pointer"
                        title="Read this response aloud with Gemini TTS"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>SPEAK</span>
                      </button>
                    </div>
                  </div>
                  {/* Single Paragraph text */}
                  <p className="font-sans text-xs sm:text-sm text-gray-100 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Currently Streaming Response */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="max-w-[95%] sm:max-w-[90%] bg-black/90 border border-[#f5b335]/60 border-l-4 border-l-[#f5b335] text-[#f6e6b4] p-3 rounded-lg font-mono text-xs leading-relaxed shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-[#f5b335] border-b border-white/10 pb-1 mb-2">
                  <span className="flex items-center gap-1 font-bold">
                    <Loader2 className="w-3 h-3 animate-spin text-[#f5b335]" />
                    <span>SYNTHESIZING REAL-TIME LCARS TELEMETRY...</span>
                  </span>
                </div>
                {streamingResponse ? (
                  <p className="font-sans text-xs sm:text-sm text-gray-100 leading-relaxed animate-pulse">
                    {streamingResponse}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#f5b335] py-2">
                    <div className="w-2.5 h-2.5 bg-[#f5b335] rounded-full animate-ping" />
                    <span>Accessing Federation Core Databases...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Speaking / Synthesizing Global Banner */}
          {isSpeaking && (
            <div className="sticky bottom-0 bg-[#161208] border border-[#f5b335] rounded-lg p-2 flex items-center justify-between shadow-xl animate-pulse">
              <div className="flex items-center gap-2 text-[#f5b335] text-xs font-mono font-bold">
                <Volume2 className="w-4 h-4 text-[#f5b335]" />
                <span>SPEAKING ALOUD (GEMINI TTS: {selectedVoice.toUpperCase()})</span>
              </div>
              <button
                onClick={handleStopSpeech}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-mono font-bold text-[10px] uppercase shadow cursor-pointer"
              >
                PAUSE VOICE
              </button>
            </div>
          )}
        </div>

        {/* Input Bar: Automatically Clears On Submit */}
        <div className="bg-[#141522] p-2.5 sm:p-3 border-t-2 border-[#f5b335]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStreamSubmit();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#f5b335] text-black hover:bg-[#ffbe4d]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="hidden sm:inline">{isListening ? 'LISTENING' : 'VOICE'}</span>
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question or follow up (e.g. 'explain more', 'what is the speed in c?')..."
              className="flex-1 bg-black text-[#f6e6b4] placeholder-gray-600 px-3 py-2 rounded-lg border border-[#e8732a]/40 font-mono text-xs sm:text-sm focus:outline-none focus:border-[#f5b335]"
            />

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-[#e8732a] hover:bg-[#f5b335] disabled:opacity-40 text-black font-bold uppercase font-mono text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ENGAGE</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
