import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterInstitutionDto } from './dto/register-institution.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl =
      process.env['SUPABASE_URL'] || process.env['NEXT_PUBLIC_SUPABASE_URL'] || '';
    const supabaseServiceKey =
      process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SERVICE_KEY'] || '';

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async registerInstitution(dto: RegisterInstitutionDto) {
    // 1. Check if user with this email already exists in database
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    // 2. Create the user in Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: dto.email.toLowerCase(),
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        role: 'ADMIN',
      },
    });

    if (authError || !authData.user) {
      this.logger.error(`Supabase user creation failed: ${authError?.message}`);
      throw new BadRequestException(
        authError?.message || 'Failed to create administrative credentials.',
      );
    }

    const authUserId = authData.user.id;

    // 3. Atomically create Institution, default Academic Year, and User in Prisma
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create Institution
        const institution = await tx.institution.create({
          data: {
            institutionType: dto.institutionType,
            legalName: dto.legalName.trim(),
            displayName: dto.displayName.trim(),
            branding: {
              phone: dto.phone || undefined,
              address: dto.address || undefined,
            },
          },
        });

        // Create default current Academic Year
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 5, 1); // June 1st of current year
        const endDate = new Date(currentYear + 1, 4, 31); // May 31st of next year

        await tx.academicYear.create({
          data: {
            institutionId: institution.id,
            name: `${currentYear}-${currentYear + 1}`,
            startDate,
            endDate,
            isActive: true,
          },
        });

        // Create the Admin / Tenant User
        const user = await tx.user.create({
          data: {
            institutionId: institution.id,
            authUserId,
            email: dto.email.toLowerCase(),
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            phone: dto.adminPhone || dto.phone || null,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        });

        return {
          success: true,
          message: 'Institution and admin account created successfully.',
          institution: {
            id: institution.id,
            legalName: institution.legalName,
            displayName: institution.displayName,
            institutionType: institution.institutionType,
          },
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        };
      });
    } catch (err: any) {
      this.logger.error(`Failed to create database records: ${err.message}`);
      // Attempt cleanup of orphaned Supabase auth user
      try {
        await this.supabase.auth.admin.deleteUser(authUserId);
      } catch (cleanupErr: any) {
        this.logger.error(`Failed to cleanup Supabase user ${authUserId}: ${cleanupErr.message}`);
      }

      throw new InternalServerErrorException(
        err.message || 'Failed to complete institution registration.',
      );
    }
  }
}
