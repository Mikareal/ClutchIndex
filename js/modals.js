/**
 * MODALS MODULE
 * Handles all modal dialogs and overlays
 */

// --- Grid Edit Modal ---
/**
 * Open grid item edit modal
 */
function openGridEdit(index) {
    gridEditIndex = index;
    const item = inventory[index];
    document.getElementById('gridEditID').value = item.partID;
    document.getElementById('gridEditQty').value = item.quantity;
    document.getElementById('gridEditColor').value = item.colorID || '';
    document.getElementById('gridEditOverlay').classList.remove('hidden');
}

/**
 * Close grid item edit modal
 */
function closeGridEdit() {
    document.getElementById('gridEditOverlay').classList.add('hidden');
    gridEditIndex = null;
}

/**
 * Save grid item edits
 */
async function saveGridEdit() {
    if (gridEditIndex === null) return;
    inventory[gridEditIndex].partID = document.getElementById('gridEditID').value.trim();
    inventory[gridEditIndex].quantity = parseInt(document.getElementById('gridEditQty').value) || 0;
    inventory[gridEditIndex].colorID = document.getElementById('gridEditColor').value.trim();
    
    await refreshPartData(gridEditIndex);
    closeGridEdit();
}

// --- Quick Entry Modal ---
/**
 * Open quick entry modal
 */
function openQuickEntry(initialChar = "") {
    const quickEntryOverlay = document.getElementById('quickEntryOverlay');
    const quickPartID = document.getElementById('quickPartID');
    quickEntryOverlay.classList.remove('hidden');
    if (initialChar) quickPartID.value = initialChar;
    setTimeout(() => quickPartID.focus(), 50);
}

/**
 * Close quick entry modal
 */
function closeQuickEntry() {
    const quickEntryOverlay = document.getElementById('quickEntryOverlay');
    const quickPartID = document.getElementById('quickPartID');
    const quickCount = document.getElementById('quickCount');
    quickEntryOverlay.classList.add('hidden');
    quickPartID.value = '';
    quickCount.value = '';
}

/**
 * Submit quick entry
 */
async function submitQuickEntry() {
    const quickPartID = document.getElementById('quickPartID');
    const quickColor = document.getElementById('quickColor');
    const quickCount = document.getElementById('quickCount');
    const quickBatchMode = document.getElementById('quickBatchMode');

    const rawID = quickPartID.value.trim();
    const partID = rawID.replace(/\.0$/, '');
    const colorID = quickColor.value.trim();
    const count = parseInt(quickCount.value) || 1;
    if (!partID) return;

    const apiData = await fetchPartData(partID, colorID);
    addToInventory(partID, count, colorID, apiData.description, apiData.imageURL);
    
    if (!quickBatchMode.checked) {
        closeQuickEntry();
    } else {
        quickPartID.value = '';
        quickCount.value = '';
        quickColor.value = '';
        quickPartID.focus();
    }
}

// --- Batch Paste Modal ---
/**
 * Open batch paste modal
 */
function openBatchPaste() {
    const batchPasteOverlay = document.getElementById('batchPasteOverlay');
    const batchPasteArea = document.getElementById('batchPasteArea');
    batchPasteOverlay.classList.remove('hidden');
    batchPasteArea.focus();
}

/**
 * Close batch paste modal
 */
function closeBatchPaste() {
    const batchPasteOverlay = document.getElementById('batchPasteOverlay');
    const batchPasteArea = document.getElementById('batchPasteArea');
    const batchProgress = document.getElementById('batchProgress');
    batchPasteOverlay.classList.add('hidden');
    batchPasteArea.value = '';
    batchProgress.classList.add('hidden');
}

/**
 * Submit batch paste data
 */
