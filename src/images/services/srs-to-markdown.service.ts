import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PromptService, SrsToMarkdownPromptOptions } from './prompt.service';
import { OpenAIService } from './openai.service';
import {
  SrsToMarkdownRequestDto,
  SrsToMarkdownResponseDto,
  SrsToMarkdownHealthResponseDto
} from '../dto/srs-to-markdown.dto';
import { OpenAIModel } from '../dto/figma-to-code.dto';

@Injectable()
export class SrsToMarkdownService {
  private readonly logger = new Logger(SrsToMarkdownService.name);

  constructor(
    private readonly promptService: PromptService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Convert SRS text to formatted markdown
   */
  async convertSrsToMarkdown(request: SrsToMarkdownRequestDto): Promise<SrsToMarkdownResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting SRS to Markdown conversion');

      // Validate request
      this.validateRequest(request);

      // Prepare prompt options
      const promptOptions: SrsToMarkdownPromptOptions = {
        srsText: request.srsText,
        preserveFormatting: request.preserveFormatting ?? true,
        outputFormat: request.outputFormat ?? 'markdown',
        projectName: request.projectName,
        formattingPreferences: request.formattingPreferences
      };

      this.logger.log(`Converting SRS text (${request.srsText.length} chars) to ${request.outputFormat} format`);

      // Generate prompts using PromptService
      const { system, user } = this.promptService.getSrsToMarkdownPrompt(promptOptions);

      // Log prompt previews for debugging
      this.logPromptPreview(system, user);

      // Call OpenAI API for markdown generation
      const { content, usage, modelUsed } = await this.openaiService.generateMarkdown(
        system,
        user,
        request.model || OpenAIModel.GPT_5_MINI
      );

      // Process and validate the generated markdown
      const processedMarkdown = this.processMarkdownContent(content, request.outputFormat);

      const processingTime = Date.now() - startTime;

      this.logger.log(`SRS to Markdown conversion completed in ${processingTime}ms`);

      return {
        success: true,
        data: {
          markdownContent: processedMarkdown,
          originalLength: request.srsText.length,
          processedLength: processedMarkdown.length,
          model: modelUsed,
          generatedAt: new Date().toISOString(),
          outputFormat: request.outputFormat || 'markdown',
          projectName: request.projectName
        },
        message: `Successfully converted SRS text to ${request.outputFormat} format`,
        processingTime,
        openaiUsage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          cost: this.openaiService.calculateCostForModel(modelUsed, usage)
        }
      };

    } catch (error) {
      this.logger.error('Error in SRS to Markdown conversion', error);
      
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        message: `SRS to Markdown conversion failed: ${error.message}`,
        processingTime
      };
    }
  }

  /**
   * Get health status of SRS to Markdown service
   */
  async getHealthStatus(): Promise<SrsToMarkdownHealthResponseDto> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: {
        srsToMarkdown: true,
        preserveFormatting: true,
        multipleFormats: true,
        costOptimization: true
      }
    };
  }

  /**
   * Validate SRS to Markdown request
   */
  private validateRequest(request: SrsToMarkdownRequestDto): void {
    if (!request.srsText || request.srsText.trim().length === 0) {
      throw new BadRequestException('SRS text is required and cannot be empty');
    }

    if (request.srsText.length > 200000) {
      throw new BadRequestException('SRS text cannot exceed 200,000 characters');
    }

    // Validate output format
    const validFormats = ['markdown', 'html', 'plain'];
    if (request.outputFormat && !validFormats.includes(request.outputFormat)) {
      throw new BadRequestException(`Invalid output format. Must be one of: ${validFormats.join(', ')}`);
    }

    this.logger.log(`Validated SRS to Markdown request for ${request.srsText.length} characters`);
  }

  /**
   * Log prompt previews with safe truncation to avoid oversized logs
   */
  private logPromptPreview(systemPrompt: string, userPrompt: string): void {
    try {
      const limit = 2000; // characters
      const head = 1000;
      const tail = 1000;
      const truncHeadTail = (s: string) => {
        if (!s) return s;
        if (s.length <= limit) return s;
        const prefix = s.slice(0, head);
        const suffix = s.slice(-tail);
        return `${prefix}\n...[skipped ${(s.length - head - tail)} chars]...\n${suffix}`;
      };

      this.logger.log(`SRS to Markdown Prompt (system) length: ${systemPrompt?.length || 0}`);
      this.logger.log(`SRS to Markdown Prompt (user) length: ${userPrompt?.length || 0}`);
      this.logger.log('SRS to Markdown Prompt (system) preview:\n' + truncHeadTail(systemPrompt));
      this.logger.log('SRS to Markdown Prompt (user) preview:\n' + truncHeadTail(userPrompt));
    } catch (e) {
      this.logger.warn('Failed to log prompt preview');
    }
  }

  /**
   * Process and format the generated markdown content
   */
  private processMarkdownContent(content: string, outputFormat?: string): string {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Generated markdown content is empty');
    }

    let processedContent = content.trim();

    // Apply format-specific processing
    switch (outputFormat) {
      case 'html':
        processedContent = this.convertMarkdownToHtml(processedContent);
        break;
      case 'plain':
        processedContent = this.convertMarkdownToPlain(processedContent);
        break;
      case 'markdown':
      default:
        // Ensure proper markdown formatting
        processedContent = this.ensureMarkdownFormatting(processedContent);
        break;
    }

    return processedContent;
  }

  /**
   * Convert markdown to HTML format
   */
  private convertMarkdownToHtml(markdown: string): string {
    // Basic markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';

    // Fix list formatting
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    return html;
  }

  /**
   * Convert markdown to plain text format
   */
  private convertMarkdownToPlain(markdown: string): string {
    return markdown
      .replace(/^#+\s*/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/^- /gm, '• ') // Convert list items
      .replace(/^\d+\. /gm, '• ') // Convert numbered lists
      .replace(/\n\n+/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Ensure proper markdown formatting
   */
  private ensureMarkdownFormatting(markdown: string): string {
    // Clean up extra whitespace
    let formatted = markdown
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]+$/gm, '') // Remove trailing spaces
      .trim();

    // Ensure proper header formatting
    formatted = formatted.replace(/^(\w+.*)$/gm, (match, content) => {
      // If line doesn't start with #, -, *, or number, and is not empty, it might be a header
      if (content.length > 0 && !content.match(/^[#\-\*\d]/)) {
        // Check if it looks like a header (short line, no punctuation at end)
        if (content.length < 100 && !content.endsWith('.') && !content.endsWith(':')) {
          return `## ${content}`;
        }
      }
      return match;
    });

    return formatted;
  }

  /**
   * Get conversion statistics for monitoring
   */
  async getConversionStats(): Promise<{
    totalConversions: number;
    averageProcessingTime: number;
    mostUsedFormat: string;
    averageInputLength: number;
    averageOutputLength: number;
  }> {
    // This would typically come from a database
    // For now, return mock data for demonstration
    return {
      totalConversions: 0,
      averageProcessingTime: 0,
      mostUsedFormat: 'markdown',
      averageInputLength: 0,
      averageOutputLength: 0
    };
  }
}
