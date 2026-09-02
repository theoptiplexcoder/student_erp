import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private redis: Redis | undefined;
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {
    if (process.env['REDIS_URL']) {
      this.redis = new Redis(process.env['REDIS_URL']);
    }
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.split(' ')[1];

    // Use Supabase's getUser() to verify the token server-side
    // This handles ES256/HS256 and all signing algorithms natively
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const authUserId = user.id;

    const cacheKey = `user_auth:${authUserId}`;
    let dbUser: any;

    if (this.redis) {
      const cachedUser = await this.redis.get(cacheKey);
      if (cachedUser) {
        dbUser = JSON.parse(cachedUser);
      }
    }

    if (!dbUser) {
      dbUser = await this.prisma.user.findUnique({
        where: { authUserId: authUserId },
        select: {
          id: true,
          authUserId: true,
          institutionId: true,
          role: true,
          status: true,
          email: true,
          customRole: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!dbUser) {
        throw new UnauthorizedException('User not found in application');
      }

      if (this.redis) {
        await this.redis.set(cacheKey, JSON.stringify(dbUser), 'EX', 15 * 60);
      }
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
      customRole: dbUser.customRole,
    };

    return true;
  }
}