async function submitBatchPaste() {
    const batchPasteArea = document.getElementById('batchPasteArea');
    const batchSubmitBtn = document.getElementById('batchSubmitBtn');
    const batchProgress = document.getElementById('batchProgress');

    const lines = batchPasteArea.value.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    // Ensure color data is loaded for the "smart" color check
    if (colors.length === 0) await fetchColors();

    batchSubmitBtn.disabled = true;
    batchProgress.classList.remove('hidden');
    document.getElementById('batchTotal').innerText = lines.length;

    for (let i = 0; i < lines.length; i++) {
        document.getElementById('batchCurrent').innerText = i + 1;
        const parts = lines[i].trim().split(/[\s;|,:\t]+/).filter(p => p.length > 0);
        
        if (parts.length === 0) continue;

        let id = parts[0].trim().replace(/\.0$/, '');
        let qty = 1;
        let color = '';

        // Smart Parsing Logic for 2 tokens (e.g., "bb0300L 1" or "4219 6")
        if (parts.length === 2) {
            const p1 = parts[0];
            const p2 = parts[1];
            const isNum1 = !isNaN(p1) && !isNaN(parseFloat(p1));
            const isNum2 = !isNaN(p2) && !isNaN(parseFloat(p2));

            if (isNum1 && isNum2) {
                // Both are numbers. Priority: Color ID if it exists in Rebrickable
                if (isValidColorID(p2)) {
                    color = p2;
                    qty = 1;
                } else {
                    qty = parseInt(p2) || 1;
                }
            } else if (isNum2) {
                // Only second is a number (bb0300L 1) -> It's the Quantity
                qty = parseInt(p2) || 1;
            } else if (isNum1) {
                // First is a number, second is letters (4219 b) -> Part + Color/Desc
                qty = 1;
                color = p2;
            }
        } else if (parts.length >= 3) {
            // Standard 3+ format: ID QTY COLOR
            qty = parseInt(parts[1].trim()) || 1;
            color = parts[2].trim();
        }

        const apiData = await fetchPartData(id, color);
        addToInventory(id, qty, color, apiData.description, apiData.imageURL);
    }

    batchSubmitBtn.disabled = false;
    closeBatchPaste();
}

// --- Export Settings Modal ---
/**
 * Open export settings modal
 */
function openExportSettings() {
    document.getElementById('exportSettingsModal').classList.remove('hidden');
}

/**
 * Close export settings modal
 */
function closeExportSettings() {
    document.getElementById('exportSettingsModal').classList.add('hidden');
}

// --- Settings Modal ---
/**
 * Open settings modal
 */
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    
    // Ensure dropdowns reflect current state
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = currentTheme;
    document.getElementById('modeSelect').value = currentMode;
}

/**
 * Close settings modal
 */
function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

// --- Inspection Modal ---
/**
 * Open part inspection modal
 */
function inspectPart(url, id, name) {
    document.getElementById('inspectionImg').src = url;
    document.getElementById('inspectionID').innerText = id;
    document.getElementById('inspectionName').innerText = name;
    document.getElementById('inspectionModal').classList.remove('hidden');
}

/**
 * Close inspection modal
 */
function closeInspection() {
    document.getElementById('inspectionModal').classList.add('hidden');
}

// --- Reset Modal ---
/**
 * Open reset authorization modal
 */
function openResetModal() {
    const resetOverlay = document.getElementById('resetOverlay');
    const resetCodeDisplay = document.getElementById('resetCodeDisplay');
    const resetConfirmInput = document.getElementById('resetConfirmInput');

    resetConfirmInput.value = '';
    resetConfirmInput.classList.remove('hidden');
    
    const modalPurgeBtn = document.querySelector('#resetOverlay button.bg-red-600');
    if (modalPurgeBtn) modalPurgeBtn.classList.remove('hidden');

    resetOverlay.classList.remove('hidden');
}

/**
 * Close reset modal
 */
function closeResetModal() {
    const resetOverlay = document.getElementById('resetOverlay');
    const resetCodeDisplay = document.getElementById('resetCodeDisplay');
    const resetConfirmInput = document.getElementById('resetConfirmInput');

    resetOverlay.classList.add('hidden');
}

/**
 */
function confirmReset() {
    const resetConfirmInput = document.getElementById('resetConfirmInput');
    if (resetConfirmInput.value.toUpperCase() === 'PURGE') {
        clearInventory();
        closeResetModal();
    }
}
