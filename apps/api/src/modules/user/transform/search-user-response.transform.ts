import { Expose, Type } from 'class-transformer';
import { UserResponse } from './user-response.transform';

class MetaResponse {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;
}

export class SearchUserResponse {
  @Expose()
  @Type(() => UserResponse)
  data: UserResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
