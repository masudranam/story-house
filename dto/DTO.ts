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
