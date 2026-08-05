import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({
    example: 'Alice Rahman',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    example: 'alice_writes',
    pattern: '^[a-z0-9_]{3,30}$',
  })
  @IsOptional()
  @Matches(/^[a-z0-9_]{3,30}$/, {
    message:
      'username must be 3-30 characters of lowercase letters, digits, or underscore',
  })
  username?: string;
}
