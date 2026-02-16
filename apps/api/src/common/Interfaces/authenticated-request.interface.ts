export interface AuthenticatedRequest {
  user: {
    id: number;
    email: string;
    role: string;
    permissions: string[];
    jti: string;
  };
}
