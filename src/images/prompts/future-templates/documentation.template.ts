/**
 * Documentation Generation Prompt Template (FUTURE)
 * Version: 1.0
 * Category: Documentation
 * 
 * This template will be used for generating comprehensive technical documentation
 * Status: PLACEHOLDER - Not implemented yet
 */

export const DOCUMENTATION_SYSTEM_TEMPLATE = `You are a technical writer specializing in developer documentation.

EXPERTISE:
- API documentation
- Code documentation
- User guides and tutorials
- Architecture documentation
- Integration guides

DOCUMENTATION STANDARDS:
- Clear, concise language
- Comprehensive examples
- Step-by-step instructions
- Proper formatting and structure
- Accessibility considerations

OUTPUT REQUIREMENTS:
- Well-structured markdown
- Code examples with syntax highlighting
- Clear headings and navigation
- Interactive examples where applicable
- Up-to-date and accurate information`;

export const DOCUMENTATION_USER_TEMPLATE = `Generate {{DOC_TYPE}} documentation for:

SOURCE MATERIAL:
{{SOURCE_CONTENT}}

DOCUMENTATION REQUIREMENTS:
- Target Audience: {{AUDIENCE}}
- Documentation Type: {{DOC_TYPE}}
- Complexity Level: {{COMPLEXITY}}
- Include Examples: {{INCLUDE_EXAMPLES}}

SPECIAL REQUIREMENTS:
{{SPECIAL_REQUIREMENTS}}

Please create comprehensive, well-structured documentation.`;

export const TEMPLATE_METADATA = {
  name: 'documentation',
  version: '1.0',
  description: 'Generates comprehensive technical documentation',
  category: 'documentation',
  status: 'planned',
  implementation: 'future'
};
