type Nullable<T> = {
  [K in keyof T]?: T[K] | null;
};

export type userAttributes =  {
  id: string;
  name: string;
  username: string;
  email: string;
  joinDate: Date;
  role: number;
  passLastModificationTime: Date;
} | null;
