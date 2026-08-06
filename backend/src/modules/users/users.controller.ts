import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationMetaDto } from '../../common/dto/paginated.dto';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { TokenPairEntity } from '../auth/entities/auth-tokens.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { PublicUserEntity } from './entities/public-user.entity';
import { StatsEntity } from './entities/stats.entity';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user (includes email)' })
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getMe(@CurrentUser() user: AuthUser): Promise<UserEntity> {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own name and/or username' })
  @ApiOkResponse({ type: UserEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiConflictResponse({ description: 'Username already taken' })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeDto,
  ): Promise<UserEntity> {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Change own password — signs out other sessions, re-credentials this one',
  })
  @ApiOkResponse({ type: TokenPairEntity })
  @ApiBadRequestResponse({
    description: 'New password invalid or same as current',
  })
  @ApiUnauthorizedResponse({
    description: 'Current password incorrect or no token',
  })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<TokenPairEntity> {
    return this.usersService.changePassword(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete own account (cascades stories, comments, likes)',
  })
  @ApiNoContentResponse({ description: 'Account deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({
    description: 'Admins cannot delete their own account',
  })
  deleteMe(@CurrentUser() user: AuthUser): Promise<void> {
    return this.usersService.deleteMe(user);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Platform statistics (admin only)' })
  @ApiOkResponse({ type: StatsEntity })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  stats(): Promise<StatsEntity> {
    return this.usersService.stats();
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List/search users (admin only)' })
  @ApiPaginatedResponse(UserEntity)
  @ApiBadRequestResponse({ description: 'Invalid pagination or filter params' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  list(
    @Query() query: UsersQueryDto,
  ): Promise<{ data: UserEntity[]; meta: PaginationMetaDto }> {
    return this.usersService.adminList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "A user's public profile (no email)" })
  @ApiOkResponse({ type: PublicUserEntity })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getPublicProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicUserEntity> {
    return this.usersService.getPublicProfile(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (admin only, not self)' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role / cannot delete own account',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  adminDelete(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.usersService.adminDelete(actor, id);
  }
}
