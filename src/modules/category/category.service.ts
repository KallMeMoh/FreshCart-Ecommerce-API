import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { slugify } from 'transliteration';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create({ name, logo_mimetype }: CreateCategoryDto) {
    let key: string | null = null;

    if (logo_mimetype)
      key = `category/${Date.now()}_${randomUUID()}.${logo_mimetype.split('/')[1]}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...category } = await this.categoryRepository.create({
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
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException("Category doesn't exist");

    if (category.status === CreationStatusEnum.Published)
      throw new ConflictException('Category creation already confirmed');

    return category;
  }

  findAll() {
    return this.categoryRepository.findAll();
  }

  findOne(slug: string) {
    return this.categoryRepository.findBySlug(slug);
  }

  update(slug: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryRepository.updateOne(slug, updateCategoryDto);
  }

  remove(id: string) {
    return this.categoryRepository.deleteOne(id);
  }
}
