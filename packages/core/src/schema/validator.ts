// packages/core/src/schema/validator.ts
// Validates content against canonical schema

import {
  CanonicalContent,
  ContentBlock,
  Metadata,
  Solution,
  ValidationResult,
  ValidationError,
  BlockType,
  ContentType,
  Category,
  Difficulty,
  ImageAlignment,
  ImageSize
} from './types';

export class ContentValidator {
  private errors: ValidationError[] = [];

  /**
   * Validate complete content
   */
  validate(content: any): ValidationResult {
    this.errors = [];

    if (!content || typeof content !== 'object') {
      this.addError('root', 'Content must be an object', 'INVALID_TYPE');
      return this.getResult();
    }

    // Validate required top-level properties
    if (!content.metadata) {
      this.addError('root', 'Missing required property: metadata', 'MISSING_REQUIRED');
    } else {
      this.validateMetadata(content.metadata);
    }

    if (!content.statement) {
      this.addError('root', 'Missing required property: statement', 'MISSING_REQUIRED');
    } else {
      this.validateBlocks(content.statement, 'statement');
    }

    // Validate optional solutions
    if (content.solutions !== undefined) {
      this.validateSolutions(content.solutions);
    }

    return this.getResult();
  }

  /**
   * Validate metadata
   */
  private validateMetadata(metadata: any): void {
    const path = 'metadata';

    // Required fields
    if (!metadata.id || typeof metadata.id !== 'number' || metadata.id < 1) {
      this.addError(`${path}.id`, 'ID must be a positive integer', 'INVALID_VALUE');
    }

    if (!metadata.title || typeof metadata.title !== 'string') {
      this.addError(`${path}.title`, 'Title must be a non-empty string', 'INVALID_VALUE');
    } else if (metadata.title.length > 200) {
      this.addError(`${path}.title`, 'Title must be 200 characters or less', 'VALUE_TOO_LONG');
    }

    if (!metadata.contentType) {
      this.addError(`${path}.contentType`, 'Missing required field: contentType', 'MISSING_REQUIRED');
    } else if (!this.isValidContentType(metadata.contentType)) {
      this.addError(`${path}.contentType`, 'Invalid contentType. Must be "problem" or "lesson"', 'INVALID_VALUE');
    }

    if (metadata.category && !this.isValidCategory(metadata.category)) {
      this.addError(`${path}.category`, 'Invalid category', 'INVALID_VALUE');
    }

    if (metadata.difficulty && !this.isValidDifficulty(metadata.difficulty)) {
      this.addError(`${path}.difficulty`, 'Invalid difficulty. Must be "Easy", "Medium", or "Hard"', 'INVALID_VALUE');
    }

    if (metadata.tags !== undefined) {
      if (!Array.isArray(metadata.tags)) {
        this.addError(`${path}.tags`, 'Tags must be an array', 'INVALID_TYPE');
      } else {
        if (metadata.tags.length > 10) {
          this.addError(`${path}.tags`, 'Maximum 10 tags allowed', 'ARRAY_TOO_LONG');
        }
        metadata.tags.forEach((tag: any, index: number) => {
          if (typeof tag !== 'string') {
            this.addError(`${path}.tags[${index}]`, 'Tag must be a string', 'INVALID_TYPE');
          } else if (tag.length === 0 || tag.length > 50) {
            this.addError(`${path}.tags[${index}]`, 'Tag must be 1-50 characters', 'INVALID_LENGTH');
          }
        });
      }
    }
  }

  /**
   * Validate array of blocks
   */
  private validateBlocks(blocks: any, path: string): void {
    if (!Array.isArray(blocks)) {
      this.addError(path, 'Blocks must be an array', 'INVALID_TYPE');
      return;
    }

    if (blocks.length === 0) {
      this.addError(path, 'At least one block is required', 'ARRAY_EMPTY');
      return;
    }

    blocks.forEach((block, index) => {
      this.validateBlock(block, `${path}[${index}]`);
    });
  }

