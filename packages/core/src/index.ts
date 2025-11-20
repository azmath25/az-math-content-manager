// packages/core/src/index.ts
// Main entry point for @azmath/core

// Export types
export * from './schema/types';

// Export validator
export {
  ContentValidator,
  validateContent,
  isValidContent
} from './schema/validator';

// Export renderer
export {
  HTMLRenderer,
  renderToHTML
} from './renderer/html';

export type { RenderOptions } from './renderer/html';
