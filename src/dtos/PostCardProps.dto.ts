export interface Props {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    email: string;
  };
  likesCount?: number;
  commentsCount?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}