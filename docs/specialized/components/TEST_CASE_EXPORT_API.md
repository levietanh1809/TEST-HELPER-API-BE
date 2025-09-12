# Test Case Export API Documentation

## Overview

The Test Case Export API provides functionality to export test cases to various formats, starting with Markdown table format. This API allows you to convert test case data into structured, readable formats suitable for documentation and sharing.

## Features

- **Markdown Export**: Convert test cases to markdown table format
- **Excel Template Fill**: Fill existing Excel template (sheet `Test Cases`) from row 17, preserving styles (exceljs)
- **Grouping Support**: Group test cases by category, priority, or no grouping
- **Flexible Formatting**: Customizable output with project names and step details
- **Multiple Languages**: Support for different output languages
- **Health Monitoring**: Built-in health check endpoints

## API Endpoints

### 1. Export to Markdown

**POST** `/api/images/test-case-export/markdown`

Converts test cases to markdown table format.

### 2. Export to Excel

**POST** `/api/images/test-case-export/excel`

Converts test cases to Excel format using a provided template. Fills sheet `Test Cases` from row 17, preserves styles, merges ReqID/Description/Pre-Condition per parent-child grouping, single worksheet.

#### Request Body

```json
{
  "testCases": [
    {
      "id": "TC-UI-001",
      "title": "Popup container visual properties",
      "description": "Verify popup visual properties match Figma spec",
      "category": "visual",
      "priority": "high",
      "preconditions": ["Design canvas is rendered"],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Inspect DOM/CSS of popup container element",
          "expectedBehavior": "Popup element exists with correct dimensions"
        }
      ],
      "finalExpectedResult": "Popup container visually matches Figma specifications"
    }
  ],
  "format": "excel",
  "projectName": "Candidate UI Common",
  "groupingStrategy": "category",
  "includeSteps": true,
  "language": "en"
}
```

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `testCases` | Array | Yes | - | Array of test case objects |
| `format` | String | No | "markdown" | Export format (markdown, excel, pdf) |
| `projectName` | String | No | - | Project name for grouping |
| `groupingStrategy` | String | No | "category" | Grouping strategy (category, priority, none) |
| `includeSteps` | Boolean | No | true | Include detailed steps in export |
| `language` | String | No | "en" | Output language |

#### Response

```json
{
  "success": true,
  "data": {
    "content": "# Test Cases - Candidate UI Common\n\n# Test Cases - Visual Tests\n\n| # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output |\n|----|-------|-------------|---------------|----------------|------------------------|\n| 1 | TC-UI-001 | Popup container visual properties | Design canvas is rendered | Inspect DOM/CSS of popup container element | Popup container visually matches Figma specifications |",
    "format": "markdown",
    "totalTestCases": 1,
    "exportedAt": "2025-09-12T03:11:55.897Z",
    "projectName": "Candidate UI Common"
  },
  "processingTime": 45
}
```

### 3. Health Check

**POST** `/api/images/test-case-export/health`

Check the health status of the export service.

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "TestCaseExportService",
    "timestamp": "2025-09-12T03:11:55.897Z",
    "features": ["markdown-export", "grouping", "table-format"]
  }
}
```

## Output Format

### Markdown Table Structure

The exported markdown follows this structure with parent-child rows:

```markdown
# Test Cases - [Project Name]

# Test Cases - [Group Name]

| # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output |
|----|-------|-------------|---------------|----------------|------------------------|
| 1 | TC-UI-001 | Test case title | Precondition text | | |
| | | | | Step 1: First action | Step 1 expected result |
| | | | | Step 2: Second action | Step 2 expected result |
| 2 | TC-UI-002 | Another test case | Another precondition | | |
| | | | | Step 1: Action for second test | Step expected result |
```

**Format Details:**
- **Parent rows**: Contain test case ID, title, description, preconditions (NO expected result)
- **Child rows**: Empty # and ReqID columns, Step/Procedure shows "Step X: action", Expected Result shows step-specific expected behavior
- **Multiple steps**: Each step creates a separate child row under the same parent test case
- **Clean content**: Test case descriptions and expected results do not include figmaId references for better readability

### Excel Format Structure

The Excel export provides enhanced formatting and organization:

```excel
📊 Excel File Features:
├── Single Worksheet: All test cases in one sheet
│   ├── Header Row: Styled with bold text and background color
│   ├── Parent Rows: Test case info with merged cells
│   │   └── Merged Cells: #, ReqID, Description, Pre-Condition span down to child rows
│   ├── Child Rows: Individual steps with expected results
│   ├── Column Optimization: Appropriate widths for readability
│   └── Base64 Encoding: Ready for file download
```

**Excel Features:**
- **Single Worksheet**: All test cases in one organized sheet
- **Merged Cells**: Parent row cells (#, ReqID, Description, Pre-Condition) span down to child rows
- **Professional Styling**: Headers with bold text and background color
- **Parent Row Styling**: Bold text, light gray background, borders for merged cells
- **Column Optimization**: Appropriate widths for each column type
- **Base64 Content**: Ready for direct file download
- **Parent-Child Format**: Same structure as markdown export with visual merging
- **Clean Content**: No figmaId references in descriptions

### Grouping Strategies

1. **Category Grouping**: Groups test cases by their category (visual, functional, etc.)
2. **Priority Grouping**: Groups test cases by priority (high, medium, low)
3. **No Grouping**: All test cases in a single table

## Test Case Data Structure

Each test case should include:

```typescript
interface TestCase {
  id: string;                    // Unique identifier
  title: string;                 // Test case title
  description?: string;          // Detailed description
  category?: string;             // Test category
  priority?: string;             // Test priority
  preconditions?: string[];      // Preconditions array
  steps?: TestStep[];            // Test steps array
  finalExpectedResult?: string;  // Final expected result
  expectedResult?: string;       // Alternative expected result
  tags?: string[];              // Tags array
  type?: string;                // Test type
}

interface TestStep {
  stepNumber: number;            // Step number
  action: string;                // Action to perform
  expectedBehavior?: string;     // Expected behavior
  expected?: string;             // Alternative expected result
  testData?: string;             // Test data
  uiInteraction?: any;           // UI interaction details
}
```

## Usage Examples

### Basic Export

```bash
curl -X POST http://localhost:3000/api/images/test-case-export/markdown \
  -H "Content-Type: application/json" \
  -d '{
    "testCases": [...],
    "projectName": "My Project"
  }'
```

### Advanced Export with Grouping

```bash
curl -X POST http://localhost:3000/api/images/test-case-export/markdown \
  -H "Content-Type: application/json" \
  -d '{
    "testCases": [...],
    "projectName": "HR UI Common",
    "groupingStrategy": "category",
    "includeSteps": true,
    "language": "en"
  }'
```

## Error Handling

The API returns appropriate error messages for:

- Missing or invalid test cases array
- Empty test cases array
- Invalid grouping strategy
- Missing required fields in test cases
- Service errors

Example error response:

```json
{
  "success": false,
  "message": "Test cases array is required",
  "processingTime": 0
}
```

## Integration

This API integrates with:

- Test Case Generation API (input source)
- File Manager Service (future file operations)
- Google Sheets Service (future Excel export)

## Future Enhancements

- Excel export functionality
- PDF export capability
- Custom template support
- Batch export operations
- Export scheduling
- Integration with external documentation tools
