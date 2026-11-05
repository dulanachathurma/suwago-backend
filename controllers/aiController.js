const { calculateBmi } = require('../utils/bmi');

// Google Gemini API Config
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGES = { en: 'English', si: 'Sinhala', ta: 'Tamil' };

// Very small per-user rate limit (best effort: serverless instances do not share memory).
const hits = new Map();
const LIMIT = 20; // requests
const WINDOW_MS = 60 * 1000;
const rateLimited = (userId) => {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > LIMIT;
};

const num = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
};

const buildSystemPrompt = (profile, language) => {
  const age = num(profile.age, 1, 120);
  const heightCm = num(profile.heightCm, 50, 250);
  const weightKg = num(profile.weightKg, 10, 400);

  const facts = [];
  if (age) facts.push('age ' + age);
  if (heightCm) facts.push('height ' + heightCm + ' cm');
  if (weightKg) facts.push('weight ' + weightKg + ' kg');
  if (heightCm && weightKg) {
    const { bmi, category } = calculateBmi(weightKg, heightCm);
    facts.push('BMI ' + bmi + ' (' + category + ')');
  }

  return [
    'You are the VitaCare health assistant inside a mobile health-tracking app used mainly in Sri Lanka.',
    'Give clear, practical, friendly general health and wellness information (nutrition, exercise, sleep, BMI, blood pressure, blood sugar and similar).',
    'You are not a doctor: never diagnose or prescribe. For serious, sudden or worrying symptoms (for example chest pain, trouble breathing, stroke signs, heavy bleeding) tell the person to seek emergency care immediately (in Sri Lanka call 1990 for the ambulance service).',
    'Keep answers short (under about 150 words) and use plain language.',
    'Reply in ' + (LANGUAGES[language] || 'English') + '.',
    facts.length ? 'What the user shared about themselves: ' + facts.join(', ') + '.' : 'The user has not shared body measurements yet.',
  ].join('\n');
};

// POST /api/ai/chat
// body: { messages: [{ role: 'user' | 'assistant', content: string }], profile?: { age, heightCm, weightKg }, language?: 'en' | 'si' | 'ta' }
const chat = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ code: 'AI_NOT_CONFIGURED', message: 'AI assistant is not configured on the server' });
    }
    if (rateLimited(String(req.user._id))) {
      return res.status(429).json({ code: 'RATE_LIMITED', message: 'Too many messages, please wait a minute' });
    }

    const { messages, profile = {}, language = 'en' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'messages is required' });
    }

    // Keep the last 20 valid turns, trim long text, and make sure the chat starts with the user.
    let clean = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 2000) }));
    while (clean.length && clean[0].role !== 'user') clean.shift();

    // Map messages to Gemini API format ('assistant' -> 'model')
    const contents = clean.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'The last message must be from the user' });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildSystemPrompt(profile, language) }],
          },
          contents: contents,
          generationConfig: {
            maxOutputTokens: 600,
          },
        }),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Gemini API error', response.status, detail.slice(0, 300));
      return res.status(502).json({ code: 'AI_UNAVAILABLE', message: 'AI assistant is unavailable right now' });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return res.status(502).json({ code: 'AI_UNAVAILABLE', message: 'AI assistant returned no answer' });
    }
    res.json({ reply });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ code: 'AI_TIMEOUT', message: 'AI assistant took too long, please try again' });
    }
    next(err);
  }
};

module.exports = { chat };
