// ===== CONFIGURATION =====
const CONFIG = {
    characterSets: {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        custom: ''
    },
    
    similarChars: 'il1Lo0O',
    
    strengthLevels: {
        weak: { min: 0, max: 25, color: '#ef4444', label: 'Weak' },
        fair: { min: 25, max: 50, color: '#f59e0b', label: 'Fair' },
        good: { min: 50, max: 75, color: '#3b82f6', label: 'Good' },
        strong: { min: 75, max: 90, color: '#10b981', label: 'Strong' },
        excellent: { min: 90, max: 100, color: '#8b5cf6', label: 'Excellent' }
    }
};

// ===== STATE MANAGEMENT =====
const state = {
    passwords: [],
    history: [],
    stats: {
        totalGenerated: 0,
        strongPasswords: 0,
        lastGenerated: null
    },
    settings: {
        theme: localStorage.getItem('theme') || 'light',
        autoCopy: true,
        saveHistory: true
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    body: document.body,
    
    // Sliders
    lengthSlider: document.getElementById('length-slider'),
    lengthValue: document.getElementById('length-value'),
    quantitySlider: document.getElementById('quantity-slider'),
    quantityValue: document.getElementById('quantity-value'),
    
    // Character sets
    setOptions: document.querySelectorAll('.set-option'),
    uppercaseSet: document.querySelector('[data-type="uppercase"]'),
    lowercaseSet: document.querySelector('[data-type="lowercase"]'),
    numbersSet: document.querySelector('[data-type="numbers"]'),
    symbolsSet: document.querySelector('[data-type="symbols"]'),
    customSet: document.querySelector('[data-type="custom"]'),
    customInputContainer: document.getElementById('custom-input-container'),
    customCharacters: document.getElementById('custom-characters'),
    
    // Advanced options
    excludeSimilar: document.getElementById('exclude-similar'),
    noDuplicates: document.getElementById('no-duplicates'),
    sequentialCheck: document.getElementById('sequential-check'),
    pronounceable: document.getElementById('pronounceable'),
    
    // Buttons
    generateBtn: document.getElementById('generate-btn'),
    quickGenerate: document.getElementById('quick-generate'),
    copyAll: document.getElementById('copy-all'),
    saveAll: document.getElementById('save-all'),
    clearResults: document.getElementById('clear-results'),
    
    // Display elements
    previewDisplay: document.getElementById('password-preview'),
    resultsContainer: document.getElementById('results-container'),
    historyList: document.getElementById('history-list'),
    emptyHistory: document.getElementById('empty-history'),
    
    // Stats
    charCount: document.getElementById('char-count'),
    entropyScore: document.getElementById('entropy-score'),
    totalGenerated: document.getElementById('total-generated'),
    strongPasswords: document.getElementById('strong-passwords'),
    lastGenerated: document.getElementById('last-generated'),
    
    // Strength analysis
    strengthFill: document.getElementById('strength-fill'),
    strengthScore: document.getElementById('strength-score'),
    detailLength: document.getElementById('detail-length'),
    detailVariety: document.getElementById('detail-variety'),
    detailEntropy: document.getElementById('detail-entropy'),
    detailPatterns: document.getElementById('detail-patterns'),
    
    // Toast container
    toastContainer: document.getElementById('toast-container'),
    
    // Year
    currentYear: document.getElementById('current-year')
};

// ===== INITIALIZATION =====
function init() {
    setCurrentYear();
    loadSettings();
    loadHistory();
    updateStatsDisplay();
    setupEventListeners();
    generateSamplePasswords();
    applyTheme();
}

// ===== THEME MANAGEMENT =====
function applyTheme() {
    elements.body.setAttribute('data-theme', state.settings.theme);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', state.settings.theme);
}

function toggleTheme() {
    state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    showToast('Theme changed', 'success');
}

// ===== PASSWORD GENERATION =====
function generatePassword(length = 16) {
    let charset = '';
    const selectedSets = [];

    // Build character set based on selected options
    if (elements.uppercaseSet.classList.contains('active')) {
        charset += CONFIG.characterSets.uppercase;
        selectedSets.push('uppercase');
    }
    if (elements.lowercaseSet.classList.contains('active')) {
        charset += CONFIG.characterSets.lowercase;
        selectedSets.push('lowercase');
    }
    if (elements.numbersSet.classList.contains('active')) {
        charset += CONFIG.characterSets.numbers;
        selectedSets.push('numbers');
    }
    if (elements.symbolsSet.classList.contains('active')) {
        charset += CONFIG.characterSets.symbols;
        selectedSets.push('symbols');
    }
    if (elements.customSet.classList.contains('active') && CONFIG.characterSets.custom) {
        charset += CONFIG.characterSets.custom;
        selectedSets.push('custom');
    }

    // Validate that at least one character set is selected
    if (charset.length === 0) {
        showToast('Please select at least one character set', 'error');
        return 'Select character sets first';
    }

    // Exclude similar characters if enabled
    if (elements.excludeSimilar.checked) {
        charset = charset.split('').filter(char =>
            !CONFIG.similarChars.includes(char)
        ).join('');
    }

    // Ensure charset is not empty after filtering
    if (charset.length === 0) {
        showToast('Character set is empty after filtering', 'error');
        return 'Invalid configuration';
    }

    // Generate sensible password with names and number sequences
    let password = generateSensiblePassword(length, selectedSets);

    // Apply additional constraints
    if (elements.noDuplicates.checked) {
        password = removeDuplicates(password);
    }

    if (elements.sequentialCheck.checked) {
        password = preventSequential(password);
    }

    return password;
}

function generateSensiblePassword(length, selectedSets) {
    // Arrays of word parts for generating sensible passwords
    const prefixes = ['Sun', 'Moon', 'Star', 'Blue', 'Red', 'Green', 'Quick', 'Fast', 'Smart', 'Bright', 'Dark', 'Light', 'Cool', 'Hot', 'Cold', 'Warm', 'Big', 'Small', 'Tall', 'Short'];
    const suffixes = ['Fire', 'Wind', 'Rain', 'Snow', 'Tree', 'Rock', 'Hill', 'Lake', 'River', 'Sea', 'Sky', 'Cloud', 'Storm', 'Wave', 'Flower', 'Leaf', 'Root', 'Branch', 'Path', 'Road'];
    const adjectives = ['Happy', 'Sad', 'Angry', 'Calm', 'Wild', 'Tame', 'Free', 'Bound', 'Pure', 'Mixed', 'Clear', 'Cloudy', 'Sharp', 'Blunt', 'Sweet', 'Sour', 'Bitter', 'Salty'];

    let password = '';

    // Generate password with sensible structure
    if (length >= 8) {
        // For longer passwords, create word-like structures with numbers
        const structure = Math.floor(Math.random() * 4);

        switch (structure) {
            case 0: // Word + Number + Word
                password = getRandomItem(prefixes) + getRandomNumber(10, 99) + getRandomItem(suffixes).toLowerCase();
                break;
            case 1: // Adjective + Word + Number
                password = getRandomItem(adjectives) + getRandomItem(suffixes).toLowerCase() + getRandomNumber(10, 99);
                break;
            case 2: // Word + Number + Suffix
                password = getRandomItem(prefixes) + getRandomNumber(100, 999) + getRandomItem(['er', 'ing', 'ed', 'ly', 'y']).toLowerCase();
                break;
            case 3: // Mixed structure
                password = getRandomItem(prefixes) + getRandomNumber(1, 9) + getRandomItem(suffixes).toLowerCase() + getRandomNumber(10, 99);
                break;
        }

        // Ensure password meets length requirements
        if (password.length > length) {
            password = password.substring(0, length);
        } else if (password.length < length) {
            // Add random characters to reach desired length
            const remaining = length - password.length;
            const extraChars = generateRandomChars(remaining, selectedSets);
            password += extraChars;
        }
    } else {
        // For shorter passwords, use simpler structure
        password = getRandomItem(prefixes).substring(0, length - 2) + getRandomNumber(10, 99);
        password = password.substring(0, length);
    }

    return password;
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomChars(length, selectedSets) {
    let charset = '';

    // Build charset from selected sets
    if (selectedSets.includes('uppercase')) charset += CONFIG.characterSets.uppercase;
    if (selectedSets.includes('lowercase')) charset += CONFIG.characterSets.lowercase;
    if (selectedSets.includes('numbers')) charset += CONFIG.characterSets.numbers;
    if (selectedSets.includes('symbols')) charset += CONFIG.characterSets.symbols;
    if (selectedSets.includes('custom')) charset += CONFIG.characterSets.custom;

    if (charset.length === 0) {
        charset = CONFIG.characterSets.lowercase + CONFIG.characterSets.numbers;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
}

function generateMultiplePasswords(count, length) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(length));
    }
    return passwords;
}

