import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/** Public profile view — no email (rule 20: never leak contact data to other users). */
export class PublicUserEntity {
  @ApiProperty({ example: '2f9b1f64-1c3a-4d0e-9d2a-0b6f6c1a2b3c' })
  id!: string;

  @ApiProperty({ example: 'Alice Rahman' })
  name!: string;

  @ApiProperty({ example: 'alice' })
  username!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<PublicUserEntity>) {
    Object.assign(this, partial);
  }
}

/** Prisma select matching PublicUserEntity. */
export const publicUserSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;
