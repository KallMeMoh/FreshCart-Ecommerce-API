import { DiscounTypeEnum } from '../enums/discount-type.enum';

class DiscountDto {
  discountType!: DiscounTypeEnum;
  value!: number;
}

export class CreateProductDto {
  name!: string;
  description!: string;
  price!: number;
  discount!: DiscountDto;
  stock!: number;
  logoMimetype!: string | null;
  galleryMimetypes!: string[];
  category!: string;
  subcategory!: string;
  brand!: string;
}
