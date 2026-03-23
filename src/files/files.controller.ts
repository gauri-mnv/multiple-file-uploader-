import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Render,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
// import { CreateFileDto } from './dto/create-file.dto';
// import { UpdateFileDto } from './dto/update-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // 'files' is the field name, 10 is max count
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new Error('Only PDF and DOC files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: any,
  ) {
    await this.filesService.saveAndCleanup(files);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return res.redirect('/files');
  }

  @Get()
  @Render('index')
  root() {
    return { message: 'Upload Interface' };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   // return this.filesService.findOne(+id);
  //   return ` wala with ${id}`;
  // }

  @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
  update(@Param('id') id: string) {
    // return this.filesService.update(+id, updateFileDto);
    return `patch wala with ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.filesService.remove(+id);
    return `Delete wala with ${id}`;
  }
}
