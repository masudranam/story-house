export interface storyFilters {
  id?: string;
  title?: string;
  category?: string;
  authorId?: string;
  sort?: 'asc' | 'desc';
  limit?: string;
  offset?: string;
  page?: string;
}
