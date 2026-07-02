import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategory.service';
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';
import { R2BucketService } from '../bucket/bucket.service';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { AccessTokenGuard } from '../../common/guards/access-toke.guard';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/user-roles.guard';
import { Roles } from '../../common/decorators/roles';

@UseGuards(AccessTokenGuard)
@Controller('subcategories')
export class SubcategoriesController {
  constructor(
    private readonly subcategoriesService: SubcategoriesService,
    private readonly r2BucketService: R2BucketService,
  ) {}

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    const { logoKey, ...subcategory } =
      await this.subcategoriesService.create(createSubcategoryDto);

    let uploadUrl: string | null = null;
    if (createSubcategoryDto.logo_mimetype && logoKey)
      uploadUrl = await this.r2BucketService.generateUploadUrl(
        logoKey,
        createSubcategoryDto.logo_mimetype.split('/')[1],
      );

    return { subcategory, uploadUrl };
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post(':id/confirm')
  async confirmSubcategoryCreation(@Param('id') subcategoryId: string) {
    const subcategory =
      await this.subcategoriesService.confirmSubcategoryCreation(subcategoryId);
    if (!subcategory.logoKey) {
      subcategory.status = CreationStatusEnum.Published;
      await subcategory.save();
    } else {
      const exists = await this.r2BucketService.fileExists(subcategory.logoKey);
      if (!exists)
        throw new UnprocessableEntityException(
          'Some files failed to upload, please try again',
        );
    }

    return { message: 'Subcategory creation confirmed successfully' };
  }

  @Get()
  findAll() {
    return this.subcategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(id, updateSubcategoryDto);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(id);
  }
}
