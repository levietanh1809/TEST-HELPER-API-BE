/**
 * Test script for Test Case Export API
 * This script tests the markdown export functionality
 */

const testCasesData = {
  "testCases": [
    {
      "id": "TC-UI-001",
      "title": "Popup container visual properties",
      "description": "Verify popup (login modal) visual properties match Figma spec: size, corner radius, stroke, background color and drop shadow.",
      "category": "visual",
      "priority": "high",
      "preconditions": [
        "Design canvas / login popup is rendered in the application under test."
      ],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Inspect DOM/CSS of popup container element.",
          "expectedBehavior": "Popup element exists and its bounding box width=424px and height=424px (absoluteBoundingBox.width=424, height=424).",
          "testData": null,
          "uiInteraction": null
        },
        {
          "stepNumber": 2,
          "action": "Verify corner radius, stroke and background color CSS values.",
          "expectedBehavior": "corner-radius = 16px; stroke/ border width = 2px; background-color = #FFFFFF (rgb(255,255,255)); border color rgba(0,0,0,0.25) or equivalent (Figma stroke opacity 0.25).",
          "testData": null,
          "uiInteraction": null
        },
        {
          "stepNumber": 3,
          "action": "Verify drop shadow effect of popup.",
          "expectedBehavior": "Drop shadow exists with offset x=-6px, y=6px, blur/radius=4px and color rgba(0,0,0,0.25) (Figma effect values).",
          "testData": null,
          "uiInteraction": null
        }
      ],
      "finalExpectedResult": "Popup container visually matches Figma: size 424x424px, corner-radius 16px, border 2px with rgba(0,0,0,0.25) and drop shadow offset (-6,6) radius 4.",
      "tags": [
        "popup",
        "figmaId:183124:126277",
        "visual-fidelity"
      ],
      "type": "positive",
      "expectedResult": "Drop shadow exists with offset x=-6px, y=6px, blur/radius=4px and color rgba(0,0,0,0.25) (Figma effect values)."
    },
    {
      "id": "TC-UI-002",
      "title": "Logo image presence and size",
      "description": "Verify logo image instance is present inside popup and its rendered size matches Figma absoluteBoundingBox.",
      "category": "visual",
      "priority": "medium",
      "preconditions": [
        "Login popup is visible."
      ],
      "steps": [
        {
          "stepNumber": 1,
          "action": "Locate the logo image element inside popup and read its rendered width/height.",
          "expectedBehavior": "Logo element exists and width equals 221.1663055419922px (~221.166px) and height equals 80px (absoluteBoundingBox.width=221.1663055419922, height=80).",
          "testData": null,
          "uiInteraction": null
        }
      ],
      "finalExpectedResult": "Logo image is present and sized at approximately 221.166px x 80px and uses an IMAGE fill as specified in Figma.",
      "tags": [
        "logo",
        "figmaId:I183124:126278;182357:174877",
        "visual-fidelity"
      ],
      "type": "positive"
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

console.log('Test Case Export API Test');
console.log('========================');
console.log('Request payload:');
console.log(JSON.stringify(testRequest, null, 2));
console.log('\nExpected markdown output format:');
console.log(`
# Test Cases - Candidate UI Common

# Test Cases - Visual Tests

| # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output |
|----|-------|-------------|---------------|----------------|------------------------|
| 1 | TC-UI-001 | Popup container visual properties | Design canvas / login popup is rendered in the application under test. | | Popup container visually matches Figma: size 424x424px, corner-radius 16px, border 2px with rgba(0,0,0,0.25) and drop shadow offset (-6,6) radius 4. |
| | | | | Step 1: Inspect DOM/CSS of popup container element. | Popup element exists and its bounding box width=424px and height=424px (absoluteBoundingBox.width=424, height=424). |
| | | | | Step 2: Verify corner radius, stroke and background color CSS values. | corner-radius = 16px; stroke/ border width = 2px; background-color = #FFFFFF (rgb(255,255,255)); border color rgba(0,0,0,0.25) or equivalent (Figma stroke opacity 0.25). |
| | | | | Step 3: Verify drop shadow effect of popup. | Drop shadow exists with offset x=-6px, y=6px, blur/radius=4px and color rgba(0,0,0,0.25) (Figma effect values). |
| 2 | TC-UI-002 | Logo image presence and size | Login popup is visible. | | Logo image is present and sized at approximately 221.166px x 80px and uses an IMAGE fill as specified in Figma. |
| | | | | Step 1: Locate the logo image element inside popup and read its rendered width/height. | Logo element exists and width equals 221.1663055419922px (~221.166px) and height equals 80px (absoluteBoundingBox.width=221.1663055419922, height=80). |

`);

console.log('\nAPI Endpoint: POST /api/images/test-case-export/markdown');
console.log('Health Check: POST /api/images/test-case-export/health');
