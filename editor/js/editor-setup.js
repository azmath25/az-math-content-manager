// editor/js/editor-setup.js
// Initialize Editor.js instances

let mainEditor = null;
let solutionEditors = [];
let solutionCount = 0;

// Initialize main editor
document.addEventListener('DOMContentLoaded', () => {
  initializeMainEditor();
  setupContentTypeListener();
  checkForDraft();
});

function initializeMainEditor() {
  mainEditor = new EditorJS({
    holder: 'editorjs-main',
    placeholder: 'Start typing your content... Use / for commands',
    
    tools: {
      header: {
        class: Header,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 2
        }
      },
      
      list: {
        class: List,
        inlineToolbar: true
      },
      
      quote: {
        class: Quote,
        inlineToolbar: true
      },
      
      math: {
        class: window.MathTool
      },
      
      image: {
        class: window.ImageWrapperTool
      }
    },
    
    onChange: (api, event) => {
      console.log('Content changed');
      autoSaveDraft();
    }
  });
}

function setupContentTypeListener() {
  const typeRadios = document.querySelectorAll('input[name="content-type"]');
  
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isLesson = e.target.value === 'lesson';
      
      // Update section title
      document.getElementById('main-section-title').textContent = 
        isLesson ? 'Lesson Content' : 'Problem Statement';
      
      // Show/hide solutions
      document.getElementById('solutions-section').style.display = 
        isLesson ? 'none' : 'block';
    });
  });
}

// Solution management
window.addSolution = function() {
  solutionCount++;
  const solutionId = `solution-${solutionCount}`;
  
  const solutionItem = document.createElement('div');
  solutionItem.className = 'solution-item';
  solutionItem.dataset.solutionId = solutionId;
  
  solutionItem.innerHTML = `
    <div class="solution-header">
      <input type="text" placeholder="Solution Title (e.g., Method 1: Factoring)" 
             class="solution-title" value="Solution ${solutionCount}">
      <button class="solution-remove" onclick="removeSolution('${solutionId}')">✕</button>
    </div>
    <div id="${solutionId}"></div>
  `;
  
  document.getElementById('solutions-list').appendChild(solutionItem);
  
  // Initialize editor for this solution
  const solutionEditor = new EditorJS({
    holder: solutionId,
    placeholder: 'Write your solution...',
    
    tools: {
      header: {
        class: Header,
        config: {
          levels: [3, 4],
          defaultLevel: 3
        }
      },
      
      list: {
        class: List,
        inlineToolbar: true
      },
      
      math: {
        class: window.MathTool
      },
      
      image: {
        class: window.ImageWrapperTool
      }
    },
    
    onChange: () => {
      autoSaveDraft();
    }
  });
  
  solutionEditors.push({
    id: solutionId,
    editor: solutionEditor
  });
};

window.removeSolution = function(solutionId) {
  if (!confirm('Remove this solution?')) return;
  
  // Remove from DOM
  const solutionItem = document.querySelector(`[data-solution-id="${solutionId}"]`);
  solutionItem.remove();
  
  // Remove from editors array
  solutionEditors = solutionEditors.filter(s => s.id !== solutionId);
  
  autoSaveDraft();
};

// Auto-save draft to localStorage
let autoSaveTimeout;
function autoSaveDraft() {
  clearTimeout(autoSaveTimeout);
  
  autoSaveTimeout = setTimeout(async () => {
    try {
      const data = await gatherAllData();
      localStorage.setItem('az-math-draft', JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
      
      console.log('✓ Draft auto-saved');
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, 2000);
}

// Check for draft on load
function checkForDraft() {
  const draft = localStorage.getItem('az-math-draft');
  
  if (draft) {
    try {
      const data = JSON.parse(draft);
      const age = Date.now() - data.timestamp;
      const minutes = Math.floor(age / 60000);
      
      if (confirm(`Found draft from ${minutes} minute(s) ago. Restore it?`)) {
        restoreDraft(data);
      } else {
        localStorage.removeItem('az-math-draft');
      }
    } catch (error) {
      console.warn('Failed to load draft:', error);
    }
  }
}

async function restoreDraft(data) {
  // Restore metadata
  if (data.id) document.getElementById('content-id').value = data.id;
  if (data.title) document.getElementById('content-title').value = data.title;
  if (data.category) document.getElementById('content-category').value = data.category;
  if (data.difficulty) document.getElementById('content-difficulty').value = data.difficulty;
  if (data.tags) document.getElementById('content-tags').value = data.tags.join(', ');
  
  // Restore content type
  if (data.contentType) {
    const radio = document.querySelector(`input[name="content-type"][value="${data.contentType}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }
  }
  
  // Restore main content
  if (data.statement && mainEditor) {
    setTimeout(() => {
      mainEditor.render({ blocks: data.statement });
    }, 500);
  }
  
  // Restore solutions
  if (data.solutions && data.solutions.length > 0) {
    data.solutions.forEach((solution, index) => {
      addSolution();
      
      setTimeout(() => {
        const solutionItem = document.querySelectorAll('.solution-item')[index];
        const titleInput = solutionItem.querySelector('.solution-title');
        titleInput.value = solution.title || `Solution ${index + 1}`;
        
        const solutionEditor = solutionEditors[index];
        if (solutionEditor) {
          solutionEditor.editor.render({ blocks: solution.blocks });
        }
      }, 700 + (index * 200));
    });
  }
  
  showNotification('✓ Draft restored', 'success');
}

// Gather all data from editors
async function gatherAllData() {
  const contentType = document.querySelector('input[name="content-type"]:checked').value;
  
  // Get metadata
  const metadata = {
    id: parseInt(document.getElementById('content-id').value) || null,
    title: document.getElementById('content-title').value.trim(),
    category: document.getElementById('content-category').value,
    difficulty: document.getElementById('content-difficulty').value,
    tags: document.getElementById('content-tags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  };
  
  // Get main content
  const mainData = await mainEditor.save();
  
  // Get solutions (if problem)
  let solutions = [];
  if (contentType === 'problem') {
    for (const sol of solutionEditors) {
      const solutionItem = document.querySelector(`[data-solution-id="${sol.id}"]`);
      const title = solutionItem.querySelector('.solution-title').value.trim();
      const blocks = await sol.editor.save();
      
      solutions.push({
        title: title,
        blocks: blocks.blocks
      });
    }
  }
  
  return {
    contentType,
    ...metadata,
    statement: mainData.blocks,
    solutions: solutions
  };
}

// Export functions
window.gatherAllData = gatherAllData;
window.mainEditor = mainEditor;
window.solutionEditors = solutionEditors;

// Utility: Show notification
function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification notification-${type}`;
  notif.textContent = message;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

window.showNotification = showNotification;
