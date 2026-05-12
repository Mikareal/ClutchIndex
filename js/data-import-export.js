/**
 * DATA IMPORT/EXPORT MODULE
 * Handles importing and exporting inventory data
 */

// --- File Import ---
/**
 * Initialize file input listener for imports
 */
function setupFileImport() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);
}

/**
 * Handle file upload and parsing
 */
async function handleFileUpload(e) {
    const fileInput = document.getElementById('fileInput');
    const file = e.target.files[0];
    if (!file) return;
    fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'json') {
        handleJSONImport(file, fileInput);
        return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
        let parsedRows = [];
        if (fileType === 'txt') {
            const text = evt.target.result;
            parsedRows = text.split('\n').filter(line => line.trim() !== '').map(line => 
                line.trim().split(/[\s,;\t]+/).filter(part => part !== '')
            );
        } else { // csv, xlsx
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            parsedRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        }

        if (parsedRows.length === 0) {
            alert('No data found in the file.');
            fileInput.value = '';
            return;
        }

        prepareImportMapper(parsedRows);
    };
    reader.readAsBinaryString(file);
}

/**
 * Handle JSON file import
 */
function handleJSONImport(file, fileInput) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const parsedData = JSON.parse(evt.target.result);
            if (Array.isArray(parsedData) && parsedData.every(item => item.partID && item.quantity !== undefined)) {
                inventory = parsedData;
                saveToStorage();
                alert('ClutchIndex JSON imported successfully!');
            } else {
                alert('Invalid ClutchIndex JSON format.');
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
        fileInput.value = ''; // Clear file input
    };
    reader.readAsText(file);
}

/**
 * Prepare import mapper UI
 */
function prepareImportMapper(parsedRows) {
    const mapperUI = document.getElementById('mapperUI');
    const mapPartID = document.getElementById('mapPartID');
    const mapQty = document.getElementById('mapQty');
    const mapDesc = document.getElementById('mapDesc');
    const mapColor = document.getElementById('mapColor');

    // Determine max columns for headers
    const maxCols = Math.max(...parsedRows.map(r => r.length), 0);
    columnHeaders = Array.from({length: maxCols}, (_, i) => `Column ${i + 1}`);
    stagedData = parsedRows; // Store as array of arrays

    // Populate dropdowns
    [mapPartID, mapQty, mapDesc, mapColor].forEach(sel => sel.innerHTML = '');
    mapDesc.add(new Option('-- Auto-Fetch API --', ''));
    mapColor.add(new Option('-- None --', ''));
    columnHeaders.forEach(h => {
        mapPartID.add(new Option(h, h));
        mapQty.add(new Option(h, h));
        mapDesc.add(new Option(h, h));
        mapColor.add(new Option(h, h));
    });

    // Auto-detect columns based on keywords
    autoDetectColumns(mapPartID, mapQty, mapDesc, mapColor, parsedRows);

    renderImportPreview(stagedData);
    mapperUI.classList.remove('hidden');
    mapperUI.classList.add('flex');
}

/**
 * Auto-detect import columns based on keywords
 */
function autoDetectColumns(mapPartID, mapQty, mapDesc, mapColor, parsedRows) {
    const keywords = {
        id: ['id', 'part', 'design', 'num'],
        qty: ['qty', 'count', 'quantity', 'minqty'],
        color: ['color', 'col'],
        desc: ['desc', 'name', 'description']
    };
    const firstRow = parsedRows[0].map(cell => String(cell).toLowerCase());

    firstRow.forEach((cellContent, i) => {
        if (keywords.id.some(k => cellContent.includes(k))) mapPartID.value = columnHeaders[i];
        if (keywords.qty.some(k => cellContent.includes(k))) mapQty.value = columnHeaders[i];
        if (keywords.color.some(k => cellContent.includes(k))) mapColor.value = columnHeaders[i];
        if (keywords.desc.some(k => cellContent.includes(k))) mapDesc.value = columnHeaders[i];
    });
}

/**
 * Cancel the current file import and reset UI
 */
