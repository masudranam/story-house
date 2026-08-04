import { userRepository } from '../../repository/userRepository.ts';
import { userService } from '../../services/userService.ts';
import { userAttributes } from '../../dto/user/userAtrributes';
import { userFilters } from '../../dto/user/userFilters.ts';
import { getMockUser } from '../fixtures/userFixtures';

jest.mock('../../repository/userRepository.ts');

describe('UserService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getUserById', () => {
    it('return the mocked user which is return form mockRepo', async () => {
      const mockUser: Partial<userAttributes> = { id: '1', name: 'Masud' };
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
      const result = await userService.getUserById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('searchUser', () => {
    it('should return all users matching filters', async () => {
      const filters: userFilters = { name: 'Masud', username: 'masud123' };
      const mockUsers: userAttributes[] = [getMockUser()];

      (userRepository.searchUser as jest.Mock).mockResolvedValue(mockUsers);
      const result = await userService.searchUser(filters);
      expect(userRepository.searchUser).toHaveBeenCalledWith(filters, 5, 0);
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
    it('update username if newUsername provided', async () => {
      const curUsername = 'old';
      const newUsername = 'new';

      await userService.updateUserName(curUsername, newUsername);
      expect(userRepository.updateUsername).toHaveBeenCalledWith(
        curUsername,
        newUsername,
      );
    });

    it('throw error if newUsername not provided', async () => {
      await expect(userService.updateUserName('cur', '')).rejects.toThrow(
        'New username required',
      );
    });
  });

  describe('deleteUserById', () => {
    it('should call repository delete by id', async () => {
      await userService.deleteUserById('123');
      expect(userRepository.deleteUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('userService.searchUser - pagination', () => {
    it('call repository with correct filters, limit and offset', async () => {
      const query: userFilters = {
        name: 'masud',
        page: 2,
        limit: 5,
      };

      const mockUsers: userAttributes[] = [
        getMockUser(),
        getMockUser(),
        getMockUser(),
      ];

      const repoSpy = jest
        .spyOn(userRepository, 'searchUser')
        .mockResolvedValue(mockUsers);
      const result = await userService.searchUser(query);

      expect(repoSpy).toHaveBeenCalledWith({ name: 'masud' }, 5, 5);

      expect(result).toEqual(mockUsers);
    });

    it('default page = 1, limit = 5 if not provided any query', async () => {
      const query: userFilters = { name: 'masud' };

      const mockUsers: userAttributes[] = [];
      const expectedFilters = { name: 'masud' };
      const expectedLimit = 5;
      const expectedOffset = 0;

      const repoSpy = jest
        .spyOn(userRepository, 'searchUser')
        .mockResolvedValue(mockUsers);

      const res = await userService.searchUser(query);

      expect(repoSpy).toHaveBeenCalledWith(
        expectedFilters,
        expectedLimit,
        expectedOffset,
      );
    });
  });
});
