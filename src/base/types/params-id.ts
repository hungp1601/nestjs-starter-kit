import { IsNotEmpty } from 'class-validator';

export class ParamId {
  @IsNotEmpty()
  id: string;
}
