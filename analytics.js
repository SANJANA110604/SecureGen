// ===== PASSWORD ANALYTICS MODULE =====
// Advanced analytics and statistics for password generation

class PasswordAnalytics {
    constructor() {
        this.analyticsData = {
            generationStats: {
                totalGenerated: 0,
                averageLength: 0,
                averageScore: 0,
                generationTime: [],
                characterDistribution: {
                    uppercase: 0,
                    lowercase: 0,
                    numbers: 0,
                    symbols: 0
                }
            },
            securityMetrics: {
                strengthDistribution: {
                    weak: 0,
                    fair: 0,
                    good: 0,
                    strong: 0,
                    excellent: 0
                },
                entropyStats: {
                    average: 0,
                    min: 0,
                    max: 0,
                    distribution: []
                },
                patternAnalysis: {
                    sequential: 0,
                    repeating: 0,
                    dictionary: 0,
                    commonSequences: {}
                }
            },
            usagePatterns: {
                timeOfDay: {},
                dayOfWeek: {},
                sessionLength: [],
                featureUsage: {
                    customChars: 0,
                    excludeSimilar: 0,
                    noDuplicates: 0,
                    sequentialCheck: 0,
                    pronounceable: 0
                }
            },
            trends: {
                lengthOverTime: [],
                scoreOverTime: [],
                generationFrequency: []
            }
        };

        this.sessionStart = Date.now();
        this.loadAnalyticsData();
    }

    trackPasswordGeneration(password, options = {}) {
        const startTime = performance.now();
        const analysis = this.analyzePassword(password);
        const endTime = performance.now();

        // Update generation stats
        this.analyticsData.generationStats.totalGenerated++;
        this.analyticsData.generationStats.averageLength =
            (this.analyticsData.generationStats.averageLength * (this.analyticsData.generationStats.totalGenerated - 1) + password.length) /
            this.analyticsData.generationStats.totalGenerated;

        this.analyticsData.generationStats.averageScore =
            (this.analyticsData.generationStats.averageScore * (this.analyticsData.generationStats.totalGenerated - 1) + analysis.score) /
            this.analyticsData.generationStats.totalGenerated;

        this.analyticsData.generationStats.generationTime.push(endTime - startTime);

        // Update character distribution
        this.updateCharacterDistribution(password);

        // Update security metrics
        this.updateSecurityMetrics(analysis);

        // Update usage patterns
        this.updateUsagePatterns(options);

        // Update trends
        this.updateTrends(password.length, analysis.score);

        this.saveAnalyticsData();
    }

    analyzePassword(password) {
        const analysis = {
            score: 0,
            entropy: 0,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSymbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
            hasSequential: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
            hasRepeating: /(.)\1{2,}/.test(password),
            length: password.length
        };

        // Calculate entropy
        analysis.entropy = this.calculateEntropy(password);

        // Calculate score
        analysis.score = this.calculateScore(analysis);

        return analysis;
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

    calculateScore(analysis) {
        let score = 0;

        // Length score (max 40 points)
        score += Math.min(analysis.length * 2, 40);

        // Character variety (max 30 points)
        let variety = 0;
        if (analysis.hasUppercase) variety++;
        if (analysis.hasLowercase) variety++;
        if (analysis.hasNumbers) variety++;
        if (analysis.hasSymbols) variety++;
        score += variety * 7.5;

        // Entropy score (max 20 points)
        score += Math.min(analysis.entropy / 2, 20);

        // Penalties
        if (analysis.hasSequential) score -= 15;
        if (analysis.hasRepeating) score -= 10;
        if (analysis.length < 8) score -= 20;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    updateCharacterDistribution(password) {
        const dist = this.analyticsData.generationStats.characterDistribution;
        dist.uppercase += (password.match(/[A-Z]/g) || []).length;
        dist.lowercase += (password.match(/[a-z]/g) || []).length;
        dist.numbers += (password.match(/\d/g) || []).length;
        dist.symbols += (password.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/g) || []).length;
    }

    updateSecurityMetrics(analysis) {
        const metrics = this.analyticsData.securityMetrics;

        // Strength distribution
        let level = 'weak';
        if (analysis.score >= 90) level = 'excellent';
        else if (analysis.score >= 75) level = 'strong';
        else if (analysis.score >= 50) level = 'good';
        else if (analysis.score >= 25) level = 'fair';
        metrics.strengthDistribution[level]++;

        // Entropy stats
        metrics.entropyStats.distribution.push(analysis.entropy);
        metrics.entropyStats.average = metrics.entropyStats.distribution.reduce((a, b) => a + b, 0) / metrics.entropyStats.distribution.length;
        metrics.entropyStats.min = Math.min(...metrics.entropyStats.distribution);
        metrics.entropyStats.max = Math.max(...metrics.entropyStats.distribution);

        // Pattern analysis
        if (analysis.hasSequential) metrics.patternAnalysis.sequential++;
        if (analysis.hasRepeating) metrics.patternAnalysis.repeating++;
    }

    updateUsagePatterns(options) {
        const patterns = this.analyticsData.usagePatterns;

        // Time tracking
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        patterns.timeOfDay[hour] = (patterns.timeOfDay[hour] || 0) + 1;
        patterns.dayOfWeek[day] = (patterns.dayOfWeek[day] || 0) + 1;

        // Session length
        patterns.sessionLength.push(Date.now() - this.sessionStart);

        // Feature usage
        if (options.customChars) patterns.featureUsage.customChars++;
        if (options.excludeSimilar) patterns.featureUsage.excludeSimilar++;
        if (options.noDuplicates) patterns.featureUsage.noDuplicates++;
        if (options.sequentialCheck) patterns.featureUsage.sequentialCheck++;
        if (options.pronounceable) patterns.featureUsage.pronounceable++;
    }

    updateTrends(length, score) {
        const trends = this.analyticsData.trends;
        const timestamp = Date.now();

        trends.lengthOverTime.push({ timestamp, value: length });
        trends.scoreOverTime.push({ timestamp, value: score });
        trends.generationFrequency.push(timestamp);

        // Keep only last 100 entries
        if (trends.lengthOverTime.length > 100) {
            trends.lengthOverTime = trends.lengthOverTime.slice(-100);
            trends.scoreOverTime = trends.scoreOverTime.slice(-100);
            trends.generationFrequency = trends.generationFrequency.slice(-100);
        }
    }

    getAnalyticsSummary() {
        const data = this.analyticsData;
        const summary = {
            totalGenerated: data.generationStats.totalGenerated,
            averageLength: Math.round(data.generationStats.averageLength * 10) / 10,
            averageScore: Math.round(data.generationStats.averageScore),
            averageEntropy: Math.round(data.securityMetrics.entropyStats.average * 10) / 10,
            strengthDistribution: data.securityMetrics.strengthDistribution,
            mostUsedFeatures: this.getMostUsedFeatures(),
            generationTrends: this.getGenerationTrends(),
            securityInsights: this.getSecurityInsights()
        };

        return summary;
    }

    getMostUsedFeatures() {
        const features = this.analyticsData.usagePatterns.featureUsage;
        return Object.entries(features)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([feature, count]) => ({ feature, count }));
    }

