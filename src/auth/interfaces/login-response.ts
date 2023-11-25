import { User } from '../entities/user.entity';

//nos va a indicar como lucen nuestras respuestas 

export interface LoginResponse {
    user: User;
    token: string;
}