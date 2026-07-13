import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { NodeEnv } from '../enums/node-env.enum';
import { EncryptionAlgo } from '../enums/enryption-algorithm.enum';

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  DB_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  SALT_ROUNDS: number = 10;

  @IsString()
  ENCRYPTION_KEY!: string;

  @IsEnum(EncryptionAlgo)
  @IsOptional()
  ENCRYPTION_ALGO: EncryptionAlgo = EncryptionAlgo.AES_256_GCM;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_PENDING_SECRET!: string;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_PASS!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsString()
  R2_BUCKET_NAME!: string;

  @IsString()
  R2_ACCOUNT_ID!: string;

  @IsString()
  R2_ACCESS_KEY_ID!: string;

  @IsString()
  R2_SECRET_ACCESS_KEY!: string;
}