// ===== PASSWORD ANALYSIS =====
function analyzePasswordStrength(password) {
    let score = 0;
    const analysis = {
        length: password.length,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSymbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
        hasSequential: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
        hasRepeating: /(.)\1{2,}/.test(password),
        entropy: calculateEntropy(password)
    };
    
    // Length score (max 40 points)
    score += Math.min(password.length * 2, 40);
    
    // Character variety (max 30 points)
    let variety = 0;
    if (analysis.hasUpper) variety++;
    if (analysis.hasLower) variety++;
    if (analysis.hasNumbers) variety++;
    if (analysis.hasSymbols) variety++;
    score += variety * 7.5;
    
    // Entropy score (max 20 points)
    score += Math.min(analysis.entropy / 2, 20);
    
    // Penalties
    if (analysis.hasSequential) score -= 15;
    if (analysis.hasRepeating) score -= 10;
    if (password.length < 8) score -= 20;
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    return { score, analysis };
}

function calculateEntropy(password) {
    // Calculate character pool size
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/\d/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
    
    if (poolSize === 0) return 0;
    
    // Shannon entropy
    const frequency = {};
    for (const char of password) {
        frequency[char] = (frequency[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const char in frequency) {
        const probability = frequency[char] / password.length;
        entropy -= probability * Math.log2(probability);
    }
    
    return Math.round(entropy * 10) / 10;
}

// ===== PASSWORD UTILITIES =====
function removeDuplicates(str) {
    return [...new Set(str.split(''))].join('');
}

function preventSequential(str) {
    const sequentialPatterns = [
        'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl',
        'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv',
        'uvw', 'vwx', 'wxy', 'xyz', '012', '123', '234', '345', '456', '567',
        '678', '789'
    ];
    
    let result = str;
    for (const pattern of sequentialPatterns) {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(result)) {
            // Replace with random characters
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
            result = result.replace(regex, match => 
                match.split('').map(() => randomChar()).join('')
            );
        }
    }
    
    return result;
}

function makePronounceable(str) {
    // Simple pronounceable password algorithm
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
        if (i % 2 === 0) {
            result += consonants[Math.floor(Math.random() * consonants.length)];
        } else {
            result += vowels[Math.floor(Math.random() * vowels.length)];
        }
    }
    
    return result;
}

