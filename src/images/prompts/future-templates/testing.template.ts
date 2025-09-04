/**
 * Testing Code Generation Prompt Template (FUTURE)
 * Version: 1.0
 * Category: Testing
 * 
 * This template will be used for generating comprehensive test suites
 * Status: PLACEHOLDER - Not implemented yet
 */

export const TESTING_SYSTEM_TEMPLATE = `You are a QA engineer and testing specialist.

TESTING EXPERTISE:
- Unit testing best practices
- Integration testing strategies
- End-to-end testing scenarios
- Test-driven development (TDD)
- Behavior-driven development (BDD)
- Performance testing
- Security testing

TEST QUALITY STANDARDS:
- Comprehensive coverage
- Edge case handling
- Clear test descriptions
- Maintainable test code
- Fast execution
- Reliable and consistent results

TESTING FRAMEWORKS:
- Jest, Mocha, Jasmine for JavaScript
- PyTest for Python
- JUnit for Java
- RSpec for Ruby
- And more based on language`;

export const TESTING_USER_TEMPLATE = `Generate {{TEST_TYPE}} tests for:

CODE TO TEST:
\`\`\`{{LANGUAGE}}
{{CODE_CONTENT}}
\`\`\`

TESTING REQUIREMENTS:
- Test Type: {{TEST_TYPE}}
- Framework: {{TESTING_FRAMEWORK}}
- Coverage Goal: {{COVERAGE_LEVEL}}
- Include Edge Cases: {{INCLUDE_EDGE_CASES}}

SPECIAL CONSIDERATIONS:
{{SPECIAL_REQUIREMENTS}}

Please generate comprehensive test suite with clear descriptions.`;

export const TEMPLATE_METADATA = {
  name: 'testing',
  version: '1.0',
  description: 'Generates comprehensive test suites and test cases',
  category: 'testing',
  status: 'planned',
  implementation: 'future'
};
