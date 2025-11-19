// editor/js/math-tool.js
// Custom Editor.js tool for LaTeX math input

class MathTool {
  static get toolbox() {
    return {
      title: 'Math',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    
    this.data = {
      latex: data.latex || '',
      display: data.display !== undefined ? data.display : false
    };
    
    this.wrapper = null;
    this.mathContainer = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('math-block');
    
    // Math display container
    this.mathContainer = document.createElement('div');
    this.mathContainer.classList.add(this.data.display ? 'math-display' : 'math-inline');
    this.wrapper.appendChild(this.mathContainer);
    
    if (this.data.latex) {
      this.renderMath();
    } else {
      this.mathContainer.innerHTML = '<span style="color: var(--gray-400); font-style: italic;">Click to enter math...</span>';
    }
    
    // Edit button
    if (!this.readOnly) {
      const editBtn = document.createElement('button');
      editBtn.classList.add('btn', 'btn-sm', 'btn-outline');
      editBtn.textContent = '✏️ Edit Math';
      editBtn.style.marginTop = 'var(--space-sm)';
      editBtn.onclick = () => this.openMathModal();
      this.wrapper.appendChild(editBtn);
    }
    
    return this.wrapper;
  }

  renderMath() {
    const wrappedLatex = this.data.display ? 
      `$$${this.data.latex}$$` : 
      `$${this.data.latex}$`;
    
    this.mathContainer.innerHTML = wrappedLatex;
    
    // Typeset with MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([this.mathContainer]).catch(err => {
        console.error('MathJax error:', err);
        this.mathContainer.innerHTML = `<span style="color: var(--error);">Invalid LaTeX: ${this.data.latex}</span>`;
      });
    }
  }

  openMathModal() {
    const modal = document.createElement('div');
    modal.className = 'math-modal-overlay';
    
    modal.innerHTML = `
      <div class="math-modal">
        <div class="math-modal-header">
          <h3>📐 Edit Math</h3>
          <button class="math-modal-close">&times;</button>
        </div>
        
        <div class="math-modal-body">
          <div class="math-mode-toggle">
            <label>
              <input type="radio" name="math-mode" value="inline" ${!this.data.display ? 'checked' : ''}>
              <span>Inline: <code>$...$</code></span>
            </label>
            <label>
              <input type="radio" name="math-mode" value="display" ${this.data.display ? 'checked' : ''}>
              <span>Display: <code>$$...$$</code></span>
            </label>
          </div>
          
          <label class="math-input-label">LaTeX Code</label>
          <textarea class="math-input" placeholder="e.g., x^2 + y^2 = r^2&#10;or \\frac{a}{b}">${this.data.latex}</textarea>
          
          <div class="math-examples">
            <strong>Quick examples:</strong>
            <button class="math-example-btn" data-latex="x^2">x²</button>
            <button class="math-example-btn" data-latex="\\frac{a}{b}">a/b</button>
            <button class="math-example-btn" data-latex="\\sqrt{x}">√x</button>
            <button class="math-example-btn" data-latex="\\sum_{i=1}^{n}">Σ</button>
            <button class="math-example-btn" data-latex="\\int_{a}^{b}">∫</button>
            <button class="math-example-btn" data-latex="\\alpha">α</button>
            <button class="math-example-btn" data-latex="\\beta">β</button>
            <button class="math-example-btn" data-latex="\\infty">∞</button>
            <button class="math-example-btn" data-latex="\\theta">θ</button>
            <button class="math-example-btn" data-latex="\\pi">π</button>
          </div>
          
          <label class="math-preview-label">Preview</label>
          <div class="math-preview">
            <small style="color: var(--gray-500);">Type LaTeX above to see preview</small>
          </div>
        </div>
        
        <div class="math-modal-footer">
          <button class="btn btn-secondary math-cancel-btn">Cancel</button>
          <button class="btn btn-primary math-save-btn">Save Math</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const latexInput = modal.querySelector('.math-input');
    const previewArea = modal.querySelector('.math-preview');
    const closeBtn = modal.querySelector('.math-modal-close');
    const cancelBtn = modal.querySelector('.math-cancel-btn');
    const saveBtn = modal.querySelector('.math-save-btn');
    const modeRadios = modal.querySelectorAll('input[name="math-mode"]');
    const exampleBtns = modal.querySelectorAll('.math-example-btn');
    
    latexInput.focus();
    latexInput.setSelectionRange(latexInput.value.length, latexInput.value.length);
    
    // Example buttons
    exampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        latexInput.value += btn.dataset.latex;
        latexInput.dispatchEvent(new Event('input'));
        latexInput.focus();
      });
    });
    
    // Live preview
    let previewTimeout;
    const updatePreview = () => {
      clearTimeout(previewTimeout);
      previewTimeout = setTimeout(() => {
        const latex = latexInput.value.trim();
        if (latex) {
          const mode = modal.querySelector('input[name="math-mode"]:checked').value;
          const wrapped = mode === 'inline' ? `$${latex}$` : `$$${latex}$$`;
          previewArea.innerHTML = wrapped;
          
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([previewArea]).catch(err => {
              previewArea.innerHTML = '<small style="color: var(--error);">Invalid LaTeX syntax</small>';
            });
          }
        } else {
          previewArea.innerHTML = '<small style="color: var(--gray-500);">Type LaTeX above to see preview</small>';
        }
      }, 500);
    };
    
    latexInput.addEventListener('input', updatePreview);
    modeRadios.forEach(radio => radio.addEventListener('change', updatePreview));
    
    // Initial preview
    if (this.data.latex) {
      updatePreview();
    }
    
    const closeModal = () => modal.remove();
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Enter to save
    latexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        saveBtn.click();
      }
    });
    
    // Escape to cancel
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
    
    // Save
    saveBtn.addEventListener('click', () => {
      const latex = latexInput.value.trim();
      if (!latex) {
        alert('Please enter LaTeX code');
        return;
      }
      
      const mode = modal.querySelector('input[name="math-mode"]:checked').value;
      
      this.data.latex = latex;
      this.data.display = (mode === 'display');
      
      this.mathContainer.className = this.data.display ? 'math-display' : 'math-inline';
      this.renderMath();
      
      closeModal();
    });
  }

  save() {
    return this.data;
  }

  validate(savedData) {
    return savedData.latex && savedData.latex.trim().length > 0;
  }
}

// Export for Editor.js
window.MathTool = MathTool;
