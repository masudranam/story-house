export interface Post {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
  author:{
    name:string;
    username:string;
    email:string;
  }
}