function cancelImport() {
    stagedData = [];
    columnHeaders = [];
    const mapperUI = document.getElementById('mapperUI');
    const fileInput = document.getElementById('fileInput');
    mapperUI.classList.add('hidden');
    if (fileInput) fileInput.value = '';
}

/**
 * Process and import mapped data
 */
async function processImport() {
    const importBtn = document.getElementById('importBtn');
    const mapperUI = document.getElementById('mapperUI');
    const mapPartID = document.getElementById('mapPartID');
    const mapQty = document.getElementById('mapQty');
    const mapDesc = document.getElementById('mapDesc');
    const mapColor = document.getElementById('mapColor');

    importBtn.disabled = true;
    
    // Get column indices from selected values
    const idIdx = columnHeaders.indexOf(mapPartID.value);
    const qtyIdx = columnHeaders.indexOf(mapQty.value);
    const descIdx = mapDesc.value ? columnHeaders.indexOf(mapDesc.value) : -1;
    const colorIdx = mapColor.value ? columnHeaders.indexOf(mapColor.value) : -1;

    for (const row of stagedData) {
        const id = String(row[idIdx] || '').trim().replace(/\.0$/, '');
        const color = colorIdx !== -1 ? String(row[colorIdx] || '').trim() : '';
        if (!id) continue;

        const qty = parseInt(row[qtyIdx]) || 1;
        const apiData = await fetchPartData(id, color);
        addToInventory(
            id,
            qty,
            color,
            descIdx !== -1 ? row[descIdx] : apiData.description,
            apiData.imageURL
        );
    }
    
    mapperUI.classList.add('hidden');
    document.getElementById('importPreview').classList.add('hidden');
    importBtn.disabled = false;
}

// --- Data Export ---
/**
 * Export inventory in various formats
 */
function exportData() {
    const type = document.getElementById('exportFormat').value;
    const filename = document.getElementById('exportFilename').value.trim() || 'clutch_ledger';
    
    const exportRows = inventory.map(item => ({
        "PART_ID": item.partID,
        "QUANTITY": item.quantity,
        "COLOR_ID": item.colorID || '',
        "DESCRIPTION": item.description || ''
    }));

    switch(type) {
        case 'xlsx':
            exportAsXLSX(exportRows, filename);
            break;
        case 'json_ci':
            exportAsJSON(filename);
            break;
        case 'xml_bl':
            exportAsXML(filename);
            break;
        case 'bl_mass':
            exportAsBlMassSearch(filename);
            break;
        default:
            exportAsCSV(exportRows, filename, type);
    }
}

/**
 * Export as XLSX
 */
function exportAsXLSX(exportRows, filename) {
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export as JSON (ClutchIndex format)
 */
function exportAsJSON(filename) {
    const data = JSON.stringify(inventory, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `${filename}.json`;
    a.click();
}

/**
 * Export as XML (BrickLink format)
 */
function exportAsXML(filename) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<INVENTORY>\n`;
    inventory.forEach(item => {
        xml += `  <ITEM>\n    <ITEMTYPE>P</ITEMTYPE>\n    <ITEMID>${item.partID}</ITEMID>\n    <MINQTY>${item.quantity}</MINQTY>\n    <COLOR>${item.colorID || 0}</COLOR>\n    <CONDITION>X</CONDITION>\n  </ITEM>\n`;
    });
    xml += `</INVENTORY>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([xml], { type: 'text/xml' }));
    a.download = `${filename}.xml`;
    a.click();
}

/**
 * Export as BrickLink mass search format
 */
function exportAsBlMassSearch(filename) {
    // Format: PartID [ColorID] Qty
    const content = inventory.map(i => `${i.partID} ${i.colorID || 0} ${i.quantity}`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${filename}_mass_search.txt`;
    a.click();
}

/**
 * Export as CSV/TSV
 */
function exportAsCSV(exportRows, filename, type) {
    let fs = (type === 'csv_semi') ? ";" : (type === 'txt' ? "\t" : ",");
    const content = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportRows), { FS: fs });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${filename}.${type === 'txt' ? 'txt' : 'csv'}`;
    a.click();
}

/**
 * Download inventory backup as JSON
 */
function downloadBackup() {
    const backup = JSON.stringify(inventory, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
    a.download = `clutch_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}
