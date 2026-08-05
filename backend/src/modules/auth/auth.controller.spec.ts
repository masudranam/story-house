import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    signup: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  it('signup delegates to the service with the DTO', async () => {
    const dto = {
      name: 'A',
      username: 'alice',
      email: 'a@x.dev',
      password: 'Password123!',
    };
    authService.signup.mockResolvedValue({ id: 'u1' });

    await expect(controller.signup(dto)).resolves.toEqual({ id: 'u1' });
    expect(authService.signup).toHaveBeenCalledWith(dto);
  });

  it('login delegates to the service', async () => {
    const dto = { identifier: 'alice', password: 'Password123!' };
    authService.login.mockResolvedValue({ accessToken: 'a' });

    await expect(controller.login(dto)).resolves.toEqual({ accessToken: 'a' });
  });

  it('refresh passes the guard-attached context to the service', async () => {
    const ctx = { userId: 'u1', jti: 'j1', token: 't' };
    authService.refresh.mockResolvedValue({ accessToken: 'new' });

    await expect(controller.refresh(ctx)).resolves.toEqual({
      accessToken: 'new',
    });
    expect(authService.refresh).toHaveBeenCalledWith(ctx);
  });

  it('logout revokes with the authenticated user id, not anything client-supplied', async () => {
    authService.logout.mockResolvedValue(undefined);
    const user = { id: 'u1', username: 'alice', role: Role.USER };

    await controller.logout(user, { refreshToken: 'r1' });

    expect(authService.logout).toHaveBeenCalledWith('u1', 'r1');
  });
});
