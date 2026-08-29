import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('admin/roles')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles(@CurrentUser() user: any) {
    return this.rolesService.getRoles(user.institutionId);
  }

  @Get(':id')
  async getRoleById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rolesService.getRoleById(user.institutionId, id);
  }

  @Post()
  async createRole(@CurrentUser() user: any, @Body() data: CreateRoleDto) {
    return this.rolesService.createRole(user.institutionId, data);
  }

  @Patch(':id')
  async updateRole(@CurrentUser() user: any, @Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(user.institutionId, id, data);
  }

  @Delete(':id')
  async deleteRole(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rolesService.deleteRole(user.institutionId, id);
  }
}
