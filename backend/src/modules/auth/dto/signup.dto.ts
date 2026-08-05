import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Alice Rahman', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    example: 'alice',
    description:
      'Lowercase letters, digits, underscore; 3-30 chars (same rule as login)',
    pattern: '^[a-z0-9_]{3,30}$',
  })
  @Matches(/^[a-z0-9_]{3,30}$/, {
    message:
      'username must be 3-30 characters of lowercase letters, digits, or underscore',
  })
  username!: string;

  @ApiProperty({ example: 'alice@storyhouse.local' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
