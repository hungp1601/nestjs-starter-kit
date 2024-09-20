import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from '../services/user/user.service';

@Injectable()
@ValidatorConstraint({ name: 'IsUserEmailExists', async: true })
export class IsUserEmailExists implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(value: string) {
    try {
      const user = await this.userService.isUserExists(value);
      if (user) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with email ${args.value} existed`;
  }
}

@Injectable()
@ValidatorConstraint({ name: 'IsValidPassword' })
export class IsValidPassword implements ValidatorConstraintInterface {
  validate(value: string) {
    if (
      value.length < 8 ||
      !/[a-z]/.test(value) ||
      !/[A-Z]/.test(value) ||
      !/[0-9]/.test(value)
    ) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number`;
  }
}
