import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import { createWriteStream } from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { GeneratedCodeFile } from '../dto/figma-to-code.dto';

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);
  private readonly tempDir: string;
  private readonly downloadDir: string;

  constructor(private configService: ConfigService) {
    this.tempDir = path.join(process.cwd(), 'temp', 'figma-to-code');
    this.downloadDir = path.join(process.cwd(), 'downloads');
    this.initializeDirectories();
  }

  private async initializeDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.downloadDir, { recursive: true });
      this.logger.log('File manager directories initialized');
    } catch (error) {
      this.logger.error('Failed to initialize directories', error);
    }
  }

  /**
   * Create a zip file from generated code files
   */
  async createDownloadPackage(
    files: GeneratedCodeFile[],
    componentName: string
  ): Promise<{
    downloadUrl: string;
    zipPath: string;
    expiresAt: Date;
  }> {
    try {
      const sessionId = uuidv4();
      const zipFilename = `${componentName}-${sessionId}.zip`;
      const zipPath = path.join(this.downloadDir, zipFilename);

      // Create temporary directory for this session
      const sessionDir = path.join(this.tempDir, sessionId);
      await fs.mkdir(sessionDir, { recursive: true });

      // Write files to temporary directory
      for (const file of files) {
        const filePath = path.join(sessionDir, file.filename);
        await fs.writeFile(filePath, file.content, 'utf8');
      }

      // Create README.md with instructions
      const readmeContent = this.generateReadmeContent(componentName, files);
      await fs.writeFile(path.join(sessionDir, 'README.md'), readmeContent, 'utf8');

      // Create zip file
      await this.createZipFromDirectory(sessionDir, zipPath);

      // Clean up temporary directory
      await this.cleanupDirectory(sessionDir);

      // Set expiration time (24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Must match FigmaToCodeController base path: 'api/images/figma-to-code'
      const downloadUrl = `/api/images/figma-to-code/download/${zipFilename}`;

      this.logger.log(`Created download package: ${zipFilename}`);

      return {
        downloadUrl,
        zipPath,
        expiresAt
      };

    } catch (error) {
      this.logger.error('Error creating download package', error);
      throw new BadRequestException('Failed to create download package');
    }
  }

  /**
   * Create zip file from directory
   */
  private async createZipFromDirectory(sourceDir: string, zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`Zip file created: ${archive.pointer()} total bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        this.logger.error('Archiver error', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Generate README.md content for the package
   */
  private generateReadmeContent(componentName: string, files: GeneratedCodeFile[]): string {
    const fileList = files.map(file => `- **${file.filename}** (${file.type}): ${file.description}`).join('\n');

    return `# ${componentName} - Generated from Figma

This package contains auto-generated code from Figma design data using AI-powered conversion.

## 📁 Files Included

${fileList}

## 🚀 Quick Start

### For HTML/CSS Components:
1. Extract all files to your project directory
2. Include the CSS file in your HTML head section
3. Copy the HTML structure to your desired location
4. Customize as needed for your specific use case

### For React Components:
1. Install required dependencies: \`npm install react\`
2. Copy component files to your \`src/components\` directory
3. Import and use the component in your application
4. Adjust props and styling as needed

### For Vue Components:
1. Install Vue.js: \`npm install vue\`
2. Copy component files to your \`src/components\` directory
3. Register and use the component in your Vue application
4. Customize props and events as needed

## 🎨 Customization

The generated code is designed to be:
- **Pixel-perfect** to the original Figma design
- **Responsive** and mobile-friendly
- **Accessible** following WCAG guidelines
- **Maintainable** with clean, semantic code

Feel free to modify colors, spacing, and functionality to match your project requirements.

## 🐛 Issues & Support

If you encounter any issues with the generated code:
1. Check browser compatibility requirements
2. Ensure all dependencies are installed
3. Verify CSS framework compatibility
4. Review component integration steps

## 📄 License

Generated code is provided as-is for your project use. No attribution required.

---

*Generated on: ${new Date().toISOString()}*
*Component: ${componentName}*
*Powered by Figma-to-Code AI*
`;
  }

  /**
   * Clean up temporary directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to cleanup directory: ${dirPath}`, error);
    }
  }

  /**
   * Get file path for download
   */
  getDownloadFilePath(filename: string): string {
    return path.join(this.downloadDir, filename);
  }

  /**
   * Check if download file exists
   */
  async downloadFileExists(filename: string): Promise<boolean> {
    try {
      const filePath = this.getDownloadFilePath(filename);
      console.log('filePath', filePath);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired download files (run periodically)
   */
  async cleanupExpiredFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.downloadDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.downloadDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          this.logger.log(`Cleaned up expired file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired files', error);
    }
  }

  /**
   * Validate file content before writing
   */
  private validateFileContent(content: string, fileType: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    // Basic validation for different file types
    switch (fileType) {
      case 'html':
        return content.includes('<') && content.includes('>');
      case 'css':
        return content.includes('{') && content.includes('}');
      case 'js':
      case 'jsx':
      case 'ts':
        return content.length > 0; // Basic check for JS files
      default:
        return true;
    }
  }
}
