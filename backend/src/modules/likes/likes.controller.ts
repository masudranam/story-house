import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { LikesService } from './likes.service';

/** The current user's like on a story — a PUT/DELETE toggle pair (rule 20). */
@ApiTags('likes')
@ApiBearerAuth()
@Controller('stories/:storyId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Like a story (idempotent)' })
  @ApiNoContentResponse({ description: 'Liked (or already liked)' })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  like(
    @CurrentUser() user: AuthUser,
    @Param('storyId', ParseUUIDPipe) storyId: string,
  ): Promise<void> {
    return this.likesService.like(user, storyId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove own like (idempotent)' })
  @ApiNoContentResponse({ description: 'Unliked (or was never liked)' })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  unlike(
    @CurrentUser() user: AuthUser,
    @Param('storyId', ParseUUIDPipe) storyId: string,
  ): Promise<void> {
    return this.likesService.unlike(user, storyId);
  }
}
