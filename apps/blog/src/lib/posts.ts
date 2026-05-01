import matter from 'gray-matter';
import { getAllPostSources, getPostSourceBySlug } from './github-content';
import type { Post, PostMetadata } from '@/types/post';

type ParsedPost = Post | null;

/**
 * 모든 포스트의 메타데이터를 가져옵니다.
 * 향후 CMS로 마이그레이션 시 이 함수만 수정하면 됩니다.
 */
export async function getAllPosts(): Promise<Post[]> {
  const postSources = await getAllPostSources();
  const allPostsData = postSources
    .map(({ slug, source }) => parsePostSource(slug, source))
    .filter((post): post is Post => post !== null);

  // 날짜순으로 정렬 (최신순)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * 특정 slug의 포스트를 가져옵니다.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const normalizedSlug = decodePostSlug(slug);
  const source = await getPostSourceBySlug(normalizedSlug);

  if (source === null) {
    return null;
  }

  return parsePostSource(normalizedSlug, source);
}

/**
 * 모든 포스트의 slug 배열을 가져옵니다.
 * 정적 생성(Static Generation)에 사용됩니다.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const allPosts = await getAllPosts();
  return allPosts.map((post) => post.slug);
}

/**
 * 태그별로 포스트를 필터링합니다.
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags?.includes(tag));
}

/**
 * 모든 태그를 가져옵니다.
 */
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagsSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

function parsePostSource(slug: string, source: string): ParsedPost {
  const { data, content } = matter(source);

  if (data.published === false) {
    return null;
  }

  const metadata = getPostMetadata(slug, data);

  return {
    slug,
    content,
    ...metadata,
  };
}

function getPostMetadata(
  slug: string,
  data: Record<string, unknown>
): PostMetadata {
  const title = getStringField(slug, data, 'title');
  const description = getStringField(slug, data, 'description');

  if (data.tags !== undefined && !isStringArray(data.tags)) {
    throw new Error(
      `Invalid frontmatter for post "${slug}": tags must be an array of strings.`
    );
  }

  const date = normalizeDateField(slug, data.date, 'date');
  const updatedAt =
    data.updatedAt === undefined
      ? undefined
      : normalizeDateField(slug, data.updatedAt, 'updatedAt');

  if (data.coverImage !== undefined && typeof data.coverImage !== 'string') {
    throw new Error(
      `Invalid frontmatter for post "${slug}": coverImage must be a string.`
    );
  }

  return {
    title,
    description,
    date,
    ...(data.tags !== undefined ? { tags: data.tags } : {}),
    ...(typeof data.author === 'string' ? { author: data.author } : {}),
    ...(typeof data.image === 'string' ? { image: data.image } : {}),
    ...(typeof data.coverImage === 'string'
      ? { coverImage: data.coverImage }
      : {}),
    ...(typeof data.published === 'boolean'
      ? { published: data.published }
      : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
  };
}

function getStringField(
  slug: string,
  data: Record<string, unknown>,
  fieldName: 'title' | 'description'
): string {
  const value = data[fieldName];

  if (typeof value !== 'string') {
    throw new Error(
      `Invalid frontmatter for post "${slug}": ${fieldName} must be a string.`
    );
  }

  return value;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function decodePostSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function normalizeDateField(
  slug: string,
  value: unknown,
  fieldName: 'date' | 'updatedAt'
): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  throw new Error(
    `Invalid frontmatter for post "${slug}": ${fieldName} must be a string.`
  );
}
