const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const sizeWarning = document.getElementById('sizeWarning');
const sendTextBtn = document.getElementById('sendTextBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const copyBtn = document.getElementById('copyBtn');

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
let statusCheckInterval = null;

document.addEventListener('DOMContentLoaded', function() {
  if (textInput) {
    textInput.addEventListener('input', handleTextInput);
  }
  
  if (sendTextBtn) {
    sendTextBtn.addEventListener('click', sendText);
  }
  
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCode);
  }
});

function handleTextInput() {
  const text = textInput.value;
  const sizeInBytes = new Blob([text]).size;
  
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
  charCount.textContent = `${sizeInMB} MB`;
  
  if (sizeInBytes > MAX_SIZE_BYTES) {
    sizeWarning.style.display = 'inline';
    sendTextBtn.disabled = true;
    sendTextBtn.classList.add('btn-disabled');
  } else {
    sizeWarning.style.display = 'none';
    sendTextBtn.disabled = text.trim().length === 0;
    sendTextBtn.classList.remove('btn-disabled');
  }
}

async function sendText() {
  const text = textInput.value.trim();
  
  if (!text) {
    showError('Please enter some text');
    return;
  }
  
  const sizeInBytes = new Blob([text]).size;
  if (sizeInBytes > MAX_SIZE_BYTES) {
    showError('Text size exceeds 2MB limit');
    return;
  }
  
  // Show loading state
  sendTextBtn.disabled = true;
  btnText.textContent = 'Sending...';
  spinner.style.display = 'block';
  
  try {
    const response = await fetch(`${API_BASE}/text/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('Service temporarily unavailable. Storage limit reached. Please try again later.');
      }
      throw new Error(data.error || 'Failed to send text');
    }
    
    showSuccess(data.code);
    
    startStatusPolling(data.code);
    
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to send text. Please try again.');
    
    sendTextBtn.disabled = false;
    btnText.textContent = 'Send Text';
    spinner.style.display = 'none';
  }
}

function showSuccess(code) {
  const textCard = document.querySelector('.text-card');
  const resultCard = document.getElementById('resultCard');
  const codeDisplay = document.getElementById('codeDisplay');
  
  if (textCard) textCard.style.display = 'none';
  if (resultCard) resultCard.style.display = 'block';
  if (codeDisplay) codeDisplay.textContent = code;
}

function showError(message) {
  const textCard = document.querySelector('.text-card');
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  
  if (textCard) textCard.style.display = 'none';
  if (errorCard) errorCard.style.display = 'block';
  if (errorMessage) errorMessage.textContent = message;
}

function copyCode() {
  const codeDisplay = document.getElementById('codeDisplay');
  const code = codeDisplay.textContent;
  
  navigator.clipboard.writeText(code).then(() => {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;
    copyBtn.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy code');
  });
}

function startStatusPolling(code) {
  statusCheckInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE}/text/status/${code}`);
      
      if (response.status === 404) {
        stopStatusPolling();
        return;
      }
      
      const data = await response.json();
      
      if (data.viewed) {
        showViewedStatus();
        stopStatusPolling();
      }
    } catch (error) {
      console.error('Status check error:', error);
      stopStatusPolling();
    }
  }, 3000);
  

  setTimeout(() => {
    stopStatusPolling();
  }, 10 * 60 * 1000);
}

function stopStatusPolling() {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
  }
}

function showViewedStatus() {
  const viewedStatus = document.getElementById('viewedStatus');
  if (viewedStatus) {
    viewedStatus.style.display = 'flex';
  }
}

window.addEventListener('beforeunload', () => {
  stopStatusPolling();
});
