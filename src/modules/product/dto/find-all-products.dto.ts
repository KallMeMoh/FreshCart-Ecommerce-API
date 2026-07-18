import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GreaterThanOrEqual } from '../../../common/decorators/greater-than-or-equal.decorator';
import { SORT_OPTIONS } from '../constants/sort-lookup-table';
import type { SortOption } from '../enums/sort-option.enum';
import { MatchesFieldType } from '../../../common/decorators/matches-field-key.decorator';

const VALID_SORT_OPTIONS = Object.keys(SORT_OPTIONS);
const EXPECTED_KEY_TYPE: Record<string, 'number' | 'string'> = {
  price: 'number',
  name: 'string',
};

class CursorDto {
  @IsString()
  id!: string;

  @IsIn(Object.keys(EXPECTED_KEY_TYPE))
  sortKey!: string;

  @MatchesFieldType('sortKey', EXPECTED_KEY_TYPE)
  value!: string | number;
}

export class FindAllProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(VALID_SORT_OPTIONS)
  sortBy?: SortOption;

  @IsOptional()
  @Transform(({ value }: { value?: string }) => {
    if (!value) return undefined;
    try {
      return JSON.parse(
        Buffer.from(value, 'base64').toString('utf-8'),
      ) as unknown;
    } catch {
      throw new BadRequestException(
        'cursor must be a base64-encoded JSON string',
      );
    }
  })
  @ValidateNested()
  @Type(() => CursorDto)
  cursor?: CursorDto;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsMongoId()
  subcategory?: string;

  @IsOptional()
  @IsMongoId()
  brand?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @GreaterThanOrEqual('minPrice')
  maxPrice?: number;
}
