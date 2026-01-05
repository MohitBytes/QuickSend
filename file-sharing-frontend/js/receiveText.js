// DOM Elements
const codeInput = document.getElementById('codeInput');
const receiveBtn = document.getElementById('receiveBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const copyTextBtn = document.getElementById('copyTextBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  if (codeInput) {
    codeInput.addEventListener('input', handleCodeInput);
    codeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        receiveText();
      }
    });
    codeInput.focus();
  }
  
  if (receiveBtn) {
    receiveBtn.addEventListener('click', receiveText);
  }
  
  if (copyTextBtn) {
    copyTextBtn.addEventListener('click', copyToClipboard);
  }
});

function handleCodeInput(e) {
  // Only allow digits
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
}

async function receiveText() {
  const code = codeInput.value.trim();
  
  if (!code || code.length !== 6) {
    showError('Please enter a valid 6-digit code');
    return;
  }
  
  // Validate code format (only digits)
  if (!/^\d{6}$/.test(code)) {
    showError('Code must contain only digits');
    return;
  }
  
  // Show loading state
  receiveBtn.disabled = true;
  btnText.textContent = 'Receiving...';
  spinner.style.display = 'block';
  
  try {
    const response = await fetch(`${API_BASE}/text/${code}`);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Invalid or expired code. Please check and try again.');
      } else if (response.status === 400) {
        throw new Error('Invalid code format. Please enter 6 digits.');
      } else {
        throw new Error(data.error || 'Failed to receive text');
      }
    }
    
    // Show the text
    showText(data.text);
    
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to receive text. Please try again.');
    
    // Reset button state
    receiveBtn.disabled = false;
    btnText.textContent = 'Receive Text';
    spinner.style.display = 'none';
  }
}

function showText(text) {
  const receiveCard = document.querySelector('.receive-card');
  const textDisplayCard = document.getElementById('textDisplayCard');
  const textDisplay = document.getElementById('textDisplay');
  
  if (receiveCard) receiveCard.style.display = 'none';
  if (textDisplayCard) textDisplayCard.style.display = 'block';
  if (textDisplay) {
    textDisplay.value = text;
    // Auto-resize textarea to fit content
    textDisplay.style.height = 'auto';
    textDisplay.style.height = Math.min(textDisplay.scrollHeight, 500) + 'px';
  }
}

function showError(message) {
  const receiveCard = document.querySelector('.receive-card');
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  
  if (receiveCard) receiveCard.style.display = 'none';
  if (errorCard) errorCard.style.display = 'block';
  if (errorMessage) errorMessage.textContent = message;
}

async function copyToClipboard() {
  const textDisplay = document.getElementById('textDisplay');
  const text = textDisplay.value;
  const copySuccess = document.getElementById('copySuccess');
  
  try {
    await navigator.clipboard.writeText(text);
    
    // Show success message
    if (copySuccess) {
      copySuccess.style.display = 'inline';
      setTimeout(() => {
        copySuccess.style.display = 'none';
      }, 2000);
    }
    
    // Visual feedback on button
    const originalText = copyTextBtn.innerHTML;
    copyTextBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Copied!
    `;
    copyTextBtn.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
      copyTextBtn.innerHTML = originalText;
      copyTextBtn.style.backgroundColor = '';
    }, 2000);
    
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy text to clipboard');
  }
}
