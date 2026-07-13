import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class AuthRepository {
  private readonly KEYS = {
    loginCounter: (userId: string) => `auth:login-counter:${userId.toString()}`,
    passwordReset: (token: string) => `auth:password-reset:${token}`,
    login2FA: (userId: string) => `auth:login-2fa:${userId.toString()}`,
    jwtBlacklist: (jti: string) => `jwt:blacklist:${jti}`,
  } as const;

  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async getLoginAttempts(userId: string) {
    return this.redisClient.get(this.KEYS.loginCounter(userId));
  }

  async incrementLoginAttempts(userId: string) {
    const count = await this.redisClient.incr(this.KEYS.loginCounter(userId));
    if (count === 1) {
      await this.redisClient.expire(this.KEYS.loginCounter(userId), 1800);
    }
    return count;
  }

  async resetLoginAttempts(userId: string) {
    return this.redisClient.del(this.KEYS.loginCounter(userId));
  }

  async setPasswordResetToken(token: string, userId: string) {
    return this.redisClient.set(
      this.KEYS.passwordReset(token),
      userId.toString(),
      'EX',
      300,
    );
  }

  async getPasswordResetToken(token: string) {
    return this.redisClient.get(this.KEYS.passwordReset(token));
  }

  async store2FACode(userId: string, code: string) {
    return this.redisClient.set(this.KEYS.login2FA(userId), code, 'EX', 300);
  }

  async get2FACode(userId: string) {
    return this.redisClient.get(this.KEYS.login2FA(userId));
  }

  async isTokenBlacklisted(tokenJti: string) {
    return this.redisClient.get(this.KEYS.jwtBlacklist(tokenJti));
  }

  async blacklistToken(jti: string) {
    return this.redisClient.set(
      this.KEYS.jwtBlacklist(jti),
      '1',
      'EX',
      365 * 24 * 60 * 60,
    );
  }
}
