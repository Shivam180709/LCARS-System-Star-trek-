import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ultra-fast brief fallback answers formatted in a single cohesive paragraph
function getStarfleetBriefAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('warp') || q.includes('faster than light') || q.includes('speed') || q.includes('alcubierre')) {
    return `In theoretical physics, general relativity permits faster-than-light metrics like the Alcubierre drive by contracting spacetime in front of a vessel and expanding it behind using negative energy densities. In Starfleet engineering, the Enterprise achieves this via twin warp nacelles channeling matter-antimatter annihilation through dilithium to generate symmetric subspace fields, circumventing relativistic time dilation completely.`;
  }

  if (q.includes('transporter') || q.includes('beam') || q.includes('teleport')) {
    return `Real quantum teleportation transfers entangled quantum states between particles, though the Heisenberg uncertainty principle makes scanning macroscopic human states currently impossible. Starfleet transporters resolve this barrier with fictional Heisenberg compensators, dematerializing matter into an energy stream projected across tens of thousands of kilometers along an annular confinement beam.`;
  }

  if (q.includes('dilithium') || q.includes('crystal')) {
    return `In the periodic table, Element 87 is Francium, a radioactive alkali metal rather than a stable mineral. In Starfleet canon, dilithium is an exotic mineral with a four-dimensional crystalline matrix that regulates high-energy matter-antimatter plasma streams without disintegrating.`;
  }

  if (q.includes('antimatter') || q.includes('power') || q.includes('energy')) {
    return `Modern particle colliders produce real antiprotons and positrons, converting 100% of rest mass directly into pure energy via Einstein's mass-energy equivalence at ninety petajoules per kilogram. Starfleet harness this raw energy within magnetic containment reactors to power the Enterprise's primary electro-plasma network and warp coils.`;
  }

  if (q.includes('shield') || q.includes('deflector')) {
    return `Aerospace researchers actively investigate electromagnetic and plasma deflector fields to shield interplanetary astronauts from ionizing cosmic radiation. On the Enterprise, localized high-frequency graviton distortion fields form defensive shields, while forward navigational deflectors emit focused tractor streams to sweep micro-asteroids clear of the flight path.`;
  }

  if (q.includes('prime directive') || q.includes('ethics') || q.includes('rule')) {
    return `The Prime Directive parallels NASA and COSPAR planetary protection protocols aimed at preventing cross-contamination of extraterrestrial ecosystems. In Starfleet protocol, General Order One strictly prohibits introducing advanced technology or cultural contamination to pre-warp civilizations under severe penalty of court-martial.`;
  }

  if (q.includes('alien') || q.includes('vulcan') || q.includes('blood') || q.includes('species')) {
    return `Earth organisms like horseshoe crabs and octopuses naturally synthesize copper-based hemocyanin blood that turns green-blue when oxygenated in cold waters. Similarly, Vulcans evolved on a harsh high-gravity desert world orbiting 40 Eridani A, developing green copper blood, secondary eyelids, and mental disciplines rooted in pure logic.`;
  }

  return `Starfleet LCARS systems process sensor telemetry using isolinear optical arrays, correlating Federation astrophysical databases with quantum mechanics and general relativity to resolve anomalous phenomena.`;
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

  if (!ai) {
    const brief = getStarfleetBriefAnswer(message);
    const words = brief.split(' ');
    for (const w of words) {
      res.write(`data: ${JSON.stringify({ text: w + ' ' })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  try {
    const systemInstruction = `You are the Starfleet LCARS Main Computer on the USS Enterprise (NCC-1701-D).
You provide brief, direct, intelligent answers to Starfleet officers exploring science, astrophysics, technology, and Starfleet canon.
STRICT RESPONSE RULES:
1. Answer in EXACTLY ONE single cohesive paragraph (around 40 to 75 words).
2. DO NOT use bullets or separate headers like "■ REAL SCIENCE:" or "■ STAR TREK CANON:". Weave the real-world science and Star Trek universe context together into one flowing paragraph.
3. No pleasantries, greetings, sign-offs, or conversational filler. Deliver the explanation directly.
4. If the user asks a follow-up or cross-question about earlier conversation turns, maintain continuous context from the chat history.
5. Language: ${language}.`;

    // Construct conversation history for multi-turn cross-questioning
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.text && typeof turn.text === 'string') {
          contents.push({
            role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    const currentPrompt = contextTopic
      ? `[Base Context: Starfleet Science & Star Trek Universe // Subject: ${contextTopic}]\nQuery: ${message}`
      : `[Base Context: Starfleet Science & Star Trek Universe]\nQuery: ${message}`;

    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }],
    });

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 140, // Fast sub-second generation
        temperature: 0.2,
      },
    });

    for await (const chunk of stream) {
      const textChunk = chunk.text;
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.warn('[LCARS Stream] Handled stream error, using fallback:', err?.message || err);
    const fallback = getStarfleetBriefAnswer(message);
    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// 2. Standard Chat Endpoint (Backup) with History
app.post('/api/chat', async (req, res) => {
  try {
    const { message, contextTopic, history = [], language = 'English' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid query message is required.' });
      return;
    }

    if (!ai) {
      const brief = getStarfleetBriefAnswer(message);
      res.json({ text: brief, source: 'starfleet_archive' });
      return;
    }

    const systemInstruction = `You are the Starfleet LCARS Main Computer on the USS Enterprise.
Answer in ONE single brief paragraph (under 70 words).
Do NOT separate into bullet points or "REAL SCIENCE / CANON" headers. Integrate scientific facts and Star Trek canon seamlessly.
Maintain history continuity for follow-up cross questions. No conversational greetings. Language: ${language}.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.text && typeof turn.text === 'string') {
          contents.push({
            role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: `[Base Star Trek Context]\nQuery: ${message}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      text: response.text || getStarfleetBriefAnswer(message),
      source: 'gemini',
    });
  } catch (error: any) {
    res.json({
      text: getStarfleetBriefAnswer(req.body?.message || ''),
      source: 'starfleet_fallback',
    });
  }
});

// In-memory TTS audio cache to prevent redundant quota usage & provide sub-millisecond replay
const ttsAudioCache = new Map<string, string>();

// 3. Fast Text-to-Speech (TTS) Endpoint powered by Gemini Flash Lite TTS with fallback & caching
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Aoede', speed = 1.15 } = req.body;
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
