export interface signUpUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface createAuthDTO {
  username: string;
  password: string;
}

export interface createUserDTO {
  name: string;
  username: string;
  email: string;
}

export interface getUserInfoDTO {
  id: string;
  name: string;
  username: string;
  email: string;
  joinDate: Date;
  role: number;
  passLastModificationTime: Date;
}

export interface createStoryDTO {
  title: string;
  description: string;
  authorId?: string;
}

export interface getStoryInfoDTO {
  id: string;
  title: string;
  description: string;
  authorUserName: string;
  authorName: string;
  authorId: string;
  lastModificationTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
