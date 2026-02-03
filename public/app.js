// DOM Elements
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyRemark = document.getElementById('apiKeyRemark');
const toggleApiKey = document.getElementById('toggleApiKey');
const saveApiKey = document.getElementById('saveApiKey');
const manageKeys = document.getElementById('manageKeys');
const keyManagerModal = document.getElementById('keyManagerModal');
const closeKeyManager = document.getElementById('closeKeyManager');
const savedKeysList = document.getElementById('savedKeysList');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewGrid = document.getElementById('previewGrid');
const fileCount = document.getElementById('fileCount');
const uploadBtn = document.getElementById('uploadBtn');
const removeAllBtn = document.getElementById('removeAllBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const tableBody = document.getElementById('tableBody');
const rawText = document.getElementById('rawText');
const exportBtn = document.getElementById('exportBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');

let selectedFiles = [];
let extractedData = [];

// Storage Keys
const STORAGE_KEYS = {
    API_KEYS: 'receipt_scanner_api_keys',
    SCAN_RESULTS: 'receipt_scanner_results',
    ENCRYPTION_KEY: 'receipt_scanner_enc_key'
};

// Simple encryption/decryption using browser's crypto API
// Note: This provides obfuscation, not military-grade security
// The real security comes from HTTPS in transit and user's device security
class SimpleEncryption {
    constructor() {
        // Generate or retrieve a device-specific key
        this.key = this.getOrCreateKey();
    }

    getOrCreateKey() {
        let key = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
        if (!key) {
            // Generate a random key for this device
            key = this.generateRandomKey();
            localStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, key);
        }
        return key;
    }

    generateRandomKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Simple XOR-based encryption with Base64 encoding
    encrypt(text) {
        if (!text) return '';

        const keyBytes = this.key.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        const textBytes = new TextEncoder().encode(text);
        const encrypted = new Uint8Array(textBytes.length);

        for (let i = 0; i < textBytes.length; i++) {
            encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }

        return btoa(String.fromCharCode(...encrypted));
    }

    decrypt(encryptedText) {
        if (!encryptedText) return '';

        try {
            const keyBytes = this.key.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
            const encryptedBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
            const decrypted = new Uint8Array(encryptedBytes.length);

            for (let i = 0; i < encryptedBytes.length; i++) {
                decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
            }

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error('Decryption failed:', e);
            return '';
        }
    }
}

const encryption = new SimpleEncryption();

// Storage Management
class StorageManager {
    static saveApiKey(apiKey, remark) {
        const keys = this.getSavedApiKeys();
        const newKey = {
            id: Date.now(),
            key: encryption.encrypt(apiKey),
            remark: remark || 'Unnamed Key',
            savedAt: new Date().toISOString()
        };

        keys.push(newKey);
        localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
        return newKey;
    }

    static getSavedApiKeys() {
        try {
            const keys = localStorage.getItem(STORAGE_KEYS.API_KEYS);
            return keys ? JSON.parse(keys) : [];
        } catch (e) {
            console.error('Failed to load API keys:', e);
            return [];
        }
    }

    static deleteApiKey(id) {
        const keys = this.getSavedApiKeys();
        const filtered = keys.filter(k => k.id !== id);
        localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(filtered));
    }

    static saveScanResults(results) {
        try {
            const existing = this.getScanResults();
            // Prepend new results (newest first)
            const updated = [...results, ...existing];
            localStorage.setItem(STORAGE_KEYS.SCAN_RESULTS, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save scan results:', e);
            // Handle quota exceeded
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some old results.');
            }
        }
    }

    static getScanResults() {
        try {
            const results = localStorage.getItem(STORAGE_KEYS.SCAN_RESULTS);
            return results ? JSON.parse(results) : [];
        } catch (e) {
            console.error('Failed to load scan results:', e);
            return [];
        }
    }

    static clearScanResults() {
        localStorage.removeItem(STORAGE_KEYS.SCAN_RESULTS);
    }

    static deleteResult(id) {
        const results = this.getScanResults();
        const filtered = results.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.SCAN_RESULTS, JSON.stringify(filtered));
    }
}

// Event Listeners
toggleApiKey.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
});

saveApiKey.addEventListener('click', handleSaveApiKey);
manageKeys.addEventListener('click', openKeyManager);
closeKeyManager.addEventListener('click', closeKeyManagerModal);

