import { repositoryUrlSchema } from '../validators/summary.schema.js';
import { fetchRepositoryEvidence } from '../services/github.service.js';
import { generateRepositorySummary } from '../ai/openai.service.js';
import { getSummaryById, saveSummary, setSummarySaved } from '../repositories/summary.repository.js';

export async function createSummary(req, res, next) {
  try {
    const { repositoryUrl } = repositoryUrlSchema.parse(req.body);
    const evidence = await fetchRepositoryEvidence(repositoryUrl);
    const { summary, model } = await generateRepositorySummary(evidence);
    const result = await saveSummary({ evidence, summary, model });
    res.status(201).json({ data: result });
  } catch (error) { next(error); }
}

export async function getSummary(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid summary ID.' });
    const summary = await getSummaryById(id);
    if (!summary) return res.status(404).json({ error: 'Summary not found.' });
    res.json({ data: summary });
  } catch (error) { next(error); }
}

export async function updateSaved(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || typeof req.body?.isSaved !== 'boolean') {
      return res.status(400).json({ error: 'Provide a valid summary ID and boolean isSaved.' });
    }
    const result = await setSummarySaved(id, req.body.isSaved);
    if (!result) return res.status(404).json({ error: 'Summary not found.' });
    res.json({ data: result });
  } catch (error) { next(error); }
}