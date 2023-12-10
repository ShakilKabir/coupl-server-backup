//transaction-limit.dto.ts

import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetTransactionLimitDto {
  @IsNotEmpty()
  @IsNumber()
  readonly monthlyLimit: number;
}

export class UpdateTransactionLimitApprovalDto {
  @IsNotEmpty()
  readonly isApproved: boolean;
}