// Close modal when clicking outside
keyManagerModal.addEventListener('click', (e) => {
    if (e.target === keyManagerModal) {
        closeKeyManagerModal();
    }
});

uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
removeAllBtn.addEventListener('click', resetUpload);
uploadBtn.addEventListener('click', uploadAndProcess);
exportBtn.addEventListener('click', exportToCSV);
clearResultsBtn.addEventListener('click', handleClearAllResults);

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        handleFiles(files);
    }
});

// API Key Management Functions
function handleSaveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    const remark = apiKeyRemark.value.trim();

    if (!apiKey) {
        alert('Please enter an API key to save');
        return;
    }

    StorageManager.saveApiKey(apiKey, remark);
    apiKeyRemark.value = '';

    // Show success message
    const originalText = saveApiKey.innerHTML;
    saveApiKey.innerHTML = '<span>✓ Saved!</span>';
    saveApiKey.classList.add('btn-success');

    setTimeout(() => {
        saveApiKey.innerHTML = originalText;
        saveApiKey.classList.remove('btn-success');
    }, 2000);
}

function openKeyManager() {
    const keys = StorageManager.getSavedApiKeys();

    if (keys.length === 0) {
        savedKeysList.innerHTML = '<p class="empty-state">No saved API keys. Save your first key above!</p>';
    } else {
        savedKeysList.innerHTML = keys.map(key => `
            <div class="saved-key-item">
                <div class="key-info">
                    <strong>${escapeHtml(key.remark)}</strong>
                    <span class="key-date">Saved: ${new Date(key.savedAt).toLocaleDateString()}</span>
                    <code class="key-preview">${maskApiKey(encryption.decrypt(key.key))}</code>
                </div>
                <div class="key-actions">
                    <button class="btn-small btn-use" data-id="${key.id}">Use</button>
                    <button class="btn-small btn-delete" data-id="${key.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        savedKeysList.querySelectorAll('.btn-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const key = keys.find(k => k.id === id);
                if (key) {
                    apiKeyInput.value = encryption.decrypt(key.key);
                    apiKeyRemark.value = key.remark;
                    closeKeyManagerModal();
                }
            });
        });

        savedKeysList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this API key?')) {
                    StorageManager.deleteApiKey(id);
                    openKeyManager(); // Refresh the list
                }
            });
        });
    }

    keyManagerModal.style.display = 'flex';
}

function closeKeyManagerModal() {
    keyManagerModal.style.display = 'none';
}

function maskApiKey(key) {
    if (!key || key.length < 10) return '****';
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
}

// File Handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFiles(files) {
    selectedFiles = files;
    previewGrid.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Receipt ${index + 1}">
                <button class="btn-remove-single" data-index="${index}" title="Remove">×</button>
                <span class="preview-label">${index + 1}</span>
            `;
            previewGrid.appendChild(previewItem);

            // Add remove handler for individual files
            const removeBtn = previewItem.querySelector('.btn-remove-single');
            removeBtn.addEventListener('click', () => removeSingleFile(index));
        };

        reader.readAsDataURL(file);
    });

    fileCount.textContent = files.length;
    uploadArea.style.display = 'none';
    previewSection.style.display = 'block';
    uploadBtn.disabled = false;
}

function removeSingleFile(index) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);

    if (selectedFiles.length === 0) {
        resetUpload();
    } else {
        handleFiles(selectedFiles);
    }
}

function resetUpload() {
    selectedFiles = [];
    fileInput.value = '';
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    uploadBtn.disabled = true;
    progressBar.style.display = 'none';
}

// Upload and Process
async function uploadAndProcess() {
    if (selectedFiles.length === 0) return;

    // Validate API key is provided (mandatory)
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('⚠️ Google Gemini API Key is required!\n\nPlease enter your API key to continue.');
        apiKeyInput.focus();
        return;
    }

    // Show loading state
    uploadBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    progressBar.style.display = 'block';

    const allResults = [];
    let processedCount = 0;

    try {
        // Process files sequentially
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            updateProgress(
                (i / selectedFiles.length) * 100,
                `Processing receipt ${i + 1} of ${selectedFiles.length}...`
            );

            const formData = new FormData();
            formData.append('receipt', file);
            formData.append('apiKey', apiKey);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Failed to process ${file.name}:`, errorData.error);
                // Continue with other files
                continue;
            }

            const result = await response.json();
            if (result.data && result.data.length > 0) {
                // Add unique IDs and timestamps to each result
                const timestampedResults = result.data.map(row => ({
                    ...row,
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    scannedAt: new Date().toISOString(),
                    fileName: file.name
                }));
                allResults.push(...timestampedResults);
            }

            processedCount++;
        }

        // Update progress
        updateProgress(100, `Processing complete! ${processedCount}/${selectedFiles.length} receipts processed.`);

        // Save new results to localStorage
        if (allResults.length > 0) {
            StorageManager.saveScanResults(allResults);
        }

        // Display all results (new + existing)
        setTimeout(() => {
            loadAndDisplayResults();
            resetUploadButton();
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to process receipts. ${processedCount}/${selectedFiles.length} were successful.`);
        if (allResults.length > 0) {
            StorageManager.saveScanResults(allResults);
            loadAndDisplayResults();
        }
        resetUploadButton();
        progressBar.style.display = 'none';
    }
}

