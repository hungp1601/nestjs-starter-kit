import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import {
  IsUserEmailExists,
  IsValidPassword,
} from '../validators/user.validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail()
  @Validate(IsUserEmailExists)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidPassword)
  password: string;
}
