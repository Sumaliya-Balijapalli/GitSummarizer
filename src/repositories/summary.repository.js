import { pool } from '../config/db.js';

export async function saveSummary({ evidence, summary, model }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const repoResult = await client.query(`
      INSERT INTO repositories (github_url, owner, name, description, default_branch, stars, language, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT (github_url) DO UPDATE SET
        description=EXCLUDED.description, default_branch=EXCLUDED.default_branch,
        stars=EXCLUDED.stars, language=EXCLUDED.language, updated_at=NOW()
      RETURNING id
    `, [
      evidence.parsed.canonicalUrl, evidence.parsed.owner, evidence.parsed.name,
      evidence.metadata.description, evidence.metadata.default_branch,
      evidence.metadata.stargazers_count || 0, evidence.metadata.language
    ]);
    const repositoryId = repoResult.rows[0].id;
    const summaryResult = await client.query(`
      INSERT INTO summaries
      (repository_id, overview, features, technologies, prerequisites, installation, usage, limitations, commit_digest, model)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, created_at
    `, [
      repositoryId, summary.overview, JSON.stringify(summary.features),
      JSON.stringify(summary.technologies), JSON.stringify(summary.prerequisites),
      JSON.stringify(summary.installation), JSON.stringify(summary.usage),
      JSON.stringify(summary.limitations), JSON.stringify(summary.commit_digest), model
    ]);
    const saved = summaryResult.rows[0];
    await client.query(
      'INSERT INTO search_history (repository_id, summary_id, searched_url) VALUES ($1,$2,$3)',
      [repositoryId, saved.id, evidence.parsed.canonicalUrl]
    );
    await client.query('COMMIT');
    return { id: saved.id, createdAt: saved.created_at, repositoryId, ...summary, model };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getSummaryById(id) {
  const result = await pool.query(`
    SELECT s.id, s.overview, s.features, s.technologies, s.prerequisites,
      s.installation, s.usage, s.limitations, s.commit_digest, s.model,
      s.is_saved AS "isSaved", s.created_at AS "createdAt",
      r.github_url AS "repositoryUrl", r.owner, r.name
    FROM summaries s JOIN repositories r ON r.id=s.repository_id
    WHERE s.id=$1
  `, [id]);
  return result.rows[0] || null;
}

export async function listHistory({ savedOnly = false, limit = 50 } = {}) {
  const result = await pool.query(`
    SELECT s.id, s.overview, s.is_saved AS "isSaved", s.created_at AS "createdAt",
      r.github_url AS "repositoryUrl", r.owner, r.name
    FROM summaries s JOIN repositories r ON r.id=s.repository_id
    ${savedOnly ? 'WHERE s.is_saved=TRUE' : ''}
    ORDER BY s.created_at DESC LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function setSummarySaved(id, isSaved) {
  const result = await pool.query(
    'UPDATE summaries SET is_saved=$2 WHERE id=$1 RETURNING id, is_saved AS "isSaved"',
    [id, isSaved]
  );
  return result.rows[0] || null;
}

export async function deleteHistoryItem(id) {
  const result = await pool.query('DELETE FROM summaries WHERE id=$1 RETURNING id', [id]);
  return Boolean(result.rowCount);
}