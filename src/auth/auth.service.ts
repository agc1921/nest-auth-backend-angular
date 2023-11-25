import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    private jwtService: JwtService,
  ) { }

  async create(CreateUserDto: CreateUserDto): Promise<User> {

    // const newUser = new this.userModel(CreateUserDto);
    // return newUser.save();

    try {

      // 1 - Encriptar las contraseñas 

      const { password, ...userData } = CreateUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${CreateUserDto.email} existe!`)
      }
      throw new InternalServerErrorException('algo se daño!')
    }




    // 2 - Guardar el usuario





    // 3 - Generar el JWT

  }

  
  findAll():Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ){
    const user = await this.userModel.findById(id)
    const {password, ...rest} = user.toJSON();
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

  
  async register ( registerDto: RegisterUserDto ): Promise<LoginResponse> {

    const user = await this.create( registerDto );

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login ( loginDto: LoginDto ):Promise<LoginResponse> {
  
  
    const { email, password } = loginDto;
  
    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
  
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Not valid credentials - password');
    }
  
    const { password:_, ...rest  } = user.toJSON();
  
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),

    }

  }

  getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
