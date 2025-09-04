import { IsString, IsNotEmpty, IsOptional, IsUrl, IsArray, IsObject, IsNumber } from 'class-validator';

export class FigmaImageDto {
  @IsString()
  @IsNotEmpty()
  componentId: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  @IsObject()
  figmaResponse?: any; // Raw Figma API response as-is
}

export class GetImagesQueryDto {
  @IsString()
  @IsNotEmpty()
  googleSheetId: string;

  @IsOptional()
  @IsString()
  sheetRange?: string;

  @IsString()
  @IsNotEmpty()
  figmaFileId: string;

  @IsString()
  @IsNotEmpty()
  figmaAccessToken: string;

  @IsOptional()
  @IsArray()
  specificNodeId?: string[];

  @IsOptional()
  @IsString()
  format?: 'png' | 'jpg' | 'svg' | 'pdf';

  @IsOptional()
  @IsString()
  scale?: '1' | '2' | '4';

  // Optional size thresholds (default 500 if not provided)
  @IsOptional()
  @IsNumber()
  minWidth?: number;

  @IsOptional()
  @IsNumber()
  minHeight?: number;
}

export class GetImagesByIdsDto {
  @IsArray()
  @IsNotEmpty()
  componentIds: string[];

  @IsString()
  @IsNotEmpty()
  figmaFileId: string;

  @IsString()
  @IsNotEmpty()
  figmaAccessToken: string;

  @IsOptional()
  @IsString()
  format?: 'png' | 'jpg' | 'svg' | 'pdf';

  @IsOptional()
  @IsString()
  scale?: '1' | '2' | '4';

  // Optional size thresholds (default 500 if not provided)
  @IsOptional()
  @IsNumber()
  minWidth?: number;

  @IsOptional()
  @IsNumber()
  minHeight?: number;
}

export class GetImagesResponseDto {
  success: boolean;
  data: FigmaImageDto[];
  message?: string;
  totalCount: number;
}
