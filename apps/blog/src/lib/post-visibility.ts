import matter from 'gray-matter';

export function updatePostPublishedInSource(
  source: string,
  published: boolean
): string {
  const parsed = matter(source);

  return matter.stringify(parsed.content, {
    ...parsed.data,
    published,
  });
}
