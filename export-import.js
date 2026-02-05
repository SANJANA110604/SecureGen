// ===== DATA MANAGEMENT MODULE =====
// Advanced data export and import functionality

class DataManager {
    constructor() {
        this.exportFormats = {
            json: this.exportJSON.bind(this),
            csv: this.exportCSV.bind(this),
            txt: this.exportTXT.bind(this),
            xml: this.exportXML.bind(this)
        };

        this.importFormats = {
            json: this.importJSON.bind(this),
            csv: this.importCSV.bind(this),
            txt: this.importTXT.bind(this)
        };
    }

    // ===== EXPORT FUNCTIONALITY =====
    async exportData(data, filename, format = 'json') {
        if (!this.exportFormats[format]) {
            throw new Error(`Unsupported export format: ${format}`);
        }

        const exportData = this.prepareExportData(data);
        return await this.exportFormats[format](exportData, filename);
    }

    prepareExportData(data) {
        return {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            application: 'SecureGen Pro',
            data: data,
            metadata: {
                totalPasswords: data.history ? data.history.length : 0,
                totalGenerated: data.stats ? data.stats.totalGenerated : 0,
                exportTimestamp: Date.now()
            }
        };
    }

    async exportJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const encrypted = await this.encryptData(jsonString);
        const compressed = await this.compressData(encrypted);

