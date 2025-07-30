import { userAttributes } from '../../dto/user/userAtrributes.ts';

export function getMockUser(
  overrides?: Partial<NonNullable<userAttributes>>,
): NonNullable<userAttributes> {
  const randomId = () => crypto.randomUUID();
  const now = new Date();

  return {
    id: randomId(),
    name: 'John Doe',
    username: 'johndoe' + Math.floor(Math.random() * 1000),
    email: `john${Math.floor(Math.random() * 1000)}@example.com`,
    joinDate: now,
    role: Math.random() > 0.5 ? 0 : 1,
    passLastModificationTime: now,
    ...overrides,
  };
}
