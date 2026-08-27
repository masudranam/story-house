/** Mirrors docs/API_CONTRACT.md exactly — the single source of truth for shapes. */

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Public profile — never includes email. */
export type PublicUser = Omit<User, 'email'>;

export interface AuthorLite {
  id: string;
  name: string;
  username: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  author: AuthorLite;
  likesCount: number;
  commentsCount: number;
  /** Present only on single-story reads for authenticated callers. */
  likedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  storyId: string;
  author: AuthorLite;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalUsers: number;
  totalStories: number;
  totalComments: number;
  newUsersThisWeek: number;
  newStoriesThisWeek: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends TokenPair {
  user: User;
}

/** The backend's global error shape. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export type StorySort = 'createdAt:desc' | 'createdAt:asc';