        this.downloadFile(compressed, `${filename}.json`, 'application/json');
        return compressed;
    }

    async exportCSV(data, filename) {
        const csvContent = this.convertToCSV(data);
        const encrypted = await this.encryptData(csvContent);
        const compressed = await this.compressData(encrypted);

        this.downloadFile(compressed, `${filename}.csv`, 'text/csv');
        return compressed;
    }

    async exportTXT(data, filename) {
        const txtContent = this.convertToTXT(data);
        const encrypted = await this.encryptData(txtContent);
        const compressed = await this.compressData(encrypted);

        this.downloadFile(compressed, `${filename}.txt`, 'text/plain');
        return compressed;
    }

    async exportXML(data, filename) {
        const xmlContent = this.convertToXML(data);
        const encrypted = await this.encryptData(xmlContent);
        const compressed = await this.compressData(encrypted);

        this.downloadFile(compressed, `${filename}.xml`, 'application/xml');
        return compressed;
    }

    // ===== IMPORT FUNCTIONALITY =====
    async importData(fileContent, format = 'json') {
        if (!this.importFormats[format]) {
            throw new Error(`Unsupported import format: ${format}`);
        }

        const decompressed = await this.decompressData(fileContent);
        const decrypted = await this.decryptData(decompressed);

        return await this.importFormats[format](decrypted);
    }

    async importFromFile(file, format) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    const result = await this.importData(content, format);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Support both legacy and new formats
            if (data.data) {
                // New format with metadata
                return data.data;
            } else {
                // Legacy format
                return data;
            }
        } catch (error) {
            throw new Error('Invalid JSON format');
        }
    }

    async importCSV(csvString) {
        try {
            const lines = csvString.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new Error('CSV file must have at least a header and one data row');
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const data = {
                passwords: [],
                history: [],
                stats: {
                    totalGenerated: 0,
                    strongPasswords: 0,
                    lastGenerated: null
                }
            };

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length >= headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });

                    if (row.password) {
                        const historyItem = {
                            password: row.password,
                            timestamp: row.timestamp ? parseInt(row.timestamp) : Date.now(),
                            strength: row.strength ? parseInt(row.strength) : 0
                        };
                        data.history.push(historyItem);

                        if (historyItem.strength >= 75) {
                            data.stats.strongPasswords++;
                        }
                    }
                }
            }

            data.stats.totalGenerated = data.history.length;
            if (data.history.length > 0) {
                data.stats.lastGenerated = Math.max(...data.history.map(h => h.timestamp));
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to parse CSV: ${error.message}`);
        }
    }

    async importTXT(txtString) {
        try {
            const lines = txtString.split('\n').filter(line => line.trim());
            const data = {
                passwords: [],
                history: [],
                stats: {
                    totalGenerated: 0,
                    strongPasswords: 0,
                    lastGenerated: null
                }
            };

            lines.forEach(line => {
                const password = line.trim();
                if (password) {
                    const historyItem = {
                        password: password,
                        timestamp: Date.now(),
                        strength: 0 // Will be calculated when displayed
                    };
                    data.history.push(historyItem);
                }
            });

            data.stats.totalGenerated = data.history.length;
            data.stats.lastGenerated = Date.now();

            return data;
        } catch (error) {
            throw new Error(`Failed to parse TXT: ${error.message}`);
        }
    }

    // ===== DATA CONVERSION =====
    convertToCSV(data) {
        const headers = ['password', 'timestamp', 'strength'];
        let csv = headers.join(',') + '\n';

        if (data.history && Array.isArray(data.history)) {
            data.history.forEach(item => {
                const row = [
                    `"${item.password.replace(/"/g, '""')}"`,
                    item.timestamp || Date.now(),
                    item.strength || 0
                ];
                csv += row.join(',') + '\n';
            });
        }

        return csv;
    }

    convertToTXT(data) {
        let txt = '';

        if (data.history && Array.isArray(data.history)) {
            data.history.forEach(item => {
                txt += item.password + '\n';
            });
        }

        return txt.trim();
    }

    convertToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<securegen-export>\n';
        xml += `  <export-date>${new Date().toISOString()}</export-date>\n`;
        xml += `  <version>1.0.0</version>\n`;
        xml += `  <application>SecureGen Pro</application>\n`;

        if (data.stats) {
            xml += '  <stats>\n';
            xml += `    <total-generated>${data.stats.totalGenerated || 0}</total-generated>\n`;
            xml += `    <strong-passwords>${data.stats.strongPasswords || 0}</strong-passwords>\n`;
            xml += `    <last-generated>${data.stats.lastGenerated || Date.now()}</last-generated>\n`;
            xml += '  </stats>\n';
        }

        if (data.history && Array.isArray(data.history)) {
            xml += '  <history>\n';
            data.history.forEach(item => {
                xml += '    <password-item>\n';
                xml += `      <password><![CDATA[${item.password}]]></password>\n`;
                xml += `      <timestamp>${item.timestamp || Date.now()}</timestamp>\n`;
                xml += `      <strength>${item.strength || 0}</strength>\n`;
                xml += '    </password-item>\n';
            });
            xml += '  </history>\n';
        }

        xml += '</securegen-export>';
        return xml;
    }

    // ===== UTILITY METHODS =====
    generateBackupFilename() {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `securegen-backup-${timestamp}`;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    // ===== ENCRYPTION/COMPRESSION (SIMPLE IMPLEMENTATION) =====
    async encryptData(data) {
        // Simple XOR encryption for demonstration
        // In a real application, use proper encryption like AES
        const key = 'SecureGen2024';
        let result = '';

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }

        return btoa(result); // Base64 encode
    }

    async decryptData(data) {
        try {
            const decoded = atob(data); // Base64 decode
            const key = 'SecureGen2024';
            let result = '';

            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }

            return result;
        } catch (error) {
            // If decryption fails, assume data wasn't encrypted
            return data;
        }
    }

    async compressData(data) {
        // Simple compression simulation
        // In a real application, use proper compression
        return data;
    }

    async decompressData(data) {
        // Simple decompression simulation
        return data;
    }

    // ===== VALIDATION =====
    validateData(data) {
        const requiredFields = ['passwords', 'history', 'stats'];

        for (const field of requiredFields) {
            if (!data.hasOwnProperty(field)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!Array.isArray(data.history)) {
            throw new Error('History must be an array');
        }

        if (typeof data.stats !== 'object') {
            throw new Error('Stats must be an object');
        }

        return true;
    }

    // ===== BACKUP/RESTORE =====
    createBackup() {
        const data = {
            passwords: state.passwords || [],
            history: state.history || [],
            stats: state.stats || {
                totalGenerated: 0,
                strongPasswords: 0,
                lastGenerated: null
            },
            settings: state.settings || {
                theme: 'light',
                autoCopy: true,
                saveHistory: true
            }
        };

        return this.prepareExportData(data);
    }

    async restoreFromBackup(backupData) {
        try {
            const data = await this.importJSON(JSON.stringify(backupData));

            // Validate the data
            this.validateData(data);

            // Restore to global state
            if (window.state) {
                window.state.passwords = data.passwords || [];
                window.state.history = data.history || [];
                window.state.stats = data.stats || window.state.stats;
                window.state.settings = data.settings || window.state.settings;
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to restore backup: ${error.message}`);
        }
    }

    // ===== ANALYTICS EXPORT =====
    async exportAnalyticsData() {
        if (!window.passwordAnalytics) {
            throw new Error('Analytics module not available');
        }

        const analyticsData = window.passwordAnalytics.getAnalyticsSummary();
        const exportData = this.prepareExportData({
            analytics: analyticsData,
            exportType: 'analytics'
        });

        return await this.exportJSON(exportData, 'securegen-analytics');
    }

    // ===== BULK OPERATIONS =====
    async exportMultipleFormats(data, baseFilename) {
        const results = {};

        for (const format of Object.keys(this.exportFormats)) {
            try {
                results[format] = await this.exportData(data, `${baseFilename}-${format}`, format);
            } catch (error) {
                console.error(`Failed to export ${format}:`, error);
                results[format] = null;
            }
        }

        return results;
    }

    // ===== CLEANUP =====
    cleanup() {
        // Clear any temporary data or event listeners
        // This method can be called when the application is shutting down
    }
}

// ===== EXPORT DATA MANAGER INSTANCE =====
const dataManager = new DataManager();