  /**
   * Validate single block
   */
  private validateBlock(block: any, path: string): void {
    if (!block || typeof block !== 'object') {
      this.addError(path, 'Block must be an object', 'INVALID_TYPE');
      return;
    }

    if (!block.type) {
      this.addError(`${path}.type`, 'Missing required field: type', 'MISSING_REQUIRED');
      return;
    }

    if (!this.isValidBlockType(block.type)) {
      this.addError(`${path}.type`, `Invalid block type: ${block.type}`, 'INVALID_VALUE');
      return;
    }

    if (!block.data || typeof block.data !== 'object') {
      this.addError(`${path}.data`, 'Missing or invalid data object', 'INVALID_TYPE');
      return;
    }

    // Validate based on block type
    switch (block.type) {
      case 'paragraph':
        this.validateParagraphBlock(block.data, path);
        break;
      case 'header':
        this.validateHeaderBlock(block.data, path);
        break;
      case 'list':
        this.validateListBlock(block.data, path);
        break;
      case 'quote':
        this.validateQuoteBlock(block.data, path);
        break;
      case 'math':
        this.validateMathBlock(block.data, path);
        break;
      case 'image':
        this.validateImageBlock(block.data, path);
        break;
    }
  }

  /**
   * Validate paragraph block
   */
  private validateParagraphBlock(data: any, path: string): void {
    if (!data.text || typeof data.text !== 'string') {
      this.addError(`${path}.data.text`, 'Paragraph text must be a non-empty string', 'INVALID_VALUE');
    }
  }

  /**
   * Validate header block
   */
  private validateHeaderBlock(data: any, path: string): void {
    if (!data.text || typeof data.text !== 'string') {
      this.addError(`${path}.data.text`, 'Header text must be a non-empty string', 'INVALID_VALUE');
    }

    if (!data.level || typeof data.level !== 'number') {
      this.addError(`${path}.data.level`, 'Header level is required', 'MISSING_REQUIRED');
    } else if (data.level < 1 || data.level > 6) {
      this.addError(`${path}.data.level`, 'Header level must be between 1 and 6', 'INVALID_VALUE');
    }
  }

  /**
   * Validate list block
   */
  private validateListBlock(data: any, path: string): void {
    if (!data.style || (data.style !== 'ordered' && data.style !== 'unordered')) {
      this.addError(`${path}.data.style`, 'List style must be "ordered" or "unordered"', 'INVALID_VALUE');
    }

    if (!Array.isArray(data.items)) {
      this.addError(`${path}.data.items`, 'List items must be an array', 'INVALID_TYPE');
    } else if (data.items.length === 0) {
      this.addError(`${path}.data.items`, 'List must have at least one item', 'ARRAY_EMPTY');
    } else {
      data.items.forEach((item: any, index: number) => {
        if (typeof item !== 'string') {
          this.addError(`${path}.data.items[${index}]`, 'List item must be a string', 'INVALID_TYPE');
        }
      });
    }
  }

  /**
   * Validate quote block
   */
  private validateQuoteBlock(data: any, path: string): void {
    if (!data.text || typeof data.text !== 'string') {
      this.addError(`${path}.data.text`, 'Quote text must be a non-empty string', 'INVALID_VALUE');
    }

    if (data.caption !== undefined && typeof data.caption !== 'string') {
      this.addError(`${path}.data.caption`, 'Quote caption must be a string', 'INVALID_TYPE');
    }
  }

  /**
   * Validate math block
   */
  private validateMathBlock(data: any, path: string): void {
    if (!data.latex || typeof data.latex !== 'string') {
      this.addError(`${path}.data.latex`, 'Math LaTeX must be a non-empty string', 'INVALID_VALUE');
    }

    if (data.display === undefined || typeof data.display !== 'boolean') {
      this.addError(`${path}.data.display`, 'Math display must be a boolean', 'INVALID_TYPE');
    }
  }

