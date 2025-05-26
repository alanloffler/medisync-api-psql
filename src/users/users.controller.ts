import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserParamsDto } from "./dto/user-params.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) data: UserParamsDto) {
    return this.usersService.findAll(data);
  }

  @Get("byIdentityNumber")
  findAllByIdentityNumber(@Query(new ValidationPipe({ transform: true })) data: UserParamsDto) {
    return this.usersService.findAllByIdentityNumber(data);
  }

  @Get("newUsersToday")
  newUsersToday() {
    return this.usersService.newUsersToday();
  }

  @Get("removedUsers")
  findRemovedUsers() {
    return this.usersService.findRemovedUsers();
  }

  @Patch("delete/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
