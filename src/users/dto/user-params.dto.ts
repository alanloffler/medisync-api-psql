import { IsIn, IsOptional, IsString } from "class-validator";

export class UserParamsDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  limit: string;

  @IsOptional()
  @IsString()
  skip: string;

  @IsOptional()
  @IsIn(["firstName", "lastName"])
  sortingKey: string;

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortingValue: string;
}
