import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateAdminDto {
  @IsString({ message: "First name must be a string" })
  @MinLength(3, { message: "First name must be at least 3 characters long" })
  @MaxLength(30, { message: "First name must be at most 30 characters long" })
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  @MinLength(3, { message: "Last name must be at least 3 characters long" })
  @MaxLength(30, { message: "Last name must be at most 30 characters long" })
  lastName: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Email is invalid" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(100, { message: "Password must be at most 100 characters long" })
  @Transform(({ value }) => value.trim())
  password: string;
}
