import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import {
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AuthProviderEnum } from '../auth/enums/auth-provider.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private verificationCode(userId: string) {
    return `user:verification-code:${userId}`;
  }

  private twoFAActivationCode(userId: string) {
    return `user:2fa-activation-code:${userId}`;
  }

  async existsByEmail(email: string) {
    return this.userModel.exists({ email });
  }

  async create(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.userModel.create(data);
  }

  async findByUsername(username: string, projection?: ProjectionType<User>) {
    return this.userModel.findOne({ username }, projection).lean();
  }

  async findByEmail(email: string, projection?: ProjectionType<User>) {
    return this.userModel.findOne({ email }, projection).lean();
  }

  async findById(userId: string, projection?: ProjectionType<User>) {
    return this.userModel.findOne({ _id: userId }, projection).lean();
  }

  async findByEmailAndProvider(email: string, provider: AuthProviderEnum) {
    return this.userModel.findOne({ email, provider }).lean();
  }

  updateById(
    userId: string,
    updates: UpdateQuery<User> | UpdateWithAggregationPipeline,
    options?: QueryOptions<User>,
  ) {
    return this.userModel.findOneAndUpdate({ _id: userId }, updates, options);
  }

  deleteById(userId: string) {
    return this.userModel.deleteOne({ _id: userId });
  }

  updatePassword(userId: string, hashedPassword: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $set: { hashed_password: hashedPassword } },
    );
  }

  async getVerificationCode(userId: string) {
    return this.redisClient.get(this.verificationCode(userId.toString()));
  }

  async setVerificationCode(userId: string, code: string) {
    return this.redisClient.set(
      this.verificationCode(userId.toString()),
      code,
      'EX',
      300,
    );
  }

  async delVerificationCode(userId: string) {
    return this.redisClient.del(this.verificationCode(userId.toString()));
  }

  async verificationCodeExists(userId: string) {
    return this.redisClient.exists(this.verificationCode(userId.toString()));
  }

  async get2FAActivationCode(userId: string) {
    return this.redisClient.get(this.twoFAActivationCode(userId.toString()));
  }

  async set2FAActivationCode(userId: string, code: string) {
    return this.redisClient.set(
      this.twoFAActivationCode(userId.toString()),
      code,
      'EX',
      300,
    );
  }

  async del2FAActivationCode(userId: string) {
    return this.redisClient.del(this.twoFAActivationCode(userId.toString()));
  }

  async twoFAActivationCodeExists(userId: string) {
    return this.redisClient.exists(this.twoFAActivationCode(userId.toString()));
  }
}
