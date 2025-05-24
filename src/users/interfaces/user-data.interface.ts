import { User } from "../entities/user.entity";

export interface IUsersData {
  count: number;
  data: User[];
  total: number;
}
