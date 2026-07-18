import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/user-roles.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './product.service';

@UseGuards(AccessTokenGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token-header')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: FindAllProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':productId')
  findOneById(@Param('productId', ParseMongoIdPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token-header')
  @Patch(':productId')
  update(
    @Param('productId', ParseMongoIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token-header')
  @Delete(':productId')
  remove(@Param('productId', ParseMongoIdPipe) id: string) {
    return this.productsService.remove(id);
  }
}
