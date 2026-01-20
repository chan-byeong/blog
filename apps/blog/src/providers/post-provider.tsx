'use client';
import { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
import { createPostStore, PostState, PostStore } from '@/stores/post-store';

type PostStoreContextType = ReturnType<typeof createPostStore>;

const PostStoreContext = createContext<PostStoreContextType | null>(null);

const initializePostState = (initialState: PostState['posts']) => {
  const postCount = initialState.length;
  const postCountByTags = initialState.reduce(
    (acc, post) => {
      post.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    posts: initialState,
    selectedTags: [],
    postCount,
    postCountByTags,
  };
};

export const PostStoreProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: PostState['posts'];
}) => {
  const [store] = useState(() => {
    return createPostStore(initializePostState(initialState));
  });

  return (
    <PostStoreContext.Provider value={store}>
      {children}
    </PostStoreContext.Provider>
  );
};

export const usePostStore = <T,>(selector: (store: PostStore) => T): T => {
  const store = useContext(PostStoreContext);
  if (!store) {
    throw new Error('PostStoreContext not found');
  }

  return useStore(store, selector);
};
