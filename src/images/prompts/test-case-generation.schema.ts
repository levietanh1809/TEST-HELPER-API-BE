export const TEST_CASE_BUNDLE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['testCases'],
  properties: {
    testCases: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'title',
          'description',
          'category',
          'priority',
          'preconditions',
          'steps',
          'finalExpectedResult',
          'tags'
        ],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          category: {
            type: 'string',
            enum: [
              'visual',
              'functional',
              'integration',
              'performance',
              'security',
              'edge_case',
              'regression',
              'accessibility'
            ]
          },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          preconditions: {
            type: 'array',
            items: { type: 'string' },
            default: []
          },
          steps: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['step', 'target', 'action', 'expected'],
              properties: {
                step: { type: 'integer', minimum: 1 },
                target: { type: 'string', minLength: 1 },
                action: { type: 'string', minLength: 1 },
                expected: { type: 'string', minLength: 1 }
              }
            }
          },
          finalExpectedResult: { type: 'string', minLength: 1 },
          tags: { type: 'array', items: { type: 'string' }, default: [] }
        }
      }
    }
  }
} as const;
