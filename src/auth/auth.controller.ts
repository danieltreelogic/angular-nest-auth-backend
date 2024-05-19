import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // hago una petición POST con algunos datos en el body y vienen en este dto
    // console.log(createAuthDto);
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    const objLogin = this.authService.login(loginDto);
    console.log({ objLogin });
    return objLogin;
  }

  @Post('/register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }


  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: Request) {
    /**
  * No sé pa qué, ya que está validando el token en el guard, aprovecha para hacer la consulta y meter en la request el resultado que es el user cuyo id viene en el token. 
  * Era una especie de prueba pero no lo pillo.
  */
    // const user = req['user'] as User;
    // return user;
    return this.authService.findAll();
  }

  /**
   * Usado para renovar el token con cada refresco de página en Angular.
   * Recibe un token, lo valida con el guard, obtiene de éste el usuario que lo envió
   * y usa el id para generar un nuevo token.
   * @param req petición que tras pasar por el Guard traerá el usuario
   * @returns objeto con el usuario y el nuevo token generado
   */
  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'];
    return {user, token: this.authService.getJwtToken( {id: user._id} )};
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
