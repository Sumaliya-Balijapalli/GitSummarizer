export const summaryJsonSchema = {
  name: 'repository_summary',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      overview: { type: 'string' },
      features: { type: 'array', items: { type: 'string' } },
      technologies: { type: 'array', items: { type: 'string' } },
      prerequisites: { type: 'array', items: { type: 'string' } },
      installation: { type: 'array', items: { type: 'string' } },
      usage: { type: 'array', items: { type: 'string' } },
      limitations: { type: 'array', items: { type: 'string' } },
      commit_digest: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            message: { type: 'string' },
            explanation: { type: 'string' }
          },
          required: ['message', 'explanation']
        }
      }
    },
    required: ['overview', 'features', 'technologies', 'prerequisites', 'installation', 'usage', 'limitations', 'commit_digest']
  }
};