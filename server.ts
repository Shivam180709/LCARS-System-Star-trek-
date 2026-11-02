import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { SCIENCE_DATABASE } from './src/data/scienceData';
import { STAR_TREK_CANON_DATABASE } from './src/data/starTrekData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK with User-Agent telemetry
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Smart local archive lookup only used if no Gemini API key is available
function getStarfleetBriefAnswer(query: string, contextTopic?: string): string {
  const combined = `${query} ${contextTopic || ''}`.toLowerCase().trim();
  const words = combined
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'what', 'how', 'why', 'explain', 'does', 'can', 'you', 'tell', 'about', 'with', 'from', 'are'].includes(w));

  // 1. Score Science Database entries
  let bestScienceScore = 0;
  let bestScience = SCIENCE_DATABASE[0];
  for (const item of SCIENCE_DATABASE) {
    const hay = `${item.title} ${item.subtitle} ${item.tags.join(' ')} ${item.realScience} ${item.starTrekCanon || ''}`.toLowerCase();
    let score = 0;
    if (combined.includes(item.title.toLowerCase())) score += 10;
    for (const w of words) {
      if (item.title.toLowerCase().includes(w)) score += 4;
      else if (item.tags.some((t) => t.toLowerCase().includes(w))) score += 3;
      else if (hay.includes(w)) score += 1;
    }
    if (score > bestScienceScore) {
      bestScienceScore = score;
      bestScience = item;
    }
  }

  // 2. Score Star Trek Canon entries
  let bestCanonScore = 0;
  let bestCanon = STAR_TREK_CANON_DATABASE[0];
  for (const item of STAR_TREK_CANON_DATABASE) {
    const hay = `${item.title} ${item.designation || ''} ${item.starTrekLore} ${item.realScienceFact}`.toLowerCase();
    let score = 0;
    if (combined.includes(item.title.toLowerCase())) score += 10;
    for (const w of words) {
      if (item.title.toLowerCase().includes(w)) score += 4;
      else if (hay.includes(w)) score += 1;
    }
    if (score > bestCanonScore) {
      bestCanonScore = score;
      bestCanon = item;
    }
  }

  if (bestScienceScore >= bestCanonScore && bestScienceScore >= 2) {
    return `${bestScience.realScience} ${bestScience.starTrekCanon || ''}`.trim();
  }
  if (bestCanonScore >= 2) {
    const cleanScience = bestCanon.realScienceFact.replace(/^REAL SCIENCE:\s*/i, '');
    return `${bestCanon.starTrekLore} ${cleanScience}`.trim();
  }

  return `Regarding "${query.trim()}", Starfleet LCARS databases correlate real-world physics, astronomy, and planetary science with Federation exploration telemetry. Please ask a specific follow-up detail or select any database module for deeper analysis.`;
}

/**
 * Ensures multi-turn conversation history strictly alternates user -> model -> user
 * and starts with a 'user' turn, preventing Gemini API 400 Invalid Argument errors
 * and preventing duplicate trailing user messages.
 */
function buildNormalizedContents(
  history: Array<{ role?: string; text?: string }>,
  currentPrompt: string,
  rawMessage: string
) {
  const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    // Filter out empty turns
    const validTurns = history
      .filter((t) => t && typeof t.text === 'string' && t.text.trim().length > 0)
      .map((t) => ({
        role: (t.role === 'assistant' || t.role === 'model' ? 'model' : 'user') as 'user' | 'model',
        text: t.text!.trim(),
      }));

    // If the client already appended the current user message to the end of history, remove that duplicate
    if (
      validTurns.length > 0 &&
      validTurns[validTurns.length - 1].role === 'user' &&
      validTurns[validTurns.length - 1].text === rawMessage.trim()
    ) {
      validTurns.pop();
    }

    // Keep up to the last 8 turns
    const recentTurns = validTurns.slice(-8);

    // Drop any leading 'model' turns so the conversation always starts with 'user'
    while (recentTurns.length > 0 && recentTurns[0].role === 'model') {
      recentTurns.shift();
    }

    // Merge consecutive turns of the same role to guarantee strict user/model alternation
    for (const turn of recentTurns) {
      const prev = normalized[normalized.length - 1];
      if (prev && prev.role === turn.role) {
        prev.parts[0].text += `\n${turn.text}`;
      } else {
        normalized.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      }
    }
  }

  // Ensure the turn before our new user prompt is 'model' (if normalized is non-empty)
  const lastTurn = normalized[normalized.length - 1];
  if (lastTurn && lastTurn.role === 'user') {
    lastTurn.parts[0].text += `\n${currentPrompt}`;
  } else {
    normalized.push({
      role: 'user',
      parts: [{ text: currentPrompt }],
    });
  }

  return normalized;
}

