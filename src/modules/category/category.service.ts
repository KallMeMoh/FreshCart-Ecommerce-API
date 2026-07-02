import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { slugify } from 'transliteration';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { CategoriesRepository } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create({ name, logo_mimetype }: CreateCategoryDto) {
    let key: string | null = null;

    if (logo_mimetype)
      key = `category/${Date.now()}_${randomUUID()}.${logo_mimetype.split('/')[1]}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...category } = await this.categoriesRepository.create({
      name,
      slug: slugify(name, { separator: '-' }),
      logoKey: key,
      status: logo_mimetype
        ? CreationStatusEnum.Draft
        : CreationStatusEnum.Published,
    });

    return category;
  }

  async confirmCategoryCreation(categoryId: string) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) throw new NotFoundException("Category doesn't exist");

    if (category.status === CreationStatusEnum.Published)
      throw new ConflictException('Category creation already confirmed');

    return category;
  }

  findAll() {
    return this.categoriesRepository.findAll();
  }

  findOne(slug: string) {
    return this.categoriesRepository.findBySlug(slug);
  }

  update(slug: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesRepository.updateOne(slug, updateCategoryDto);
  }

  remove(id: string) {
    return this.categoriesRepository.deleteOne(id);
  }
}
