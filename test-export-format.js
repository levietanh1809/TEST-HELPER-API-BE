/**
 * Test script for corrected Test Case Export API format
 * This script tests the new markdown export format with parent-child rows
 */

const testCasesData = {
  "testCases": [
    {
      "id": "UI-001",
      "title": "Popup container visual properties",
      "description": "Verify the main popup frame matches Figma visual specifications (size, background, stroke, corner radius, padding).",
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
        "visual-fidelity",
        "figma:183124:126277"
      ]
    }
  ]
};

// Test request payload
const testRequest = {
  testCases: testCasesData.testCases,
  format: 'markdown',
  projectName: 'Candidate UI Common',
  groupingStrategy: 'category',
  includeSteps: true,
  language: 'en'
};

console.log('Test Case Export API - Corrected Format Test');
console.log('============================================');
console.log('Request payload:');
console.log(JSON.stringify(testRequest, null, 2));
console.log('\nExpected markdown output format:');
console.log(`
# Test Cases - Candidate UI Common

# Test Cases - Visual Tests

| # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output |
|----|-------|-------------|---------------|----------------|------------------------|
| 1 | UI-001 | Popup container visual properties | Design loaded in browser so the popup is visible. | | |
| | | | | Step 1: Inspect DOM/CSS properties for the popup container. | Popup element has width=424px and height=424px (absoluteBoundingBox). Background-color = #FFFFFF. Stroke present with color=#000000 and opacity=0.25. corner-radius = 16px. Padding left=32px, right=32px, top=32px, bottom=32px. Layout mode = vertical; item spacing = 32px. |

`);

console.log('\nKey Changes Made:');
console.log('- Parent row: Contains test case ID, title, description, preconditions (NO expected result)');
console.log('- Child rows: Empty # and ReqID columns, Step/Procedure shows "Step X: action", Expected Result shows step expectedBehavior');
console.log('- Multiple steps create multiple child rows under same parent');
console.log('- Proper markdown table formatting with empty cells for child rows');
console.log('- Clean content: No figmaId references in descriptions or expected results');

console.log('\nAPI Endpoint: POST /api/images/test-case-export/markdown');
console.log('Health Check: POST /api/images/test-case-export/health');
