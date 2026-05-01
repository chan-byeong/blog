import { Octokit } from '@octokit/rest';
import { NextRequest } from 'next/server';
import type {
  GitHubContentConfig,
  GitHubFileContent,
  GitHubRequestError,
} from '@/@types/github-content';

const GITHUB_API_VERSION = '2022-11-28';
const DEFAULT_BRANCH = 'main';
const ATTACHMENTS_DIRECTORY = 'posts/attachments';
const CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400';
const CONTENT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

interface AttachmentRouteParams {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: AttachmentRouteParams
) {
  const { path } = await params;
  const attachmentPath = getAttachmentPath(path);

  if (attachmentPath === null) {
    return Response.json(
      { success: false, error: 'invalid_attachment_path' },
      { status: 400 }
    );
  }

  const config = getGitHubContentConfig();
  const payload = await fetchAttachmentContent(config, attachmentPath);

  if (payload === null) {
    return Response.json(
      { success: false, error: 'attachment_not_found' },
      { status: 404 }
    );
  }

  if (!isGitHubFileContent(payload)) {
    return Response.json(
      { success: false, error: 'invalid_attachment_content' },
      { status: 502 }
    );
  }

  const body = Buffer.from(payload.content.replace(/\s/g, ''), 'base64');

  return new Response(body, {
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': getContentType(attachmentPath),
    },
  });
}

function getAttachmentPath(pathSegments: string[]): string | null {
  if (pathSegments.length === 0) {
    return null;
  }

  if (pathSegments.some((segment) => segment === '' || segment === '..')) {
    return null;
  }

  return `${ATTACHMENTS_DIRECTORY}/${pathSegments.map(encodeURIComponent).join('/')}`;
}

function getGitHubContentConfig(): GitHubContentConfig {
  const owner = process.env.GITHUB_CONTENT_OWNER?.trim();
  const repo = process.env.GITHUB_CONTENT_REPO?.trim();
  const branch = process.env.GITHUB_CONTENT_BRANCH?.trim() || DEFAULT_BRANCH;
  const token = process.env.GITHUB_CONTENT_TOKEN?.trim();

  if (!owner) {
    throw new Error(
      'Missing required environment variable: GITHUB_CONTENT_OWNER.'
    );
  }

  if (!repo) {
    throw new Error(
      'Missing required environment variable: GITHUB_CONTENT_REPO.'
    );
  }

  return {
    owner,
    repo,
    branch,
    ...(token ? { token } : {}),
  };
}

async function fetchAttachmentContent(
  config: GitHubContentConfig,
  path: string
): Promise<unknown | null> {
  const octokit = new Octokit({
    ...(config.token ? { auth: config.token } : {}),
  });

  try {
    const response = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: config.branch,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });

    return response.data;
  } catch (error) {
    if (isGitHubRequestError(error) && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function isGitHubFileContent(
  value: unknown
): value is Required<GitHubFileContent> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'encoding' in value &&
    'content' in value &&
    value.type === 'file' &&
    value.encoding === 'base64' &&
    typeof value.content === 'string'
  );
}

function isGitHubRequestError(value: unknown): value is GitHubRequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'number'
  );
}

function getContentType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();

  if (!extension) {
    return 'application/octet-stream';
  }

  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}
