import { ApiProperty } from '@nestjs/swagger';

export class StatsEntity {
  @ApiProperty({ example: 128 })
  totalUsers!: number;

  @ApiProperty({ example: 342 })
  totalStories!: number;

  @ApiProperty({ example: 1289 })
  totalComments!: number;

  @ApiProperty({ example: 7 })
  newUsersThisWeek!: number;

  @ApiProperty({ example: 21 })
  newStoriesThisWeek!: number;

  constructor(partial: Partial<StatsEntity>) {
    Object.assign(this, partial);
  }
}
