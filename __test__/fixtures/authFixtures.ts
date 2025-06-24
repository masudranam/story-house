import { userAttributes } from "../../dto/user/userAtrributes.ts";

export const createSignupInput = (overrides = {}) => ({
  username: 'user_' + Math.random().toString(36).substring(2, 8),
  email: `test_${Date.now()}@mail.com`,
  password: 'StrongPass123!',
  name: 'Test User',
  ...overrides,
});

export const mockLoginInput = {
  identifier: 'abc',
  password: '12345',
};

export const createLoginInput = (
  type: 'email' | 'username' = 'email',
  overrides = {},
) => {
  const base = {
    emailOrUsername: type === 'email' ? 'test@mail.com' : 'testuser',
    password: 'StrongPass123!',
  };

  return {
    ...base,
    ...overrides,
  };
};


export const mockUserOutput: NonNullable<userAttributes> = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Masud Rana',
  username: 'masud123',
  email: 'masud@example.com',
  joinDate: new Date('2024-01-01T00:00:00Z'),
  role: 1, 
  passLastModificationTime: new Date('2025-01-01T00:00:00Z'),
};
