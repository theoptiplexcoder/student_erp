import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/batches')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createBatchDto: CreateBatchDto) {
    return this.batchesService.create(user.institutionId, createBatchDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.batchesService.findAll(user.institutionId, pageNum, sizeNum, search);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.batchesService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchesService.update(user.institutionId, id, updateBatchDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.batchesService.remove(user.institutionId, id);
  }
}
