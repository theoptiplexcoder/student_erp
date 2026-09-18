import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { SupabaseAuthGuard } from '../../guards/supabase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RejectOnboardingDto } from './dto/reject-onboarding.dto';
import { ListOnboardingRequestsDto } from './dto/list-onboarding-requests.dto';

@Controller('superadmin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('stats')
  async getStats() {
    return this.superadminService.getStats();
  }

  @Get('onboarding-requests')
  async listOnboardingRequests(@Query() query: ListOnboardingRequestsDto) {
    return this.superadminService.listOnboardingRequests(query.status);
  }

  @Get('onboarding-requests/:id')
  async getOnboardingRequest(@Param('id') id: string) {
    return this.superadminService.getOnboardingRequest(id);
  }

  @Post('onboarding-requests/:id/approve')
  async approveOnboardingRequest(@Param('id') id: string, @Request() req: any) {
    return this.superadminService.approveOnboardingRequest(id, req.user?.id);
  }

  @Post('onboarding-requests/:id/reject')
  async rejectOnboardingRequest(
    @Param('id') id: string,
    @Body() dto: RejectOnboardingDto,
  ) {
    return this.superadminService.rejectOnboardingRequest(id, dto);
  }
}
