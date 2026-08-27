import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import {
  AuthSessionEntity,
  TokenPairEntity,
} from './entities/auth-tokens.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { RefreshContext } from './strategies/jwt-refresh.strategy';

@ApiTags('auth')
@ApiTooManyRequestsResponse({
  description: 'Rate limit exceeded (applies to every /auth route)',
})
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({ type: UserEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Username or email already taken' })
  signup(@Body() dto: SignupDto): Promise<UserEntity> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with username or email' })
  @ApiOkResponse({ type: AuthSessionEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<AuthSessionEntity> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate the refresh token and get a new access token',
  })
  @ApiOkResponse({ type: TokenPairEntity })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or revoked refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  refresh(@CurrentUser() ctx: RefreshContext): Promise<TokenPairEntity> {
    // JwtRefreshGuard verified signature/expiry (fromBodyField) and attached
    // the context; malformed bodies already got 401 from the guard, so no
    // body pipe is needed here — the DTO is documentation.
    return this.authService.refresh(ctx);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiNoContentResponse({ description: 'Token revoked (idempotent)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }
}
