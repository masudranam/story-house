import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  // Deliberately NOT @IsJWT(): logout revoking a malformed token is a natural
  // 204 no-op (idempotent), and the refresh guard rejects bad JWTs with 401
  // itself — a 400 here would add an undocumented status to the contract.
  @ApiProperty({ description: 'The refresh token issued at login/refresh' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
