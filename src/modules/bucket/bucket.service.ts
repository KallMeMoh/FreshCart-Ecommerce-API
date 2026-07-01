import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '../config/config.service';

@Injectable()
export class R2BucketService {
  private client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${configService.r2AccountId}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configService.r2AccessKeyId,
        secretAccessKey: configService.r2SecretAccessKey,
      },
    });
  }

  async generateUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.r2BucketName,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(this.client, command, { expiresIn: 60 });
  }

  async generateReadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.r2BucketName,
      Key: key,
    });
    return await getSignedUrl(this.client, command, {
      expiresIn: 60 * 60 * 6,
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.r2BucketName,
      Key: key,
    });
    await this.client.send(command);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.configService.r2BucketName,
          Key: key,
        }),
      );
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: unknown) {
      return false;
    }
  }
}
