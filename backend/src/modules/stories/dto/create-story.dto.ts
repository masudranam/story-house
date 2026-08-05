import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({
    example: 'The Lighthouse at the Edge of the Map',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiProperty({
    example: 'Everyone in the village said the lighthouse had been dark...',
  })
  @IsString()
  @MinLength(1)
  content!: string;
}
