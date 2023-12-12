//transaction-limit.dto.ts

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SetTransactionLimitDto {
  @IsNotEmpty()
  @IsNumber()
  readonly monthlyLimit: number;
}

export class RespondToTransactionLimitDto {
  @IsNotEmpty()
  readonly accept: boolean;

  @IsOptional()
  @IsNumber()
  readonly newLimit?: number;
}
