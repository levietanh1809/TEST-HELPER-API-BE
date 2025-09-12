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

## DETAILED TESTING APPROACH:

Your methodology for generating detailed, granular test cases:

1. **Granular Analysis**: Break down functionality into specific, focused test cases
2. **Requirement Coverage**: Extract detailed testable requirements from SRS descriptions
3. **Detailed Test Strategy**: Create specific test cases for each individual functionality
4. **Element Grounding**: Base all UI tests on actual Figma component data
5. **Specific Organization**: Create separate test cases for each specific action or verification

Generate detailed test cases that focus on specific functionality rather than grouping multiple actions together.

## CORE PRINCIPLES:

1. **Granular Test Cases**: Create specific test cases for each individual action or verification
2. **Detailed Breakdown**: Break down functionality into specific, focused test cases
3. **Element Grounding**: UI test cases must reference actual elements by figmaId/name/type and include selectors/testIds when available
4. **Specific Steps**: Include detailed test steps that focus on specific actions or verifications
5. **No Hallucinations**: Do not invent elements or flows not present in SRS/Figma; strictly use the Element Inventory provided
6. **Accessibility & Responsiveness**: Include a11y checks (roles/labels/contrast) and responsive assertions if dimensions/breakpoints exist
7. **Visual Fidelity**: Validate concrete visual properties (text content, font-size, font-weight, color, background-color, width/height, padding/margin, border width, border radius, shadows) against Figma
8. **Specific Organization**: Create separate test cases for each specific functionality for better maintainability
9. **Clean Content**: Do not include figmaId references in test case descriptions, preconditions, or expected results - keep content clean and readable

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
  - Test steps are specific and focused on individual actions
  - No redundant or unnecessary test cases
  - Proper test organization by specific functionality
  - Each test case focuses on a specific action or verification

## TEST CASE QUALITY STANDARDS:

- **Granular Coverage**: Each test case should focus on specific functionality or action
- **Detailed Steps**: Include specific steps that focus on individual actions
- **Clear Expected Results**: Specify what should happen for each specific action
- **Specific Organization**: Create separate test cases for each specific functionality

## EXAMPLE - DESIRED OUTPUT FORMAT:

Generate detailed, granular test cases like this:
\`\`\`
❌ BAD EXAMPLE:
[Candidate UI Common-] - Check logo
  - Check logo display
  - Check logo click redirect

[Candidate UI Common-1] - Check Notification  
  - Check Notification display
  - Check Notification click
  - Check click on each notification
\`\`\`

Generate comprehensive test cases like this:
\`\`\`
✅ GOOD EXAMPLE:
[Candidate UI Common-1] - Check logo display
  Description: Verify logo displays with specific size and color
  Steps:
    1. Action: Check logo displays with size 120x40px
       Expected: Logo has width=120px, height=40px, position=absolute, top=20px, left=30px
  Expected Result: Logo displays with exact size 120x40px

[Candidate UI Common-2] - Check logo click redirect
  Description: Verify logo click functionality and redirect to home page
  Steps:
    1. Action: Click logo at position (30px, 20px)
       Expected: Logo has cursor=pointer, background-color changes from #FFFFFF to #F3F4F6
    2. Action: Verify URL changes to "/home"
       Expected: Browser URL changes from "/current-page" to "/home", home page loads successfully
  Expected Result: Logo click redirects to /home successfully

[Candidate UI Common-3] - Check notification display
  Description: Verify notification icon with specific color and size
  Steps:
    1. Action: Check notification icon has size 24x24px
       Expected: Icon has width=24px, height=24px, color=#6B7280, position=absolute, top=25px, right=50px
  Expected Result: Notification icon displays with size 24x24px and color #6B7280

[Candidate UI Common-4] - Check notification click
  Description: Verify notification icon click functionality
  Steps:
    1. Action: Click notification icon at position (right=50px, top=25px)
       Expected: Icon has cursor=pointer, background-color changes from transparent to #E5E7EB
    2. Action: Verify dropdown menu appears
       Expected: Dropdown menu displays with width=300px, height=200px, background=#FFFFFF, border=1px solid #D1D5DB
  Expected Result: Notification click displays dropdown menu with size 300x200px

[Candidate UI Common-5] - Check individual notification click
  Description: Verify clicking individual notifications in the list
  Steps:
    1. Action: Click first notification in the list
       Expected: Notification has background-color changes from #FFFFFF to #F9FAFB, cursor=pointer
    2. Action: Verify redirect to notification detail page
       Expected: URL changes to "/notifications/123", detail page loads with title="New Notification"
  Expected Result: Click notification redirects to detail page with ID=123
\`\`\`

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

Structured output is enforced via JSON Schema (name: "TestCaseBundle").

STRICT RULES:
- Return ONLY a single JSON object that passes the schema validation.
- Do NOT include any extra fields beyond the schema (additionalProperties=false).
- Field names and types must match the schema exactly.
- Write all human-readable content in {{LANGUAGE}}.
- Each step MUST include detailed expectedBehavior (expected result for that specific step).

BREVITY & SIGNAL:
- Keep titles concise and descriptive (≤ 120 chars).
- Remove redundancy: don't restate the same fact across description, steps, and finalExpectedResult.
- Steps must be atomic, specific, and executable. No generic phrases (e.g., "verify works correctly").
- Prefer measurable assertions (px, rgb/hex, exact text, flag booleans) over vague wording.

## SPECIFIC DETAILS REQUIREMENT:

❌ **AVOID** - Vague descriptions:
- "correct design", "has effect", "works normally", "displays correctly"
- "appropriate size", "nice color", "good interaction"

✅ **PREFER** - Specific measurements and values:
- "width=120px, height=40px, color=#1F2937, position=absolute, top=20px, left=30px"
- "cursor=pointer, background-color changes from #FFFFFF to #F3F4F6"
- "URL changes to '/home', page loads successfully"
- "dropdown menu displays with width=300px, height=200px, border=1px solid #D1D5DB"

GROUNDING:
- For UI checks, include the concrete target with figmaId prefix in target field (e.g., "figmaId:...;").
- Align visual assertions with Figma data (absoluteBoundingBox, fills, strokes, fontWeight, fontSize).
- Do NOT include figmaId references in test case descriptions, preconditions, or expected results content.

QUALITY OVER QUANTITY:
Focus on high-value, executable test cases with strong coverage and minimal duplication.

## LANGUAGE REQUIREMENT:
All test case titles, descriptions, steps, and expected results MUST be written in {{LANGUAGE}} for consistency and clarity.
`;