// ===== DISPLAY FUNCTIONS =====
function updatePreview() {
    const length = parseInt(elements.lengthSlider.value);
    const quantity = parseInt(elements.quantitySlider.value);
    const password = generatePassword(length);
    const { score, analysis } = analyzePasswordStrength(password);

    let previewContent = `
        <div class="password-preview-text">
            <div class="password-text">${password}</div>
            <div class="password-strength">
                <div class="strength-indicator" style="width: ${score}%; background: ${getStrengthColor(score)}"></div>
            </div>
        </div>
    `;

    // Show quantity info if more than 1 password will be generated
    if (quantity > 1) {
        previewContent += `
            <div class="preview-quantity-info">
                <small>Will generate ${quantity} passwords when you click "Generate Passwords"</small>
            </div>
        `;
    }

    elements.previewDisplay.innerHTML = previewContent;

    elements.charCount.textContent = password.length;
    elements.entropyScore.textContent = analysis.entropy;
}

function displayPasswords(passwords) {
    elements.resultsContainer.innerHTML = '';
    
    passwords.forEach((password, index) => {
        const { score, analysis } = analyzePasswordStrength(password);
        const strengthColor = getStrengthColor(score);
        
        const passwordElement = document.createElement('div');
        passwordElement.className = 'result-item fade-in';
        passwordElement.innerHTML = `
            <div class="password-strength">
                <div class="strength-indicator" style="width: ${score}%; background: ${strengthColor}"></div>
            </div>
            <div class="password-text">${password}</div>
            <div class="password-actions">
                <button class="btn-icon copy-password" title="Copy password" data-password="${password}">
                    <i class="far fa-copy"></i>
                </button>
                <button class="btn-icon save-password" title="Save to history" data-password="${password}">
                    <i class="far fa-save"></i>
                </button>
            </div>
        `;
        
        elements.resultsContainer.appendChild(passwordElement);
    });
    
    // Update overall strength analysis
    updateStrengthAnalysis(passwords);
}

