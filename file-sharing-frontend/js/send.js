// DOM Elements
let selectedFile = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const sendBtn = document.getElementById('sendBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  // Click to select file
  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      fileInput.click();
    });
  }
  
  // Drop zone click
  if (dropZone) {
    dropZone.addEventListener('click', function(e) {
      if (!selectedFile && (e.target === dropZone || e.target.closest('.drop-zone-content'))) {
        fileInput.click();
      }
    });
  }
  
  // File input change
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Drag and drop
  if (dropZone) {
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
  }
  
  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', uploadFile);
  }
  
  // Change file button
  if (changeFileBtn) {
    changeFileBtn.addEventListener('click', () => {
      selectedFile = null;
      showDropZone();
      fileInput.value = '';
    });
  }
  
  // Copy code button
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCode);
  }
});

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    selectedFile = files[0];
    showFilePreview(selectedFile);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectedFile = files[0];
    showFilePreview(selectedFile);
  }
}

function showFilePreview(file) {
  const dropZoneContent = document.getElementById('dropZoneContent');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const sendBtn = document.getElementById('sendBtn');
  
  if (dropZoneContent) dropZoneContent.style.display = 'none';
  if (filePreview) filePreview.style.display = 'flex';
  if (sendBtn) sendBtn.style.display = 'flex';
  
  if (fileName) fileName.textContent = file.name;
  if (fileSize) fileSize.textContent = formatFileSize(file.size);
}

function showDropZone() {
  const dropZoneContent = document.getElementById('dropZoneContent');
  const filePreview = document.getElementById('filePreview');
  const sendBtn = document.getElementById('sendBtn');
  
  if (dropZoneContent) dropZoneContent.style.display = 'flex';
  if (filePreview) filePreview.style.display = 'none';
  if (sendBtn) sendBtn.style.display = 'none';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function uploadFile(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (!selectedFile) {
    showError('Please select a file first');
    return;
  }
  
  // Show loading state
  const sendBtn = document.getElementById('sendBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');
  const uploadCard = document.querySelector('.upload-card');
  const progressContainer = document.getElementById('progressContainer');
  
  if (sendBtn) sendBtn.disabled = true;
  if (btnText) btnText.textContent = 'Uploading...';
  if (spinner) spinner.style.display = 'block';
  if (progressContainer) progressContainer.style.display = 'block';
  
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  // Use XMLHttpRequest for progress tracking
  const xhr = new XMLHttpRequest();
  
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      updateProgressBar(percent);
    }
  };
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText);
        console.log('Upload successful:', data);
        
        // Hide upload card and show result
        if (uploadCard) uploadCard.style.display = 'none';
        showResult(data.code);
      } catch (err) {
        console.error('Parse error:', err);
        showError('Failed to process server response');
      }
    } else {
      console.error('Upload failed with status:', xhr.status);
      showError('Upload failed: ' + xhr.statusText);
    }
    
    // Reset button state
    if (sendBtn) sendBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send File';
    if (spinner) spinner.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
  };
  
  xhr.onerror = function() {
    console.error('Network error');
    showError('Network error. Please check if the server is running.');
    
    // Reset button state
    if (sendBtn) sendBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send File';
    if (spinner) spinner.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
  };
  
  xhr.open('POST', API_BASE + '/upload', true);
  xhr.send(formData);
}

function updateProgressBar(percent) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressText) progressText.textContent = percent + '%';
}

function showResult(code) {
  const resultCard = document.getElementById('resultCard');
  const codeDisplay = document.getElementById('codeDisplay');
  
  if (resultCard) resultCard.style.display = 'block';
  if (codeDisplay) codeDisplay.textContent = code;
  
  // Start polling for download status
  startStatusPolling(code);
}

let statusPollingInterval = null;

function startStatusPolling(code) {
  // Clear any existing interval
  if (statusPollingInterval) {
    clearInterval(statusPollingInterval);
  }
  
  statusPollingInterval = setInterval(async () => {
    try {
      const res = await fetch(API_BASE + '/status/' + code);
      
      if (!res.ok) {
        console.error('Status check failed');
        return;
      }
      
      const data = await res.json();
      
      if (data.downloaded) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
        showDownloadNotification();
      }
      
      if (data.expired) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
      }
    } catch (err) {
      console.error('Status polling error:', err);
    }
  }, 3000); // Poll every 3 seconds
}

function showDownloadNotification() {
  const downloadStatus = document.getElementById('downloadStatus');
  
  if (downloadStatus) {
    downloadStatus.style.display = 'flex';
    
    // Animate in
    downloadStatus.style.animation = 'slideUp 0.4s ease';
    
    // Optional: Play a sound or show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('QuickSend', {
        body: 'Your file has been downloaded!',
        icon: '/favicon.ico'
      });
    }
  }
}

function showError(message) {
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  const uploadCard = document.querySelector('.upload-card');
  
  if (uploadCard) uploadCard.style.display = 'none';
  if (errorCard) errorCard.style.display = 'block';
  if (errorMessage) errorMessage.textContent = message;
}

function copyCode() {
  const codeDisplay = document.getElementById('codeDisplay');
  const copyBtn = document.getElementById('copyBtn');
  
  if (codeDisplay) {
    const code = codeDisplay.textContent;
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        showCopyFeedback();
      }).catch(err => {
        console.error('Failed to copy:', err);
        fallbackCopy(code);
      });
    } else {
      fallbackCopy(code);
    }
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback();
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback() {
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
    copyBtn.style.background = '#10b981';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.background = '';
    }, 2000);
  }
}