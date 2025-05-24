import * as bcryptjs from "bcryptjs";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { IResponse } from "../common/interfaces/response.interface";
import { Admin } from "./entities/admin.entity";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";

@Injectable()
export class AdminService {
  constructor(@InjectRepository(Admin) private adminRepository: Repository<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<IResponse<Admin>> {
    const emailTaken: boolean = await this.isEmailTaken(createAdminDto.email);
    if (emailTaken) throw new HttpException("Email already taken", HttpStatus.CONFLICT);

    const passwordHashed: string = await bcryptjs.hash(createAdminDto.password, 10);
    createAdminDto.password = passwordHashed;

    const admin: Admin = await this.adminRepository.save({ ...createAdminDto });
    if (!admin) throw new HttpException("Failed to create admin", HttpStatus.BAD_REQUEST);

    return {
      data: admin,
      message: "Admin created",
      statusCode: HttpStatus.CREATED,
    };
  }

  async findAll(): Promise<IResponse<Admin[]>> {
    const admins: Admin[] = await this.adminRepository.find({
      select: ["id", "firstName", "lastName", "email", "createdAt", "updatedAt"],
    });
    if (!admins) throw new HttpException("Admins not found", HttpStatus.NOT_FOUND);

    return {
      data: admins,
      message: "Admins found",
      statusCode: HttpStatus.OK,
    };
  }

  async findOne(id: number): Promise<IResponse<Admin>> {
    const admin: Admin | null = await this.adminRepository.findOne({
      where: { id },
      select: ["id", "firstName", "lastName", "email", "createdAt", "updatedAt"],
    });
    if (!admin) throw new HttpException("Admin not found", HttpStatus.NOT_FOUND);

    return {
      data: admin,
      message: "Admin found",
      statusCode: HttpStatus.OK,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<IResponse<Admin | null>> {
    await this.adminExists(id);

    if (updateAdminDto.email) {
      const emailTaken: boolean = await this.isEmailTaken(updateAdminDto.email);
      if (emailTaken) throw new HttpException("Email already taken", HttpStatus.CONFLICT);
    }

    if (updateAdminDto.password) {
      const passwordHashed: string = await bcryptjs.hash(updateAdminDto.password, 10);
      updateAdminDto.password = passwordHashed;
    }

    const result = await this.adminRepository.update(id, { ...updateAdminDto });
    if (result.affected === 0) throw new HttpException("Failed to update admin", HttpStatus.BAD_REQUEST);

    let admin: Admin | null = null;
    if (result.affected && result.affected > 0) {
      admin = await this.adminRepository.findOne({
        where: { id },
        select: ["id", "firstName", "lastName", "email", "createdAt", "updatedAt"],
      });
    }

    return {
      data: admin,
      message: "Admin updated",
      statusCode: HttpStatus.OK,
    };
  }

  async remove(id: number) {
    const admin: Admin | null = await this.adminExists(id);

    const result = await this.adminRepository.delete({ id });
    if (result.affected === 0) throw new HttpException("Failed to remove admin", HttpStatus.BAD_REQUEST);

    return {
      data: admin,
      message: "Admin removed",
      statusCode: HttpStatus.OK,
    };
  }

  private async adminExists(id: number): Promise<Admin | null> {
    const admin: Admin | null = await this.adminRepository.findOne({
      where: { id },
      select: ["id", "firstName", "lastName", "email", "createdAt", "updatedAt"],
    });
    if (!admin) throw new HttpException("Admin not found", HttpStatus.NOT_FOUND);

    return admin;
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const admin = await this.adminRepository.findOneBy({ email });
    return !!admin;
  }
}
