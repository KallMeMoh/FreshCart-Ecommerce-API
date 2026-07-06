import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOtpPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const errors: string[] = [];

    if (typeof value !== 'string') {
      errors.push('otp must be a string');
      throw new BadRequestException(errors);
    }

    if (!/^\d{6}$/.test(value)) {
      errors.push('otp must be exactly 6 digits (0-9)');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }
}
