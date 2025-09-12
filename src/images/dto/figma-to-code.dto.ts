import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';

export enum CodeFramework {
  VANILLA = 'vanilla',
  REACT = 'react',
  VUE = 'vue',
  ANGULAR = 'angular'
}

export enum CSSFramework {
  VANILLA = 'vanilla',
  TAILWIND = 'tailwind',
  BOOTSTRAP = 'bootstrap',
  STYLED_COMPONENTS = 'styled-components'
}

export enum OpenAIModel {
  // Primary Production Models Only
  GPT_5_MINI = 'gpt-5-mini',
  O4_MINI = 'o4-mini',
  GPT_5 = 'gpt-5'
}

export class FigmaToCodeRequestDto {
  @IsObject()
  @IsNotEmpty()
  figmaResponse: any; // Raw Figma node data

  @IsOptional()
  @IsEnum(CodeFramework)
  framework?: CodeFramework = CodeFramework.VANILLA;

  @IsOptional()
  @IsEnum(CSSFramework)
  cssFramework?: CSSFramework = CSSFramework.VANILLA;

  @IsOptional()
  @IsEnum(OpenAIModel)
  model?: OpenAIModel = OpenAIModel.GPT_5_MINI;

  @IsOptional()
  @IsString()
  componentName?: string;

  @IsOptional()
  @IsBoolean()
  includeResponsive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeInteractions?: boolean = false;

  @IsOptional()
  @IsString()
  additionalRequirements?: string;
}

export interface GeneratedCodeFile {
  filename: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'jsx' | 'vue' | 'ts';
  description: string;
}

export class FigmaToCodeResponseDto {
  success: boolean;
  
  data?: {
    files: GeneratedCodeFile[];
    componentName: string;
    framework: CodeFramework;
    cssFramework: CSSFramework;
    model: OpenAIModel;
    downloadUrl?: string; // For zip download
  };
  
  message?: string;
  processingTime?: number;
  
  // OpenAI usage statistics
  openaiUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
}

export class CreateDownloadPackageDto {
  @IsNotEmpty()
  files: GeneratedCodeFile[];

  @IsString()
  @IsNotEmpty()
  componentName: string;
}

export class CreateDownloadPackageResponseDto {
  success: boolean;
  data?: {
    downloadUrl: string;
  };
  message?: string;
}
