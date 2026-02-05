// ===== PASSWORD VALIDATION MODULE =====
// Advanced password validation and security checks

class PasswordValidator {
    constructor() {
        this.validationRules = {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
            noSequential: true,
            noRepeating: true,
            noDictionary: true,
            noPersonalInfo: true
        };

        this.dictionaryWords = [
            'password', 'password1', '123456', 'qwerty', 'abc123', 'admin', 'root',
            'user', 'guest', 'login', 'welcome', 'admin123', 'letmein', 'monkey',
            'dragon', 'passw0rd', 'p@ssword', 'password!', 'qwerty123', 'iloveyou',
            'princess', 'rockyou', '123456789', '12345678', '12345', '1234567890',
            '1234567', '12345678910', 'password123', 'summer', 'winter', 'spring',
            'autumn', 'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];

        this.commonPatterns = [
            /(\d{3,})/g, // Three or more consecutive digits
            /([a-zA-Z])\1{2,}/g, // Three or more repeating characters
            /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/gi,
            /(012|123|234|345|456|567|678|789|890|901)/g,
            /(qwerty|asdf|zxcv)/gi
        ];
    }

    validatePassword(password, customRules = {}) {
        const rules = { ...this.validationRules, ...customRules };
        const result = {
            isValid: true,
            score: 0,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // Length validation
        if (password.length < rules.minLength) {
            result.errors.push(`Password must be at least ${rules.minLength} characters long`);
            result.isValid = false;
        } else if (password.length > rules.maxLength) {
            result.errors.push(`Password must not exceed ${rules.maxLength} characters`);
            result.isValid = false;
        } else {
            result.score += Math.min(password.length * 2, 40);
        }

        // Character requirements
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

        if (rules.requireUppercase && !hasUppercase) {
            result.errors.push('Password must contain at least one uppercase letter');
            result.isValid = false;
        } else if (hasUppercase) {
            result.score += 15;
        }

        if (rules.requireLowercase && !hasLowercase) {
            result.errors.push('Password must contain at least one lowercase letter');
            result.isValid = false;
        } else if (hasLowercase) {
            result.score += 15;
        }

        if (rules.requireNumbers && !hasNumbers) {
            result.errors.push('Password must contain at least one number');
            result.isValid = false;
        } else if (hasNumbers) {
            result.score += 15;
        }

        if (rules.requireSymbols && !hasSymbols) {
            result.errors.push('Password must contain at least one symbol');
            result.isValid = false;
        } else if (hasSymbols) {
            result.score += 15;
        }

        // Pattern checks
        if (rules.noSequential) {
            const sequentialPatterns = [
                'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl',
                'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv',
                'uvw', 'vwx', 'wxy', 'xyz', '012', '123', '234', '345', '456', '567',
                '678', '789'
            ];

            for (const pattern of sequentialPatterns) {
                if (password.toLowerCase().includes(pattern)) {
                    result.warnings.push('Password contains sequential characters');
                    result.score -= 10;
                    break;
                }
            }
        }

        if (rules.noRepeating) {
            if (/(.)\1{2,}/.test(password)) {
                result.warnings.push('Password contains repeating characters');
                result.score -= 10;
            }
        }

        if (rules.noDictionary) {
            const lowerPassword = password.toLowerCase();
            for (const word of this.dictionaryWords) {
                if (lowerPassword.includes(word)) {
                    result.warnings.push('Password contains common dictionary words');
                    result.score -= 20;
                    break;
                }
            }
        }

        // Entropy calculation
        const entropy = this.calculateEntropy(password);
        result.score += Math.min(entropy / 2, 20);

        // Suggestions
        if (entropy < 50) {
            result.suggestions.push('Consider using a longer password or more character types');
        }

        if (!hasSymbols && !hasNumbers) {
            result.suggestions.push('Add numbers or symbols to increase security');
        }

        if (password.length < 12) {
            result.suggestions.push('Use at least 12 characters for better security');
        }

        // Ensure score is within bounds
        result.score = Math.max(0, Math.min(100, Math.round(result.score)));

        return result;
    }

    calculateEntropy(password) {
        let poolSize = 0;
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/\d/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

        if (poolSize === 0) return 0;

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

    checkPasswordStrength(password) {
        const validation = this.validatePassword(password);
        let level = 'weak';

        if (validation.score >= 90) level = 'excellent';
        else if (validation.score >= 75) level = 'strong';
        else if (validation.score >= 50) level = 'good';
        else if (validation.score >= 25) level = 'fair';

        return {
            level,
            score: validation.score,
            validation
        };
    }

    generatePasswordSuggestions(basePassword) {
        const suggestions = [];
        const validation = this.validatePassword(basePassword);

        if (!validation.isValid) {
            // Generate suggestions to fix validation errors
            if (validation.errors.some(error => error.includes('uppercase'))) {
                suggestions.push(this.addUppercase(basePassword));
            }
            if (validation.errors.some(error => error.includes('lowercase'))) {
                suggestions.push(this.addLowercase(basePassword));
            }
            if (validation.errors.some(error => error.includes('number'))) {
                suggestions.push(this.addNumbers(basePassword));
            }
            if (validation.errors.some(error => error.includes('symbol'))) {
                suggestions.push(this.addSymbols(basePassword));
            }
        }

        // Always provide some variations
        suggestions.push(this.addLength(basePassword));
        suggestions.push(this.replaceSimilarChars(basePassword));
        suggestions.push(this.addComplexity(basePassword));

        return suggestions.filter(suggestion =>
            suggestion !== basePassword &&
            this.validatePassword(suggestion).isValid
        );
    }

    addUppercase(password) {
        if (/[A-Z]/.test(password)) return password;
        return password.charAt(0).toUpperCase() + password.slice(1);
    }

    addLowercase(password) {
        if (/[a-z]/.test(password)) return password;
        return password.toLowerCase().charAt(0).toLowerCase() + password.slice(1);
    }

    addNumbers(password) {
        if (/\d/.test(password)) return password;
        const numbers = '0123456789';
        const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
        return password + randomNum;
    }

    addSymbols(password) {
        if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return password;
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        return password + randomSymbol;
    }

    addLength(password) {
        if (password.length >= 12) return password;
        const additionalChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = password;
        while (result.length < 12) {
            result += additionalChars[Math.floor(Math.random() * additionalChars.length)];
        }
        return result;
    }

    replaceSimilarChars(password) {
        const similarChars = {
            'i': '1', 'l': '7', 'o': '0', 'O': '8', 'I': '9', 'L': '4'
        };
        return password.split('').map(char => similarChars[char] || char).join('');
    }

    addComplexity(password) {
        let result = password;
        const transformations = [
            () => result.charAt(0).toUpperCase() + result.slice(1),
            () => result + Math.floor(Math.random() * 100),
            () => result + '!@#$'[Math.floor(Math.random() * 4)],
            () => result.replace(/(.{2})/g, '$1' + Math.floor(Math.random() * 10))
        ];

        transformations.forEach(transform => {
            if (Math.random() > 0.5) {
                result = transform();
            }
        });

        return result;
    }

    analyzePasswordHistory(passwords) {
        const analysis = {
            averageLength: 0,
            averageScore: 0,
            commonPatterns: [],
            strengthDistribution: {
                weak: 0,
                fair: 0,
                good: 0,
                strong: 0,
                excellent: 0
            },
            uniquePasswords: new Set(),
            duplicateCount: 0
        };

        passwords.forEach(password => {
            const strength = this.checkPasswordStrength(password);
            analysis.averageLength += password.length;
            analysis.averageScore += strength.score;
            analysis.strengthDistribution[strength.level]++;
            analysis.uniquePasswords.add(password);
        });

        analysis.averageLength /= passwords.length;
        analysis.averageScore /= passwords.length;
        analysis.duplicateCount = passwords.length - analysis.uniquePasswords.size;

        // Find common patterns
        const patternCounts = {};
        passwords.forEach(password => {
            this.commonPatterns.forEach(pattern => {
                const matches = password.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        patternCounts[match] = (patternCounts[match] || 0) + 1;
                    });
                }
            });
        });

        analysis.commonPatterns = Object.entries(patternCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([pattern, count]) => ({ pattern, count }));

        return analysis;
    }
}

// ===== EXPORT VALIDATOR INSTANCE =====
const passwordValidator = new PasswordValidator();
