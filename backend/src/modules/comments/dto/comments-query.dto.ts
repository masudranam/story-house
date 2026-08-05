import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

/** Admin moderation list filters. */
export class CommentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Matches comment content OR author username (contains)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ description: 'Only comments on this story' })
  @IsOptional()
  @IsUUID()
  storyId?: string;
}
