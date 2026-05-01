import 'server-only';

import { Octokit } from '@octokit/rest';
import { cacheLife, cacheTag } from 'next/cache';
import type {
  GitHubContentConfig,
  GitHubContentItem,
  GitHubFileContent,
  GitHubRequestError,
  PostSource,
} from '@/@types/github-content';
import {
  GitHubContentError,
  toGitHubContentError,
} from './github-content-error';
import { POSTS_CACHE_TAG, getPostCacheTag } from './post-cache-tags';

const GITHUB_API_VERSION = '2022-11-28';
const POSTS_DIRECTORY = 'posts';
const DEFAULT_BRANCH = 'main';
const POST_FILE_EXTENSIONS = ['.mdx', '.md'] as const;

export function hasGitHubContentConfig(): boolean {
  return Boolean(
    process.env.GITHUB_CONTENT_OWNER?.trim() &&
    process.env.GITHUB_CONTENT_REPO?.trim()
  );
}

export async function getPostSlugs(): Promise<string[]> {
  'use cache';
  cacheLife('days');
  cacheTag(POSTS_CACHE_TAG);

  const config = getGitHubContentConfig();
  const payload = await fetchGitHubContent(config, POSTS_DIRECTORY);

  if (!Array.isArray(payload)) {
    throw new GitHubContentError(
      'Expected GitHub posts directory response to be an array.'
    );
  }

  return payload
    .filter(isGitHubContentItem)
    .filter((item) => item.type === 'file' && isPostFileName(item.name))
    .map((item) => getSlugFromPostFileName(item.name));
}

export async function getPostSourceBySlug(
  slug: string
): Promise<string | null> {
  'use cache';
  cacheLife('days');
  cacheTag(getPostCacheTag(slug));

  const config = getGitHubContentConfig();
  const payload = await fetchPostContentBySlug(config, slug);

  if (payload === null) {
    return null;
  }

  if (!isGitHubFileContent(payload)) {
    throw new GitHubContentError(
      `Expected GitHub post "${slug}" response to be a base64 file.`
    );
  }

  return decodeBase64Content(payload.content);
}

export async function getAllPostSources(): Promise<PostSource[]> {
  'use cache';
  cacheLife('days');
  cacheTag(POSTS_CACHE_TAG);

  const slugs = await getPostSlugs();
  const sources = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      source: await getPostSourceBySlug(slug),
    }))
  );

  return sources
    .filter(
      (postSource): postSource is { slug: string; source: string } =>
        postSource.source !== null
    )
    .map(({ slug, source }) => ({ slug, source }));
}

function getGitHubContentConfig(): GitHubContentConfig {
  const owner = process.env.GITHUB_CONTENT_OWNER?.trim();
  const repo = process.env.GITHUB_CONTENT_REPO?.trim();
  const branch = process.env.GITHUB_CONTENT_BRANCH?.trim() || DEFAULT_BRANCH;
  const token = process.env.GITHUB_CONTENT_TOKEN?.trim();

  if (!owner) {
    throw new GitHubContentError(
      'Missing required environment variable: GITHUB_CONTENT_OWNER.'
    );
  }

  if (!repo) {
    throw new GitHubContentError(
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

function fetchGitHubContent(
  config: GitHubContentConfig,
  path: string,
  options?: { allowNotFound?: false }
): Promise<unknown>;
function fetchGitHubContent(
  config: GitHubContentConfig,
  path: string,
  options: { allowNotFound: true }
): Promise<unknown | null>;
async function fetchGitHubContent(
  config: GitHubContentConfig,
  path: string,
  options: { allowNotFound?: boolean } = {}
): Promise<unknown | null> {
  const octokit = createOctokit(config);

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
    if (
      options.allowNotFound === true &&
      isGitHubRequestError(error) &&
      error.status === 404
    ) {
      return null;
    }

    throw toGitHubContentError(error);
  }
}

function createOctokit(config: GitHubContentConfig): Octokit {
  return new Octokit({
    ...(config.token ? { auth: config.token } : {}),
  });
}

async function fetchPostContentBySlug(
  config: GitHubContentConfig,
  slug: string
): Promise<unknown | null> {
  for (const extension of POST_FILE_EXTENSIONS) {
    const payload = await fetchGitHubContent(
      config,
      `${POSTS_DIRECTORY}/${slug}${extension}`,
      { allowNotFound: true }
    );

    if (payload !== null) {
      return payload;
    }
  }

  return null;
}

function isGitHubContentItem(value: unknown): value is GitHubContentItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'type' in value &&
    typeof value.name === 'string' &&
    typeof value.type === 'string'
  );
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
    'message' in value &&
    typeof value.status === 'number' &&
    typeof value.message === 'string'
  );
}

function isPostFileName(fileName: string): boolean {
  return POST_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

function getSlugFromPostFileName(fileName: string): string {
  const extension = POST_FILE_EXTENSIONS.find((postExtension) =>
    fileName.endsWith(postExtension)
  );

  if (extension === undefined) {
    return fileName;
  }

  return fileName.slice(0, -extension.length);
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8');
}
