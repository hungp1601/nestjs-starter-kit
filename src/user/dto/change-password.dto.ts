import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsValidPassword } from '../validators/user.validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidPassword)
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidPassword)
  new_password: string;
}
