import { StateCreator, createStore } from 'zustand/vanilla';
import { Post } from '@/types/post';

export type PostState = {
  posts: Post[];
  selectedTags: string[];
  postCount: number;
  postCountByTags: Record<string, number>;
};

export type PostActions = {
  getAllPosts: () => Post[];
  getPostsByTags: (tags: string[]) => Post[];
  getFilteredPosts: () => Post[];
  getAllTags: () => string[];
  getSelectedTags: () => string[];
  addSelectedTag: (tag: string) => void;
  removeSelectedTag: (tag: string) => void;
};

export type PostStore = PostState & PostActions;

const createPostSlice: StateCreator<PostStore, [], [], PostStore> = (
  set,
  get
) =>
  ({
    getAllPosts: () => {
      return get().posts;
    },
    getPostsByTags: (tags: string[]) => {
      return get().posts.filter((post) =>
        post.tags?.some((tag) => tags.includes(tag))
      );
    },
    getFilteredPosts: () => {
      const selectedTags = get().selectedTags;
      if (selectedTags.length === 0) {
        return get().posts;
      }
      return get().posts.filter((post) =>
        post.tags?.some((tag) => selectedTags.includes(tag))
      );
    },
    getAllTags: () => {
      return Array.from(
        new Set(get().posts.flatMap((post) => post.tags || []))
      );
    },
    addSelectedTag: (tag: string) => {
      set({ selectedTags: Array.from(new Set([...get().selectedTags, tag])) });
    },
    removeSelectedTag: (tag: string) => {
      set({ selectedTags: get().selectedTags.filter((t) => t !== tag) });
    },
    getSelectedTags: () => {
      return get().selectedTags;
    },
  }) as PostStore;

export const createPostStore = (initialState: PostState) => {
  return createStore<PostStore>()((set, get, store) => ({
    ...initialState,
    ...createPostSlice(set, get, store),
  }));
};
