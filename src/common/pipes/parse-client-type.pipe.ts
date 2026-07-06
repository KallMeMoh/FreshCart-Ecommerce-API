import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ClientTypeEnum, isClientTypeEnum } from '../enums/client-type.enum';

@Injectable()
export class ParseClientTypePipe implements PipeTransform {
  transform(value: string): ClientTypeEnum {
    if (!isClientTypeEnum(value)) {
      throw new BadRequestException(`Invalid Client Type: ${value}`);
    }
    return value;
  }
}
