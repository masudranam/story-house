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
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationMetaDto } from '../../common/dto/paginated.dto';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoriesQueryDto } from './dto/stories-query.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryEntity } from './entities/story.entity';
import { StoriesService } from './stories.service';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List stories (paginated, searchable, sortable)' })
  @ApiPaginatedResponse(StoryEntity)
  @ApiBadRequestResponse({
    description: 'Invalid pagination, filter, or sort params',
  })
  list(
    @Query() query: StoriesQueryDto,
  ): Promise<{ data: StoryEntity[]; meta: PaginationMetaDto }> {
    return this.storiesService.list(query);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish a story (author = the authenticated user)',
  })
  @ApiCreatedResponse({ type: StoryEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateStoryDto,
  ): Promise<StoryEntity> {
    return this.storiesService.create(user, dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Read a story (likedByMe included for authenticated callers)',
  })
  @ApiOkResponse({ type: StoryEntity })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<StoryEntity> {
    return this.storiesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Edit own story (owner only — moderation is delete-only)',
  })
  @ApiOkResponse({ type: StoryEntity })
  @ApiBadRequestResponse({ description: 'Validation failed or malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not the story owner' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryDto,
  ): Promise<StoryEntity> {
    return this.storiesService.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a story (owner or ADMIN; cascades comments/likes)',
  })
  @ApiNoContentResponse({ description: 'Story deleted' })
  @ApiBadRequestResponse({ description: 'Malformed UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Neither owner nor admin' })
  @ApiNotFoundResponse({ description: 'Story not found' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.storiesService.remove(user, id);
  }
}
