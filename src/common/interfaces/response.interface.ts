export interface IResponse<T = any> {
  data?: T;
  message: string;
  pagination?: {
    hasMore: boolean;
    totalItems: number;
  };
  // stats?: IStats;
  statusCode: number;
}
