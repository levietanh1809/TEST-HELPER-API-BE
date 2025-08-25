import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ImagesController } from './images.controller';
import { ImagesService } from './services/images.service';
import { FigmaService } from './services/figma.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import configuration from '../config/configuration';

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: ImagesService;

  const mockImagesService = {
    getImagesFromSheet: jest.fn(),
    getImagesByComponentIds: jest.fn(),
    validateServices: jest.fn(),
    getAvailableComponents: jest.fn(),
    previewSheetData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      controllers: [ImagesController],
      providers: [
        {
          provide: ImagesService,
          useValue: mockImagesService,
        },
        {
          provide: FigmaService,
          useValue: {},
        },
        {
          provide: GoogleSheetsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImagesFromSheet', () => {
    it('should return images from sheet', async () => {
      const mockResult = {
        success: true,
        data: [],
        totalCount: 0,
      };

      mockImagesService.getImagesFromSheet.mockResolvedValue(mockResult);

      const result = await controller.getImagesFromSheet({});
      
      expect(result).toEqual(mockResult);
      expect(service.getImagesFromSheet).toHaveBeenCalledWith({});
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const mockServiceStatus = {
        figma: true,
        googleSheets: true,
      };

      mockImagesService.validateServices.mockResolvedValue(mockServiceStatus);

      const result = await controller.healthCheck();
      
      expect(result.status).toBe('ok');
      expect(result.services).toEqual(mockServiceStatus);
      expect(result.healthy).toBe(true);
    });
  });
});
