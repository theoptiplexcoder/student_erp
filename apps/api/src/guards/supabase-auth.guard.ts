import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.split(' ')[1];

    const {
      data: { user: supabaseUser },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { authUserId: supabaseUser.id },
      select: {
        id: true,
        authUserId: true,
        institutionId: true,
        role: true,
        status: true,
        email: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found in application');
    }

    if (dbUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    request.user = {
      id: dbUser.id,
      authUserId: dbUser.authUserId,
      institutionId: dbUser.institutionId,
      role: dbUser.role,
      status: dbUser.status,
      email: dbUser.email,
    };

    return true;
  }
}
