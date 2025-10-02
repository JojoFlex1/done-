import { IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WasteSubmissionDto {
  @ApiProperty({ example: 'QR_BIN001' })
  @IsNotEmpty()
  qr_code: string;

  @ApiProperty({ example: 'smartphone' })
  @IsNotEmpty()
  waste_type: string;

  @ApiProperty({ example: 0.5, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  @Max(50)
  weight_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;
}
