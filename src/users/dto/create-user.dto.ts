import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString({ message: "First name must be a string" })
  @MinLength(3, { message: "First name must be at least 3 characters long" })
  @MaxLength(30, { message: "First name must be at most 30 characters long" })
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  @MinLength(3, { message: "Last name must be at least 3 characters long" })
  @MaxLength(30, { message: "Last name must be at most 30 characters long" })
  lastName: string;

  @IsInt({ message: "Identity card must be an integer" })
  @Min(1000000, { message: "Identity card must be at least 1 million" })
  @Max(99999999, { message: "Identity card must be at most 99.99 million" })
  dni: number;

  @IsInt({ message: "Area code must be an integer" })
  @Min(1, { message: "Area code must be at least 1" })
  @Max(999, { message: "Area code must be at most 999" })
  areaCode: number;

  @IsInt({ message: "Phone number must be an integer" })
  @Min(1000000000, { message: "Phone number must be at least 1 billion" })
  @Max(9999999999, { message: "Phone number must be at most 9.999 billion" })
  phone: number;

  @IsOptional()
  @IsEmail({}, { message: "Email must be a valid email address" })
  email?: string;

  @IsOptional()
  @IsBoolean({ message: "Deleted status must be a boolean" })
  isDeleted?: boolean;
}
