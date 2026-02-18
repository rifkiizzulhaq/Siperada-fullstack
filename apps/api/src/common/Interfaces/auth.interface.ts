export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: TokenUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenUser {
  id: number;
  email: string;
  password: string;
  role?: {
    id: number;
    name: string;
  };
  permissions?: Array<{
    id: number;
    name: string;
  }>;
}

export interface RefreshTokenData {
  userId: number;
  email: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role?: string;
  permissions: number[];
  jti: string;
}

export interface UsedTokenData {
  userId: number;
  rotatedTo?: {
    accessToken: string;
    refreshToken: string;
  };
  rotatedAt: number;
}
