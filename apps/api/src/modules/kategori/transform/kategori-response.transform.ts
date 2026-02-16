import { Expose } from 'class-transformer';

export class KategoriResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
