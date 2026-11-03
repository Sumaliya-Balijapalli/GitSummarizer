import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubRepositoryUrl } from '../src/services/github.service.js';

test('parses a normal GitHub repository URL', () => {
  assert.deepEqual(parseGitHubRepositoryUrl('https://github.com/facebook/react'), {
    owner: 'facebook', name: 'react', canonicalUrl: 'https://github.com/facebook/react'
  });
});
test('supports .git suffix', () => {
  assert.equal(parseGitHubRepositoryUrl('https://github.com/example/project.git').name, 'project');
});
test('rejects non-GitHub hosts', () => {
  assert.throws(() => parseGitHubRepositoryUrl('https://example.com/a/b'));
});
test('rejects URLs without owner and repository', () => {
  assert.throws(() => parseGitHubRepositoryUrl('https://github.com/facebook'));
});