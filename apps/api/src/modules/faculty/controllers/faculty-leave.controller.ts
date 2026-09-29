import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FacultyLeaveService } from '../services/faculty-leave.service';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/leave')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyLeaveController {
  constructor(private readonly service: FacultyLeaveService) {}

  @Get()
  getMyRequests(@CurrentUser() user: any) {
    return this.service.getMyRequests(user.id, user.institutionId);
  }

  @Post()
  createRequest(@CurrentUser() user: any, @Body() dto: CreateLeaveRequestDto) {
    return this.service.createRequest(user.id, user.institutionId, dto);
  }

  @Delete(':id')
  cancelRequest(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancelRequest(user.id, user.institutionId, id);
  }
}