    getGenerationTrends() {
        const trends = this.analyticsData.trends;
        const now = Date.now();
        const last24h = trends.generationFrequency.filter(time => now - time < 24 * 60 * 60 * 1000).length;
        const lastWeek = trends.generationFrequency.filter(time => now - time < 7 * 24 * 60 * 60 * 1000).length;

        return {
            last24Hours: last24h,
            lastWeek: lastWeek,
            averagePerDay: Math.round(lastWeek / 7)
        };
    }

    getSecurityInsights() {
        const metrics = this.analyticsData.securityMetrics;
        const insights = [];

        const weakPercentage = (metrics.strengthDistribution.weak / this.analyticsData.generationStats.totalGenerated) * 100;
        if (weakPercentage > 20) {
            insights.push('Consider using stronger password requirements');
        }

        const sequentialPercentage = (metrics.patternAnalysis.sequential / this.analyticsData.generationStats.totalGenerated) * 100;
        if (sequentialPercentage > 10) {
            insights.push('Many passwords contain sequential characters');
        }

        if (this.analyticsData.generationStats.averageLength < 12) {
            insights.push('Average password length is below recommended minimum');
        }

        return insights;
    }

    exportAnalyticsData() {
        const data = {
            exportDate: new Date().toISOString(),
            summary: this.getAnalyticsSummary(),
            rawData: this.analyticsData
        };

        return JSON.stringify(data, null, 2);
    }

    importAnalyticsData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.rawData) {
                this.analyticsData = data.rawData;
                this.saveAnalyticsData();
                return true;
            }
        } catch (error) {
            console.error('Failed to import analytics data:', error);
        }
        return false;
    }

    resetAnalytics() {
        this.analyticsData = {
            generationStats: {
                totalGenerated: 0,
                averageLength: 0,
                averageScore: 0,
                generationTime: [],
                characterDistribution: {
                    uppercase: 0,
                    lowercase: 0,
                    numbers: 0,
                    symbols: 0
                }
            },
            securityMetrics: {
                strengthDistribution: {
                    weak: 0,
                    fair: 0,
                    good: 0,
                    strong: 0,
                    excellent: 0
                },
                entropyStats: {
                    average: 0,
                    min: 0,
                    max: 0,
                    distribution: []
                },
                patternAnalysis: {
                    sequential: 0,
                    repeating: 0,
                    dictionary: 0,
                    commonSequences: {}
                }
            },
            usagePatterns: {
                timeOfDay: {},
                dayOfWeek: {},
                sessionLength: [],
                featureUsage: {
                    customChars: 0,
                    excludeSimilar: 0,
                    noDuplicates: 0,
                    sequentialCheck: 0,
                    pronounceable: 0
                }
            },
            trends: {
                lengthOverTime: [],
                scoreOverTime: [],
                generationFrequency: []
            }
        };
        this.saveAnalyticsData();
    }

    saveAnalyticsData() {
        try {
            localStorage.setItem('passwordAnalytics', JSON.stringify(this.analyticsData));
        } catch (error) {
            console.error('Failed to save analytics data:', error);
        }
    }

    loadAnalyticsData() {
        try {
            const saved = localStorage.getItem('passwordAnalytics');
            if (saved) {
                this.analyticsData = { ...this.analyticsData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        }
    }
}

// ===== EXPORT ANALYTICS INSTANCE =====
const passwordAnalytics = new PasswordAnalytics();