function updateStrengthAnalysis(passwords) {
    if (passwords.length === 0) return;
    
    const avgScore = passwords.reduce((sum, pwd) => 
        sum + analyzePasswordStrength(pwd).score, 0) / passwords.length;
    
    const sampleAnalysis = analyzePasswordStrength(passwords[0]);
    
    elements.strengthFill.style.width = `${avgScore}%`;
    elements.strengthFill.style.background = getStrengthColor(avgScore);
    
    elements.strengthScore.innerHTML = `
        <span class="score-label">Score:</span>
        <span class="score-value">${Math.round(avgScore)}/100</span>
    `;
    
    elements.detailLength.textContent = passwords[0].length;
    elements.detailVariety.textContent = 
        (sampleAnalysis.analysis.hasUpper ? 1 : 0) +
        (sampleAnalysis.analysis.hasLower ? 1 : 0) +
        (sampleAnalysis.analysis.hasNumbers ? 1 : 0) +
        (sampleAnalysis.analysis.hasSymbols ? 1 : 0);
    elements.detailEntropy.textContent = sampleAnalysis.analysis.entropy;
    elements.detailPatterns.textContent = 
        sampleAnalysis.analysis.hasSequential || sampleAnalysis.analysis.hasRepeating ? 'Detected' : 'None';
}

function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    if (state.history.length === 0) {
        elements.emptyHistory.classList.remove('hidden');
        return;
    }
    
    elements.emptyHistory.classList.add('hidden');
    
    // Display last 10 items
    state.history.slice(0, 10).forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        historyItem.innerHTML = `
            <span class="password">${item.password}</span>
            <span class="timestamp">${formatTime(item.timestamp)}</span>
        `;
        elements.historyList.appendChild(historyItem);
    });
}

function updateStatsDisplay() {
    elements.totalGenerated.textContent = state.stats.totalGenerated;
    elements.strongPasswords.textContent = state.stats.strongPasswords;
    elements.lastGenerated.textContent = 
        state.stats.lastGenerated ? formatTime(state.stats.lastGenerated) : '--:--';
}