function buildSystemInstruction(language: string, contextTopic?: string): string {
  const topicNote = contextTopic
    ? `\n- Optional background context if the user's question is a shorthand or refers to the currently open exhibit: "${contextTopic}". However, if the user asks about a different subject, IGNORE this background topic and answer the user's actual question directly!`
    : '';

  return `You are the Starfleet LCARS Main Computer on the USS Enterprise.
Your primary directive is to directly, accurately, and specifically answer the exact question the user asked.

CRITICAL ACCURACY & RELEVANCE RULES:
1. ALWAYS answer the user's exact question first and foremost. Never substitute a pre-canned topic (like warp drive or isolinear chips) if the user asked about something else.
2. Whether the user asks about real-world science (physics, astronomy, biology, chemistry, mathematics, Earth history, technology), Star Trek lore (ships, characters, species, episodes, bridge systems), or a general question, answer THAT exact subject accurately.
3. When relevant, briefly connect real-world science and Star Trek canon naturally, but never force unrelated Star Trek jargon if it detracts from answering the user's question.
4. For follow-up questions (e.g. "why?", "how fast is that?", "explain more", "what about in real life?"), use the preceding conversation history to stay strictly on the subject being discussed.${topicNote}
5. Format your answer in ONE cohesive, clear paragraph of roughly 45 to 85 words. Do not use bullet points, markdown headers, or conversational filler.
6. Respond in ${language}.`;
}

