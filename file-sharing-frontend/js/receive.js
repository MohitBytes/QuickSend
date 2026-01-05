// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  const codeInput = document.getElementById('codeInput');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadFile);
  }
  
  // Allow Enter key to trigger download
  if (codeInput) {
    codeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        downloadFile(e);
      }
    });
    
    // Auto-format input to only accept numbers
    codeInput.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '').substring(0, 6);
    });
  }
});

async function downloadFile(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const codeInput = document.getElementById('codeInput');
  const code = codeInput ? codeInput.value.trim() : '';
  
  if (!code) {
    showError('Please enter a code');
    return false;
  }
  
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    showError('Please enter a valid 6-digit code');
    return false;
  }
  
  // Show loading state
  const downloadBtn = document.getElementById('downloadBtn');
  const btnText = downloadBtn ? downloadBtn.querySelector('#btnText') : null;
  const spinner = downloadBtn ? downloadBtn.querySelector('#spinner') : null;
  
  if (downloadBtn) downloadBtn.disabled = true;
  if (btnText) btnText.textContent = 'Validating...';
  if (spinner) spinner.style.display = 'block';
  
  try {
    // Validate code with backend first
    const statusRes = await fetch(API_BASE + '/status/' + code);
    
    if (!statusRes.ok) {
      showError('Invalid code. Please check and try again.');
      resetButton(downloadBtn, btnText, spinner);
      return false;
    }
    
    const statusData = await statusRes.json();
    
    if (statusData.expired) {
      showError('This code has expired. Files are only available for 10 minutes.');
      resetButton(downloadBtn, btnText, spinner);
      return false;
    }
    
    // Code is valid, proceed with download
    if (btnText) btnText.textContent = 'Downloading...';
    
    // Trigger download
    window.location.href = API_BASE + '/download/' + code;
    
    // Reset button after a delay
    setTimeout(() => {
      resetButton(downloadBtn, btnText, spinner);
    }, 2000);
    
  } catch (err) {
    console.error('Validation error:', err);
    showError('Unable to connect to server. Please check your connection.');
    resetButton(downloadBtn, btnText, spinner);
  }
  
  return false;
}

function resetButton(downloadBtn, btnText, spinner) {
  if (downloadBtn) downloadBtn.disabled = false;
  if (btnText) btnText.textContent = 'Download File';
  if (spinner) spinner.style.display = 'none';
}

function showError(message) {
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  const receiveCard = document.querySelector('.receive-card');
  
  if (errorMessage) errorMessage.textContent = message;
  if (errorCard) {
    errorCard.style.display = 'block';
    
    // Hide error card after 3 seconds
    setTimeout(() => {
      errorCard.style.display = 'none';
    }, 3000);
  }
}
