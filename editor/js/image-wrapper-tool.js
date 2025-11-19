// editor/js/image-wrapper-tool.js
// Custom Editor.js image tool with perfect text wrapping

import { storage, ref, uploadBytes, getDownloadURL } from '../../shared/js/firebase-config.js';

class ImageWrapperTool {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      alt: data.alt || '',
      alignment: data.alignment || 'center',
      size: data.size || 'medium'
    };
    
    this.wrapper = null;
    this.imageEl = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('image-wrapper-block');
    
    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    imageContainer.dataset.alignment = this.data.alignment;
    imageContainer.dataset.size = this.data.size;
    
    if (this.data.url) {
      this.imageEl = document.createElement('img');
      this.imageEl.src = this.data.url;
      this.imageEl.alt = this.data.alt;
      this.imageEl.style.maxWidth = '100%';
      this.imageEl.style.borderRadius = 'var(--radius-md)';
      imageContainer.appendChild(this.imageEl);
      
      if (this.data.caption) {
        const captionEl = document.createElement('div');
        captionEl.classList.add('image-caption');
        captionEl.textContent = this.data.caption;
        imageContainer.appendChild(captionEl);
      }
    } else {
      // Upload prompt
      const uploadPrompt = document.createElement('div');
      uploadPrompt.classList.add('image-upload-prompt');
      uploadPrompt.innerHTML = `
        <div style="padding: 3rem; text-align: center; border: 2px dashed var(--gray-300); border-radius: var(--radius-md); background: var(--gray-50); cursor: pointer;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; color: var(--gray-400);">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <p style="margin: 0; font-weight: 600; color: var(--gray-600);">Click to upload image</p>
          <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--gray-500);">or paste URL</p>
        </div>
      `;
      
      if (!this.readOnly) {
        uploadPrompt.onclick = () => this.openImageModal();
      }
      
      imageContainer.appendChild(uploadPrompt);
    }
    
    this.wrapper.appendChild(imageContainer);
    
    // Controls
    if (!this.readOnly && this.data.url) {
      const controls = document.createElement('div');
      controls.classList.add('image-controls');
      controls.style.marginTop = 'var(--space-sm)';
      controls.style.display = 'flex';
      controls.style.gap = 'var(--space-sm)';
      controls.style.flexWrap = 'wrap';
      
      controls.innerHTML = `
        <button class="btn btn-sm btn-outline">✏️ Edit</button>
        <button class="btn btn-sm btn-secondary">🔄 Change</button>
      `;
      
      controls.querySelector('.btn-outline').onclick = () => this.openImageModal();
      controls.querySelector('.btn-secondary').onclick = () => this.changeImage();
      
      this.wrapper.appendChild(controls);
    }
    
    return this.wrapper;
  }

  openImageModal() {
    const modal = document.createElement('div');
    modal.className = 'math-modal-overlay';
    
    modal.innerHTML = `
      <div class="math-modal">
        <div class="math-modal-header">
          <h3>🖼️ ${this.data.url ? 'Edit' : 'Add'} Image</h3>
          <button class="math-modal-close">&times;</button>
        </div>
        
        <div class="math-modal-body">
          
          <!-- Upload Method -->
          <div style="margin-bottom: var(--space-lg);">
            <label class="math-input-label">Upload Method</label>
            <div style="display: flex; gap: var(--space-sm);">
              <label style="flex: 1; display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md); background: var(--gray-50); border: 2px solid var(--gray-300); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="upload-method" value="upload" checked style="width: auto;">
                <span>📁 Upload File</span>
              </label>
              <label style="flex: 1; display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md); background: var(--gray-50); border: 2px solid var(--gray-300); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="upload-method" value="url" style="width: auto;">
                <span>🔗 Enter URL</span>
              </label>
            </div>
          </div>
          
          <!-- File Upload -->
          <div id="upload-section">
            <label class="math-input-label">Select Image File</label>
            <input type="file" accept="image/*" class="w-full" style="padding: var(--space-md); border: 2px dashed var(--gray-300); border-radius: var(--radius-md); cursor: pointer;">
          </div>
          
          <!-- URL Input -->
          <div id="url-section" style="display: none;">
            <label class="math-input-label">Image URL</label>
            <input type="url" class="image-url-input" placeholder="https://..." value="${this.data.url}">
          </div>
          
          <!-- Preview -->
          <div id="image-preview" style="margin: var(--space-lg) 0; display: ${this.data.url ? 'block' : 'none'};">
            <label class="math-input-label">Preview</label>
            <img src="${this.data.url}" style="max-width: 100%; border-radius: var(--radius-md); border: 2px solid var(--gray-200);">
          </div>
          
          <!-- Caption & Alt -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-lg);">
            <div>
              <label class="math-input-label">Caption (optional)</label>
              <input type="text" class="image-caption-input" placeholder="Image caption..." value="${this.data.caption}">
            </div>
            <div>
              <label class="math-input-label">Alt Text</label>
              <input type="text" class="image-alt-input" placeholder="Description..." value="${this.data.alt}">
            </div>
          </div>
          
          <!-- Alignment -->
          <div style="margin-top: var(--space-lg);">
            <label class="math-input-label">Text Wrapping / Alignment</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm);">
              <button class="alignment-btn ${this.data.alignment === 'float-left' ? 'active' : ''}" data-align="float-left">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⬅️</div>
                <div style="font-size: 0.75rem;">Float Left</div>
              </button>
              <button class="alignment-btn ${this.data.alignment === 'center' ? 'active' : ''}" data-align="center">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⬆️</div>
                <div style="font-size: 0.75rem;">Center</div>
              </button>
              <button class="alignment-btn ${this.data.alignment === 'float-right' ? 'active' : ''}" data-align="float-right">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">➡️</div>
                <div style="font-size: 0.75rem;">Float Right</div>
              </button>
            </div>
            <p style="margin-top: var(--space-sm); font-size: 0.875rem; color: var(--gray-600);">
              💡 Float options allow text to wrap around the image
            </p>
          </div>
          
          <!-- Size -->
          <div style="margin-top: var(--space-lg);">
            <label class="math-input-label">Image Size</label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm);">
              <button class="size-btn ${this.data.size === 'small' ? 'active' : ''}" data-size="small">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⬜</div>
                <div style="font-size: 0.75rem;">Small</div>
              </button>
              <button class="size-btn ${this.data.size === 'medium' ? 'active' : ''}" data-size="medium">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">◼️</div>
                <div style="font-size: 0.75rem;">Medium</div>
              </button>
              <button class="size-btn ${this.data.size === 'large' ? 'active' : ''}" data-size="large">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⬛</div>
                <div style="font-size: 0.75rem;">Large</div>
              </button>
              <button class="size-btn ${this.data.size === 'full' ? 'active' : ''}" data-size="full">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🖼️</div>
                <div style="font-size: 0.75rem;">Full</div>
              </button>
            </div>
          </div>
          
        </div>
        
        <div class="math-modal-footer">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-primary save-btn">Save Image</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
      .alignment-btn, .size-btn {
        padding: var(--space-md);
        background: var(--gray-50);
        border: 2px solid var(--gray-300);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: center;
      }
      .alignment-btn:hover, .size-btn:hover {
        background: var(--primary-bg);
        border-color: var(--primary);
      }
      .alignment-btn.active, .size-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    `;
    document.head.appendChild(style);
    
    // Elements
    const fileInput = modal.querySelector('input[type="file"]');
    const urlInput = modal.querySelector('.image-url-input');
    const captionInput = modal.querySelector('.image-caption-input');
    const altInput = modal.querySelector('.image-alt-input');
    const preview = modal.querySelector('#image-preview');
    const previewImg = preview.querySelector('img');
    const uploadSection = modal.querySelector('#upload-section');
    const urlSection = modal.querySelector('#url-section');
    const methodRadios = modal.querySelectorAll('input[name="upload-method"]');
    const alignmentBtns = modal.querySelectorAll('.alignment-btn');
    const sizeBtns = modal.querySelectorAll('.size-btn');
    const closeBtn = modal.querySelector('.math-modal-close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');
    
    let selectedFile = null;
    let tempUrl = this.data.url;
    let tempAlignment = this.data.alignment;
    let tempSize = this.data.size;
    
    // Method toggle
    methodRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'upload') {
          uploadSection.style.display = 'block';
          urlSection.style.display = 'none';
        } else {
          uploadSection.style.display = 'none';
          urlSection.style.display = 'block';
        }
      });
    });
    
    // File upload
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFile = file;
        tempUrl = URL.createObjectURL(file);
        previewImg.src = tempUrl;
        preview.style.display = 'block';
      }
    });
    
    // URL input
    urlInput.addEventListener('input', (e) => {
      tempUrl = e.target.value;
      if (tempUrl) {
        previewImg.src = tempUrl;
        preview.style.display = 'block';
      }
    });
    
    // Alignment buttons
    alignmentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alignmentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tempAlignment = btn.dataset.align;
      });
    });
    
    // Size buttons
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tempSize = btn.dataset.size;
      });
    });
    
    const closeModal = () => modal.remove();
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Save
    saveBtn.addEventListener('click', async () => {
      if (!tempUrl && !selectedFile) {
        alert('Please upload an image or enter URL');
        return;
      }
      
      saveBtn.disabled = true;
      saveBtn.textContent = '⏳ Saving...';
      
      try {
        // Upload file if selected
        if (selectedFile) {
          const timestamp = Date.now();
          const filename = `image_${timestamp}.jpg`;
          const storageRef = ref(storage, `editor_images/${filename}`);
          
          await uploadBytes(storageRef, selectedFile);
          tempUrl = await getDownloadURL(storageRef);
        }
        
        // Update data
        this.data.url = tempUrl;
        this.data.caption = captionInput.value.trim();
        this.data.alt = altInput.value.trim() || 'Image';
        this.data.alignment = tempAlignment;
        this.data.size = tempSize;
        
        // Re-render
        this.wrapper.innerHTML = '';
        const newRender = this.render();
        this.wrapper.appendChild(...newRender.childNodes);
        
        closeModal();
        
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Image';
      }
    });
  }

  changeImage() {
    this.data.url = '';
    this.wrapper.innerHTML = '';
    const newRender = this.render();
    this.wrapper.appendChild(...newRender.childNodes);
    this.openImageModal();
  }

  save() {
    return this.data;
  }

  validate(savedData) {
    return savedData.url && savedData.url.trim().length > 0;
  }
}

window.ImageWrapperTool = ImageWrapperTool;
