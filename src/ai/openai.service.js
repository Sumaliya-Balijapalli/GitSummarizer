import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js';
import { summaryJsonSchema } from './summary.schema.js';
import { generatedSummarySchema } from '../validators/summary.schema.js';

export async function generateRepositorySummary(evidence) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 2 });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(evidence) }
    ],
    text: { format: { type: 'json_schema', ...summaryJsonSchema } }
  });
  const raw = response.output_text;
  if (!raw) throw new Error('The AI provider returned an empty response.');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('The AI provider returned invalid JSON.'); }
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    summary: generatedSummarySchema.parse(parsed)
  };
}