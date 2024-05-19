import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService) { }


  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // extraigo el password y lo demás lo clono a un objeto nuevo
      const { password, ...userData } = createUserDto;
      /** new this.userModel es el objeto que genero para manejar el CRUD, ¿qué le paso? 
       * pues un objeto (los {}) que contiene la propiedad password con el hash y las propiedades 
       * destripadas del objeto que hice en la línea anterior.
      */
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });
      /** este método es asíncrono ya que lo que sale de aquí es una promesa y la operación de bd se hace fuera de aquí. 
       * Con await en este async método hago que se ejecute aquí dentro, supongo, en todo caso gracias a eso un error
       * en la operación de base de datos será capturado en el catch de este mismo método.
      */
      await newUser.save();

      /** por supuesto no quiero mandar el hash al frontend. Repito lo que hice antes para desestructurar el password.
       */
      const { password: _, ...user } = newUser.toJSON();

      /**Esto no es la promesa sino el User. No comprendo cómo, pero parece ser que el await permite devolver el objeto y no la promesa */
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException(`Something wents wrong!`);
    }

  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {
    // traga registerDto porque cumple la firma de CreateDto
    const user = await this.create(registerDto);

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email')
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password: _, ...rest } = user.toJSON();
    /**
     * Sería razonable devolver
     * User {_id, name, email, roles, }
     * Token (sesión) -> ej. KSDJKLEJ.OISJEFIJ.LLSODFJLJF
     */
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }) // user tiene las propiedades del interfaz User y muchas cosas más, incluyendo el _id en formato string
    }
  }

  findAll() {
    return this.userModel.find();
  }

  async findUserById( id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