// 1. Real-Time Streaming Gemini Endpoint (SSE) for Ultra-Fast Typing & Cross-Questioning History
app.post('/api/chat/stream', async (req, res) => {
  const { message, contextTopic, history = [], language = 'English' } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Valid query message is required.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const ai = getAiClient();
  if (!ai) {
    const brief = getStarfleetBriefAnswer(message, contextTopic);
    const words = brief.split(' ');
    for (const w of words) {
      res.write(`data: ${JSON.stringify({ text: w + ' ' })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  const systemInstruction = buildSystemInstruction(language, contextTopic);
  const contents = buildNormalizedContents(history, message.trim(), message.trim());

  // Cascade through active models so transient issues never drop into unrelated static fallbacks
  const candidateModels: Array<{ name: string; useThinkingLow: boolean }> = [
    { name: 'gemini-3.8-flash', useThinkingLow: true },
    { name: 'gemini-flash-latest', useThinkingLow: false },
    { name: 'gemini-3.1-flash-lite', useThinkingLow: false },
  ];

  let streamedAnyText = false;

  for (const candidate of candidateModels) {
    try {
      const config: Record<string, any> = {
        systemInstruction,
      };
      if (candidate.useThinkingLow) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const stream = await ai.models.generateContentStream({
        model: candidate.name,
        contents,
        config,
      });

      for await (const chunk of stream) {
        const textChunk = chunk.text;
        if (textChunk) {
          streamedAnyText = true;
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
      }

      if (streamedAnyText) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    } catch (err: any) {
      console.warn(`[LCARS Stream] Model ${candidate.name} failed:`, err?.message || err);
      if (streamedAnyText) {
        // Already partially streamed; finish cleanly
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    }
  }

  // Final fallback if all models are unreachable
  const fallback = getStarfleetBriefAnswer(message, contextTopic);
  res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// 2. Standard Chat Endpoint (Backup) with History
app.post('/api/chat', async (req, res) => {
  try {
    const { message, contextTopic, history = [], language = 'English' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid query message is required.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      const brief = getStarfleetBriefAnswer(message, contextTopic);
      res.json({ text: brief, source: 'starfleet_archive' });
      return;
    }

    const systemInstruction = buildSystemInstruction(language, contextTopic);
    const contents = buildNormalizedContents(history, message.trim(), message.trim());

    const candidateModels: Array<{ name: string; useThinkingLow: boolean }> = [
      { name: 'gemini-3.8-flash', useThinkingLow: true },
      { name: 'gemini-flash-latest', useThinkingLow: false },
      { name: 'gemini-3.1-flash-lite', useThinkingLow: false },
    ];

    for (const candidate of candidateModels) {
      try {
        const config: Record<string, any> = {
          systemInstruction,
        };
        if (candidate.useThinkingLow) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model: candidate.name,
          contents,
          config,
        });

        if (response.text && response.text.trim()) {
          res.json({
            text: response.text.trim(),
            source: candidate.name,
          });
          return;
        }
      } catch (err: any) {
        console.warn(`[LCARS Chat] Model ${candidate.name} failed:`, err?.message || err);
      }
    }

    res.json({
      text: getStarfleetBriefAnswer(message, contextTopic),
      source: 'starfleet_fallback',
    });
  } catch (error: any) {
    res.json({
      text: getStarfleetBriefAnswer(req.body?.message || '', req.body?.contextTopic),
      source: 'starfleet_fallback',
    });
  }
});

// In-memory TTS audio cache to prevent redundant quota usage & provide sub-millisecond replay
const ttsAudioCache = new Map<string, string>();

// 3. Fast Text-to-Speech (TTS) Endpoint powered by Gemini Flash Lite TTS with fallback & caching
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Aoede' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required.' });
      return;
    }

    // Clean text for fast audio synthesis & natural Starfleet pronunciation
    const cleanSpeechText = text
      .replace(/[■#*`_]/g, '')
      .replace(/REAL SCIENCE:/gi, 'Real science: ')
      .replace(/STAR TREK CANON:/gi, 'Star Trek canon: ')
      .replace(/NCC-1701/g, 'N C C 1 7 0 1')
      .replace(/M\/ARA/g, 'matter antimatter reaction assembly')
      .replace(/FTL/g, 'faster than light')
      .trim()
      .slice(0, 450); // Concise paragraph for rapid sub-second audio generation

    const validVoice = ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].includes(voiceName)
      ? voiceName
      : 'Aoede';

    const cacheKey = `${validVoice}::${cleanSpeechText}`;
    if (ttsAudioCache.has(cacheKey)) {
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        res.json({
          audioData: cached,
          mimeType: 'audio/wav',
          fallbackToBrowser: false,
          cached: true,
        });
        return;
      }
    }

    const ai = getAiClient();
    if (!ai) {
      console.warn('[LCARS TTS] No Gemini AI instance configured.');
      res.json({ audioData: null, fallbackToBrowser: true });
      return;
    }

    // Prioritize high-throughput ultra-low-latency 'gemini-3.8-flash-lite-tts'
    const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
    let base64Audio: string | null | undefined = null;

    for (const modelName of ttsModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanSpeechText,
                  speechMetadata: {
                    style: 'Brisk, crisp, authoritative Starfleet computer voice at efficient tempo',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: validVoice },
              },
            },
          },
        });

        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          // Store into cache (evicting oldest if capacity reached)
          if (ttsAudioCache.size >= 100) {
            const oldestKey = ttsAudioCache.keys().next().value;
            if (oldestKey) ttsAudioCache.delete(oldestKey);
          }
          ttsAudioCache.set(cacheKey, base64Audio);
          break; // successfully synthesized!
        }
      } catch (modelErr: any) {
        console.warn(`[LCARS TTS] Model ${modelName} unavailable or limit reached:`, modelErr?.status || modelErr?.message || modelErr);
        // Continue to next model in loop
      }
    }

    if (base64Audio) {
      res.json({
        audioData: base64Audio,
        mimeType: 'audio/wav',
        fallbackToBrowser: false,
      });
    } else {
      res.json({ audioData: null, fallbackToBrowser: true });
    }
  } catch (err: any) {
    console.warn('[LCARS TTS] Synthesis ended gracefully with browser fallback:', err?.message || err);
    res.json({ audioData: null, fallbackToBrowser: true });
  }
});

// Serve local audio assets (theme mp3, sound effects)
app.use('/audio', express.static(path.resolve(__dirname, 'public/audio')));

// Vite middleware in dev, static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[LCARS] Starfleet Science Terminal server online on port ${PORT}`);
  });
}

startServer();
