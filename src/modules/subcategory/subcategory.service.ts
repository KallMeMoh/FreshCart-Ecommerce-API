import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';
import { SubcategoriesRepository } from './subcategory.repository';

@Injectable()
export class SubcategoriesService {
  constructor(
    private readonly subcategoriesRepository: SubcategoriesRepository,
  ) {}

  async create({ name, logo_mimetype, categoryId }: CreateSubcategoryDto) {
    let key: string | null = null;

    if (logo_mimetype)
      key = `subcategory/${Date.now()}_${randomUUID()}.${logo_mimetype.split('/')[1]}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...subcategory } = await this.subcategoriesRepository.create({
      name,
      logoKey: key,
      category: new Types.ObjectId(categoryId),
      status: logo_mimetype
        ? CreationStatusEnum.Draft
        : CreationStatusEnum.Published,
    });

    return subcategory;
  }

  async confirmSubcategoryCreation(subcategoryId: string) {
    const subcategory =
      await this.subcategoriesRepository.findById(subcategoryId);
    if (!subcategory) throw new NotFoundException("Subcategory doesn't exist");

    if (subcategory.status === CreationStatusEnum.Published)
      throw new ConflictException('Subcategory creation already confirmed');

    return subcategory;
  }

  findAll() {
    return this.subcategoriesRepository.findAll();
  }

  findOne(slug: string) {
    return this.subcategoriesRepository.findBySlug(slug);
  }

  update(slug: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoriesRepository.updateOne(slug, updateSubcategoryDto);
  }

  remove(id: string) {
    return this.subcategoriesRepository.deleteOne(id);
  }
}
