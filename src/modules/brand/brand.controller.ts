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
import { Roles } from '../../common/decorators/roles';
import { CreationStatusEnum } from '../../common/enums/creation-status.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/user-roles.guard';
import { R2BucketService } from '../bucket/bucket.service';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { BrandsService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@UseGuards(AccessTokenGuard)
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly r2BucketService: R2BucketService,
  ) {}

  @HttpCode(201)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    const { logoKey, ...brand } =
      await this.brandsService.create(createBrandDto);

    let uploadUrl: string | null = null;
    if (createBrandDto.logo_mimetype && logoKey)
      uploadUrl = await this.r2BucketService.generateUploadUrl(
        logoKey,
        createBrandDto.logo_mimetype.split('/')[1],
      );

    return { brand, uploadUrl };
  }

  @HttpCode(201)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Post(':id/confirm')
  async confirmBrandCreation(@Param('id') brandId: string) {
    const brand = await this.brandsService.confirmBrandCreation(brandId);
    if (!brand.logoKey) {
      brand.status = CreationStatusEnum.Published;
      await brand.save();
    } else {
      const exists = await this.r2BucketService.fileExists(brand.logoKey);
      if (!exists)
        throw new UnprocessableEntityException(
          'Some files failed to upload, please try again',
        );
    }

    return { message: 'Brand creation confirmed successfully' };
  }

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findOne(slug);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @HttpCode(204)
  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
