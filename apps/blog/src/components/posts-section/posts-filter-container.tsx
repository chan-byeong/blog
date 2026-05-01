'use client';

import { useCallback, useMemo, useState } from 'react';
import { SideBar } from '@/components/side-bar';
import { PostsSection } from '@/components/posts-section';
import type { Post } from '@/types/post';

const EXCLUDED_DEFAULT_TAG = '회고';

interface PostsFilterContainerProps {
  posts: Post[];
}

export const PostsFilterContainer = ({ posts }: PostsFilterContainerProps) => {
  const postCountByTags = useMemo(() => getPostCountByTags(posts), [posts]);
  const [selectedTags, setSelectedTags] = useState(() =>
    getDefaultSelectedTags(posts)
  );

  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) {
      return posts;
    }

    return posts.filter((post) =>
      post.tags?.some((tag) => selectedTags.includes(tag))
    );
  }, [posts, selectedTags]);

  const handleTagChange = useCallback((tag: string, checked: boolean) => {
    setSelectedTags((currentTags) => {
      if (checked) {
        return Array.from(new Set([...currentTags, tag]));
      }

      return currentTags.filter((currentTag) => currentTag !== tag);
    });
  }, []);

  return (
    <section className='col-span-full grid grid-cols-subgrid items-start gap-y-8 self-start pt-10 md:gap-y-14 md:pt-20'>
      <SideBar
        postCount={posts.length}
        postCountByTags={postCountByTags}
        selectedTags={selectedTags}
        onTagChange={handleTagChange}
      />
      <PostsSection posts={filteredPosts} />
    </section>
  );
};

function getPostCountByTags(posts: Post[]): Record<string, number> {
  return posts.reduce<Record<string, number>>((acc, post) => {
    post.tags?.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });

    return acc;
  }, {});
}

function getDefaultSelectedTags(posts: Post[]): string[] {
  return Array.from(new Set(posts.flatMap((post) => post.tags || []))).filter(
    (tag) => tag !== EXCLUDED_DEFAULT_TAG
  );
}
