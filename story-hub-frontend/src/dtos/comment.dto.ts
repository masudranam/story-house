export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
  };
}