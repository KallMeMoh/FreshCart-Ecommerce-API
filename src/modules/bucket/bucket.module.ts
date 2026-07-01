import { Global, Module } from '@nestjs/common';
import { R2BucketService } from './bucket.service';

@Global()
@Module({
  providers: [R2BucketService],
  exports: [R2BucketService],
})
export class R2BucketModule {}
