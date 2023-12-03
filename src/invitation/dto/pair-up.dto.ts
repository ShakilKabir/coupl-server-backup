// pair-up.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class PairUpDto {
  @IsNotEmpty()
  @IsString()
  readonly primaryId: string;
}