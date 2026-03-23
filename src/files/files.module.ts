import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileMetadata } from './entities/file.entity';
import { UploadToS3Service } from 'src/upload-to-s3/upload-to-s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileMetadata])],
  controllers: [FilesController],
  providers: [FilesService, UploadToS3Service],
})
export class FilesModule {}
