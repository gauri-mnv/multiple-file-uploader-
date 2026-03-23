// import { CreateFileDto } from './dto/create-file.dto';
// import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMetadata } from './entities/file.entity';
import { UploadToS3Service } from 'src/upload-to-s3/upload-to-s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileMetadata)
    private fileRepo: Repository<FileMetadata>,
    private s3Service: UploadToS3Service,
  ) {}

  async uploadFiles(files: Express.Multer.File[]): Promise<void> {
    for (const file of files) {
      // 1. S3 par upload karein (Folder name 'general' ya 'uploads' de sakte hain)
      const uploadResult = await this.s3Service.uploadBufferFileToS3(
        'customer-uploads',
        file.buffer,
        file.originalname,
      );

      // 2. Database mein metadata save karein
      const newFile = this.fileRepo.create({
        filename: file.originalname,
        path: uploadResult.key, // S3 key save ho rahi hai
        mimetype: file.mimetype,
        // customerId: '123' // Agar aapke paas customerId hai toh yahan pass karein
      });

      await this.fileRepo.save(newFile);
    }
  }

  // Ye method bhi zaroori hai controller ke liye
  async findAll(): Promise<FileMetadata[]> {
    return await this.fileRepo.find({
      order: { id: 'DESC' }, // Taki latest uploads sabse upar dikhen
    });
  }

  async findOne(id: number): Promise<FileMetadata> {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async getLatest(): Promise<FileMetadata | null> {
    return await this.fileRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' }, // Make sure your entity has createdAt
    });
  }
  async remove(id: number): Promise<{ deleted: boolean }> {
    const file = await this.findOne(id); // Reuse findOne to check if it exists

    // If using S3, you might want to delete from S3 here too:
    // await this.s3Service.deleteFileByUrl(file.path);

    await this.fileRepo.remove(file);
    return { deleted: true };
  }

  // src/files/files.service.ts

  async deleteSpecificFile(fileId: number) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });

    if (file) {
      // 1. S3 se delete karo
      await this.s3Service.deleteFileByUrl(file.path);

      // 2. Database se record hatao
      await this.fileRepo.remove(file);

      return { success: true };
    }
    throw new Error('File not found');
  }

  // Upload logic mein ab "Cleanup" mita do, sirf Save rakho
  async saveFiles(files: Express.Multer.File[], customerId: string) {
    for (const file of files) {
      const uploadResult = await this.s3Service.uploadBufferFileToS3(
        `customer-${customerId}`, // Folder name based on customer
        file.buffer,
        file.originalname,
      );

      const metadata = this.fileRepo.create({
        filename: file.originalname,
        path: uploadResult.key,
        mimetype: file.mimetype,
        customerId: customerId,
      });
      await this.fileRepo.save(metadata);
    }
  }
}
