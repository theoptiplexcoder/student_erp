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
import { CourseOfferingsService } from '../services/course-offerings.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('academic/course-offerings')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CourseOfferingsController {
  constructor(private readonly courseOfferingsService: CourseOfferingsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createCourseOfferingDto: any) {
    createCourseOfferingDto.institutionId = user.institutionId;
    return this.courseOfferingsService.create(createCourseOfferingDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
    @Query('termId') termId?: string,
  ) {
    return this.courseOfferingsService.findAll(user.institutionId, courseId, termId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.courseOfferingsService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateCourseOfferingDto: any) {
    return this.courseOfferingsService.update(user.institutionId, id, updateCourseOfferingDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.courseOfferingsService.remove(user.institutionId, id);
  }
}
