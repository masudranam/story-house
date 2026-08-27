import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Response model for the full user (owner/admin view — includes email).
 * passwordHash never reaches this class: services select it away (rule 30).
 */
export class UserEntity {
  @ApiProperty({ example: '2f9b1f64-1c3a-4d0e-9d2a-0b6f6c1a2b3c' })
  id!: string;

  @ApiProperty({ example: 'Alice Rahman' })
  name!: string;

  @ApiProperty({ example: 'alice' })
  username!: string;

  @ApiProperty({ example: 'alice@storyhouse.local' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

/** Prisma select matching UserEntity — the password-hash firewall. */
export const userEntitySelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;
