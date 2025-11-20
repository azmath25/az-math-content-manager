// packages/core/src/renderer/html.ts
// Renders canonical content to HTML with perfect text wrapping

import {
  CanonicalContent,
  ContentBlock,
  ParagraphBlock,
  HeaderBlock,
  ListBlock,
  QuoteBlock,
  MathBlock,
  ImageBlock,
  Solution,
  IMAGE_SIZE_MAP
} from '../schema/types';

export interface RenderOptions {
  includeMetadata?: boolean;
  mathDelimiters?: 'mathjax' | 'katex';
  imageBaseUrl?: string;
  cssClasses?: {
    wrapper?: string;
    statement?: string;
    solution?: string;
  };
}

export class HTMLRenderer {
  private options: Required<RenderOptions>;

  constructor(options: RenderOptions = {}) {
    this.options = {
      includeMetadata: options.includeMetadata ?? true,
      mathDelimiters: options.mathDelimiters ?? 'mathjax',
      imageBaseUrl: options.imageBaseUrl ?? '',
      cssClasses: {
        wrapper: options.cssClasses?.wrapper ?? 'content-wrapper',
        statement: options.cssClasses?.statement ?? 'statement-block',
        solution: options.cssClasses?.solution ?? 'solution-block'
      }
    };
  }

  /**
   * Render complete content to HTML
   */
  render(content: CanonicalContent): string {
    const parts: string[] = [];

    // Metadata header
    if (this.options.includeMetadata) {
      parts.push(this.renderMetadata(content.metadata));
    }

    // Statement
    parts.push(`<div class="${this.options.cssClasses.statement}">`);
    parts.push(this.renderBlocks(content.statement));
    parts.push('</div>');

    // Solutions
    if (content.solutions && content.solutions.length > 0) {
      parts.push(this.renderSolutions(content.solutions));
    }

    return `<div class="${this.options.cssClasses.wrapper}">${parts.join('\n')}</div>`;
  }

  /**
   * Render metadata header
   */
  private renderMetadata(metadata: any): string {
    const tags = metadata.tags.map((tag: string) => 
      `<span class="badge badge-tag">#${this.escapeHtml(tag)}</span>`
    ).join(' ');

    return `
      <div class="content-metadata">
        <h1 class="content-title">${this.escapeHtml(metadata.title)}</h1>
        <div class="content-meta-info">
          <span class="badge badge-category">${this.escapeHtml(metadata.category)}</span>
          <span class="badge badge-difficulty badge-${metadata.difficulty.toLowerCase()}">${this.escapeHtml(metadata.difficulty)}</span>
          ${tags}
        </div>
      </div>
    `;
  }

  /**
   * Render array of blocks
   */
  renderBlocks(blocks: ContentBlock[]): string {
    return blocks.map(block => this.renderBlock(block)).join('\n');
  }

  /**
   * Render single block based on type
   */
  private renderBlock(block: ContentBlock): string {
    switch (block.type) {
      case 'paragraph':
        return this.renderParagraph(block as ParagraphBlock);
      case 'header':
        return this.renderHeader(block as HeaderBlock);
      case 'list':
        return this.renderList(block as ListBlock);
      case 'quote':
        return this.renderQuote(block as QuoteBlock);
      case 'math':
        return this.renderMath(block as MathBlock);
      case 'image':
        return this.renderImage(block as ImageBlock);
      default:
        console.warn('Unknown block type:', (block as any).type);
        return '';
    }
  }

  /**
   * Render paragraph block
   */
  private renderParagraph(block: ParagraphBlock): string {
    return `<div class="content-block"><p>${block.data.text}</p></div>`;
  }

  /**
   * Render header block
   */
  private renderHeader(block: HeaderBlock): string {
    const tag = `h${block.data.level}`;
    return `<div class="content-block"><${tag}>${this.escapeHtml(block.data.text)}</${tag}></div>`;
  }

  /**
   * Render list block
   */
  private renderList(block: ListBlock): string {
    const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
    const items = block.data.items
      .map(item => `<li>${item}</li>`)
      .join('');
    
    return `<div class="content-block"><${tag} class="content-list">${items}</${tag}></div>`;
  }

  /**
   * Render quote block
   */
  private renderQuote(block: QuoteBlock): string {
    const caption = block.data.caption 
      ? `<footer class="quote-caption">— ${this.escapeHtml(block.data.caption)}</footer>`
      : '';
    
    return `
      <div class="content-block">
        <blockquote class="content-quote">
          <p>${block.data.text}</p>
          ${caption}
        </blockquote>
      </div>
    `;
  }

  /**
   * Render math block
   */
  private renderMath(block: MathBlock): string {
    const delim = block.data.display ? '$$' : '$';
    const wrapped = `${delim}${block.data.latex}${delim}`;
    const className = block.data.display ? 'math-display' : 'math-inline';
    
    return `<div class="content-block ${className}">${wrapped}</div>`;
  }

  /**
   * Render image block with proper floating
   * THIS IS THE CRITICAL FUNCTION FOR TEXT WRAPPING
   */
  private renderImage(block: ImageBlock): string {
    const { url, alt, caption, alignment, size } = block.data;
    
    // Build CSS classes for alignment and size
    const alignClass = `align-${alignment}`;
    const sizeClass = `size-${size}`;
    
    // Build image element
    const imgUrl = this.options.imageBaseUrl + url;
    const imgElement = `<img src="${this.escapeHtml(imgUrl)}" alt="${this.escapeHtml(alt)}" loading="lazy">`;
    
    // Build caption if present
    const captionElement = caption 
      ? `<span class="image-caption">${this.escapeHtml(caption)}</span>`
      : '';
    
    // CRITICAL: For float-left and float-right, we DON'T wrap in content-block
    // This allows proper text wrapping
    if (alignment === 'float-left' || alignment === 'float-right') {
      return `
        <div class="image-block ${alignClass} ${sizeClass}">
          ${imgElement}
          ${captionElement}
        </div>
      `;
    }
    
    // For center alignment, wrap in content-block
    return `
      <div class="content-block">
        <div class="image-block ${alignClass} ${sizeClass}">
          ${imgElement}
          ${captionElement}
        </div>
      </div>
    `;
  }

  /**
   * Render solutions
   */
  private renderSolutions(solutions: Solution[]): string {
    const solutionsHtml = solutions.map((solution, index) => {
      return `
        <div class="${this.options.cssClasses.solution} clearfix">
          <h2 class="solution-title">${this.escapeHtml(solution.title)}</h2>
          ${this.renderBlocks(solution.blocks)}
        </div>
      `;
    }).join('\n');

    return `
      <div class="solutions-container">
        <h2 class="solutions-header">Solutions</h2>
        ${solutionsHtml}
      </div>
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render to DOM element (browser only)
   */
  renderToElement(content: CanonicalContent, container: HTMLElement): void {
    container.innerHTML = this.render(content);
    
    // Trigger MathJax typesetting if available
    if (typeof window !== 'undefined' && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise([container]).catch((err: any) => {
        console.error('MathJax rendering error:', err);
      });
    }
  }
}

/**
 * Quick render function
 */
export function renderToHTML(
  content: CanonicalContent, 
  options?: RenderOptions
): string {
  const renderer = new HTMLRenderer(options);
  return renderer.render(content);
}