// ===== UTILITY FUNCTIONS =====
function getStrengthColor(score) {
    for (const level in CONFIG.strengthLevels) {
        const range = CONFIG.strengthLevels[level];
        if (score >= range.min && score < range.max) {
            return range.color;
        }
    }
    return CONFIG.strengthLevels.excellent.color;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Password copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy to clipboard', 'error');
        console.error('Copy failed:', err);
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show`;
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
        </div>
        <div class="toast-content">
            <strong>${type === 'success' ? 'Success' : 'Error'}</strong>
            <span>${message}</span>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function saveToHistory(password) {
    const historyItem = {
        password,
        timestamp: Date.now(),
        strength: analyzePasswordStrength(password).score
    };
    
    state.history.unshift(historyItem);
    
    // Keep only last 50 items
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    if (historyItem.strength >= 75) {
        state.stats.strongPasswords++;
    }
    
    saveHistory();
    updateHistoryDisplay();
}

// ===== STORAGE FUNCTIONS =====
function saveHistory() {
    try {
        localStorage.setItem('passwordHistory', JSON.stringify(state.history));
        localStorage.setItem('passwordStats', JSON.stringify(state.stats));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function loadHistory() {
    try {
        const savedHistory = localStorage.getItem('passwordHistory');
        const savedStats = localStorage.getItem('passwordStats');
        
        if (savedHistory) {
            state.history = JSON.parse(savedHistory);
        }
        
        if (savedStats) {
            state.stats = JSON.parse(savedStats);
        }
        
        updateHistoryDisplay();
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('passwordSettings');
        if (savedSettings) {
            state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('passwordSettings', JSON.stringify(state.settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

function setCurrentYear() {
    elements.currentYear.textContent = new Date().getFullYear();
}

// ===== SAMPLE DATA =====
function generateSamplePasswords() {
    if (state.history.length === 0) {
        const samples = [
            'Tr0ub4dor&3',
            'correcthorsebatterystaple',
            'MyP@ssw0rd!2024',
            'W1nterIsC0ming!',
            'Secure@123#'
        ];
        
        samples.forEach(password => {
            saveToHistory(password);
        });
        
        state.stats.totalGenerated = samples.length;
        state.stats.lastGenerated = Date.now();
        updateStatsDisplay();
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Slider updates
    elements.lengthSlider.addEventListener('input', function() {
        elements.lengthValue.textContent = this.value;
        updatePreview();
    });
    
    elements.quantitySlider.addEventListener('input', function() {
        elements.quantityValue.textContent = this.value;
        updatePreview();
    });
    
    // Character set toggles
    elements.setOptions.forEach(option => {
        option.addEventListener('click', function() {
            const checkbox = this.querySelector('input');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('active');

            // Special handling for custom set
            if (this.dataset.type === 'custom') {
                if (this.classList.contains('active')) {
                    elements.customInputContainer.style.display = 'block';
                    elements.customCharacters.focus();
                } else {
                    elements.customInputContainer.style.display = 'none';
                    CONFIG.characterSets.custom = '';
                    elements.customCharacters.value = '';
                }
            }

            updatePreview();
        });
    });

    // Custom characters input
    elements.customCharacters.addEventListener('input', function() {
        CONFIG.characterSets.custom = this.value;
        updatePreview();
    });
    
    // Advanced options
    elements.excludeSimilar.addEventListener('change', updatePreview);
    elements.noDuplicates.addEventListener('change', updatePreview);
    elements.sequentialCheck.addEventListener('change', updatePreview);
    elements.pronounceable.addEventListener('change', updatePreview);
    
    // Generate buttons
    elements.generateBtn.addEventListener('click', () => {
        const length = parseInt(elements.lengthSlider.value);
        const quantity = parseInt(elements.quantitySlider.value);
        
        state.passwords = generateMultiplePasswords(quantity, length);
        displayPasswords(state.passwords);
        
        // Update stats
        state.stats.totalGenerated += quantity;
        state.stats.lastGenerated = Date.now();
        updateStatsDisplay();
        
        showToast(`${quantity} password${quantity > 1 ? 's' : ''} generated!`, 'success');
    });
    
    elements.quickGenerate.addEventListener('click', () => {
        // Quick generate with default settings
        elements.lengthSlider.value = 12;
        elements.lengthValue.textContent = '12';
        elements.quantitySlider.value = 1;
        elements.quantityValue.textContent = '1';
        
        state.passwords = generateMultiplePasswords(1, 12);
        displayPasswords(state.passwords);
        
        state.stats.totalGenerated++;
        state.stats.lastGenerated = Date.now();
        updateStatsDisplay();
        
        showToast('Quick password generated!', 'success');
    });
    
    // Action buttons
    elements.copyAll.addEventListener('click', () => {
        if (state.passwords.length === 0) {
            showToast('No passwords to copy', 'error');
            return;
        }
        copyToClipboard(state.passwords.join('\n'));
    });
    
    elements.saveAll.addEventListener('click', () => {
        if (state.passwords.length === 0) {
            showToast('No passwords to save', 'error');
            return;
        }
        
        state.passwords.forEach(password => {
            saveToHistory(password);
        });
        
        showToast('All passwords saved to history!', 'success');
    });
    
    elements.clearResults.addEventListener('click', () => {
        state.passwords = [];
        elements.resultsContainer.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-key"></i>
                <p>No passwords generated yet</p>
                <p class="empty-desc">Click "Generate Passwords" to get started</p>
            </div>
        `;
        
        // Reset strength analysis
        elements.strengthFill.style.width = '0%';
        elements.strengthScore.innerHTML = `
            <span class="score-label">Score:</span>
            <span class="score-value">0/100</span>
        `;
        
        showToast('Results cleared', 'success');
    });
    
    // Delegate events for dynamically created buttons
    elements.resultsContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-password');
        const saveBtn = e.target.closest('.save-password');
        
        if (copyBtn) {
            const password = copyBtn.dataset.password;
            copyToClipboard(password);
        }
        
        if (saveBtn) {
            const password = saveBtn.dataset.password;
            saveToHistory(password);
        }
    });
    
    // History items click to copy
    elements.historyList.addEventListener('click', (e) => {
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            const password = historyItem.querySelector('.password').textContent;
            copyToClipboard(password);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + G to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            elements.generateBtn.click();
        }
        
        // Ctrl/Cmd + C to copy all
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.shiftKey) {
            e.preventDefault();
            elements.copyAll.click();
        }
        
        // Space for quick generate
        if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
            e.preventDefault();
            elements.quickGenerate.click();
        }
    });
    
    // Initialize preview
    updatePreview();
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);