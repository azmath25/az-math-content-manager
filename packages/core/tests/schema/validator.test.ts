// packages/core/tests/schema/validator.test.ts
// Tests for content validator

import { ContentValidator, validateContent, isValidContent } from '../../src/schema/validator';
import validProblem from '../fixtures/valid-problem.json';
import invalidProblem from '../fixtures/invalid-problem.json';
import validLesson from '../fixtures/valid-lesson.json';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('Valid Content', () => {
    test('should validate a valid problem', () => {
      const result = validator.validate(validProblem);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate a valid lesson', () => {
      const result = validator.validate(validLesson);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate problem with all block types', () => {
      const content = {
        metadata: {
          id: 1,
          title: "Test Problem",
          contentType: "problem",
          category: "Algebra",
          difficulty: "Medium",
          tags: ["test"],
          author: "admin",
          draft: false,
          timestamp: "2025-01-15T10:00:00Z"
        },
        statement: [
          {
            type: "paragraph",
            data: { text: "This is a paragraph." }
          },
          {
            type: "header",
            data: { text: "Section Header", level: 2 }
          },
          {
            type: "list",
            data: {
              style: "ordered",
              items: ["Item 1", "Item 2"]
            }
          },
          {
            type: "quote",
            data: {
              text: "A quote",
              caption: "Author"
            }
          },
          {
            type: "math",
            data: {
              latex: "x^2 + y^2 = r^2",
              display: true
            }
          },
          {
            type: "image",
            data: {
              url: "https://example.com/image.png",
              alt: "Test image",
              caption: "Test caption",
              alignment: "center",
              size: "medium"
            }
          }
        ],
        solutions: [
          {
            title: "Solution 1",
            blocks: [
              {
                type: "paragraph",
                data: { text: "Solution text." }
              }
            ]
          }
        ]
      };

      const result = validator.validate(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Metadata', () => {
    test('should reject missing metadata', () => {
      const content = { statement: [] };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'root',
          code: 'MISSING_REQUIRED'
        })
      );
    });

    test('should reject invalid ID', () => {
      const content = {
        metadata: { ...validProblem.metadata, id: -1 },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.id',
          code: 'INVALID_VALUE'
        })
      );
    });

    test('should reject empty title', () => {
      const content = {
        metadata: { ...validProblem.metadata, title: "" },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.title',
          code: 'INVALID_VALUE'
        })
      );
    });

    test('should reject title over 200 characters', () => {
      const content = {
        metadata: { ...validProblem.metadata, title: "a".repeat(201) },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.title',
          code: 'VALUE_TOO_LONG'
        })
      );
    });

    test('should reject invalid contentType', () => {
      const content = {
        metadata: { ...validProblem.metadata, contentType: "invalid" },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.contentType',
          code: 'INVALID_VALUE'
        })
      );
    });

    test('should reject invalid category', () => {
      const content = {
        metadata: { ...validProblem.metadata, category: "InvalidCategory" },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.category',
          code: 'INVALID_VALUE'
        })
      );
    });

    test('should reject invalid difficulty', () => {
      const content = {
        metadata: { ...validProblem.metadata, difficulty: "Impossible" },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject tags as non-array', () => {
      const content = {
        metadata: { ...validProblem.metadata, tags: "not-array" },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.tags',
          code: 'INVALID_TYPE'
        })
      );
    });

    test('should reject more than 10 tags', () => {
      const content = {
        metadata: { ...validProblem.metadata, tags: Array(11).fill("tag") },
        statement: validProblem.statement
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'metadata.tags',
          code: 'ARRAY_TOO_LONG'
        })
      );
    });
  });

  describe('Invalid Statement', () => {
    test('should reject missing statement', () => {
      const content = { metadata: validProblem.metadata };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'root',
          code: 'MISSING_REQUIRED'
        })
      );
    });

    test('should reject empty statement array', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: []
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'statement',
          code: 'ARRAY_EMPTY'
        })
      );
    });

    test('should reject statement as non-array', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: "not an array"
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });
  });

  describe('Invalid Blocks', () => {
    test('should reject block without type', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { data: { text: "No type" } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'statement[0].type',
          code: 'MISSING_REQUIRED'
        })
      );
    });

    test('should reject invalid block type', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "invalid", data: {} }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'statement[0].type',
          code: 'INVALID_VALUE'
        })
      );
    });

    test('should reject paragraph without text', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "paragraph", data: {} }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject header with invalid level', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "header", data: { text: "Header", level: 7 } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject list with invalid style', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "list", data: { style: "invalid", items: ["item"] } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject list with empty items', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "list", data: { style: "ordered", items: [] } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject math without latex', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "math", data: { display: true } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject image without url', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          { type: "image", data: { alt: "Image" } }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject image with invalid alignment', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          {
            type: "image",
            data: {
              url: "https://example.com/img.png",
              alignment: "invalid"
            }
          }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject image with invalid size', () => {
      const content = {
        metadata: validProblem.metadata,
        statement: [
          {
            type: "image",
            data: {
              url: "https://example.com/img.png",
              size: "huge"
            }
          }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });
  });

  describe('Invalid Solutions', () => {
    test('should reject solutions as non-array', () => {
      const content = {
        ...validProblem,
        solutions: "not an array"
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject solution without title', () => {
      const content = {
        ...validProblem,
        solutions: [
          { blocks: [] }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject solution with title over 100 chars', () => {
      const content = {
        ...validProblem,
        solutions: [
          {
            title: "a".repeat(101),
            blocks: validProblem.solutions[0].blocks
          }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });

    test('should reject solution without blocks', () => {
      const content = {
        ...validProblem,
        solutions: [
          { title: "Solution" }
        ]
      };
      const result = validator.validate(content);
      expect(result.valid).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    test('validateContent should work', () => {
      const result = validateContent(validProblem);
      expect(result.valid).toBe(true);
    });

    test('isValidContent should return true for valid content', () => {
      expect(isValidContent(validProblem)).toBe(true);
    });

    test('isValidContent should return false for invalid content', () => {
      expect(isValidContent(invalidProblem)).toBe(false);
    });
  });

  describe('Complex Invalid Content', () => {
    test('should catch multiple errors', () => {
      const result = validator.validate(invalidProblem);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });
});
