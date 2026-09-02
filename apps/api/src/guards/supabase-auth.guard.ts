import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {
    this.redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');
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
    let decodedToken: any;

    try {
      const jwtSecret = process.env['SUPABASE_JWT_SECRET'];
      if (!jwtSecret) throw new Error('SUPABASE_JWT_SECRET is missing');

      decodedToken = jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const authUserId = decodedToken.sub;
    if (!authUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const cacheKey = `user_auth:${authUserId}`;
    let dbUser: any;

    const cachedUser = await this.redis.get(cacheKey);
    if (cachedUser) {
      dbUser = JSON.parse(cachedUser);
    } else {
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

      await this.redis.set(cacheKey, JSON.stringify(dbUser), 'EX', 15 * 60);
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
