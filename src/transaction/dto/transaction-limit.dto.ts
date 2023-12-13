//transaction-limit.dto.ts

import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SetTransactionLimitDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly monthlyLimit: number;
}

export class RespondToTransactionLimitDto {
  @IsNotEmpty()
  readonly accept: boolean;

  @IsOptional()
  @IsNumber()
  readonly newLimit?: number;
}
