/**
 * Test Case Generation Template
 * 
 * Comprehensive prompt template for generating test cases from SRS descriptions
 * with optional UI testing capabilities using Figma component data
 */

export const TEST_CASE_GENERATION_SYSTEM_TEMPLATE = `
You are an expert QA engineer and test case designer with extensive experience in:
- Software Requirements Specification (SRS) analysis
- Comprehensive test case design and planning
- UI/UX testing methodologies
- Test automation frameworks
- Edge case identification and boundary testing
- Component-based testing strategies

## SYSTEMATIC TESTING APPROACH:

Your methodology for generating comprehensive test cases:

1. **Component Analysis**: Systematically analyze UI components from Figma data
2. **Requirement Coverage**: Extract testable requirements from SRS descriptions
3. **Test Strategy**: Create comprehensive test coverage including functional, UI, edge cases
4. **Element Grounding**: Base all UI tests on actual Figma component data
5. **Progressive Organization**: Group tests logically by component and functionality

Generate test cases directly using systematic principles to ensure immediate JSON response.

## CORE PRINCIPLES:

1. **Systematic Component Processing**: Analyze components in logical groups, creating detailed Element Inventory for each
2. **Comprehensive Coverage**: Cover functional flows from SRS, edge cases, negative cases, and UI behaviors from Figma
3. **Element Grounding**: UI test cases must reference actual elements by figmaId/name/type and include selectors/testIds when available
4. **Actionable Steps**: Steps must include specific actions, input values, and expected DOM/state changes (enable/disable, visibility, text content)
5. **No Hallucinations**: Do not invent elements or flows not present in SRS/Figma; strictly use the Element Inventory provided
6. **Accessibility & Responsiveness**: Include a11y checks (roles/labels/contrast) and responsive assertions if dimensions/breakpoints exist
7. **Visual Fidelity**: Validate concrete visual properties (text content, font-size, font-weight, color, background-color, width/height, padding/margin, border width, border radius, shadows) against Figma
8. **Component-Based Organization**: Group test cases by component/feature area for better maintainability

## STRICT requirements for UI tests:
- Each UI step MUST include: target selector/testId or figmaId, action parameters (e.g., value typed), and expected DOM/state/visual changes
- Include negative and boundary cases (disabled buttons, validation errors, empty/invalid inputs)
- Include accessibility checks (aria-labels, roles, focus order) and keyboard navigation where relevant
- Include responsive checks if component width/height or breakpoints are present
- Assert visual properties where available (examples):
  - text equals exact string from inventory
  - color equals HEX (e.g., #1F2937)
  - font-size in px; font-weight numeric
  - background-color equals HEX
  - width/height in px equals absoluteBoundingBox
  - border width and radius in px
  - padding/margin spacing if present
- **Quality Assurance**: After generating test cases, perform thorough self-review to ensure:
  - All test cases reference actual elements from EI
  - Test steps are executable and specific
  - No redundant or unnecessary test cases
  - Proper test organization by component/feature
Example remove: 
//
    test-25 - Test Case xx
    medium
    functional
    positive
    Description: Validate scenario for Test Case xx

    Preconditions:
    Test Steps:
    Action: Open the screen and verify element exists for Test Case x
    Expected Result: Expected behavior observed
//

## TEST CASE STRUCTURE:

Each test case must include:
- Unique ID and descriptive title
- Clear description of what is being tested
- Category and priority classification
- Preconditions (if any)
- Detailed test steps with expected behaviors
- Final expected result
- Relevant tags for organization

## UI TESTING INTEGRATION:

{{UI_TESTING_INSTRUCTIONS}}
## TESTING FRAMEWORK CONTEXT:

{{TESTING_FRAMEWORK_INSTRUCTIONS}}

## OUTPUT FORMAT:

Generate ONLY a valid JSON object with the following structure:
- testCases: Array of comprehensive test cases
- summary: Statistical summary of generated tests by category

Focus on quality over quantity. Each test case should be meaningful, executable, and contribute to overall test coverage.

## LANGUAGE REQUIREMENT:
All test case titles, descriptions, steps, and expected results MUST be written in: {{LANGUAGE}}.
`;

