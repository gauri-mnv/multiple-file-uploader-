import { Injectable } from '@nestjs/common';
import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { fileTypeFromBuffer, FileTypeResult } from 'file-type';
import { s3Client, BUCKET, ALLOWED_MIME_TYPES } from './config';
import 'dotenv/config';
import path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface fiesListType {
  key: string;
  fileName: string | undefined;
  extension: string;
  url: string;
  sizeBytes: number | undefined;
  sizeKB: string | null;
  sizeMB: string | null;
  lastModified: Date | undefined;
}

@Injectable()
export class UploadToS3Service {
  //#region :- upload using base64data

  async uploadBase64FileToS3(
    folder: string,
    base64Data: string,
    fileName: string,
  ): Promise<{
    key: string;
    fileName: string;
    contentType: string;
    extension: string;
    folder: string;
    url: string;
  }> {
    if (!base64Data) {
      throw new Error('Base64 data missing');
    }

    // Remove data URI prefix if present
    const cleanedBase64: string = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;

    const buffer: Buffer = Buffer.from(cleanedBase64, 'base64');

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Invalid base64 buffer');
    }

    const fileType: FileTypeResult | undefined =
      await fileTypeFromBuffer(buffer);

    if (!fileType) {
      throw new Error('Unable to detect file type');
    }

    const { ext: extension, mime: contentType } = fileType;

    // Optional strict validation
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      throw new Error(`File type not allowed: ${contentType}`);
    }

    // Ensure filename has correct extension
    let safeFileName: string = fileName;
    if (!safeFileName.endsWith(`.${extension}`)) {
      safeFileName = `${safeFileName}.${extension}`;
    }

    const key: string = `${folder.replace(/\/$/, '')}/${encodeURIComponent(safeFileName)}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    console.log(command);

    await s3Client.send(command);

    const url = `${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(0, 8)}${BUCKET}.${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(8)}/${key}`;

    return {
      key,
      fileName: safeFileName,
      contentType,
      extension,
      folder,
      url,
    };
  }
  //#endregion

  //#region :- upload using buffer

  async uploadBufferFileToS3(
    folder: string,
    buffer: Buffer,
    fileName: string,
  ): Promise<{
    key: string;
    fileName: string;
    contentType: string;
    extension: string;
    folder: string;
    url: string;
  }> {
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer missing');
    }

    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error('Unable to detect file type');
    }
    const { ext: extension, mime: contentType } = fileType;

    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      throw new Error(`File type not allowed: ${contentType}`);
    }

    const safeFileName = fileName.endsWith(`.${extension}`)
      ? fileName
      : `${fileName}.${extension}`;

    const key = `${folder.replace(/\/$/, '')}/${encodeURIComponent(safeFileName)}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      }),
    );

    const url = `${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(0, 8)}${BUCKET}.${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(8)}/${key}`;

    return {
      key,
      fileName: safeFileName,
      contentType,
      extension,
      folder,
      url,
    };
  }

  //#endregion

  //#region :- list files in any specific folder
  async listFilesInFolder(folder: string) {
    const files: fiesListType[] = [];
    let continuationToken: any;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: folder.replace(/\/$/, '') + '/',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      response.Contents?.forEach((item) => {
        if (!item.Key || item.Key.endsWith('/')) return;

        const fileName = item.Key.split('/').pop();
        const extension = path.extname(fileName!).replace('.', '');
        const url = `${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(0, 8)}${BUCKET}.${process.env.DIGITAL_OCEAN_SPACES_END_POINT!.slice(8)}/${encodeURIComponent(item.Key)}`;

        files.push({
          key: item.Key,
          fileName,
          url,
          extension,
          sizeBytes: item.Size,
          sizeKB: item.Size ? (item.Size / 1024).toFixed(2) : null,
          sizeMB: item.Size ? (item.Size / (1024 * 1024)).toFixed(2) : null,
          lastModified: item.LastModified,
        });
      });

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    if (!files?.length) {
      return 'No folder / files found';
    }

    return {
      folder,
      totalFiles: files.length,
      files,
    };
  }
  //#region :- extract key from AWS URL
  private extractKeyFromUrl(fileUrl: string): string {
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    const url = new URL(fileUrl);

    // Example:
    // https://begindaily-dev.s3.ap-south-1.amazonaws.com/appointments/notification-setting.png
    // pathname = "/appointments/notification-setting.png"

    return decodeURIComponent(url.pathname.substring(1));
  }
  //#endregion

  //#region :- delete file by url
  async deleteFileByUrl(fileUrl: string): Promise<void> {
    let key: string;

    // Check if it's a full URL (starts with http)
    if (fileUrl.startsWith('http')) {
      try {
        key = this.extractKeyFromUrl(fileUrl);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Fallback: If extraction fails, try to use the pathname as a last resort
        const url = new URL(fileUrl);
        key = url.pathname.startsWith('/')
          ? url.pathname.substring(1)
          : url.pathname;
      }
    } else {
      // If it's not a URL, it's already a relative path/key
      // Just ensure there is no leading slash
      key = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    }

    // Debug log to see exactly what we are sending to S3
    console.log(`Attempting to delete S3 object with key: ${key}`);

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  }
  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    // This link will work for 1 hour (3600 seconds)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }
  //#endregion
}
