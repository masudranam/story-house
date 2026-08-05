import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersService = {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    changePassword: jest.fn(),
    deleteMe: jest.fn(),
    getPublicProfile: jest.fn(),
    adminList: jest.fn(),
    adminDelete: jest.fn(),
    stats: jest.fn(),
  };

  const me = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('me endpoints operate on the token identity, never a client-supplied id', async () => {
    usersService.getMe.mockResolvedValue({ id: 'user-1' });
    usersService.updateMe.mockResolvedValue({ id: 'user-1' });
    usersService.changePassword.mockResolvedValue(undefined);
    usersService.deleteMe.mockResolvedValue(undefined);

    await controller.getMe(me);
    await controller.updateMe(me, { name: 'New' });
    await controller.changePassword(me, {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword456!',
    });
    await controller.deleteMe(me);

    expect(usersService.getMe).toHaveBeenCalledWith('user-1');
    expect(usersService.updateMe).toHaveBeenCalledWith('user-1', {
      name: 'New',
    });
    expect(usersService.changePassword).toHaveBeenCalledWith(
      'user-1',
      expect.any(Object),
    );
    expect(usersService.deleteMe).toHaveBeenCalledWith(me);
  });

  it('admin delete passes the acting admin for the self-delete check', async () => {
    usersService.adminDelete.mockResolvedValue(undefined);
    const admin = { id: 'admin-1', username: 'admin', role: Role.ADMIN };

    await controller.adminDelete(admin, 'user-2');

    expect(usersService.adminDelete).toHaveBeenCalledWith(admin, 'user-2');
  });
});
