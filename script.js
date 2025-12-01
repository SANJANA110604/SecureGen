// DOM Elements
const generateBtn = document.getElementById('generate');
const copyBtn = document.getElementById('copy');
const resetBtn = document.getElementById('reset');
const saveBtn = document.getElementById('save');
const passwordInput = document.getElementById('password');
const historyList = document.getElementById('history-list');
const emptyHistory = document.getElementById('empty-history');
const strengthBar = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');

// Character sets for password generation
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Similar characters to exclude if option is selected
const similarChars = 'il1Lo0O';

// Load password history from localStorage
let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];
updateHistoryDisplay();

// Generate password function
function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const includeUppercase = document.getElementById('uppercase').checked;
    const includeLowercase = document.getElementById('lowercase').checked;
    const includeNumbers = document.getElementById('numbers').checked;
    const includeSymbols = document.getElementById('symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;

    // Validate at least one character type is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        alert('Please select at least one character type!');
        return;
    }

    // Build character pool
    let charPool = '';
    if (includeUppercase) charPool += uppercaseChars;
    if (includeLowercase) charPool += lowercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    // Remove similar characters if option is selected
    if (excludeSimilar) {
        for (let char of similarChars) {
            charPool = charPool.replace(char, '');
        }
    }

    // Generate the password(s)
    let password = '';
    if (quantity === 1) {
        // Generate a single password
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charPool.length);
            password += charPool[randomIndex];
        }
    } else {
        // Generate multiple passwords separated by commas
        const passwords = [];
        for (let p = 0; p < quantity; p++) {
            let singlePassword = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charPool.length);
                singlePassword += charPool[randomIndex];
            }
            passwords.push(singlePassword);
        }
        password = passwords.join(', ');
    }

    // Display the generated password
    passwordInput.value = password;
    
    // Calculate and display password strength
    const strength = calculatePasswordStrength(password.split(', ')[0]);
    updateStrengthMeter(strength);
    
    // Add to history if it's a single password
    if (quantity === 1) {
        addToHistory(password);
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length contributes up to 40 points
    score += Math.min(password.length * 3, 40);
    
    // Character variety contributes up to 60 points
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    
    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
    score += (varietyCount - 1) * 15;
    
    // Deductions for patterns
    if (/(.)\1{2,}/.test(password)) score -= 20; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) score -= 15; // Only letters
    if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
    
    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));
    
    // Categorize strength
    if (score < 30) return {score, level: 'Weak', class: 'strength-weak'};
    if (score < 60) return {score, level: 'Fair', class: 'strength-fair'};
    if (score < 80) return {score, level: 'Good', class: 'strength-good'};
    return {score, level: 'Strong', class: 'strength-strong'};
}

// Update the strength meter
function updateStrengthMeter(strength) {
    strengthBar.className = '';
    strengthBar.classList.add(strength.class);
    strengthLabel.textContent = `${strength.level} (${strength.score}/100)`;
}

// Add password to history
function addToHistory(password) {
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const date = new Date().toLocaleDateString();
    
    passwordHistory.unshift({
        password,
        time: timestamp,
        date: date
    });
    
    // Keep only the last 10 passwords
    if (passwordHistory.length > 10) {
        passwordHistory = passwordHistory.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    
    // Update display
    updateHistoryDisplay();
}

// Update the history display
function updateHistoryDisplay() {
    // Clear current history list
    historyList.innerHTML = '';
    
    if (passwordHistory.length === 0) {
        emptyHistory.style.display = 'block';
        return;
    }
    
    emptyHistory.style.display = 'none';
    
    // Add each password to the history list
    passwordHistory.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-password">${item.password}</span>
            <span class="history-time">${item.date} ${item.time}</span>
        `;
        historyList.appendChild(li);
    });
}

// Copy password to clipboard
function copyToClipboard() {
    if (!passwordInput.value) {
        alert('No password to copy! Generate a password first.');
        return;
    }
    
    // For multiple passwords, just copy the first one
    const passwordToCopy = passwordInput.value.split(', ')[0];
    
    navigator.clipboard.writeText(passwordToCopy).then(() => {
        // Visual feedback for copying
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.backgroundColor = '#4caf50';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy password to clipboard');
    });
}

// Reset form
function resetForm() {
    document.getElementById('length').value = 12;
    document.getElementById('quantity').value = 1;
    document.getElementById('uppercase').checked = true;
    document.getElementById('lowercase').checked = true;
    document.getElementById('numbers').checked = true;
    document.getElementById('symbols').checked = true;
    document.getElementById('exclude-similar').checked = false;
    passwordInput.value = '';
    
    // Reset strength meter
    strengthBar.className = '';
    strengthBar.style.width = '0%';
    strengthLabel.textContent = 'None';
}

// Save password (simulates sending to Python backend)
function savePassword() {
    if (!passwordInput.value) {
        alert('No password to save! Generate a password first.');
        return;
    }
    
    // In a real implementation, this would send to a Python backend
    // For this demo, we'll simulate it with a message
    const passwordToSave = passwordInput.value.split(', ')[0];
    
    // Simulate API call to Python backend
    simulatePythonBackendCall(passwordToSave);
}

// Simulate calling Python backend
function simulatePythonBackendCall(password) {
    // Show loading state
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        // In a real implementation, you would use fetch() to call a Flask endpoint
        // For this demo, we'll just show a success message
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.style.backgroundColor = '#4caf50';
        
        // Log to console (simulating Python processing)
        console.log(`Password sent to Python backend: ${password}`);
        console.log('Python would process this password, possibly hashing it or storing it securely.');
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.backgroundColor = '';
            saveBtn.disabled = false;
        }, 2000);
        
        // Show alert
        alert(`Password saved successfully!\n\nIn a full implementation, this would be sent to a Python Flask backend for secure storage or additional processing.`);
    }, 1500);
}

// Event Listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
resetBtn.addEventListener('click', resetForm);
saveBtn.addEventListener('click', savePassword);

// Generate a password on page load
window.addEventListener('DOMContentLoaded', () => {
    // Generate an initial password
    generatePassword();
});

// Keyboard shortcut for generation (Ctrl+G or Cmd+G)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        generatePassword();
    }
});