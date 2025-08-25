import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImagesController } from './images.controller';
import { ImagesService } from './services/images.service';
import { FigmaService } from './services/figma.service';
import { GoogleSheetsService } from './services/google-sheets.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImagesController],
  providers: [ImagesService, FigmaService, GoogleSheetsService],
  exports: [ImagesService, FigmaService, GoogleSheetsService],
})
export class ImagesModule {}
