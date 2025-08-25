import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets;

  constructor(private configService: ConfigService) {
    this.initializeGoogleSheets();
  }

  private initializeGoogleSheets() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.configService.get<string>('googleSheets.serviceAccount.email'),
          private_key: this.configService.get<string>('googleSheets.serviceAccount.privateKey')?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets API', error);
      throw new BadRequestException('Google Sheets configuration error');
    }
  }

  async getComponentIds(sheetId: string, range?: string): Promise<string[]> {
    try {
      const sheetRange = range || this.configService.get<string>('googleSheets.range') || 'Sheet1!A:A';

      if (!sheetId) {
        throw new BadRequestException('Google Sheet ID is required');
      }

      this.logger.log(`Fetching component IDs from sheet: ${sheetId}, range: ${sheetRange}`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        this.logger.warn('No data found in the specified range');
        return [];
      }

      // Extract component IDs from the first column and filter out empty values
      const componentIds = rows
        .map(row => row[0])
        .filter(id => id && id.trim() !== '')
        .map(id => id.trim());

      this.logger.log(`Found ${componentIds.length} component IDs`);
      return componentIds;

    } catch (error) {
      this.logger.error('Error fetching data from Google Sheets', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch data from Google Sheets');
    }
  }

  async validateSheetAccess(sheetId: string): Promise<boolean> {
    try {
      if (!sheetId) {
        return false;
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      return !!response.data;
    } catch (error) {
      this.logger.error('Sheet access validation failed', error);
      return false;
    }
  }
}
