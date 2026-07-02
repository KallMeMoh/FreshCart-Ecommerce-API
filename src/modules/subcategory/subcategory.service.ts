import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { slugify } from 'transliteration';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';
import { SubcategoryRepository } from './subcategory.repository';

@Injectable()
export class SubcategoryService {
  constructor(private readonly subcategoryRepository: SubcategoryRepository) {}

  async create({ name, logo_mimetype, categoryId }: CreateSubcategoryDto) {
    let key: string | null = null;

    if (logo_mimetype)
      key = `subcategory/${Date.now()}_${randomUUID()}.${logo_mimetype.split('/')[1]}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...subcategory } = await this.subcategoryRepository.create({
      name,
      slug: slugify(name, { separator: '-' }),
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
      await this.subcategoryRepository.findById(subcategoryId);
    if (!subcategory) throw new NotFoundException("Subcategory doesn't exist");

    if (subcategory.status === CreationStatusEnum.Published)
      throw new ConflictException('Subcategory creation already confirmed');

    return subcategory;
  }

  findAll() {
    return this.subcategoryRepository.findAll();
  }

  findOne(slug: string) {
    return this.subcategoryRepository.findBySlug(slug);
  }

  update(slug: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoryRepository.updateOne(slug, updateSubcategoryDto);
  }

  remove(id: string) {
    return this.subcategoryRepository.deleteOne(id);
  }
}
