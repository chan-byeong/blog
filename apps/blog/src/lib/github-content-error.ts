import type { GitHubRequestError } from '@/@types/github-content';

export class GitHubContentError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GitHubContentError';
    this.status = status;
  }
}

export function toGitHubContentError(error: unknown): GitHubContentError {
  if (isGitHubRequestError(error)) {
    return new GitHubContentError(
      `GitHub content request failed with status ${error.status}. ${error.message}`,
      error.status
    );
  }

  if (error instanceof Error) {
    return new GitHubContentError(
      `Failed to fetch GitHub content: ${error.message}`
    );
  }

  return new GitHubContentError('Failed to fetch GitHub content.');
}

function isGitHubRequestError(value: unknown): value is GitHubRequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    typeof value.status === 'number' &&
    typeof value.message === 'string'
  );
}
