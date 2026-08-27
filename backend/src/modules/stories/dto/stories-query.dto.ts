import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export const STORY_SORTS = ['createdAt:desc', 'createdAt:asc'] as const;
export type StorySort = (typeof STORY_SORTS)[number];

export class StoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filters title (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ description: 'Only stories by this author' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ enum: STORY_SORTS, default: 'createdAt:desc' })
  @IsOptional()
  @IsIn(STORY_SORTS)
  sort: StorySort = 'createdAt:desc';
}
