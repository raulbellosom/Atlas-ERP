import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const TOKEN_TTL_MINUTES = 15;

const TOKEN_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  tokenHash: true,
  expiresAt: true,
  usedAt: true,
  createdAt: true,
} satisfies Prisma.PasswordResetTokenSelect;

type PasswordResetTokenRecord = Prisma.PasswordResetTokenGetPayload<{
  select: typeof TOKEN_SELECT;
}>;

@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  generateRawToken(): string {
    return randomBytes(48).toString('hex');
  }

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async createResetToken(
    organizationId: string,
    userId: string,
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    // Invalidate any previous tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { organizationId, userId, tokenHash, expiresAt },
    });

    return { rawToken, expiresAt };
  }

  async findValidToken(
    rawToken: string,
  ): Promise<PasswordResetTokenRecord | null> {
    const tokenHash = this.hashToken(rawToken);

    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: TOKEN_SELECT,
    });

    if (!token || token.usedAt || token.expiresAt < new Date()) {
      return null;
    }

    return token;
  }

  async markTokenUsed(tokenId: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }
}
