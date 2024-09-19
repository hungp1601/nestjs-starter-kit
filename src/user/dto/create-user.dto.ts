import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsUserEmailExists } from '../validators/user.validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail()
  @Validate(IsUserEmailExists)
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
