import { Module } from '@nestjs/common';
import { CryptoService } from './cropto.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
