import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { slugify } from 'transliteration';
import { Category } from '../../category/entities/category.entity';
import { CreationStatusEnum } from '../../../common/enums/creation-status.enum';

@Schema({
  timestamps: true,
  strictQuery: true,
  optimisticConcurrency: true,
})
export class Subcategory {
  _id!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  slug!: string;

  @Prop({
    type: String,
    default: null,
  })
  logoKey!: string | null;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Category.name,
  })
  category!: Types.ObjectId;

  @Prop({
    type: String,
    enum: CreationStatusEnum,
    default: CreationStatusEnum.Draft,
  })
  status: CreationStatusEnum = CreationStatusEnum.Draft;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SubcategoryDocument = HydratedDocument<Subcategory>;
export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

SubcategorySchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lowercase: true,
      trim: true,
      separator: '_',
    });
  }
});

SubcategorySchema.pre(['findOneAndUpdate', 'updateOne'], function () {
  const update = this.getUpdate();

  if (update && 'name' in update) {
    this.set({
      slug: slugify(update.$set!.name as string, {
        lowercase: true,
        trim: true,
        separator: '_',
      }),
    });
  }
});
