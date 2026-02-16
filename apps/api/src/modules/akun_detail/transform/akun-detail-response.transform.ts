import { Expose } from 'class-transformer';

export class AkunDetailResponse {
  @Expose()
  id: number;

  @Expose()
  kode: string;

  @Expose()
  name: string;
}
