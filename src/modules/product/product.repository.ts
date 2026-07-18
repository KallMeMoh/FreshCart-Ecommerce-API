import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async findAll(params: {
    filters: {
      category?: string;
      subcategory?: string;
      brand?: string;
      inStock?: boolean;
      minPrice?: number;
      maxPrice?: number;
    };
    sortField: string;
    sortDirection: 1 | -1;
    cursor?: { id: string; sortKey: string; value: string | number };
    limit: number;
  }) {
    const { filters, sortField, sortDirection, cursor, limit } = params;

    const filterConditions: Record<string, unknown> = {};
    if (filters.category) filterConditions.category = filters.category;
    if (filters.subcategory) filterConditions.subcategory = filters.subcategory;
    if (filters.brand) filterConditions.brand = filters.brand;
    if (filters.inStock) filterConditions.stock = { $gt: 0 };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filterConditions.price = {
        ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
      };
    }

    let cursorCondition: Record<string, unknown> | null = null;
    if (cursor) {
      const gtOrLt = sortDirection === 1 ? '$gt' : '$lt';
      cursorCondition =
        sortField === '_id'
          ? { _id: { [gtOrLt]: cursor.id } }
          : {
              $or: [
                { [sortField]: { [gtOrLt]: cursor.value } },
                { [sortField]: cursor.value, _id: { [gtOrLt]: cursor.id } },
              ],
            };
    }

    const filter = cursorCondition
      ? { $and: [filterConditions, cursorCondition] }
      : filterConditions;
    const sort =
      sortField === '_id'
        ? { _id: sortDirection }
        : { [sortField]: sortDirection, _id: sortDirection };

    const products = await this.productModel
      .find(filter)
      .sort(sort)
      .limit(limit + 1);
    const hasNextPage = products.length > limit;
    const results = hasNextPage ? products.slice(0, -1) : products;

    return { results, hasNextPage };
  }

  findOne(arg: { id: string } | { slug: string }) {
    return 'id' in arg
      ? this.productModel.findById(arg.id).lean()
      : this.productModel.findOne({ slug: arg.slug }).lean();
  }

  async create(
    data: Omit<Product, '_id' | 'slug' | 'createdAt' | 'updatedAt'>,
  ) {
    const doc = await this.productModel.create(data);
    return doc.toObject();
  }

  async updateOne(_id: string, data: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(_id, data, {
      returnDocument: 'after',
    });
  }

  remove(_id: string) {
    return this.productModel.deleteOne({ _id });
  }

  async updateReview(_id: string, rating: number, session?: ClientSession) {
    return this.productModel.updateOne(
      { _id },
      [
        {
          $set: {
            averageRating: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$averageRating', '$reviewCount'] },
                    rating,
                  ],
                },
                { $add: ['$reviewCount', 1] },
              ],
            },
            reviewCount: { $add: ['$reviewCount', 1] },
          },
        },
      ],
      { session },
    );
  }
}
