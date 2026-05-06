'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { AdminPostSummary } from '@/types/admin-post';

export type VisibilityFilter = 'all' | 'published' | 'hidden';

interface VisibilityCounts {
  all: number;
  published: number;
  hidden: number;
}

interface VisibilitySuccessResponse {
  success: true;
  post: {
    slug: string;
    title: string;
    published: boolean;
  };
  commitSha: string;
}

interface AdminPostsContextValue {
  managedPosts: AdminPostSummary[];
  filteredPosts: AdminPostSummary[];
  counts: VisibilityCounts;
  selectedFilter: VisibilityFilter;
  pendingSlug: string | null;
  rowErrors: Record<string, string>;
  setSelectedFilter: (filter: VisibilityFilter) => void;
  toggleVisibility: (post: AdminPostSummary) => Promise<void>;
  logout: () => Promise<void>;
}

interface AdminPostsProviderProps {
  initialPosts: AdminPostSummary[];
  children: ReactNode;
}

const AdminPostsContext = createContext<AdminPostsContextValue | null>(null);

export function AdminPostsProvider({
  initialPosts,
  children,
}: AdminPostsProviderProps) {
  const [managedPosts, setManagedPosts] = useState(initialPosts);
  const [selectedFilter, setSelectedFilterState] =
    useState<VisibilityFilter>('all');
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const counts = useMemo(() => getVisibilityCounts(managedPosts), [managedPosts]);
  const filteredPosts = useMemo(
    () => getFilteredPosts(managedPosts, selectedFilter),
    [managedPosts, selectedFilter]
  );

  const setSelectedFilter = useCallback((filter: VisibilityFilter) => {
    setSelectedFilterState(filter);
  }, []);

  const toggleVisibility = useCallback(
    async (post: AdminPostSummary) => {
      if (pendingSlug !== null) {
        return;
      }

      const nextPublished = !post.published;
      setPendingSlug(post.slug);
      clearRowError(post.slug, setRowErrors);
      updatePostPublished(post.slug, nextPublished, setManagedPosts);

      try {
        const response = await fetch(
          `/api/admin/posts/${encodeURIComponent(post.slug)}/visibility`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ published: nextPublished }),
          }
        );

        const payload = (await response.json()) as unknown;

        if (!response.ok || !isVisibilitySuccessResponse(payload)) {
          throw new Error('Visibility update failed.');
        }

        updatePostPublished(post.slug, payload.post.published, setManagedPosts);
      } catch {
        updatePostPublished(post.slug, post.published, setManagedPosts);
        setRowErrors((currentErrors) => ({
          ...currentErrors,
          [post.slug]: '변경을 저장하지 못했습니다.',
        }));
      } finally {
        setPendingSlug(null);
      }
    },
    [pendingSlug]
  );

  const logout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign('/');
  }, []);

  const value = useMemo<AdminPostsContextValue>(
    () => ({
      managedPosts,
      filteredPosts,
      counts,
      selectedFilter,
      pendingSlug,
      rowErrors,
      setSelectedFilter,
      toggleVisibility,
      logout,
    }),
    [
      managedPosts,
      filteredPosts,
      counts,
      selectedFilter,
      pendingSlug,
      rowErrors,
      setSelectedFilter,
      toggleVisibility,
      logout,
    ]
  );

  return (
    <AdminPostsContext.Provider value={value}>
      {children}
    </AdminPostsContext.Provider>
  );
}

export function useAdminPosts(): AdminPostsContextValue {
  const context = useContext(AdminPostsContext);

  if (context === null) {
    throw new Error('useAdminPosts must be used within AdminPostsProvider.');
  }

  return context;
}

function getVisibilityCounts(posts: AdminPostSummary[]): VisibilityCounts {
  const published = posts.filter((post) => post.published).length;

  return {
    all: posts.length,
    published,
    hidden: posts.length - published,
  };
}

function getFilteredPosts(
  posts: AdminPostSummary[],
  selectedFilter: VisibilityFilter
): AdminPostSummary[] {
  if (selectedFilter === 'published') {
    return posts.filter((post) => post.published);
  }

  if (selectedFilter === 'hidden') {
    return posts.filter((post) => !post.published);
  }

  return posts;
}

function updatePostPublished(
  slug: string,
  published: boolean,
  setManagedPosts: Dispatch<SetStateAction<AdminPostSummary[]>>
) {
  setManagedPosts((currentPosts) =>
    currentPosts.map((post) =>
      post.slug === slug ? { ...post, published } : post
    )
  );
}

function clearRowError(
  slug: string,
  setRowErrors: Dispatch<SetStateAction<Record<string, string>>>
) {
  setRowErrors((currentErrors) => {
    const nextErrors = { ...currentErrors };
    delete nextErrors[slug];

    return nextErrors;
  });
}

function isVisibilitySuccessResponse(
  value: unknown
): value is VisibilitySuccessResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'post' in value &&
    'commitSha' in value &&
    value.success === true &&
    typeof value.commitSha === 'string' &&
    isVisibilityPost(value.post)
  );
}

function isVisibilityPost(
  value: unknown
): value is VisibilitySuccessResponse['post'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    'title' in value &&
    'published' in value &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.published === 'boolean'
  );
}