function updateProgress(percent, text) {
    progressFill.style.width = percent + '%';
    progressText.textContent = text;
}

function resetUploadButton() {
    uploadBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}

// Display Results
function loadAndDisplayResults() {
    extractedData = StorageManager.getScanResults();
    displayResults();
}

function displayResults() {
    // Clear previous results
    tableBody.innerHTML = '';

    // Populate table (newest first)
    if (extractedData.length > 0) {
        extractedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <button class="btn-icon btn-delete-row" data-id="${row.id}" title="Delete this entry">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
                <td>${escapeHtml(row.date || '')}</td>
                <td>${escapeHtml(row.receiptNo || '')}</td>
                <td>${escapeHtml(row.companyName || '')}</td>
                <td>${escapeHtml(row.description || '')}</td>
                <td>${escapeHtml(row.amount || '')}</td>
                <td>${escapeHtml(row.advanceToCo || '')}</td>
                <td>${escapeHtml(row.category || '')}</td>
                <td>${escapeHtml(row.paymentType || '')}</td>
            `;
            tableBody.appendChild(tr);

            // Add delete handler
            const deleteBtn = tr.querySelector('.btn-delete-row');
            deleteBtn.addEventListener('click', () => handleDeleteResult(row.id));
        });

        // Display summary
        const latestScan = extractedData[0]?.scannedAt;
        rawText.textContent = `Total entries: ${extractedData.length}\nLatest scan: ${latestScan ? new Date(latestScan).toLocaleString() : 'N/A'}`;
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No data available. Scan your first receipt above!</td>';
        tableBody.appendChild(tr);
        rawText.textContent = 'No results yet';
    }

    // Show results section
    resultsSection.style.display = 'block';
    progressBar.style.display = 'none';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleDeleteResult(id) {
    if (confirm('Delete this entry?')) {
        StorageManager.deleteResult(id);
        loadAndDisplayResults();
    }
}

function handleClearAllResults() {
    if (confirm('⚠️ This will permanently delete all scan results. Continue?')) {
        StorageManager.clearScanResults();
        extractedData = [];
        displayResults();
    }
}

// Export to CSV
function exportToCSV() {
    if (extractedData.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Date', 'Receipt No', 'Company Name', 'Description', 'Amount (RM)', 'Advance to Co(RM)', 'Category', 'Payment Type', 'Scanned At', 'File Name'];
    const csvContent = [
        headers.join(','),
        ...extractedData.map(row => [
            csvEscape(row.date || ''),
            csvEscape(row.receiptNo || ''),
            csvEscape(row.companyName || ''),
            csvEscape(row.description || ''),
            csvEscape(row.amount || ''),
            csvEscape(row.advanceToCo || ''),
            csvEscape(row.category || ''),
            csvEscape(row.paymentType || ''),
            csvEscape(row.scannedAt ? new Date(row.scannedAt).toLocaleString() : ''),
            csvEscape(row.fileName || '')
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `receipt_data_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility Functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function csvEscape(text) {
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
}

// Initialize on page load
window.addEventListener('load', () => {
    console.log('Receipt Scanner loaded successfully');

    // Load and display existing results
    loadAndDisplayResults();

    // Auto-load the first saved API key if available
    const savedKeys = StorageManager.getSavedApiKeys();
    if (savedKeys.length > 0 && !apiKeyInput.value) {
        const firstKey = savedKeys[0];
        apiKeyInput.value = encryption.decrypt(firstKey.key);
        apiKeyRemark.value = firstKey.remark;
    }
});
