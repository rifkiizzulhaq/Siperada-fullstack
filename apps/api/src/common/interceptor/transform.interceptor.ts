import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface ClassConstructor {
  new (...arg: unknown[]): object;
}

export const Transform = (dto: ClassConstructor) => {
  return UseInterceptors(new TransformInterceptor(dto));
};

export class TransformInterceptor<T extends object> implements NestInterceptor<
  T,
  object
> {
  constructor(private dto: ClassConstructor) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<object> {
    return next.handle().pipe(
      map((data: T) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
