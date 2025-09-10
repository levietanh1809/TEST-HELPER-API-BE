import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImagesController } from './images.controller';
import { FigmaToCodeController } from './figma-to-code.controller';
import { TestCaseGenerationController } from './test-case-generation.controller';
import { SrsToMarkdownController } from './srs-to-markdown.controller';
import { ImagesService } from './services/images.service';
import { FigmaService } from './services/figma.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { OpenAIService } from './services/openai.service';
import { FileManagerService } from './services/file-manager.service';
import { FigmaToCodeService } from './services/figma-to-code.service';
import { TestCaseGenerationService } from './services/test-case-generation.service';
import { SrsToMarkdownService } from './services/srs-to-markdown.service';
import { PromptService } from './services/prompt.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImagesController, FigmaToCodeController, TestCaseGenerationController, SrsToMarkdownController],
  providers: [
    ImagesService,
    FigmaService,
    GoogleSheetsService,
    OpenAIService,
    FileManagerService,
    FigmaToCodeService,
    TestCaseGenerationService,
    SrsToMarkdownService,
    PromptService,
  ],
  exports: [
    ImagesService,
    FigmaService,
    GoogleSheetsService,
    OpenAIService,
    FileManagerService,
    FigmaToCodeService,
    TestCaseGenerationService,
    SrsToMarkdownService,
  ],
})
export class ImagesModule {}
