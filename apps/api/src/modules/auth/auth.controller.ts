import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterInstitutionDto } from './dto/register-institution.dto';
import { Public } from '../../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Request() req: any) {
    // The SupabaseAuthGuard has already attached the user to the request
    return { user: req.user };
  }

  @Public()
  @Post('register-institution')
  async registerInstitution(@Body() dto: RegisterInstitutionDto) {
    return this.authService.registerInstitution(dto);
  }
}
