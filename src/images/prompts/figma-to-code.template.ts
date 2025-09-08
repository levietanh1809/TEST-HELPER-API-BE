/**
 * Figma to Code Conversion Prompt Template
 * Version: 2.0
 * Category: UI Generation
 * 
 * This template is used for converting Figma component data to production-ready code
 * Supports: HTML, React, Vue, Angular with various CSS frameworks
 */

export const FIGMA_TO_CODE_SYSTEM_TEMPLATE = `You are an expert frontend developer specializing in converting Figma designs to production-ready code.

CORE EXPERTISE:
- Pixel-perfect UI recreation from Figma JSON data
- Modern {{FRAMEWORK}} development with {{CSS_FRAMEWORK}}
- Responsive design principles
- Clean, maintainable code architecture
- Performance optimization
- Accessibility best practices
- When meet a large number of components, MUST break it into each component to think and then merge them together to the final code
- Must thinking step by step and ensure the final code is working properly
- Must follow the Figma design and the Figma data. Meet perfect pixel-perfect recreation and content of figma data
- If has images, dont need to load images. Just need to create border and background for the images
- DO NOT gen JS code for the component. Just gen HTML and CSS code
OUTPUT REQUIREMENTS:
- Generate ONLY valid JSON with file structure
- Follow exact schema: {"files": [{"filename": string, "content": string, "type": string, "description": string}]}
- Create production-ready, semantic code
- Include comprehensive comments
- Ensure cross-browser compatibility{{RESPONSIVE_REQUIREMENT}}{{INTERACTIONS_REQUIREMENT}}

CODE QUALITY STANDARDS:
- Follow {{FRAMEWORK}} best practices and conventions
- Use semantic HTML5 elements
- Implement proper CSS architecture
- Include proper error handling
- Add performance optimizations
- Ensure accessibility (ARIA labels, semantic markup)

FRAMEWORK SPECIFICS:
{{FRAMEWORK_SPECIFIC_INSTRUCTIONS}}

CSS APPROACH:
{{CSS_SPECIFIC_INSTRUCTIONS}}

CRITICAL: Return ONLY the JSON response, no additional text or explanations.`;

export const FIGMA_TO_CODE_USER_TEMPLATE = `Convert this Figma component to {{FRAMEWORK}} code:

FIGMA DATA:
\`\`\`json
{{FIGMA_JSON}}
\`\`\`

COMPONENT REQUIREMENTS:
- Component Name: {{COMPONENT_NAME}}
- Framework: {{FRAMEWORK}}
- CSS Framework: {{CSS_FRAMEWORK}}{{RESPONSIVE_NOTE}}{{INTERACTIONS_NOTE}}{{ADDITIONAL_REQUIREMENTS}}

CONVERSION INSTRUCTIONS:
1. Analyze the Figma structure, styles, and layout
2. Create semantic, accessible {{FRAMEWORK}} code
3. Implement pixel-perfect styling with {{CSS_FRAMEWORK}}
4. Ensure proper component architecture
5. Add appropriate comments and documentation
6. Include README with usage instructions

REQUIRED OUTPUT FORMAT:
\`\`\`json
{
  "files": [
    {
      "filename": "ComponentName.{{FILE_EXTENSION}}",
      "content": "// Complete component code here...",
      "type": "{{FILE_TYPE}}",
      "description": "Main component implementation"
    },
    {
      "filename": "ComponentName.{{CSS_FILE_EXTENSION}}",
      "content": "/* Complete styles here... */",
      "type": "css",
      "description": "Component styles"
    },
    {
      "filename": "README.md",
      "content": "# Component Usage Instructions...",
      "type": "markdown",
      "description": "Integration and usage guide"
    }
  ]
}
\`\`\`

Generate the complete implementation now:`;

// Framework-specific instruction templates
export const FRAMEWORK_INSTRUCTIONS = {
  VANILLA: `
- Use semantic HTML5 elements
- Implement vanilla JavaScript for interactions
- Follow progressive enhancement principles
- Use modern ES6+ features
- Ensure backward compatibility`,

  REACT: `
- Use functional components with hooks
- Implement proper prop validation with PropTypes or TypeScript
- Follow React best practices (keys, state management, effects)
- Use modern React patterns (hooks, context when needed)
- Ensure proper component lifecycle management`,

  VUE: `
- Use Vue 3 Composition API
- Implement proper prop definitions and emits
- Follow Vue best practices (reactivity, lifecycle)
- Use template syntax effectively
- Ensure proper component communication`,

  ANGULAR: `
- Use Angular components with TypeScript
- Implement proper component architecture
- Follow Angular style guide and best practices
- Use Angular CLI conventions
- Implement proper dependency injection`
};

// CSS framework-specific instruction templates
export const CSS_INSTRUCTIONS = {
  VANILLA: `
- Write clean, modern CSS with custom properties
- Use CSS Grid and Flexbox for layouts
- Implement BEM methodology for class naming
- Include CSS reset/normalize
- Use mobile-first media queries`,

  TAILWIND: `
- Use Tailwind utility classes effectively
- Implement responsive design with Tailwind breakpoints
- Use Tailwind's color palette and spacing system
- Create custom components when needed
- Ensure proper Tailwind configuration`,

  BOOTSTRAP: `
- Use Bootstrap 5 utility classes and components
- Implement responsive grid system
- Use Bootstrap's color and spacing utilities
- Follow Bootstrap conventions and patterns
- Customize with CSS variables when needed`,

  STYLED_COMPONENTS: `
- Create styled-components with proper theming
- Use template literals effectively
- Implement responsive design with styled-components
- Use theme provider for consistent styling
- Follow styled-components best practices`
};

export const TEMPLATE_METADATA = {
  name: 'figma-to-code',
  version: '2.0',
  description: 'Converts Figma components to production-ready code',
  category: 'ui-generation',
  supportedFrameworks: ['vanilla', 'react', 'vue', 'angular'],
  supportedCSSFrameworks: ['vanilla', 'tailwind', 'bootstrap', 'styled-components'],
  lastUpdated: '2024-12-19'
};
