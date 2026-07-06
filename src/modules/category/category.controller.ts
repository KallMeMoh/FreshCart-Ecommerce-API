import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { R2BucketService } from '../bucket/bucket.service';
import { CategoriesService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/user-roles.guard';
import { Roles } from '../../common/decorators/roles';

@UseGuards(AccessTokenGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly r2BucketService: R2BucketService,
  ) {}

  @HttpCode(201)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const { logoKey, ...category } =
      await this.categoriesService.create(createCategoryDto);

    let uploadUrl: string | null = null;
    if (createCategoryDto.logo_mimetype && logoKey)
      uploadUrl = await this.r2BucketService.generateUploadUrl(
        logoKey,
        createCategoryDto.logo_mimetype.split('/')[1],
      );

    return { category, uploadUrl };
  }

  @HttpCode(201)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post(':id/confirm')
  async confirmCategoryCreation(@Param('id') categoryId: string) {
    const category =
      await this.categoriesService.confirmCategoryCreation(categoryId);
    if (!category.logoKey) {
      category.status = CreationStatusEnum.Published;
      await category.save();
    } else {
      const exists = await this.r2BucketService.fileExists(category.logoKey);
      if (!exists)
        throw new UnprocessableEntityException(
          'Some files failed to upload, please try again',
        );
    }

    return { message: 'Category creation confirmed successfully' };
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOne(slug);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @HttpCode(204)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
