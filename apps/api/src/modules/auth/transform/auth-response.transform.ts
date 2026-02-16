import { Expose, Type } from 'class-transformer';

import { UserResponse } from '../../user/transform/user-response.transform';

export class AuthResponseTransform {
  @Expose()
  @Type(() => UserResponse)
  user?: UserResponse;

  @Expose()
  accessToken?: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  message?: string;
}
