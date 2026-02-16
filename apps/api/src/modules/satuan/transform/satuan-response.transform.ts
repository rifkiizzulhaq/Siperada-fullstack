import { Expose } from 'class-transformer';

export class SatuanResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
