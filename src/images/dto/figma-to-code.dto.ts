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
  // GPT-4o Series (Latest & Best)
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  
  // GPT-4.1 Series (Long Context) - NEW!
  GPT_4_1 = 'gpt-4.1',
  GPT_4_1_MINI = 'gpt-4.1-mini',
  
  // GPT-4 Series
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  
  // GPT-3.5 Series
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
  
  // Specialized Models
  GPT_4_VISION_PREVIEW = 'gpt-4-vision-preview',
  GPT_4O_REALTIME_PREVIEW = 'gpt-4o-realtime-preview'
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
  model?: OpenAIModel = OpenAIModel.GPT_4O;

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
