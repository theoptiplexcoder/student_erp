import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getRoles(institutionId: string) {
    return this.prisma.customRole.findMany({
      where: { institutionId },
      include: {
        permissions: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRoleById(institutionId: string, id: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, institutionId },
      include: {
        permissions: true,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async createRole(institutionId: string, data: CreateRoleDto) {
    return this.prisma.customRole.create({
      data: {
        institutionId,
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions || [],
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async updateRole(institutionId: string, id: string, data: UpdateRoleDto) {
    await this.getRoleById(institutionId, id);

    return this.prisma.$transaction(async (tx) => {
      if (data.permissions) {
        await tx.rolePermission.deleteMany({
          where: { customRoleId: id },
        });
      }

      return tx.customRole.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          ...(data.permissions && {
            permissions: {
              create: data.permissions,
            },
          }),
        },
        include: {
          permissions: true,
        },
      });
    });
  }

  async deleteRole(institutionId: string, id: string) {
    await this.getRoleById(institutionId, id);
    return this.prisma.customRole.delete({
      where: { id },
    });
  }
}
