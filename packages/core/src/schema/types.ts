// packages/core/src/schema/types.ts
// TypeScript types matching the canonical schema

export type ContentType = 'problem' | 'lesson';

export type Category = 
  | 'Algebra' 
  | 'Geometry' 
  | 'Number Theory' 
  | 'Combinatorics' 
  | 'Calculus' 
  | 'General';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Metadata {
  id: number;
  title: string;
  contentType: ContentType;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  author: string;
  draft: boolean;
  timestamp: string; // ISO 8601 format
}

// Block types
export type BlockType = 
  | 'paragraph' 
  | 'header' 
  | 'list' 
  | 'quote' 
  | 'math' 
  | 'image';

export interface BaseBlock {
  type: BlockType;
  data: Record<string, any>;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  data: {
    text: string; // Rich text with inline HTML/math
  };
}

export interface HeaderBlock extends BaseBlock {
  type: 'header';
  data: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  data: {
    style: 'ordered' | 'unordered';
    items: string[];
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  data: {
    text: string;
    caption?: string;
  };
}

export interface MathBlock extends BaseBlock {
  type: 'math';
  data: {
    latex: string; // Without delimiters
    display: boolean; // true = $$, false = $
  };
}

export type ImageAlignment = 'center' | 'float-left' | 'float-right';
export type ImageSize = 'small' | 'medium' | 'large' | 'full';

export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    url: string;
    alt: string;
    caption?: string;
    alignment: ImageAlignment;
    size: ImageSize;
  };
}

export type ContentBlock = 
  | ParagraphBlock 
  | HeaderBlock 
  | ListBlock 
  | QuoteBlock 
  | MathBlock 
  | ImageBlock;

export interface Solution {
  title: string;
  blocks: ContentBlock[];
}

export interface CanonicalContent {
  metadata: Metadata;
  statement: ContentBlock[];
  solutions?: Solution[];
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

// Helper type guards
export const isParagraphBlock = (block: ContentBlock): block is ParagraphBlock => 
  block.type === 'paragraph';

export const isHeaderBlock = (block: ContentBlock): block is HeaderBlock => 
  block.type === 'header';

export const isListBlock = (block: ContentBlock): block is ListBlock => 
  block.type === 'list';

export const isQuoteBlock = (block: ContentBlock): block is QuoteBlock => 
  block.type === 'quote';

export const isMathBlock = (block: ContentBlock): block is MathBlock => 
  block.type === 'math';

export const isImageBlock = (block: ContentBlock): block is ImageBlock => 
  block.type === 'image';

// Size mappings for rendering
export const IMAGE_SIZE_MAP: Record<ImageSize, string> = {
  small: '30%',
  medium: '50%',
  large: '70%',
  full: '100%'
};
