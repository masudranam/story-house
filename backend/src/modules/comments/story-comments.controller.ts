import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationMetaDto } from '../../common/dto/paginated.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';

/** Comments as a sub-resource of stories (rule 20: relations are nested routes). */
@ApiTags('comments')
@Controller('stories/:storyId/comments')
export class StoryCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "A story's comments, newest first (paginated)" })
  @ApiPaginatedResponse(CommentEntity)
  @ApiBadRequestResponse({ description: 'Malformed UUID or pagination params' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  list(
    @Param('storyId', ParseUUIDPipe) storyId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<{ data: CommentEntity[]; meta: PaginationMetaDto }> {
    return this.commentsService.listForStory(storyId, query);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Comment on a story (author = the authenticated user)',
  })
  @ApiCreatedResponse({ type: CommentEntity })
  @ApiBadRequestResponse({ description: 'Validation failed or malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('storyId', ParseUUIDPipe) storyId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentsService.createForStory(user, storyId, dto);
  }
}
