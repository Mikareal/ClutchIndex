/**
 * EVENTS MODULE
 * Handles all event listeners and keyboard shortcuts
 */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Layout toggle
    document.getElementById('viewTable').onclick = () => switchLayout('table');
    document.getElementById('viewGrid').onclick = () => switchLayout('grid');

    // Density toggle
    const densityToggle = document.getElementById('densityToggle');
    if (densityToggle) densityToggle.onclick = toggleDensity;

    // Color search
    document.getElementById('colorSearch').oninput = handleColorSearch;

    // Quick entry keyboard shortcuts
    const quickPartID = document.getElementById('quickPartID');
    const quickCount = document.getElementById('quickCount');
    const quickColor = document.getElementById('quickColor');

    quickPartID.onkeydown = (e) => { if (e.key === 'Enter') quickCount.focus(); };
    quickCount.onkeydown = (e) => { if (e.key === 'Enter') quickColor.focus(); };
    quickColor.onkeydown = (e) => { if (e.key === 'Enter') submitQuickEntry(); };

    // Global keyboard shortcuts
    window.addEventListener('keydown', handleGlobalKeydown);
    window.addEventListener('click', handleWindowClick);

    // File import setup
    setupFileImport();
}

/**
 * Handle color search in sidebar
 */
function handleColorSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = colors.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.id.toString().includes(term)
    );
    renderColorList(filtered);
}

/**
 * Handle global keyboard shortcuts
 */
function handleGlobalKeydown(e) {
    // Priority 1: Escape key closes all active UI layers
    if (e.key === 'Escape') { 
        closeQuickEntry();
        closeBatchPaste();
        closeExportSettings();
        closeSettings();
        closeInspection();
        closeGridEdit();
        const sidebar = document.getElementById('colorSidebar');
        if (sidebar) sidebar.classList.add('translate-x-full'); 
        return;
    }

    // Safety Checks: Block fast input if typing or a modal/sidebar is already open
    const isInputActive = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
    const isModalOpen = !!document.querySelector('.modal-fade:not(.hidden)');
    const sidebarElement = document.getElementById('colorSidebar');
    const isSidebarOpen = sidebarElement && !sidebarElement.classList.contains('translate-x-full');

    if (isInputActive || isModalOpen || isSidebarOpen) return;

    // Priority 2: Fast input trigger on alphanumeric keys
    if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) { 
        e.preventDefault(); 
        openQuickEntry(e.key); 
    }
}

/**
 * Handle click outside modals
 */
function handleWindowClick(e) {
    if (e.target.classList.contains('modal-fade')) {
        closeQuickEntry();
        closeBatchPaste();
        closeExportSettings();
        closeSettings();
        closeInspection();
        closeGridEdit();
        closeResetModal();
    }
}
