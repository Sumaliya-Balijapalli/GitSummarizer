const API = 'https://api.github.com';

export function parseGitHubRepositoryUrl(input) {
  let url;
  try { url = new URL(input); } catch { throw new Error('Enter a valid GitHub repository URL.'); }
  if (url.hostname.toLowerCase() !== 'github.com') throw new Error('Only github.com repository URLs are supported.');
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) throw new Error('Use a URL like https://github.com/owner/repository.');
  const owner = parts[0];
  const name = parts[1].replace(/\.git$/i, '');
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) {
    throw new Error('The GitHub owner or repository name is invalid.');
  }
  return { owner, name, canonicalUrl: `https://github.com/${owner}/${name}` };
}

async function githubGet(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': process.env.GITHUB_API_VERSION || '2022-11-28',
    'User-Agent': 'GitSummarizer'
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(15000) });
  if (response.status === 404) throw new Error('Repository not found or not publicly accessible.');
  if (!response.ok) throw new Error(`GitHub API request failed (${response.status}). Try again later.`);
  return response.json();
}

export async function fetchRepositoryEvidence(inputUrl) {
  const parsed = parseGitHubRepositoryUrl(inputUrl);
  const base = `/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.name)}`;
  const metadata = await githubGet(base);
  let readme = '';
  try {
    const readmeData = await githubGet(`${base}/readme`);
    if (readmeData.content) readme = Buffer.from(readmeData.content, 'base64').toString('utf8');
  } catch (error) {
    if (!String(error.message).includes('404')) throw error;
  }
  const commits = await githubGet(`${base}/commits?per_page=${Math.min(Number(process.env.MAX_COMMITS || 12), 20)}`);
  return {
    parsed,
    metadata: {
      full_name: metadata.full_name,
      html_url: metadata.html_url,
      description: metadata.description,
      default_branch: metadata.default_branch,
      stargazers_count: metadata.stargazers_count,
      language: metadata.language,
      topics: metadata.topics || []
    },
    readme: readme.slice(0, Number(process.env.MAX_README_CHARS || 18000)),
    commits: commits.map((item) => ({
      sha: item.sha?.slice(0, 7),
      message: item.commit?.message?.split('\\n')[0] || '',
      date: item.commit?.author?.date || null
    }))
  };
}