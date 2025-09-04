import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImagesController } from './images.controller';
import { FigmaToCodeController } from './figma-to-code.controller';
import { ImagesService } from './services/images.service';
import { FigmaService } from './services/figma.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { OpenAIService } from './services/openai.service';
import { FileManagerService } from './services/file-manager.service';
import { FigmaToCodeService } from './services/figma-to-code.service';
import { PromptService } from './services/prompt.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImagesController, FigmaToCodeController],
  providers: [
    ImagesService,
    FigmaService,
    GoogleSheetsService,
    OpenAIService,
    FileManagerService,
    FigmaToCodeService,
    PromptService,
  ],
  exports: [
    ImagesService,
    FigmaService,
    GoogleSheetsService,
    OpenAIService,
    FileManagerService,
    FigmaToCodeService,
  ],
})
export class ImagesModule {}
