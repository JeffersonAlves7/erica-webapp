import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const imports: any = [AuthModule, UsersModule, PrismaModule, ProductsModule];

if (process.env.NODE_ENV == 'production') {
  imports.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  );
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