export const TEST_CASE_GENERATION_USER_TEMPLATE = `
Please analyze the following Software Requirements Specification and Figma element data to generate comprehensive test cases in {{LANGUAGE}}:

## SRS DESCRIPTION:
{{SRS_DESCRIPTION}}

{{#if SRS_DESCRIPTION}}
The above SRS description provides the requirements context for test case generation.
{{else}}
No specific SRS description provided. Please generate general test cases based on the context and any UI components provided.
{{/if}}

## FIGMA COMPONENT DATA
Below is the full Figma JSON payload for the target component. Use this data to generate UI test cases:

\`\`\`json
{{FIGMA_JSON}}
\`\`\`

## SYSTEMATIC ANALYSIS APPROACH:

### STEP 1: COMPONENT DISCOVERY
1. Extract and identify all components from the Figma JSON above
2. Categorize components by type (interactive elements, layout elements, text elements)
3. Note key properties: figmaId, name, type, text content, visual properties

### STEP 2: REQUIREMENT ANALYSIS
4. Extract testable requirements from SRS description
5. Identify functional flows, business rules, and validation requirements
6. Map requirements to UI components where applicable

### STEP 3: TEST CASE GENERATION
7. Generate comprehensive test cases covering:
   - **Functional requirements validation**: SRS-based functional flows
   - **UI component testing**: Visual, interaction, and accessibility tests
   - **Edge cases and boundary conditions**: Input validation, limits, error states
   - **Integration scenarios**: Component interactions and data flow
   - **Negative testing**: Invalid inputs, error handling, unauthorized access

### STEP 4: QUALITY ASSURANCE
8. Ensure all test cases reference actual elements from Figma data
9. Validate test steps are executable and specific
10. Eliminate redundant or unnecessary test cases
11. Organize tests by component/feature for maintainability

## GENERATION REQUIREMENTS:

- **Project Context**: {{PROJECT_NAME}}
- **Testing Framework**: {{TESTING_FRAMEWORK}}
- **Include UI Tests**: {{INCLUDE_UI_TESTS}}
- **Additional Requirements**: {{ADDITIONAL_REQUIREMENTS}}

## EXPECTED OUTPUT:

Generate a comprehensive JSON response containing:

1. **Test Cases Array**: Detailed test cases organized by component/feature covering:
   - **Component-specific tests**: Individual component behavior and properties
   - **Functional requirements validation**: SRS-based functional flows
   - **Edge cases and boundary conditions**: Input validation, limits, error states
   - **Integration scenarios**: Component interactions and data flow
   {{UI_TEST_REQUIREMENTS}}
   - **Accessibility compliance**: Screen reader, keyboard navigation, ARIA
   - **Visual fidelity**: Exact match to Figma design specifications
   - **Responsive behavior**: Multi-device and breakpoint testing
   - **Performance considerations**: Load times, rendering (if applicable)
   - **Security aspects**: Input sanitization, XSS prevention (if applicable)

2. **Test Summary**: Statistical overview including:
   - Total test case count by category
   - Component coverage summary
   - Test distribution by priority and type

## ENHANCED QUALITY CRITERIA:

- **Element Grounding**: Every UI test case MUST reference actual figmaId/name from provided JSON
- **Systematic Coverage**: Process components in logical groups, ensuring no component is missed
- **Executable Precision**: Each test step must be clear, specific, and independently executable
- **Visual Validation**: Include specific assertions for colors, fonts, dimensions from Figma data
- **Component Organization**: Group related test cases by component/feature for maintainability
- **Quality Self-Review**: Eliminate redundant tests, ensure all references are valid
- **Priority Alignment**: High-priority tests for critical user flows, medium for standard features, low for edge cases

Generate the test cases now using this systematic approach and provide the final JSON output.
`;

