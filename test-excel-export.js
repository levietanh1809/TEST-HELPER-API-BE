/**
 * Test script for Excel Export API
 * This script tests the Excel export functionality
 */

const testCasesData = {
  "testCases": [
    {
      "id": "UI-001",
      "title": "Popup container visual properties",
      "description": "Verify the main popup frame matches design specifications (size, background, stroke, corner radius, padding).",
      "category": "visual",
      "priority": "high",
      "type": "positive",
      "preconditions": [
        "Design loaded in browser so the popup is visible."
      ],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Inspect DOM/CSS properties for the popup container.",
          "expectedBehavior": "Popup element has width=424px and height=424px (absoluteBoundingBox). Background-color = #FFFFFF. Stroke present with color=#000000 and opacity=0.25. corner-radius = 16px. Padding left=32px, right=32px, top=32px, bottom=32px. Layout mode = vertical; item spacing = 32px.",
          "testData": null,
          "uiInteraction": null
        }
      ],
      "expectedResult": "Popup element has width=424px and height=424px (absoluteBoundingBox). Background-color = #FFFFFF. Stroke present with color=#000000 and opacity=0.25. corner-radius = 16px. Padding left=32px, right=32px, top=32px, bottom=32px. Layout mode = vertical; item spacing = 32px.",
      "tags": [
        "popup",
        "visual-fidelity"
      ]
    },
    {
      "id": "UI-002",
      "title": "Logo image presence and size",
      "description": "Verify logo image instance is present inside popup and its rendered size matches specifications.",
      "category": "visual",
      "priority": "medium",
      "preconditions": [
        "Login popup is visible."
      ],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Locate the logo image element inside popup and read its rendered width/height.",
          "expectedBehavior": "Logo element exists and width equals 221.166px and height equals 80px.",
          "testData": null,
          "uiInteraction": null
        }
      ],
      "expectedResult": "Logo image is present and sized at approximately 221.166px x 80px.",
      "tags": [
        "logo",
        "visual-fidelity"
      ]
    }
  ]
};

// Test request payload for Excel export
const testRequest = {
  testCases: testCasesData.testCases,
  format: 'excel',
  projectName: 'Candidate UI Common',
  groupingStrategy: 'category',
  includeSteps: true,
  language: 'en'
};

console.log('Test Case Excel Export API Test');
console.log('================================');
console.log('Request payload:');
console.log(JSON.stringify(testRequest, null, 2));
console.log('\nExpected Excel output features:');
console.log(`
📊 Excel File Structure:
├── Test Cases (Single Worksheet)
│   ├── Header Row: # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output
│   ├── Parent Row: 1 | UI-001 | Popup container visual properties | Design loaded in browser | | |
│   │   └── [MERGED CELLS: #, ReqID, Description, Pre-Condition span down to child rows]
│   ├── Child Row:   | | | | Step 1: Inspect DOM/CSS properties | Popup element has width=424px...
│   ├── Parent Row: 2 | UI-002 | Logo image presence and size | Login popup is visible | | |
│   │   └── [MERGED CELLS: #, ReqID, Description, Pre-Condition span down to child rows]
│   └── Child Row:   | | | | Step 1: Locate the logo image element | Logo element exists and width...
│
📋 Excel Features:
- Single worksheet with all test cases
- Parent-child row format with merged cells
- Merged cells: Parent row cells (#, ReqID, Description, Pre-Condition) span down to child rows
- Column width optimization
- Header styling (bold, background color)
- Parent row styling (bold, light gray background, borders)
- Clean content without figmaId references
- Base64 encoded content for download
`);

console.log('\nKey Features:');
console.log('- Single worksheet: All test cases in one sheet');
console.log('- Merged cells: Parent row cells span down to child rows');
console.log('- Parent-child format: Same structure as markdown export');
console.log('- Excel styling: Headers with bold text and background color');
console.log('- Parent row styling: Bold text, light gray background, borders');
console.log('- Column optimization: Appropriate widths for each column');
console.log('- Base64 encoding: Content ready for file download');
console.log('- Clean content: No figmaId references in descriptions');

console.log('\nAPI Endpoints:');
console.log('POST /api/images/test-case-export/excel - Excel export');
console.log('POST /api/images/test-case-export/markdown - Markdown export');
console.log('POST /api/images/test-case-export/health - Health check');
