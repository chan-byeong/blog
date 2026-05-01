import 'server-only';

const POSTS_FILE_PATTERN = /^posts\/([^/]+)\.(?:mdx|md)$/;

interface GitHubPushCommit {
  added?: unknown;
  modified?: unknown;
  removed?: unknown;
}

interface GitHubPushPayload {
  commits?: unknown;
  head_commit?: unknown;
}

export function getChangedPostSlugs(payload: unknown): string[] {
  if (!isGitHubPushPayload(payload)) {
    return [];
  }

  const commits = getPushCommits(payload);
  const changedFiles = new Set<string>();

  for (const commit of commits) {
    for (const filePath of getCommitFilePaths(commit)) {
      changedFiles.add(filePath);
    }
  }

  return [...changedFiles]
    .map(getPostSlugFromPath)
    .filter((slug): slug is string => slug !== null)
    .sort();
}

export function getPostSlugFromPath(filePath: string): string | null {
  const match = POSTS_FILE_PATTERN.exec(filePath);

  if (!match) {
    return null;
  }

  return match[1];
}

function getPushCommits(payload: GitHubPushPayload): GitHubPushCommit[] {
  const commits = Array.isArray(payload.commits) ? payload.commits : [];
  const headCommit = isGitHubPushCommit(payload.head_commit)
    ? [payload.head_commit]
    : [];

  return [...commits, ...headCommit].filter(isGitHubPushCommit);
}

function getCommitFilePaths(commit: GitHubPushCommit): string[] {
  return [
    ...getStringArray(commit.added),
    ...getStringArray(commit.modified),
    ...getStringArray(commit.removed),
  ];
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function isGitHubPushPayload(value: unknown): value is GitHubPushPayload {
  return typeof value === 'object' && value !== null;
}

function isGitHubPushCommit(value: unknown): value is GitHubPushCommit {
  return typeof value === 'object' && value !== null;
}
