import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({ example: 'Иван' })
  @IsString()
  @MinLength(1, { message: 'Имя обязательно' })
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  @MinLength(1, { message: 'Фамилия обязательна' })
  lastName: string;

  @ApiPropertyOptional({ example: '+7 900 123-45-67' })
  @IsOptional()
  @IsString()
  phone?: string;
}
