import { Injectable } from '@nestjs/common';
// import { CreateFileDto } from './dto/create-file.dto';
// import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { FileMetadata } from './entities/file.entity';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileRepo: Repository<FileMetadata>,
  ) {}
  async saveAndCleanup(files: Express.Multer.File[]) {
    const savedFiles: FileMetadata[] = [];

    for (const file of files) {
      // 1. Save new file metadata
      const newFile = await this.fileRepo.save({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      });
      savedFiles.push(newFile);
    }

    // 2. Identify all files EXCEPT the very last one added
    const latestFile = await this.fileRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    if (latestFile) {
      const oldFiles = await this.fileRepo.find({
        where: { id: Not(latestFile.id) },
      });

      // 3. Delete physical files and DB records
      for (const oldFile of oldFiles) {
        if (fs.existsSync(oldFile.path)) {
          fs.unlinkSync(oldFile.path);
        }
        await this.fileRepo.remove(oldFile);
      }
    }

    return {
      message: 'Upload successful, old files purged.',
      latest: latestFile,
    };
  }
}
