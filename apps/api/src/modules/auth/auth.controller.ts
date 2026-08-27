import { Controller, Get, Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Request() req: any) {
    // The SupabaseAuthGuard has already attached the user to the request
    return { user: req.user };
  }
}
