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
import { CommentsService } from './comments.service';
import { CommentsQueryDto } from './dto/comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Moderation list: search all comments (admin only)',
  })
  @ApiPaginatedResponse(CommentEntity)
  @ApiBadRequestResponse({ description: 'Invalid pagination or filter params' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  adminList(
    @Query() query: CommentsQueryDto,
  ): Promise<{ data: CommentEntity[]; meta: PaginationMetaDto }> {
    return this.commentsService.adminList(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit own comment (bumps updatedAt)' })
  @ApiOkResponse({ type: CommentEntity })
  @ApiBadRequestResponse({ description: 'Validation failed or malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not the comment owner' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentsService.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment (owner or ADMIN)' })
  @ApiNoContentResponse({ description: 'Comment deleted' })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Neither owner nor admin' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.commentsService.remove(user, id);
  }
}
