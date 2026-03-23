import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin@123',
      database: 'fileUploader',
      autoLoadEntities: true,
      synchronize: true,
    }),
    FilesModule,
  ],
})
export class AppModule {}
