// editor/js/editor-actions.js
// Handle save, publish, preview actions

import { db, storage } from '../../shared/js/firebase-config.js';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Preview content
window.previewContent = async function() {
  try {
    const data = await window.gatherAllData();
    
    const modal = document.getElementById('preview-modal');
    const content = document.getElementById('preview-content');
    
    // Build preview HTML
    let html = `
      <div style="padding: var(--space-lg); border-bottom: 2px solid var(--gray-200); background: var(--gray-50);">
        <h1 style="margin: 0 0 var(--space-sm);">${data.title || 'Untitled'}</h1>
        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
          <span class="badge badge-primary">${data.category}</span>
          <span class="badge badge-warning">${data.difficulty}</span>
          ${data.tags.map(tag => `<span class="badge">#${tag}</span>`).join('')}
        </div>
      </div>
      
      <div style="padding: var(--space-xl);">
        <h2>${data.contentType === 'lesson' ? 'Lesson Content' : 'Problem Statement'}</h2>
        ${renderBlocks(data.statement)}
        
        ${data.solutions && data.solutions.length > 0 ? `
          <h2 style="margin-top: var(--space-2xl);">Solutions</h2>
          ${data.solutions.map((sol, idx) => `
            <div style="margin-top: var(--space-xl); padding: var(--space-lg); background: var(--gray-50); border-radius: var(--radius-lg);">
              <h3 style="margin-top: 0;">${sol.title}</h3>
              ${renderBlocks(sol.blocks)}
            </div>
          `).join('')}
        ` : ''}
      </div>
    `;
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
    
    // Typeset math
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([content]);
    }
    
  } catch (error) {
    console.error('Preview error:', error);
    alert('Failed to generate preview: ' + error.message);
  }
};

window.closePreview = function() {
  document.getElementById('preview-modal').classList.add('hidden');
};

// Render blocks for preview
function renderBlocks(blocks) {
  if (!blocks || blocks.length === 0) {
    return '<p style="color: var(--gray-500);"><em>No content</em></p>';
  }
  
  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${block.data.text}</p>`;
      
      case 'header':
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
      
      case 'list':
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        return `<${tag}>${block.data.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
      
      case 'quote':
        return `<blockquote style="border-left: 4px solid var(--primary); padding-left: var(--space-md); color: var(--gray-600); font-style: italic;">${block.data.text}</blockquote>`;
      
      case 'math':
        const wrapped = block.data.display ? `$$${block.data.latex}$$` : `$${block.data.latex}$`;
        return `<div class="${block.data.display ? 'math-display' : 'math-inline'}">${wrapped}</div>`;
      
      case 'image':
        const alignClass = block.data.alignment === 'float-left' ? 'image-float-left' : 
                          block.data.alignment === 'float-right' ? 'image-float-right' : 
                          'image-center';
        const sizeMap = { small: '30%', medium: '50%', large: '70%', full: '100%' };
        const maxWidth = sizeMap[block.data.size] || '50%';
        
        return `
          <div style="text-align: ${block.data.alignment === 'center' ? 'center' : 'left'}; margin: var(--space-lg) 0;">
            <img src="${block.data.url}" 
                 alt="${block.data.alt}" 
                 class="${alignClass}"
                 style="max-width: ${maxWidth}; border-radius: var(--radius-md);">
            ${block.data.caption ? `<div style="text-align: center; font-size: 0.875rem; color: var(--gray-600); margin-top: var(--space-sm); font-style: italic;">${block.data.caption}</div>` : ''}
          </div>
        `;
      
      default:
        return '';
    }
  }).join('\n');
}

// Save draft
window.saveDraft = async function() {
  try {
    const data = await window.gatherAllData();
    
    if (!data.title) {
      alert('Please enter a title');
      return;
    }
    
    showLoading('Saving draft...');
    
    // Get or assign ID
    let id = data.id;
    if (!id) {
      id = await getNextId(data.contentType);
      document.getElementById('content-id').value = id;
    }
    
    // Prepare document
    const collectionName = data.contentType === 'lesson' ? 'lessons' : 'problems';
    const docData = {
      id: id,
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      tags: data.tags,
      statement: data.statement,
      solutions: data.solutions,
      draft: true,
      author: 'admin',
      timestamp: serverTimestamp()
    };
    
    // Save to Firestore
    await setDoc(doc(db, collectionName, String(id)), docData);
    
    hideLoading();
    window.showNotification('✓ Draft saved successfully', 'success');
    
  } catch (error) {
    hideLoading();
    console.error('Save draft error:', error);
    alert('Failed to save draft: ' + error.message);
  }
};

// Publish content
window.publishContent = async function() {
  try {
    const data = await window.gatherAllData();
    
    // Validate
    if (!data.title) {
      alert('Please enter a title');
      return;
    }
    
    if (!data.statement || data.statement.length === 0) {
      alert('Please add some content');
      return;
    }
    
    if (data.contentType === 'problem' && (!data.solutions || data.solutions.length === 0)) {
      if (!confirm('No solutions added. Publish anyway?')) {
        return;
      }
    }
    
    if (!confirm('Publish this content? It will be publicly visible.')) {
      return;
    }
    
    showLoading('Publishing...');
    
    // Get or assign ID
    let id = data.id;
    if (!id) {
      id = await getNextId(data.contentType);
      document.getElementById('content-id').value = id;
    }
    
    // Prepare document
    const collectionName = data.contentType === 'lesson' ? 'lessons' : 'problems';
    const docData = {
      id: id,
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      tags: data.tags,
      statement: data.statement,
      solutions: data.solutions,
      draft: false,
      author: 'admin',
      timestamp: serverTimestamp()
    };
    
    // Save to Firestore
    await setDoc(doc(db, collectionName, String(id)), docData);
    
    // Clear draft
    localStorage.removeItem('az-math-draft');
    
    hideLoading();
    window.showNotification('✓ Published successfully!', 'success');
    
    // Offer to view
    setTimeout(() => {
      if (confirm('Content published! View it now?')) {
        const page = data.contentType === 'lesson' ? 'lesson' : 'problem';
        window.open(`../viewer/${page}.html?id=${id}`, '_blank');
      }
    }, 500);
    
  } catch (error) {
    hideLoading();
    console.error('Publish error:', error);
    alert('Failed to publish: ' + error.message);
  }
};

// Clear all
window.clearAll = function() {
  if (!confirm('Clear all content? This cannot be undone.')) {
    return;
  }
  
  // Clear inputs
  document.getElementById('content-id').value = '';
  document.getElementById('content-title').value = '';
  document.getElementById('content-category').value = 'Algebra';
  document.getElementById('content-difficulty').value = 'Medium';
  document.getElementById('content-tags').value = '';
  
  // Clear main editor
  if (window.mainEditor) {
    window.mainEditor.clear();
  }
  
  // Clear solutions
  document.getElementById('solutions-list').innerHTML = '';
  window.solutionEditors = [];
  
  // Clear draft
  localStorage.removeItem('az-math-draft');
  
  window.showNotification('✓ Cleared', 'info');
};

// Get next available ID
async function getNextId(contentType) {
  try {
    const collectionName = contentType === 'lesson' ? 'lessons' : 'problems';
    const q = query(
      collection(db, collectionName),
      orderBy('id', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const highestId = snapshot.docs[0].data().id;
      return highestId + 1;
    }
    
    return 1;
    
  } catch (error) {
    console.warn('Error getting next ID:', error);
    return Date.now() % 10000; // Fallback
  }
}

// Loading overlay
function showLoading(message) {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.className = 'loading-overlay';
  
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <p style="margin: 0; font-weight: 600;">${message}</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
}
