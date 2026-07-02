import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CreationStatusEnum } from '../../../common/enums/creation-status.enum';
import { Product } from '../../product/entities/product.entity';

@Schema({
  timestamps: true,
  strictQuery: true,
  optimisticConcurrency: true,
})
export class Review {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  author!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Product.name,
  })
  product!: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  review!: number;

  @Prop({
    type: String,
    default: null,
  })
  message!: string | null;

  @Prop({
    type: String,
    enum: CreationStatusEnum,
    default: CreationStatusEnum.Draft,
  })
  status: CreationStatusEnum = CreationStatusEnum.Draft;

  createdAt!: Date;
  updatedAt!: Date;
}

export type ReviewDocument = HydratedDocument<Review>;
export const ReviewSchema = SchemaFactory.createForClass(Review);
