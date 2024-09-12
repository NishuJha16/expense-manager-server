import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: '2024-09-01T10:00:00Z',
    description: 'Date and time of the expense.',
  })
  @IsDate()
  @IsNotEmpty()
  datetime: Date;

  @ApiProperty({ example: 'Food', description: 'Category of the expense.' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Lunch', description: 'Title of the expense.' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Lunch at the café',
    description: 'Description of the expense.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15.5, description: 'Amount of the expense.' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'cash',
    description: 'Mode of payment for the expense.',
  })
  @IsString()
  @IsNotEmpty()
  mode: string;
}
