import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { SORT_OPTIONS } from './constants/sort-lookup-table';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './product.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create({
    name,
    description,
    price,
    discount,
    stock,
    logoMimetype,
    galleryMimetypes,
    category,
    subcategory,
    brand,
  }: CreateProductDto) {
    let logoKey: string | null = null;
    let galleryKeys: string[] = [];

    if (logoMimetype)
      logoKey = `brand/${Date.now()}_${randomUUID()}.${logoMimetype.split('/')[1]}`;

    if (!galleryMimetypes.length)
      galleryKeys = galleryMimetypes.map(
        (mimetype) =>
          `brand/${Date.now()}_${randomUUID()}.${mimetype.split('/')[1]}`,
      );

    const status =
      !logoMimetype && !galleryMimetypes.length
        ? CreationStatusEnum.Published
        : CreationStatusEnum.Draft;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...product } = await this.productsRepository.create({
      name,
      description,
      price,
      discount,
      stock,
      category: category,
      subcategory: subcategory,
      brand: brand,
      averageRating: 0,
      reviewCount: 0,
      logoKey,
      galleryKeys,
      status,
    });

    return { product, logoKey, galleryKeys };
  }

  async findAll({
    category,
    subcategory,
    brand,
    inStock,
    minPrice,
    maxPrice,
    sortBy,
    cursor,
    limit: amount,
  }: FindAllProductsDto) {
    const sortConfig = sortBy
      ? SORT_OPTIONS[sortBy]
      : ({ field: '_id', direction: 1 } as const);
    const limit = amount ?? 20;

    const { results, hasNextPage } = await this.productsRepository.findAll({
      filters: {
        category,
        subcategory,
        brand,
        inStock,
        minPrice,
        maxPrice,
      },
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction,
      cursor,
      limit,
    });

    let nextCursor: string | null = null;
    if (hasNextPage) {
      const last = results[results.length - 1];
      const cursorPayload =
        sortConfig.field === '_id'
          ? { sortKey: '_id', id: last._id }
          : {
              sortKey: sortConfig.field,
              value: last[sortConfig.field],
              id: last._id,
            };
      nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString(
        'base64',
      );
    }

    return { data: results, pagination: { nextCursor, hasNextPage, limit } };
  }

  findById(id: string) {
    return this.productsRepository.findOne({ id });
  }

  findBySlug(slug: string) {
    return this.productsRepository.findOne({ slug });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productsRepository.updateOne(id, updateProductDto);
  }

  remove(id: string) {
    return this.productsRepository.remove(id);
  }
}
