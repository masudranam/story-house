import { AuthService } from '../../services/authService.ts';
import { userRepository } from '../../repository/userRepository.ts';
import { authRepository } from '../../repository/authRepository.ts';
import { passwordHandler } from '../../utils/hashedPassword.ts';
import { generateToken } from '../../utils/jwtHandler.ts';
import { signUpUser } from '../../dto/auth/signupUserDTO.ts';
import { loginUser } from '../../dto/auth/loginUserDTO.ts';

jest.mock('../../repository/userRepository.ts');
jest.mock('../../repository/authRepository.ts');
jest.mock('../../utils/hashedPassword.ts');
jest.mock('../../utils/jwtHandler.ts');

describe('AuthService', () => {
  const service = new AuthService();

  afterEach(() => jest.clearAllMocks());

  describe('signUpUser', () => {
    const newUser: signUpUser = {
      name: 'Masud',
      username: 'masud123',
      email: 'masud@example.com',
      password: 'pass123',
    };

    it('should throw error if user already exists', async () => {
      (userRepository.findUserByIdentifier as jest.Mock).mockResolvedValue({
        username: 'masud',
      });

      await expect(service.signUpUser(newUser)).rejects.toThrow(
        'username or email already exist',
      );
    });

    it('should create user if not exists', async () => {
      (userRepository.findUserByIdentifier as jest.Mock).mockResolvedValue(
        null,
      );
      const mockCreatedUser: signUpUser = {
        name: 'abc',
        username: 'Masud',
        email: 'email',
        password: 'password',
      };
      (authRepository.createUserWithAuth as jest.Mock).mockResolvedValue(
        mockCreatedUser,
      );

      const result = await service.signUpUser(newUser);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('loginUser', () => {
    const loginPayload: loginUser = {
      identifier: 'masud123',
      password: 'pass123',
    };

    const mockUser = {
      id: '1',
      username: 'masud123',
      email: 'masud@example.com',
      role: 0,
    };

    const mockAuth = {
      id: 'asldkf',
      password: 'hashedPassword',
    };

    it('should throw if user not found', async () => {
      (userRepository.findUserByIdentifier as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.loginUser(loginPayload)).rejects.toThrow(
        "User doesn't exist!",
      );
    });

    it('should throw if password mismatch', async () => {
      (userRepository.findUserByIdentifier as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (authRepository.findAuthByUserId as jest.Mock).mockResolvedValue(
        mockAuth,
      );
      (passwordHandler.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.loginUser(loginPayload)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should return token on success', async () => {
      (userRepository.findUserByIdentifier as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (authRepository.findAuthByUserId as jest.Mock).mockResolvedValue(
        mockAuth,
      );
      (passwordHandler.comparePassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('mocked-token');

      const result = await service.loginUser(loginPayload);
      expect(result).toEqual({
        message: 'Login seccessful',
        token: 'Bearer mocked-token',
      });
    });
  });
});
