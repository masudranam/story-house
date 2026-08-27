import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class TokenPairEntity {
  @ApiProperty({
    description:
      'Short-lived JWT for the Authorization header (no Bearer prefix)',
  })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived rotating refresh token' })
  refreshToken!: string;

  constructor(partial: Partial<TokenPairEntity>) {
    Object.assign(this, partial);
  }
}

export class AuthSessionEntity extends TokenPairEntity {
  @ApiProperty({ type: UserEntity })
  user!: UserEntity;

  constructor(partial: Partial<AuthSessionEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