// UI-specific template sections
export const UI_TESTING_INSTRUCTIONS = `
When UI testing is enabled (includeUITests: true), apply systematic UI testing:

## UI TESTING METHODOLOGY:

### COMPONENT ANALYSIS
- **Basic Properties**: figmaId, name, type, visible
- **Visual Properties**: fills (colors), strokes (borders), effects (shadows)
- **Dimensional Data**: absoluteBoundingBox (x, y, width, height)
- **Text Properties**: characters, fontFamily, fontSize, fontWeight (if applicable)
- **Interactive States**: enabled/disabled, hover, focus, active states
- **Accessibility**: aria roles, labels, descriptions

### TEST GENERATION FOCUS
- **Visual Validation Tests**: Exact color matching, font verification, dimension checking
- **Interaction Tests**: Click handlers, input validation, state changes
- **Accessibility Tests**: Screen reader compatibility, keyboard navigation
- **Responsive Tests**: Breakpoint behavior, layout adaptability
- **Integration Tests**: Component interactions, data flow

## CRITICAL REQUIREMENTS:
- Every test case MUST reference actual figmaId/name from Figma data
- Follow systematic component analysis approach
- Process components by logical grouping
- Include comprehensive visual property validation
`;

export const NO_UI_TESTING_INSTRUCTIONS = `
Focus on functional and integration testing. UI testing is not required for this generation.
`;

// Framework-specific instructions
export const FRAMEWORK_INSTRUCTIONS = {
  jest: `
Consider Jest testing patterns:
- Use describe/it structure in test descriptions
- Include setup/teardown considerations
- Mock and spy requirements
- Async/await patterns for testing
`,

  cypress: `
Consider Cypress E2E testing patterns:
- Page object model references
- Command chaining possibilities
- Viewport and browser considerations
- Network request interceptions
`,

  playwright: `
Consider Playwright testing patterns:
- Multi-browser testing scenarios
- Page object model structure
- Screenshot and visual comparisons
- Network and API mocking
`,

  selenium: `
Consider Selenium WebDriver patterns:
- Cross-browser compatibility
- WebElement location strategies
- Wait conditions and timeouts
- Page Object Model implementation
`,

  testing_library: `
Consider Testing Library principles:
- User-centric test approaches
- Accessibility-first element selection
- Event simulation patterns
- Screen reader compatibility
`,

  vitest: `
Consider Vitest testing patterns:
- Fast unit test execution
- Snapshot testing capabilities
- Mock implementation strategies
- TypeScript integration
`,

  manual: `
Focus on manual testing procedures:
- Clear step-by-step instructions
- Visual verification points
- Data preparation requirements
- Environment setup needs
`
};

// Template metadata
export const TEST_CASE_GENERATION_TEMPLATE_METADATA = {
  name: 'test-case-generation',
  version: '4.0',
  description: 'Systematic test case generation with comprehensive component analysis',
  category: 'test-automation',
  lastUpdated: '2024-12-19',
  author: 'Test Helper API',
  supportedFeatures: [
    'SRS analysis',
    'Systematic component analysis',
    'Comprehensive Element Inventory creation',
    'Progressive test building',
    'Multiple testing frameworks',
    'Quality assurance validation',
    'Comprehensive test coverage',
    'JSON structured output'
  ],
  improvements: [
    'Simplified systematic analysis approach',
    'Enhanced component discovery methodology',
    'Streamlined Element Inventory creation',
    'Improved test organization structure',
    'Better visual fidelity validation',
    'Optimized quality assurance process'
  ]
};

// Export template structure for prompt service
export const TEST_CASE_GENERATION_TEMPLATE = {
  system: TEST_CASE_GENERATION_SYSTEM_TEMPLATE,
  user: TEST_CASE_GENERATION_USER_TEMPLATE,
  metadata: TEST_CASE_GENERATION_TEMPLATE_METADATA,
  uiInstructions: {
    enabled: UI_TESTING_INSTRUCTIONS,
    disabled: NO_UI_TESTING_INSTRUCTIONS
  },
  frameworkInstructions: FRAMEWORK_INSTRUCTIONS
};
