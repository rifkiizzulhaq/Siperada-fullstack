import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { HttpExceptionFilter } from './filter/http-exception';
import { AuthGuard } from './guard/auth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthModule } from '../modules/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class CoreModule {}
