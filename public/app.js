// DOM Elements
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleApiKey = document.getElementById('toggleApiKey');
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

let selectedFiles = [];
let extractedData = [];

// Event Listeners
toggleApiKey.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
});

uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
removeAllBtn.addEventListener('click', resetUpload);
uploadBtn.addEventListener('click', uploadAndProcess);
exportBtn.addEventListener('click', exportToCSV);

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
    resultsSection.style.display = 'none';
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
    resultsSection.style.display = 'none';

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
                allResults.push(...result.data);
            }

            processedCount++;
        }

        // Update progress
        updateProgress(100, `Processing complete! ${processedCount}/${selectedFiles.length} receipts processed.`);

        // Display results
        setTimeout(() => {
            displayResults({ data: allResults, text: `Processed ${processedCount} receipts` });
            resetUploadButton();
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to process receipts. ${processedCount}/${selectedFiles.length} were successful.`);
        if (allResults.length > 0) {
            displayResults({ data: allResults, text: `Partial results: ${processedCount} receipts` });
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
function displayResults(result) {
    extractedData = result.data || [];

    // Clear previous results
    tableBody.innerHTML = '';

    // Populate table
    if (extractedData.length > 0) {
        extractedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
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
        });
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No data extracted. Please try with a clearer image.</td>';
        tableBody.appendChild(tr);
    }

    // Display raw text
    rawText.textContent = result.text || 'No text extracted';

    // Show results section
    resultsSection.style.display = 'block';
    progressBar.style.display = 'none';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Export to CSV
function exportToCSV() {
    if (extractedData.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Date', 'Receipt No', 'Company Name', 'Description', 'Amount (RM)', 'Advance to Co(RM)', 'Category', 'Payment Type'];
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
            csvEscape(row.paymentType || '')
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

// Add loading event listener for progress simulation
window.addEventListener('load', () => {
    console.log('Receipt Scanner loaded successfully');
});
