import { listHistory, deleteHistoryItem } from '../repositories/summary.repository.js';

export async function getHistory(req, res, next) {
  try {
    const rawLimit = Number(req.query.limit || 50);
    const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    res.json({ data: await listHistory({ limit }) });
  } catch (error) { next(error); }
}

export async function getSavedHistory(req, res, next) {
  try { res.json({ data: await listHistory({ savedOnly: true, limit: 100 }) }); }
  catch (error) { next(error); }
}

export async function deleteHistory(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid history ID.' });
    const deleted = await deleteHistoryItem(id);
    if (!deleted) return res.status(404).json({ error: 'Summary not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
}