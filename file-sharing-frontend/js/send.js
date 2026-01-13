let selectedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const sendBtn = document.getElementById('sendBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      fileInput.click();
    });
  }
  
  if (dropZone) {
    dropZone.addEventListener('click', function(e) {
      if (selectedFiles.length === 0 && (e.target === dropZone || e.target.closest('.drop-zone-content'))) {
        fileInput.click();
      }
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  if (dropZone) {
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', uploadFile);
  }
  
  if (changeFileBtn) {
    changeFileBtn.addEventListener('click', () => {
      selectedFiles = [];
      showDropZone();
      fileInput.value = '';
    });
  }
  
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
    selectedFiles = Array.from(files);
    validateAndShowFiles();
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectedFiles = Array.from(files);
    validateAndShowFiles();
  }
}

function validateAndShowFiles() {
  if (selectedFiles.length > 20) {
    showError('Maximum 20 files allowed. Please select fewer files.');
    selectedFiles = [];
    return;
  }
  
  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const maxSize = 200 * 1024 * 1024; // 200MB
  
  if (totalSize > maxSize) {
    showError('Total file size exceeds 200MB. Please select smaller files.');
    selectedFiles = [];
    return;
  }
  
  if (selectedFiles.length === 1) {
    showFilePreview(selectedFiles[0]);
  } else {
    showMultipleFilesPreview(selectedFiles);
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

function showMultipleFilesPreview(files) {
  const dropZoneContent = document.getElementById('dropZoneContent');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const sendBtn = document.getElementById('sendBtn');
  
  if (dropZoneContent) dropZoneContent.style.display = 'none';
  if (filePreview) filePreview.style.display = 'flex';
  if (sendBtn) sendBtn.style.display = 'flex';
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  
  if (fileName) fileName.textContent = `${files.length} files selected (will be zipped)`;
  if (fileSize) fileSize.textContent = formatFileSize(totalSize);
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
  
  if (selectedFiles.length === 0) {
    showError('Please select at least one file');
    return;
  }
  
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
  selectedFiles.forEach(file => {
    formData.append('files', file);
  });
  
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
        
        if (uploadCard) uploadCard.style.display = 'none';
        showResult(data.code, data.zipped, data.fileCount);
      } catch (err) {
        console.error('Parse error:', err);
        showError('Failed to process server response');
      }
    } else {
      console.error('Upload failed with status:', xhr.status);
      try {
        const errorData = JSON.parse(xhr.responseText);
        showError(errorData.error || 'Upload failed: ' + xhr.statusText);
      } catch {
        showError('Upload failed: ' + xhr.statusText);
      }
    }
    
    if (sendBtn) sendBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send File';
    if (spinner) spinner.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
  };
  
  xhr.onerror = function() {
    console.error('Network error');
    showError('Network error. Please check if the server is running.');
    
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

function showResult(code, zipped, fileCount) {
  const resultCard = document.getElementById('resultCard');
  const codeDisplay = document.getElementById('codeDisplay');
  const resultMessage = document.querySelector('.result-message');
  
  if (resultCard) resultCard.style.display = 'block';
  if (codeDisplay) codeDisplay.textContent = code;
  
  if (resultMessage && zipped) {
    resultMessage.textContent = `${fileCount} files zipped. Share this code to receive the ZIP file.`;
  }
  
  startStatusPolling(code);
}

let statusPollingInterval = null;
let countdownInterval = null;

function startStatusPolling(code) {
  if (statusPollingInterval) {
    clearInterval(statusPollingInterval);
  }
  
  // Start countdown timer
  startCountdownTimer();
  
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
        stopCountdownTimer();
      }
    } catch (err) {
      console.error('Status polling error:', err);
    }
  }, 3000); 
}

function startCountdownTimer() {
  const expiryNotice = document.querySelector('.expiry-notice');
  if (!expiryNotice) return;
  
  // Stop any existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  // Set expiry time to 10 minutes from now
  const expiryTime = Date.now() + (10 * 60 * 1000);
  
  function updateTimer() {
    const now = Date.now();
    const remaining = expiryTime - now;
    
    if (remaining <= 0) {
      expiryNotice.textContent = '⏱️ Code has expired';
      expiryNotice.style.color = '#ef4444';
      clearInterval(countdownInterval);
      countdownInterval = null;
      return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    expiryNotice.textContent = `⏱️ Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Update immediately
  updateTimer();
  
  // Update every second
  countdownInterval = setInterval(updateTimer, 1000);
}

function stopCountdownTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function showDownloadNotification() {
  const downloadStatus = document.getElementById('downloadStatus');
  
  if (downloadStatus) {
    downloadStatus.style.display = 'flex';
    
    downloadStatus.style.animation = 'slideUp 0.4s ease';
    
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