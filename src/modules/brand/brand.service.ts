import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { slugify } from 'transliteration';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { BrandsRepository } from './brand.repository';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async create({ name, logo_mimetype }: CreateBrandDto) {
    let key: string | null = null;

    if (logo_mimetype)
      key = `brand/${Date.now()}_${randomUUID()}.${logo_mimetype.split('/')[1]}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...brand } = await this.brandsRepository.create({
      name,
      slug: slugify(name, { separator: '-' }),
      logoKey: key,
      status: logo_mimetype
        ? CreationStatusEnum.Draft
        : CreationStatusEnum.Published,
    });

    return brand;
  }

  async confirmBrandCreation(brandId: string) {
    const brand = await this.brandsRepository.findById(brandId);
    if (!brand) throw new NotFoundException("Brand doesn't exist");

    if (brand.status === CreationStatusEnum.Published)
      throw new ConflictException('Brand creation already confirmed');

    return brand;
  }

  findAll() {
    return this.brandsRepository.findAll();
  }

  findOne(slug: string) {
    return this.brandsRepository.findBySlug(slug);
  }

  update(slug: string, updateBrandDto: UpdateBrandDto) {
    return this.brandsRepository.updateOne(slug, updateBrandDto);
  }

  remove(id: string) {
    return this.brandsRepository.deleteOne(id);
  }
}