  /**
   * Validate image block
   */
  private validateImageBlock(data: any, path: string): void {
    if (!data.url || typeof data.url !== 'string') {
      this.addError(`${path}.data.url`, 'Image URL must be a non-empty string', 'INVALID_VALUE');
    } else {
      // Basic URL validation
      try {
        new URL(data.url);
      } catch {
        // Could be relative URL or data URI
        if (!data.url.startsWith('/') && !data.url.startsWith('data:')) {
          this.addError(`${path}.data.url`, 'Image URL must be a valid URL, relative path, or data URI', 'INVALID_VALUE');
        }
      }
    }

    if (data.alt !== undefined && typeof data.alt !== 'string') {
      this.addError(`${path}.data.alt`, 'Image alt text must be a string', 'INVALID_TYPE');
    }

    if (data.caption !== undefined && typeof data.caption !== 'string') {
      this.addError(`${path}.data.caption`, 'Image caption must be a string', 'INVALID_TYPE');
    }

    if (data.alignment && !this.isValidImageAlignment(data.alignment)) {
      this.addError(`${path}.data.alignment`, 'Invalid alignment. Must be "center", "float-left", or "float-right"', 'INVALID_VALUE');
    }

    if (data.size && !this.isValidImageSize(data.size)) {
      this.addError(`${path}.data.size`, 'Invalid size. Must be "small", "medium", "large", or "full"', 'INVALID_VALUE');
    }
  }

  /**
   * Validate solutions array
   */
  private validateSolutions(solutions: any): void {
    const path = 'solutions';

    if (!Array.isArray(solutions)) {
      this.addError(path, 'Solutions must be an array', 'INVALID_TYPE');
      return;
    }

    solutions.forEach((solution, index) => {
      this.validateSolution(solution, `${path}[${index}]`);
    });
  }

  /**
   * Validate single solution
   */
  private validateSolution(solution: any, path: string): void {
    if (!solution || typeof solution !== 'object') {
      this.addError(path, 'Solution must be an object', 'INVALID_TYPE');
      return;
    }

    if (!solution.title || typeof solution.title !== 'string') {
      this.addError(`${path}.title`, 'Solution title must be a non-empty string', 'INVALID_VALUE');
    } else if (solution.title.length > 100) {
      this.addError(`${path}.title`, 'Solution title must be 100 characters or less', 'VALUE_TOO_LONG');
    }

    if (!solution.blocks) {
      this.addError(`${path}.blocks`, 'Solution blocks are required', 'MISSING_REQUIRED');
    } else {
      this.validateBlocks(solution.blocks, `${path}.blocks`);
    }
  }

  /**
   * Type guard helpers
   */
  private isValidBlockType(type: any): type is BlockType {
    return ['paragraph', 'header', 'list', 'quote', 'math', 'image'].includes(type);
  }

  private isValidContentType(type: any): type is ContentType {
    return type === 'problem' || type === 'lesson';
  }

  private isValidCategory(category: any): category is Category {
    return ['Algebra', 'Geometry', 'Number Theory', 'Combinatorics', 'Calculus', 'General'].includes(category);
  }

  private isValidDifficulty(difficulty: any): difficulty is Difficulty {
    return ['Easy', 'Medium', 'Hard'].includes(difficulty);
  }

  private isValidImageAlignment(alignment: any): alignment is ImageAlignment {
    return ['center', 'float-left', 'float-right'].includes(alignment);
  }

  private isValidImageSize(size: any): size is ImageSize {
    return ['small', 'medium', 'large', 'full'].includes(size);
  }

  /**
   * Add validation error
   */
  private addError(path: string, message: string, code: string): void {
    this.errors.push({ path, message, code });
  }

  /**
   * Get validation result
   */
  private getResult(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors
    };
  }
}

/**
 * Quick validation function
 */
export function validateContent(content: any): ValidationResult {
  const validator = new ContentValidator();
  return validator.validate(content);
}

/**
 * Type guard with validation
 */
export function isValidContent(content: any): content is CanonicalContent {
  const result = validateContent(content);
  return result.valid;
}
