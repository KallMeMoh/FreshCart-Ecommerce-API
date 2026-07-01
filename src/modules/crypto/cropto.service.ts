import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { EncryptionAlgo } from '../config/dto/env.dto';

@Injectable()
export class CryptoService {
  static readonly IV_LENGTH: Record<EncryptionAlgo, number> = {
    [EncryptionAlgo.AES_256_GCM]: 12,
  };

  constructor(private readonly configService: ConfigService) {}

  encrypt(
    data: string,
    inputEncoding: BufferEncoding = 'utf8',
    outputEncoding: BufferEncoding = 'hex',
  ) {
    try {
      const iv = randomBytes(
        CryptoService.IV_LENGTH[this.configService.encryptionAlgo],
      );

      const cipher = createCipheriv(
        this.configService.encryptionAlgo,
        this.configService.encryptionKey,
        iv,
      );

      let encrypted = cipher.update(data, inputEncoding, outputEncoding);
      encrypted += cipher.final(outputEncoding);

      const authTag = cipher.getAuthTag();

      return {
        success: true,
        encrypted: [
          iv.toString(outputEncoding),
          authTag.toString(outputEncoding),
          encrypted,
        ].join(':'),
      };
    } catch (error: unknown) {
      return { success: false, encrypted: null, error };
    }
  }

  decrypt(
    encryptedData: string,
    inputEncoding: BufferEncoding = 'hex',
    outputEncoding: BufferEncoding = 'utf8',
  ) {
    try {
      const parts = encryptedData.split(':');
      if (!parts || parts.length !== 3)
        return {
          success: false,
          decrypted: null,
          error: 'Wrong format for encryptedData',
        };

      const [iv, authTag, ciphertext] = parts;

      const decipher = createDecipheriv(
        this.configService.encryptionAlgo,
        this.configService.encryptionKey,
        Buffer.from(iv, inputEncoding),
      );
      decipher.setAuthTag(Buffer.from(authTag, inputEncoding));

      let decrypted = decipher.update(
        ciphertext,
        inputEncoding,
        outputEncoding,
      );
      decrypted += decipher.final(outputEncoding);

      return { success: true, decrypted, error: null };
    } catch (error: unknown) {
      return { success: false, decrypted: null, error };
    }
  }
}
