# @azmath/core

Core content system for Az-Math with canonical schema, validation, and HTML rendering with perfect text wrapping.

## Features

- 📋 **Canonical Schema** - Single source of truth for all content
- ✅ **Content Validation** - Comprehensive validation against schema
- 🎨 **HTML Renderer** - Convert canonical JSON to styled HTML
- 🖼️ **Perfect Text Wrapping** - Images float with text wrapping beautifully
- 📐 **Math Support** - MathJax integration for equations
- 🎯 **Type Safety** - Full TypeScript support
- 🧪 **Well Tested** - Comprehensive test suite

## Installation

```bash
npm install @azmath/core
# or
pnpm add @azmath/core
```

## Quick Start

### Validate Content

```typescript
import { validateContent } from '@azmath/core';

const content = {
  metadata: {
    id: 1,
    title: "My Problem",
    contentType: "problem",
    category: "Algebra",
    difficulty: "Medium",
    tags: ["quadratic"],
    author: "admin",
    draft: false,
    timestamp: new Date().toISOString()
  },
  statement: [
    {
      type: "paragraph",
      data: { text: "Solve $x^2 + 5x + 6 = 0$" }
    }
  ]
};

const result = validateContent(content);

if (result.valid) {
  console.log('✓ Content is valid');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Render to HTML

```typescript
import { renderToHTML } from '@azmath/core';

const html = renderToHTML(content, {
  includeMetadata: true,
  mathDelimiters: 'mathjax'
});

// Insert into page
document.getElementById('content').innerHTML = html;

// Typeset math if using MathJax
if (window.MathJax) {
  MathJax.typesetPromise();
}
```

### Using the Renderer Class

```typescript
import { HTMLRenderer } from '@azmath/core';

const renderer = new HTMLRenderer({
  includeMetadata: true,
  imageBaseUrl: 'https://cdn.example.com/',
  cssClasses: {
    wrapper: 'my-content',
    statement: 'problem-statement',
    solution: 'solution-block'
  }
});

const html = renderer.render(content);
```

## Content Structure

### Metadata

```typescript
{
  id: number;                          // Unique identifier
  title: string;                       // Content title (max 200 chars)
  contentType: 'problem' | 'lesson';  // Type of content
  category: 'Algebra' | 'Geometry' | ...;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];                      // Max 10 tags
  author: string;
  draft: boolean;
  timestamp: string;                   // ISO 8601 format
}
```

### Block Types

#### Paragraph
```typescript
{
  type: "paragraph",
  data: {
    text: string  // Rich text with inline HTML/math
  }
}
```

#### Header
```typescript
{
  type: "header",
  data: {
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6
  }
}
```

#### List
```typescript
{
  type: "list",
  data: {
    style: "ordered" | "unordered",
    items: string[]
  }
}
```

#### Quote
```typescript
{
  type: "quote",
  data: {
    text: string,
    caption?: string
  }
}
```

#### Math
```typescript
{
  type: "math",
  data: {
    latex: string,      // LaTeX without delimiters
    display: boolean    // true = $$, false = $
  }
}
```

#### Image (with Text Wrapping)
```typescript
{
  type: "image",
  data: {
    url: string,
    alt: string,
    caption?: string,
    alignment: "center" | "float-left" | "float-right",
    size: "small" | "medium" | "large" | "full"
  }
}
```

### Solutions (Problems Only)

```typescript
{
  title: string,        // Max 100 chars
  blocks: ContentBlock[]
}
```

## Text Wrapping

The renderer produces HTML with perfect text wrapping:

- **Float-left**: Image on left, text wraps right
- **Float-right**: Image on right, text wraps left
- **Center**: Full-width, no wrapping
- **Responsive**: Auto-centers on mobile

### Example

```typescript
const content = {
  metadata: { /* ... */ },
  statement: [
    {
      type: "image",
      data: {
        url: "diagram.png",
        alignment: "float-right",
        size: "medium",
        caption: "Important diagram"
      }
    },
    {
      type: "paragraph",
      data: {
        text: "This text wraps beautifully around the image..."
      }
    }
  ]
};
```

## Validation

### Validation Result

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;      // e.g., "metadata.title"
  message: string;   // Human-readable error
  code: string;      // Error code for programmatic handling
}
```

### Error Codes

- `MISSING_REQUIRED` - Required field is missing
- `INVALID_TYPE` - Wrong data type
- `INVALID_VALUE` - Value outside allowed range/enum
- `VALUE_TOO_LONG` - String exceeds max length
- `ARRAY_EMPTY` - Array must have items
- `ARRAY_TOO_LONG` - Too many items

### Type Guards

```typescript
import { isValidContent } from '@azmath/core';

if (isValidContent(data)) {
  // TypeScript knows data is CanonicalContent
  const html = renderToHTML(data);
}
```

## CSS Requirements

For proper text wrapping, include the float.css styles:

```html
<link rel="stylesheet" href="path/to/float.css">
```

Or copy the critical CSS:

```css
.image-block.align-float-left {
  float: left;
  margin: 0 1.5rem 1rem 0;
}

.image-block.align-float-right {
  float: right;
  margin: 0 0 1rem 1.5rem;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## API Reference

### validateContent(content: any): ValidationResult
Validates content against canonical schema.

### isValidContent(content: any): content is CanonicalContent
Type guard that validates and narrows type.

### renderToHTML(content: CanonicalContent, options?: RenderOptions): string
Quick render function.

### class HTMLRenderer
Full-featured renderer with options.

#### constructor(options?: RenderOptions)
Create renderer with options.

#### render(content: CanonicalContent): string
Render content to HTML string.

#### renderBlocks(blocks: ContentBlock[]): string
Render array of blocks.

## Examples

See `tests/fixtures/` for complete examples:
- `valid-problem.json` - Simple problem
- `valid-lesson.json` - Lesson with all block types
- `example-problem.json` - Complex problem with text wrapping

## License

MIT © azmath25