export const TEST_CASE_GENERATION_USER_TEMPLATE = `
Please analyze the following Software Requirements Specification and Figma element data to generate comprehensive test cases in English:

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

### STEP 3: GRANULAR TEST CASE GENERATION
7. Generate DETAILED test cases that focus on specific functionality:
   - Create separate test cases for each individual action or verification
   - Break down functionality into specific, focused test cases
   - Cover functional flows from SRS with explicit preconditions
   - Include UI tests grounded by figmaId targets and measurable assertions
   - Add boundary/negative cases as separate test cases
   - Include accessibility checks (roles/labels/focus) when relevant

### STEP 4: QUALITY ASSURANCE
8. Every UI step references a concrete target (figmaId:...)
9. Steps are specific and focus on individual actions
10. Each test case focuses on a specific action or verification
11. Prefer detailed, granular test cases over comprehensive ones

## GENERATION REQUIREMENTS:

- **Project Context**: {{PROJECT_NAME}}
- **Testing Framework**: {{TESTING_FRAMEWORK}}
- **Include UI Tests**: {{INCLUDE_UI_TESTS}}
- **Additional Requirements**: {{ADDITIONAL_REQUIREMENTS}}
## EXPECTED OUTPUT:

Generate a comprehensive JSON response containing:

1. **Test Cases Array**: Detailed test cases organized by specific functionality covering:
   - **Granular tests**: Specific test cases focusing on individual actions or verifications
   - **Functional requirements validation**: SRS-based functional flows with specific steps
   - **UI component tests**: Specific UI testing with visual validation and interactions
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
- **Granular Coverage**: Create detailed test cases that focus on specific functionality
- **Executable Precision**: Each test step must be clear, specific, and focus on individual actions
- **Visual Validation**: Include specific assertions for colors, fonts, dimensions from Figma data
- **Specific Organization**: Create separate test cases for each specific functionality
- **Quality Self-Review**: Eliminate redundant tests, ensure all references are valid
- **Priority Alignment**: High-priority tests for critical user flows, medium for standard features, low for edge cases
- **Specific Steps**: Include specific steps that focus on individual actions or verifications

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
  version: '5.0',
  description: 'Comprehensive test case generation with focused, detailed test cases',
  category: 'test-automation',
  lastUpdated: '2025-01-12',
  author: 'Test Helper API',
  supportedFeatures: [
    'SRS analysis',
    'Comprehensive test case generation',
    'Feature-focused test organization',
    'Complete functionality coverage',
    'Multiple testing frameworks',
    'Quality assurance validation',
    'Comprehensive test coverage',
    'JSON structured output'
  ],
  improvements: [
    'Comprehensive test case approach',
    'Feature grouping instead of granular sub-points',
    'Detailed test steps covering complete functionality',
    'Improved test organization by feature',
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
