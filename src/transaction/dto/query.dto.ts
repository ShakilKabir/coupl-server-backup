// src/transaction/dto/query.dto.ts

import { IsOptional, IsDateString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  category?: string;
}
