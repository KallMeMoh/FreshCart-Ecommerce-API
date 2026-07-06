import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isURL } from 'class-validator';

@Injectable()
export class ParseVerificationUrlPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isURL(value)) {
      throw new BadRequestException(`Invalid Verification Url: ${value}`);
    }
    return value;
  }
}
