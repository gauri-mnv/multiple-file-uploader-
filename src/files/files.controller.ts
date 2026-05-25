import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  Render,
  Res,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import express from 'express'; // Simplified import
import { UploadToS3Service } from 'src/upload-to-s3/upload-to-s3.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly s3Service: UploadToS3Service,
  ) {}

  /**
   * GET /files/show
   * Ab ye saari files dikhayega (Multiple objects like Sign, Photo, PDF)
   */
  @Get('show')
  @Render('index')
  async root(@Query('status') status: string) {
    // 1. Service se array mangwao (Yahan await hona chahiye)
    const allFiles = await this.filesService.findAll();

    // 2. Ab .map() kaam karega kyunki allFiles ab ek Array hai
    const filesWithUrls = await Promise.all(
      allFiles.map(async (file) => ({
        ...file,
        viewUrl: await this.s3Service.getPresignedUrl(file.path),
      })),
    );

    return {
      message: 'Customer Document Management',
      status:
        status === 'success'
          ? 'Uploaded!'
          : status === 'deleted'
            ? 'Deleted!'
            : null,
      files: filesWithUrls,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB Limit
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    // @Res() res: express.Response,
  ) {
    console.log('Total files received:', files.length);
    if (!files || files.length === 0) {
      return { message: 'No files uploaded', data: [] };
    } else if (files && files.length > 0) {
      // void this.filesService.uploadFiles(files);
      // return res.redirect('/files/show?status=success');

      const uploadedFilesData = await this.filesService.uploadFiles(files);
      return {
        message: 'Upload successful',
        data: uploadedFilesData,
      };
    }
  }

  /**
   * POST /files/delete/:id
   * Specific file delete karne ke liye (Browser forms DELETE direct support nahi karte, isliye POST better hai)
   */
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Res() res: express.Response) {
    await this.filesService.remove(+id);
    return res.redirect('/files/show?status=deleted');
  }
}
