import { userService } from '../../services/userService.ts';
import { userRepository } from '../../repository/userRepository.ts';
import { userAttributes } from '../../dto/user/userAtrributes.ts';
import { userFilters } from '../../dto/user/userFilters.ts';

jest.mock('../../repository/userRepository.ts');

describe('UserService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser: Partial<userAttributes> = { id: '1', name: 'Masud' };
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUser', () => {
    it('should return all users matching filters', async () => {
      const filters: userFilters = { name: 'Masud', username: 'masud123' };
      const mockUsers: userAttributes[] = [
        {
          id: '1',
          name: 'Masud',
          username: 'masud123',
          email: '',
          joinDate: new Date(),
          role: 0,
          passLastModificationTime: new Date(),
        },
      ];

      (userRepository.getAllUser as jest.Mock).mockResolvedValue(mockUsers);
      const result = await userService.getAllUser(filters);

      expect(userRepository.getAllUser).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      const mockUser: Partial<userAttributes> = { username: 'masud123' };
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await userService.getUserByUsername('masud123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserName', () => {
    it('should update username if newUsername provided', async () => {
      const curUsername = 'old';
      const newUsername = 'new';

      await userService.updateUserName(curUsername, newUsername);
      expect(userRepository.updateUsername).toHaveBeenCalledWith(
        curUsername,
        newUsername,
      );
    });

    it('should throw error if newUsername not provided', async () => {
      await expect(userService.updateUserName('cur', '')).rejects.toThrow(
        'New username required',
      );
    });
  });

  describe('deleteUserByUsername', () => {
    it('should call repository delete by username', async () => {
      await userService.deleteUserByUsername('masud123');
      expect(userRepository.deleteUserByUsername).toHaveBeenCalledWith(
        'masud123',
      );
    });
  });

  describe('deleteUserById', () => {
    it('should call repository delete by id', async () => {
      await userService.deleteUserById('123');
      expect(userRepository.deleteUserById).toHaveBeenCalledWith('123');
    });
  });
});
