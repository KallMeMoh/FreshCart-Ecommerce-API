import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuthProviderEnum } from '../../auth/enums/auth-provider.enum';
import { UserRoleEnum } from '../enums/user-role.enum';

@Schema({
  timestamps: true,
  strictQuery: true,
  optimisticConcurrency: true,
})
export class User {
  _id!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  username!: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  email!: string;

  @Prop({
    type: String,
    default: null,
  })
  avatarKey!: string | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  verified!: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  has2FA!: boolean;

  @Prop({
    type: String,
    required: function (this: UserDocument): boolean {
      return this.provider === AuthProviderEnum.System;
    },
  })
  hashedPassword?: string;

  @Prop({
    type: String,
    enum: Object.values(AuthProviderEnum),
    required: true,
  })
  provider!: AuthProviderEnum;

  @Prop({
    type: String,
    enum: Object.values(UserRoleEnum),
    default: UserRoleEnum.User,
  })
  role!: UserRoleEnum;

  @Prop({
    type: Date,
    default: () => new Date(),
    index: { expireAfterSeconds: 86400 },
  })
  verificationExpiry?: Date;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

const queryMethods = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndDelete',
] as const;

queryMethods.forEach((method) => {
  UserSchema.pre(method, function () {
    this.where({ deletedAt: null });
  });
});
