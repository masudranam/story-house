import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice', description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  identifier!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}
