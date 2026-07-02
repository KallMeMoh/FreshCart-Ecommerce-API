import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AllowedPictureMimeType } from '../../../common/enums/picture-mimetype.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
  @Transform(({ value }: { value?: string }) => value?.trim())
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(20, { message: 'Name must be at most 20 characters' })
  @Matches(/^[A-Z]/, {
    message: 'Name must start with an uppercase letter',
  })
  name!: string;

  @IsEnum(AllowedPictureMimeType)
  @IsOptional()
  logo_mimetype?: AllowedPictureMimeType;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
