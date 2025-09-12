import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { Workbook } from 'exceljs';
import { TestCaseExportRequestDto, TestCaseExportResponseDto, MarkdownExportOptions } from '../dto/test-case-export.dto';

@Injectable()
export class ExcelExportService {
  private readonly logger = new Logger(ExcelExportService.name);

  /**
   * Export test cases to Excel format
   */
  async exportToExcel(request: TestCaseExportRequestDto): Promise<TestCaseExportResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting test case export to Excel');
      this.validateRequest(request);

      const options: MarkdownExportOptions = {
        projectName: request.projectName,
        groupingStrategy: request.groupingStrategy || 'category',
        includeSteps: request.includeSteps !== false,
        language: request.language || 'en'
      };

      const excelBuffer = await this.generateExcelBuffer(request.testCases, options);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          content: excelBuffer.toString('base64'),
          format: 'excel',
          totalTestCases: request.testCases.length,
          exportedAt: new Date().toISOString(),
          projectName: request.projectName
        },
        processingTime
      };

    } catch (error) {
      this.logger.error('Test case Excel export failed', error);
      return {
        success: false,
        message: `Excel export failed: ${error.message}`,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate Excel buffer from test cases
   */
  private async generateExcelBuffer(testCases: any[], options: MarkdownExportOptions): Promise<Buffer> {
    // Attempt to use existing template if available
    const templatePath = path.resolve(process.cwd(), 'template', 'Test_case_excel_template.xlsx');
    const startRow = 17; // 1-based Excel row number to start filling (row 17)

    try {
      if (fs.existsSync(templatePath)) {
        // Use exceljs to preserve styles when filling template
        const wb = new Workbook();
        await wb.xlsx.readFile(templatePath);
        const sheet = wb.worksheets.find(ws => ws.name === 'Test Cases') ?? wb.worksheets[0];

        const { matrix, merges } = this.buildExportMatrix(testCases, options);
        const rows = matrix.length > 0 ? matrix.slice(1) : matrix; // drop header

        // Directly write to template from startRow. Assumes template rows are safe (no conflicting formulas)

        // Clone styles from the row above the insertion if available
        const templateRowIndex = Math.max(1, startRow - 1);
        const templateRow = sheet.getRow(templateRowIndex);
        const hasTemplate = templateRow && templateRow.cellCount > 0;

        for (let i = 0; i < rows.length; i++) {
          const values = rows[i];
          const row = sheet.getRow(startRow + i);

          if (hasTemplate) {
            for (let c = 1; c <= values.length; c++) {
              const target = row.getCell(c);
              const src = templateRow.getCell(c);
              if ((src as any).style) {
                target.style = { ...(src as any).style } as any;
              }
              target.alignment = { ...(target.alignment || {}), wrapText: true, vertical: 'middle' };
            }
          }

          for (let c = 0; c < values.length; c++) {
            const colIndex = c + 1; // 1-based
            const target = row.getCell(colIndex);
            target.value = values[c] ?? null;
          }
          (row as any).commit?.();
        }

        // Apply merges for ReqID/Description/Pre-Condition (columns 2-4) using offset
        const rowOffset = (startRow - 1) - 1; // dropped header
        merges?.forEach(m => {
          if (m.s.c < 1 || m.s.c > 3) return; // restrict to columns B..D
          const startRowAbs = rowOffset + m.s.r + 1;
          const endRowAbs = rowOffset + m.e.r + 1;
          const colAbs = m.s.c + 1;
          sheet.mergeCells(startRowAbs, colAbs, endRowAbs, colAbs);
        });

        const buffer = await wb.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
    } catch (e) {
      this.logger.warn(`Template load failed, falling back to generated workbook. Reason: ${e?.message || e}`);
    }

    // Fallback: Create workbook if template not available
    const workbook = XLSX.utils.book_new();
    const worksheet = this.createWorksheet(testCases, 'Test Cases', options);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Create worksheet for all test cases
   */
  private createWorksheet(testCases: any[], sheetName: string, options: MarkdownExportOptions): XLSX.WorkSheet {
    const data: any[][] = [];

    // Add header row
    data.push(['#', 'ReqID', 'Description', 'Pre-Condition', 'Step/Procedure', 'Expected Result/Output']);

    // Continuous display index for the '#' column across all rows
    let displayIndex = 1;
    // Test case index used for fallback ReqID generation only
    let testCaseIndex = 1;
    const mergeRanges: any[] = [];

    testCases.forEach((testCase) => {
      const reqId = typeof testCase.id === 'string' && testCase.id.trim().length > 0
        ? testCase.id.trim()
        : (typeof testCase.reqId === 'string' && testCase.reqId.trim().length > 0
            ? testCase.reqId.trim()
            : `TC-${testCaseIndex}`);
      const description = testCase.title || testCase.description || '';
      const preCondition = this.formatPreConditions(testCase.preconditions);

      // Parent row - main test case info (no expected result)
      data.push([displayIndex, reqId, description, preCondition, '', '']);
      displayIndex++;

      const parentRowIndex = data.length - 1; // Current row index (0-based)
      let childRowCount = 0;

      // Child rows - individual steps
      if (testCase.steps && testCase.steps.length > 0) {
        testCase.steps.forEach((step: any, idx: number) => {
          const stepProcedure = this.formatStepProcedure(step);
          const stepExpectedResult = this.formatStepExpectedResult(step);
          // Skip adding empty step rows to avoid blank lines
          if (!stepProcedure && !stepExpectedResult) {
            return;
          }
          if (idx === 0) {
            // Place first step on the parent row to avoid a blank line under merged cells
            data[parentRowIndex][4] = stepProcedure;
            data[parentRowIndex][5] = stepExpectedResult;
            // Do not increment displayIndex here; parent row already consumed it
          } else {
            // For subsequent steps, use continuous numbering in the '#' column (no merge for '#')
            data.push([displayIndex, '', '', '', stepProcedure, stepExpectedResult]);
            displayIndex++;
            childRowCount++;
          }
        });
      }

      // If there are steps, create merge ranges for parent row cells
      if (testCase.steps && testCase.steps.length > 0) {
        // Merge cells for parent row: ReqID, Description, Pre-Condition (do NOT merge '#')
        // From parent row to last child row
        const lastChildRowIndex = parentRowIndex + childRowCount; // childRowCount is number of extra rows beyond the parent
        
        // Merge ReqID column (B)
        mergeRanges.push({
          s: { r: parentRowIndex, c: 1 }, // Start row, column B
          e: { r: lastChildRowIndex, c: 1 } // End row, column B
        });
        
        // Merge Description column (C)
        mergeRanges.push({
          s: { r: parentRowIndex, c: 2 }, // Start row, column C
          e: { r: lastChildRowIndex, c: 2 } // End row, column C
        });
        
        // Merge Pre-Condition column (D)
        mergeRanges.push({
          s: { r: parentRowIndex, c: 3 }, // Start row, column D
          e: { r: lastChildRowIndex, c: 3 } // End row, column D
        });
      }

      testCaseIndex++;
    });

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 15 },  // ReqID
      { wch: 40 },  // Description
      { wch: 30 },  // Pre-Condition
      { wch: 50 },  // Step/Procedure
      { wch: 60 }   // Expected Result/Output
    ];
    worksheet['!cols'] = columnWidths;

    // Add merge ranges to worksheet
    if (mergeRanges.length > 0) {
      worksheet['!merges'] = mergeRanges;
    }

    // Add header styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E5E7EB' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // Add styling for merged cells (parent rows)
    this.addMergedCellStyling(worksheet, mergeRanges);

    return worksheet;
  }

  /**
   * Build export matrix and merge ranges without creating a new worksheet
   * Used for filling into existing templates at a specific start row
   */
  private buildExportMatrix(testCases: any[], options: MarkdownExportOptions): { matrix: any[][]; merges: any[] } {
    const matrix: any[][] = [];
    // Header row (consumer can choose to overwrite or not; we include for consistency)
    matrix.push(['#', 'ReqID', 'Description', 'Pre-Condition', 'Step/Procedure', 'Expected Result/Output']);

    let displayIndex = 1;
    let testCaseIndex = 1;
    const merges: any[] = [];

    testCases.forEach((testCase) => {
      const reqId = testCase.id || `TC-${testCaseIndex}`;
      const description = testCase.title || testCase.description || '';
      const preCondition = this.formatPreConditions(testCase.preconditions);

      // Parent row - placeholder for steps (first step will be set on this row)
      matrix.push([displayIndex, reqId, description, preCondition, '', '']);
      const parentRowIndex = matrix.length - 1; // 0-based within matrix
      displayIndex++;

      let childRowCount = 0;
      if (testCase.steps && testCase.steps.length > 0) {
        testCase.steps.forEach((step: any, idx: number) => {
          const stepProcedure = this.formatStepProcedure(step);
          const stepExpectedResult = this.formatStepExpectedResult(step);
          if (!stepProcedure && !stepExpectedResult) {
            return;
          }
          if (idx === 0) {
            matrix[parentRowIndex][4] = stepProcedure;
            matrix[parentRowIndex][5] = stepExpectedResult;
          } else {
            matrix.push([displayIndex, '', '', '', stepProcedure, stepExpectedResult]);
            displayIndex++;
            childRowCount++;
          }
        });
      }

      // Add merges for ReqID, Description, Pre-Condition columns spanning parent + child rows
      if (testCase.steps && testCase.steps.length > 0) {
        const lastChildRowIndex = parentRowIndex + childRowCount;
        // Column indexes: 1=ReqID, 2=Description, 3=Pre-Condition
        merges.push({ s: { r: parentRowIndex, c: 1 }, e: { r: lastChildRowIndex, c: 1 } });
        merges.push({ s: { r: parentRowIndex, c: 2 }, e: { r: lastChildRowIndex, c: 2 } });
        merges.push({ s: { r: parentRowIndex, c: 3 }, e: { r: lastChildRowIndex, c: 3 } });
      }

      testCaseIndex++;
    });

    return { matrix, merges };
  }

  /**
   * Write AOA matrix into an existing worksheet while preserving styles and sheet ref
   */
  private writeMatrixPreserveStyles(
    worksheet: XLSX.WorkSheet,
    matrix: any[][],
    startRowZeroBased: number,
    startColZeroBased: number
  ) {
    // Write values cell-by-cell to avoid clearing styles
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const value = row[c];
        const cellAddress = XLSX.utils.encode_cell({ r: startRowZeroBased + r, c: startColZeroBased + c });
        // Preserve existing style if any
        const existing = (worksheet as any)[cellAddress];
        const existingStyle = existing && existing.s ? existing.s : undefined;

        (worksheet as any)[cellAddress] = {
          v: value,
          t: 's',
          s: existingStyle
        } as any;
      }
    }

    // Update !ref to include the new cells
    const currentRef = worksheet['!ref'];
    const startCell = XLSX.utils.encode_cell({ r: startRowZeroBased, c: startColZeroBased });
    const endCell = XLSX.utils.encode_cell({ r: startRowZeroBased + Math.max(matrix.length - 1, 0), c: startColZeroBased + Math.max(matrix[0]?.length - 1 || 0, 0) });
    const newRef = `${startCell}:${endCell}`;
    if (!currentRef) {
      worksheet['!ref'] = newRef;
    } else {
      const cr = XLSX.utils.decode_range(currentRef);
      const nr = XLSX.utils.decode_range(newRef);
      const mergedRange = {
        s: { r: Math.min(cr.s.r, nr.s.r), c: Math.min(cr.s.c, nr.s.c) },
        e: { r: Math.max(cr.e.r, nr.e.r), c: Math.max(cr.e.c, nr.e.c) }
      };
      worksheet['!ref'] = XLSX.utils.encode_range(mergedRange);
    }
  }


  /**
   * Format preconditions for Excel
   */
  private formatPreConditions(preconditions: string[] | undefined): string {
    if (!preconditions || preconditions.length === 0) {
      return '';
    }
    return preconditions.join('\n');
  }

  /**
   * Format step procedure for Excel
   */
  private formatStepProcedure(step: any): string {
    const stepNumber = step.stepNumber || 1;
    const action = step.action || '';
    return `Step ${stepNumber}: ${action}`;
  }

  /**
   * Format expected result for individual step
   */
  private formatStepExpectedResult(step: any): string {
    if (step.expectedBehavior) {
      return step.expectedBehavior.replace(/\n/g, '\n');
    }
    
    if (step.expected) {
      return step.expected.replace(/\n/g, '\n');
    }

    return '';
  }


  /**
   * Add styling for merged cells (parent rows)
   */
  private addMergedCellStyling(worksheet: XLSX.WorkSheet, mergeRanges: any[]): void {
    mergeRanges.forEach(mergeRange => {
      // Style the first cell of each merged range (parent row)
      const startCell = XLSX.utils.encode_cell({ r: mergeRange.s.r, c: mergeRange.s.c });
      
      if (worksheet[startCell]) {
        worksheet[startCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F3F4F6' } }, // Light gray background for parent rows
          alignment: { 
            horizontal: 'center', 
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            right: { style: 'thin', color: { rgb: 'D1D5DB' } }
          }
        };
      }
    });
  }

  /**
   * Validate export request
   */
  private validateRequest(request: TestCaseExportRequestDto): void {
    if (!request.testCases || !Array.isArray(request.testCases)) {
      throw new Error('Test cases array is required');
    }

    if (request.testCases.length === 0) {
      throw new Error('At least one test case is required for export');
    }

    // Validate each test case has required fields
    request.testCases.forEach((testCase, index) => {
      if (!testCase.id && !testCase.title && !testCase.description) {
        throw new Error(`Test case at index ${index} must have at least id, title, or description`);
      }
    });

    this.logger.log(`Validated Excel export request for ${request.testCases.length} test cases`);
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    return {
      status: 'healthy',
      service: 'ExcelExportService',
      timestamp: new Date().toISOString(),
      features: ['excel-export', 'template-fill', 'parent-child-format', 'styling']
    };
  }
}
