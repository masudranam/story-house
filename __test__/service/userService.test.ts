import { userRepository } from '../../repository/userRepository.ts';
import { userService } from '../../services/userService.ts';
import { userAttributes } from '../../dto/user/userAtrributes';
import { userFilters } from '../../dto/user/userFilters.ts';
import { getMockUser } from '../fixtures/userFixtures';

describe('userService.searchUser - pagination', () => {
  it('should call repository with correct filters, limit and offset', async () => {
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
    const expectedFilters = {name: 'masud'};
    const expectedLimit = 5;
    const expectedOffset = 0;

    const repoSpy = jest
      .spyOn(userRepository, 'searchUser')
      .mockResolvedValue(mockUsers);

    await userService.searchUser(query);

    expect(repoSpy).toHaveBeenCalledWith(expectedFilters, expectedLimit, expectedOffset);
  });
});
