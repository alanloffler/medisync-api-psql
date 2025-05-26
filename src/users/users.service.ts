import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, MoreThanOrEqual, Raw, Repository } from "typeorm";
import type { IResponse } from "../common/interfaces/response.interface";
import type { IUserStats } from "./interfaces/user-stats.interface";
import type { IUsersData } from "./interfaces/user-data.interface";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserParamsDto } from "./dto/user-params.dto";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<IResponse<User>> {
    if (createUserDto.dni) {
      const findUser: User | null = await this.idCardExists(createUserDto.dni);
      if (findUser) throw new HttpException("Identity card number already used", HttpStatus.CONFLICT);
    }

    const user: User = await this.userRepository.save(createUserDto);
    if (!user) throw new HttpException("Failed to create user", HttpStatus.BAD_REQUEST);

    return {
      data: user,
      message: "User created",
      statusCode: HttpStatus.OK,
    };
  }

  async findAll(data: UserParamsDto): Promise<IResponse<IUsersData>> {
    const { search = "", limit, skip, sortingKey, sortingValue } = data;
    let sorting = {};
    let sk: string = "lastName";
    if (sortingKey) sk = sortingKey;
    if (sortingValue === "asc") sorting = { [sk]: 1 };
    if (sortingValue === "desc") sorting = { [sk]: -1 };

    const users: User[] = await this.userRepository.find({
      where: [
        { isDeleted: false, firstName: ILike(`%${search}%`) },
        { isDeleted: false, lastName: ILike(`%${search}%`) },
      ],
      order: sorting,
      skip: skip ? parseInt(skip, 10) : 0,
      take: limit ? parseInt(limit, 10) : 100,
    });

    if (users.length === 0) throw new HttpException("Users not found", HttpStatus.NOT_FOUND);
    if (!users) throw new HttpException("Error fetching users", HttpStatus.BAD_REQUEST);

    const count: number = await this.userRepository.count({
      where: [
        { isDeleted: false, firstName: ILike(`%${search}%`) },
        { isDeleted: false, lastName: ILike(`%${search}%`) },
      ],
    });
    const _limit: number = parseInt(limit) > 0 ? parseInt(limit) : 100;
    const pageTotal: number = count ? Math.floor((count - 1) / _limit) + 1 : 0;
    const usersData: IUsersData = { total: pageTotal, count: count, data: users };

    return {
      data: usersData,
      message: "Users found",
      statusCode: HttpStatus.OK,
    };
  }

  async findAllByIdentityNumber(data: UserParamsDto): Promise<IResponse<IUsersData>> {
    const { search, limit, skip, sortingKey, sortingValue } = data;
    let sorting = {};
    let sk: string = "lastName";
    if (sortingKey) sk = sortingKey;
    if (sortingValue === "asc") sorting = { [sk]: 1 };
    if (sortingValue === "desc") sorting = { [sk]: -1 };

    const users: User[] = await this.userRepository.find({
      where: [
        {
          isDeleted: false,
          dni: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :search`, { search: `${search}%` }),
        },
      ],
      order: sorting,
      skip: skip ? parseInt(skip, 10) : 0,
      take: limit ? parseInt(limit, 10) : 100,
    });

    if (users.length === 0) throw new HttpException("Users not found", HttpStatus.NOT_FOUND);
    if (!users) throw new HttpException("Error fetching users", HttpStatus.BAD_REQUEST);

    const count: number = await this.userRepository.count({
      where: {
        isDeleted: false,
        dni: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :search`, { search: `${search}%` }),
      },
    });
    const _limit: number = parseInt(limit) > 0 ? parseInt(limit) : 100;
    const pageTotal: number = count ? Math.floor((count - 1) / _limit) + 1 : 0;
    const usersData: IUsersData = { total: pageTotal, count: count, data: users };

    return {
      data: usersData,
      message: "Users found",
      statusCode: HttpStatus.OK,
    };
  }

  async findOne(id: number): Promise<IResponse<User>> {
    const user: User | null = await this.userRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!user) throw new HttpException("User not found", HttpStatus.BAD_REQUEST);

    return {
      data: user,
      message: "User found",
      statusCode: HttpStatus.OK,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<IResponse<User | null>> {
    if (updateUserDto.dni) {
      const findIdCard = await this.idCardExists(updateUserDto.dni);
      if (findIdCard && findIdCard.id !== id) throw new HttpException("Identity card already exists", HttpStatus.CONFLICT);
    }

    const result = await this.userRepository.update(id, { ...updateUserDto });
    if (result.affected === 0) throw new HttpException("User not updated", HttpStatus.BAD_REQUEST);

    let user: User | null = null;
    if (result.affected && result.affected > 0) {
      user = await this.userRepository.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (!user) throw new HttpException("User not found", HttpStatus.BAD_REQUEST);
    }

    return {
      data: user,
      message: "User updated",
      statusCode: HttpStatus.OK,
    };
  }

  // TODO: remove appos associated with user
  async remove(id: number): Promise<IResponse<User | null>> {
    const user: User | null = await this.userExists(id);

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new HttpException("User not deleted", HttpStatus.BAD_REQUEST);

    return {
      data: user,
      message: "User deleted",
      statusCode: HttpStatus.OK,
    };
  }

  async newUsersToday(): Promise<IResponse<IUserStats>> {
    const countAll: number = await this.userRepository.countBy({ isDeleted: false });
    if (!countAll) throw new HttpException("Error counting users", HttpStatus.BAD_REQUEST);

    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday: number = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(today),
        isDeleted: false,
      },
    });
    if (countToday === undefined || countToday === null) throw new HttpException("Error counting today new users", HttpStatus.BAD_REQUEST);

    const data: IUserStats = {
      percentage: countToday ? (countToday * 100) / countAll : 0,
      today: countToday,
      total: countAll,
    };

    return {
      data: data,
      message: "New users today",
      statusCode: HttpStatus.OK,
    };
  }

  async findRemovedUsers(): Promise<IResponse<User[]>> {
    const users: User[] = await this.userRepository.find({ where: { isDeleted: true } });
    if (users.length === 0) return { data: [], message: "Users not found", statusCode: HttpStatus.NOT_FOUND };
    if (!users) throw new HttpException("Error finding users removed", HttpStatus.BAD_REQUEST);

    return {
      data: users,
      message: "Users removed found",
      statusCode: HttpStatus.OK,
    };
  }

  async delete(id: number): Promise<IResponse<User | null>> {
    const result = await this.userRepository.update(id, { isDeleted: true });
    if (result.affected === 0) throw new HttpException("Error deleting user (soft)", HttpStatus.BAD_REQUEST);

    let user: User | null = null;
    if (result.affected && result.affected > 0) {
      user = await this.userRepository.findOne({
        where: {
          id: id,
          isDeleted: true,
        },
      });
      if (!user) throw new HttpException("User not found", HttpStatus.BAD_REQUEST);
    }

    return {
      data: user,
      message: "User deleted (soft)",
      statusCode: HttpStatus.OK,
    };
  }

  private async userExists(id: number): Promise<User | null> {
    const user: User | null = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    return user;
  }

  private async idCardExists(idCard: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ dni: idCard });
  }
}
