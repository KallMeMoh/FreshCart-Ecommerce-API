import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './dto/env.dto';

@Injectable()
export class ConfigService {
  constructor(
    private readonly config: NestConfigService<EnvironmentVariables, true>,
  ) {}

  get nodeEnv() {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get port() {
    return this.config.get('PORT', { infer: true });
  }

  get databaseUrl() {
    return this.config.getOrThrow('DB_URL', { infer: true });
  }

  get redisUrl() {
    return this.config.getOrThrow<string>('REDIS_URL', { infer: true });
  }

  get saltRounds() {
    return this.config.get('SALT_ROUNDS', { infer: true });
  }

  get encryptionKey() {
    return Buffer.from(
      this.config.getOrThrow('ENCRYPTION_KEY', { infer: true }),
    );
  }
  get encryptionAlgo() {
    return this.config.get('ENCRYPTION_ALGO', { infer: true });
  }

  get accessSecret() {
    return this.config.getOrThrow('JWT_ACCESS_SECRET', { infer: true });
  }

  get refreshSecret() {
    return this.config.getOrThrow('JWT_REFRESH_SECRET', { infer: true });
  }

  get pendingSecret() {
    return this.config.getOrThrow('JWT_PENDING_SECRET', { infer: true });
  }

  get smtpUser() {
    return this.config.getOrThrow('SMTP_USER', { infer: true });
  }
  get smtpPass() {
    return this.config.getOrThrow('SMTP_PASS', { infer: true });
  }

  get googleClientId() {
    return this.config.getOrThrow('GOOGLE_CLIENT_ID', { infer: true });
  }

  // get googleClientSecret() {
  //   return this.config.getOrThrow('GOOGLE_CLIENT_SECRET', { infer: true });
  // }

  get frontendUrl() {
    return this.config.getOrThrow('FRONTEND_URL', { infer: true });
  }

  get r2BucketName() {
    return this.config.getOrThrow('R2_BUCKET_NAME', { infer: true });
  }
  get r2AccountId() {
    return this.config.getOrThrow('R2_ACCOUNT_ID', { infer: true });
  }
  get r2AccessKeyId() {
    return this.config.getOrThrow('R2_ACCESS_KEY_ID', { infer: true });
  }
  get r2SecretAccessKey() {
    return this.config.getOrThrow('R2_SECRET_ACCESS_KEY', { infer: true });
  }
}
