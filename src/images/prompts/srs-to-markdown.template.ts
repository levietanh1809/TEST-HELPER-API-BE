/**
 * SRS to Markdown Conversion Template
 * 
 * AI prompt templates for converting Software Requirements Specification (SRS) text
 * to well-formatted markdown with proper structure and formatting
 */

export const SRS_TO_MARKDOWN_SYSTEM_TEMPLATE = `
You are a senior technical writer.

Convert the provided SRS text into clean Markdown while preserving all original information and structure.

Hard constraints:
- Output only the Markdown content body.
- No preface or explanation.
- No code fences (no triple backticks).
- No URLs/links/emails; if a link exists, keep only its visible label.
- No images or external references.

Use appropriate Markdown headings, lists, tables, and emphasis. Keep section hierarchy and spacing clear and readable.
`;

export const SRS_TO_MARKDOWN_USER_TEMPLATE = `
Convert the following SRS text into Markdown.

Rules:
- Preserve all content and structure.
- Output only the Markdown body (no description, no code fences, no links/URLs/emails).

SRS TEXT:
{{SRS_TEXT}}
`;

// Template metadata
export const SRS_TO_MARKDOWN_TEMPLATE_METADATA = {
  name: 'srs-to-markdown',
  version: '1.0',
  description: 'Convert SRS text to well-formatted markdown with Excel compatibility',
  category: 'documentation',
  lastUpdated: '2025-09-10',
  author: 'Test Helper API',
  supportedFeatures: [
    'SRS text conversion',
    'Markdown formatting',
    'Excel compatibility',
    'Structure preservation',
    'Readability enhancement',
    'Technical accuracy',
    'Multiple output formats'
  ],
  improvements: [
    'Optimized for cost-effective AI models',
    'Excel copy-paste workflow support',
    'Flexible formatting options',
    'Preserve existing formatting option',
    'Multiple output format support'
  ]
};

// Export template structure for prompt service
export const SRS_TO_MARKDOWN_TEMPLATE = {
  system: SRS_TO_MARKDOWN_SYSTEM_TEMPLATE,
  user: SRS_TO_MARKDOWN_USER_TEMPLATE,
  metadata: SRS_TO_MARKDOWN_TEMPLATE_METADATA
};
