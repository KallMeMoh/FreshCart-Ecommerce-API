import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class RequiredFieldPipe<T = unknown> implements PipeTransform<T, T> {
  transform(value: T, metadata: ArgumentMetadata): T {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(`${metadata.data} is required`);
    }
    return value;
  }
}
