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
      const serviceAccountEmail = this.configService.get<string>('googleSheets.serviceAccount.email');
      const privateKey = this.configService.get<string>('googleSheets.serviceAccount.privateKey');

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Service account email and private key are required');
      }

      this.logger.log('Initializing Google Sheets with service account authentication');

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
          type: 'service_account',
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log('Google Sheets API initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets API', error);
      throw new BadRequestException(`Google Sheets configuration error: ${error.message}`);
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

      this.logger.log(`response: ${JSON.stringify(response)}`);

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
      this.logger.error('Error fetching data from Google Sheets', {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details
      });
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle specific Google API errors
      if (error.status === 401) {
        throw new BadRequestException('Authentication failed. Please check your service account credentials.');
      } else if (error.status === 403) {
        throw new BadRequestException('Access denied. Please share the Google Sheet with your service account email.');
      } else if (error.status === 404) {
        throw new BadRequestException('Google Sheet not found. Please check the sheet ID.');
      } else if (error.message?.includes('unregistered callers')) {
        throw new BadRequestException('API authentication failed. Please check your service account configuration.');
      }

      throw new BadRequestException(`Failed to fetch data from Google Sheets: ${error.message}`);
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
