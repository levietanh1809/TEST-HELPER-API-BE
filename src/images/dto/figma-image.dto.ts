import { IsString, IsNotEmpty, IsOptional, IsUrl, IsArray } from 'class-validator';

export class FigmaImageDto {
  @IsString()
  @IsNotEmpty()
  componentId: string;

  @IsString()
  @IsNotEmpty()
  componentName: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  scale?: string;
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
  @IsString()
  format?: 'png' | 'jpg' | 'svg' | 'pdf';

  @IsOptional()
  @IsString()
  scale?: '1' | '2' | '4';
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
}

export class GetImagesResponseDto {
  success: boolean;
  data: FigmaImageDto[];
  message?: string;
  totalCount: number;
}
