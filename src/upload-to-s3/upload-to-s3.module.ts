import { Module } from '@nestjs/common';
import { UploadToS3Service } from './upload-to-s3.service';

@Module({
  providers: [UploadToS3Service],
  exports: [UploadToS3Service],
})
export class UploadToS3Module {}
