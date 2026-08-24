import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, RoomType } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(institutionId: string, createRoomDto: CreateRoomDto) {
    // Verify the building belongs to the institution
    const building = await this.prisma.building.findFirst({
      where: { id: createRoomDto.buildingId, institutionId },
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${createRoomDto.buildingId} not found`);
    }

    return this.prisma.room.create({
      data: {
        buildingId: createRoomDto.buildingId,
        name: createRoomDto.name,
        number: createRoomDto.number,
        floor: createRoomDto.floor,
        capacity: createRoomDto.capacity,
        roomType: (createRoomDto.roomType as RoomType) ?? 'CLASSROOM',
        institutionId,
      },
      include: { building: true },
    });
  }

  async findAll(
    institutionId: string,
    page = 1,
    pageSize = 50,
    search?: string,
    buildingId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.RoomWhereInput = {
      institutionId,
      ...(buildingId ? { buildingId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { number: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: { building: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(institutionId: string, id: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, institutionId },
      include: { building: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(institutionId: string, id: string, updateRoomDto: UpdateRoomDto) {
    await this.findOne(institutionId, id);

    // If buildingId is being updated, verify it belongs to the institution
    if (updateRoomDto.buildingId) {
      const building = await this.prisma.building.findFirst({
        where: { id: updateRoomDto.buildingId, institutionId },
      });
      if (!building) {
        throw new NotFoundException(`Building with ID ${updateRoomDto.buildingId} not found`);
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        ...(updateRoomDto.buildingId && { buildingId: updateRoomDto.buildingId }),
        ...(updateRoomDto.name && { name: updateRoomDto.name }),
        ...(updateRoomDto.number && { number: updateRoomDto.number }),
        ...(updateRoomDto.floor !== undefined && { floor: updateRoomDto.floor }),
        ...(updateRoomDto.capacity !== undefined && { capacity: updateRoomDto.capacity }),
        ...(updateRoomDto.roomType && { roomType: updateRoomDto.roomType as RoomType }),
      },
      include: { building: true },
    });
  }

  async remove(institutionId: string, id: string) {
    await this.findOne(institutionId, id);
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
