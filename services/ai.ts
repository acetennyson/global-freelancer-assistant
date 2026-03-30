import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_CONFIG } from './config';

function getKeys(env: string | undefined): string[] {
  return (env ?? '').split(',').map(k => k.trim()).filter(Boolean);
}

const geminiFailedKeys = new Map<string, number>(); // key -> failed timestamp
const COOLDOWN = 60000;

function isRateLimitError(e: any): boolean {
  const s = e?.message?.toLowerCase() ?? '';
  return s.includes('429') || s.includes('quota') || s.includes('rate limit') || s.includes('too many requests');
}

async function tryGemini(keys: string[], prompt: string): Promise<string | null> {
  const now = Date.now();
  // restore keys past cooldown
  for (const [k, t] of geminiFailedKeys) {
    if (now - t > COOLDOWN) geminiFailedKeys.delete(k);
  }

  for (const key of keys) {
    if (geminiFailedKeys.has(key)) continue;
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e: any) {
      if (isRateLimitError(e)) {
        geminiFailedKeys.set(key, Date.now());
        console.error(`Gemini key rate-limited, cooling down: ${e.message.slice(0, 80)}`);
      } else {
        console.error(`Gemini key failed: ${e.message.slice(0, 80)}`);
      }
    }
  }
  return null;
}

async function tryClaude(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const client = new Anthropic({ apiKey: key });
      const msg = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });
      return (msg.content[0] as any).text;
    } catch {}
  }
  return null;
}

async function tryDeepSeek(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const client = new OpenAI({ apiKey: key, baseURL: 'https://api.deepseek.com' });
      const res = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      });
      return res.choices[0].message.content;
    } catch {}
  }
  return null;
}

async function tryHuggingFace(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.95,
        }),
      });
      if (!res.ok) { console.error('HuggingFace failed:', await res.text()); continue; }
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch (e: any) {
      console.error(`HuggingFace key failed: ${e.message}`);
    }
  }
  return null;
}

async function tryGroq(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const client = new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' });
      const res = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      });
      return res.choices[0].message.content;
    } catch (e: any) {
      console.error(`Groq key failed: ${e.message}`);
    }
  }
  return null;
}

export async function runAI(prompt: string): Promise<string> {
  const geminiKeys = getKeys(process.env.GEMINI_API_KEYS);
  const anthropicKeys = getKeys(process.env.ANTHROPIC_API_KEYS);
  const deepseekKeys = getKeys(process.env.DEEPSEEK_API_KEYS);
  const groqKeys = getKeys(process.env.GROQ_API_KEYS);
  const hfKeys = getKeys(process.env.HUGGINGFACE_API_KEYS);

  const result =
    (geminiKeys.length && await tryGemini(geminiKeys, prompt)) ||
    (anthropicKeys.length && await tryClaude(anthropicKeys, prompt)) ||
    (deepseekKeys.length && await tryDeepSeek(deepseekKeys, prompt)) ||
    (groqKeys.length && await tryGroq(groqKeys, prompt)) ||
    (hfKeys.length && await tryHuggingFace(hfKeys, prompt)) ||
    null;

  if (!result) throw new Error('All AI providers failed or no API keys configured.');
  return result.trim();
}

export async function generateDraft(client: {
  name: string;
  project: string;
  last_update: string;
  next_action: string;
  history?: { draft: string; created_at: string }[];
}): Promise<string> {
  const freelancerName = AI_CONFIG.freelancerName;

  const historySection = client.history?.length
    ? `\nPrevious messages sent to this client (most recent first):\n${client.history.map((h, i) => `${i + 1}. [${new Date(h.created_at).toLocaleDateString()}] "${h.draft.slice(0, 150)}..."`).join('\n')}\n`
    : '';

  const prompt = `You are drafting a professional email from a freelancer to their client.
Freelancer name: ${freelancerName}
Client name: ${client.name}
Project: ${client.project}
Last update: ${client.last_update}
${client.next_action ? `Next action needed: ${client.next_action}` : "No specific next action — the ball is in the client's court."}
${historySection}
Write a new email that continues naturally from previous messages if any exist. Don't repeat what was already said. Start with "Hi ${client.name}," and sign off with "${freelancerName}". Keep it under ${AI_CONFIG.draftWordLimit} words. Be specific and professional.`;
  return runAI(prompt);
}

export async function generateSubject(client: {
  name: string;
  project: string;
  last_update: string;
}): Promise<string> {
  const prompt = `Write a concise email subject line (max 8 words) for a freelancer project update.
Project: ${client.project}
Last update: ${client.last_update}
Return only the subject line, nothing else. No quotes.`;
  return runAI(prompt);
}
