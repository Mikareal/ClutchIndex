/**
 * Hide skeleton loader and show main content
 */
function hideSkeletonLoader() {
    const skeleton = document.getElementById('skeletonLoader');
    const mainContent = document.getElementById('mainContent');
    
    if (skeleton && mainContent) {
        skeleton.style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.classList.add('animate-fade');
    }
}

/**
 * Show skeleton loader and hide main content
 */
function showSkeletonLoader() {
    const skeleton = document.getElementById('skeletonLoader');
    const mainContent = document.getElementById('mainContent');
    
    if (skeleton && mainContent) {
        skeleton.style.display = 'block';
        mainContent.classList.add('hidden');
        mainContent.classList.remove('animate-fade');
    }
}

// --- Appearance Management ---
/**
 * Apply theme to DOM
 */
function setTheme(theme) {
    currentTheme = theme;
    saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Extract RGB for CSS variables
    const temp = document.createElement('div');
    temp.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    document.body.appendChild(temp);
    const rgb = getComputedStyle(temp).color.match(/\d+/g);
    if (rgb) document.documentElement.style.setProperty('--accent-rgb', rgb.join(', '));
    temp.remove();
    
    // Clear custom overrides if switching to a preset theme
    if (theme !== 'custom') {
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-faded');
    }

    // Update Dropdown
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = theme;
    }

    // Handle Custom Color Picker visibility
    const customPicker = document.getElementById('customColorPicker');
    if (customPicker) {
        customPicker.classList.toggle('hidden', theme !== 'custom');
        if (theme === 'custom') {
            const color = getStoredCustomColor();
            updateCustomColor(color);
        }
    }
}

/**
 * Apply dark/light mode to DOM
 */
function setMode(mode) {
    currentMode = mode;
    saveMode(mode);
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    const modeToggle = document.getElementById('darkModeToggle');
    if (modeToggle) modeToggle.checked = (mode === 'dark');
}

/**
 * Apply visibility of the theme toggle in the header
 */
function applyThemeToggleVisibility() {
    const container = document.getElementById('themeToggleContainer');
    if (container) container.classList.toggle('hidden', !showThemeToggle);
}

/**
 * Update API Key display state in settings
 */
function updateApiKeyUI() {
    const inputArea = document.getElementById('apiInputArea');
    const actionsArea = document.getElementById('apiActionsArea');
    if (!inputArea || !actionsArea) return;

    inputArea.classList.toggle('hidden', !!userApiKey);
    actionsArea.classList.toggle('hidden', !userApiKey);
}

/**
 * Manually show input to edit key
 */
function showApiKeyInput() {
    document.getElementById('apiInputArea').classList.remove('hidden');
    document.getElementById('apiActionsArea').classList.add('hidden');
    document.getElementById('settingsApiKey').focus();
}

/**
 * Toggle API Key input visibility (password vs text)
 */
function toggleApiKeyVisibility() {
    const input = document.getElementById('settingsApiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Update custom color and apply to theme
 */
function updateCustomColor(hex) {
    document.documentElement.style.setProperty('--accent', hex);
    // Create a faded version for backgrounds
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-faded', `rgba(${r}, ${g}, ${b}, 0.15)`);
    saveCustomColor(hex);
}

// --- Color Sidebar ---
/**
 * Toggle color sidebar visibility
 */
async function toggleColorSidebar() {
    const sidebar = document.getElementById('colorSidebar');
    const listContainer = document.getElementById('colorList');
    const isHidden = sidebar.classList.contains('translate-x-full');
    
    if (isHidden) {
        sidebar.classList.remove('translate-x-full');
        // Always render if opening, but only fetch if we don't have data
        if (!colors || colors.length === 0) {
            listContainer.innerHTML = '<div class="text-center p-8 text-[10px] text-slate-500 animate-pulse uppercase tracking-widest">Fetching Colors...</div>';
            const fetched = await fetchColors();
            renderColorList(fetched);
        } else {
            renderColorList(colors);
        }
    } else {
        sidebar.classList.add('translate-x-full');
    }
}

/**
 * Filter color list based on search input
 */
function filterColorList(query) {
    if (!colors) return;
    const q = query.toLowerCase();
    const filtered = colors.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.id.toString().includes(q)
    );
    renderColorList(filtered);
}

function renderColorList(items) {
    const listContainer = document.getElementById('colorList');

    if (!items || items.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-center opacity-50">
                <div class="text-[10px] uppercase tracking-tighter mb-2">No color data found</div>
                <div class="text-[9px] text-red-400 uppercase">Check API Key in Settings</div>
            </div>`;
        return;
    }

    listContainer.innerHTML = '';
    items.forEach(c => {
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group";
        div.onclick = () => {
            navigator.clipboard.writeText(c.id);
            const originalColor = div.style.borderColor;
            div.style.borderColor = 'var(--accent)';
            setTimeout(() => div.style.borderColor = originalColor, 200);
        };
        div.innerHTML = `
            <div class="w-4 h-4 shrink-0 border border-white/20 shadow-sm" style="background-color: #${c.rgb}"></div>
            <div class="flex-grow text-[11px] mono group-hover:text-white transition-colors truncate text-slate-400">${c.name}</div>
            <div class="text-[11px] mono font-bold" style="color: var(--accent)">${c.id}</div>
        `;
        listContainer.appendChild(div);
    });
}

/**
 * Get display text for color column (ID vs Name)
 */
function getColorDisplayText(colorID) {
    if (!instantColorTranslation || !colorID) return colorID || 'Default';
    const color = findColorByID(colorID);
    return color ? color.name : colorID;
}

/**
 * Handle focus on color ID field (Swap Name to ID for editing)
 */
function handleColorFocus(index, el) {
    if (instantColorTranslation) {
        el.innerText = inventory[index].colorID || 'Default';
    }
}

/**
 * Handle blur on color ID field (Swap ID to Name for display)
 */
function handleColorBlur(index, el) {
    const val = el.innerText.trim();
    updateColorID(index, val);
    const hex = getColorHex(val);
    if (instantColorTranslation) {
        el.innerText = getColorDisplayText(val);
    }
    el.style.color = (showColorText && hex) ? hex : '';
}

/**
 * Live update color visuals while typing in the table
 */
function liveUpdateColorID(index, el) {
    const val = el.innerText.trim();
    const hex = getColorHex(val);
    const colorObj = findColorByID(val);
    const container = el.parentElement;
    const square = container.querySelector('.live-color-square');

    if (square) {
        if (val && hex) {
            square.style.backgroundColor = hex;
            square.title = colorObj ? colorObj.name : 'Unknown Color';
            square.classList.remove('hidden');
        } else {
            square.classList.add('hidden');
        }
    }
    
    if (showColorText && hex) {
        el.style.color = hex;
    } else {
        el.style.color = '';
    }

    inventory[index].colorID = val;
}

// --- Inventory Rendering ---
/**
 * Main inventory render dispatcher
 */
function renderInventory() {
    const tableView = document.getElementById('tableView');
    const gridView = document.getElementById('gridView');
    const emptyState = document.getElementById('emptyState');

    if (inventory.length === 0) {
        emptyState.classList.remove('hidden');
        tableView.classList.add('hidden');
        gridView.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    if (currentLayout === 'table') {
        renderTable();
    } else {
        renderGrid();
    }
}

/**
 * Render inventory as table
 */
function renderTable() {
    const tableView = document.getElementById('tableView');
    const gridView = document.getElementById('gridView');
    const inventoryTableBody = document.getElementById('inventoryTableBody');

    tableView.classList.remove('hidden');
    gridView.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    
    inventory.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = `hover:bg-[var(--bg-hover)] transition-colors group ${isCompact ? 'compact-row' : 'py-2'} border-b border-[var(--border-light)]`;
        
        const thumbSize = isCompact ? 'w-8 h-8' : 'w-12 h-12 border border-[var(--border-medium)]';
        const fontSize = isCompact ? 'text-xs' : 'text-sm';
        const cellPadding = isCompact ? 'px-2' : 'px-4';
        const qtyPadding = isCompact ? 'px-3' : 'px-6';

        const brickContent = `<img src="${item.imageURL}" alt="${item.partID}" class="object-contain w-full h-full img-glow cursor-zoom-in transition-transform hover:scale-110" onclick="event.stopPropagation(); inspectPart('${item.imageURL}', '${item.partID}', '${item.description}')">
               <div class="hover-preview glass p-1 w-32 h-32 bottom-0 left-14 border border-accent/20"><img src="${item.imageURL}" class="w-full h-full object-contain"></div>`;

        row.innerHTML = `
            <td class="${cellPadding} text-center">
                <div class="${thumbSize} mx-auto bg-black flex items-center justify-center overflow-hidden relative preview-container rounded border border-[var(--border-light)] hover:border-[var(--accent)] transition-colors">
                    ${brickContent}
                </div>
            </td>
            <td class="${cellPadding} mono ${fontSize} font-bold inline-editable relative text-center" style="color: var(--accent)"
                contenteditable="true" spellcheck="false"
                onblur="updatePartID(${index}, this.innerText); renderInventory();"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.partID}
                <button onclick="refreshPartData(${index})" class="sync-btn absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all" style="color: var(--accent)" title="Sync API Data">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </td>
            <td class="${cellPadding} text-center ${fontSize} italic cursor-edit hover:text-white transition-colors truncate max-w-[200px] sm:max-w-xs inline-editable" style="color: var(--text-secondary)"
                contenteditable="true" 
                spellcheck="false"
                onblur="updateDescription(${index}, this.innerText)"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.description}
            </td>
            <td class="${cellPadding} text-center">
                <div class="inline-flex items-center justify-center gap-2">
                    ${showColorSquares ? `<div class="live-color-square w-4 h-4 border border-white/30 rounded-sm flex-shrink-0 ${!item.colorID || !getColorHex(item.colorID) ? 'hidden' : ''}" style="background-color: ${getColorHex(item.colorID) || '#ffffff'}" title="${findColorByID(item.colorID)?.name || 'Default Color'}"></div>` : ''}
                    <span class="live-color-text mono text-[10px] uppercase tracking-widest inline-editable"
                        contenteditable="true" spellcheck="false" style="${showColorText && getColorHex(item.colorID) ? `color: ${getColorHex(item.colorID)}` : ''}"
                        title="${findColorByID(item.colorID)?.name || 'Click to edit ID'}"
                        oninput="liveUpdateColorID(${index}, this)"
                        onfocus="handleColorFocus(${index}, this)"
                        onblur="handleColorBlur(${index}, this)"
                        onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                        ${getColorDisplayText(item.colorID)}
                    </span>
                </div>
            </td>
            <td class="${qtyPadding} text-right mono ${fontSize} font-bold inline-editable" style="color: var(--accent)"
                contenteditable="true"
                spellcheck="false"
                onblur="updateQuantity(${index}, this.innerText)"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.quantity}
            </td>
            <td class="${qtyPadding} text-right">
                <button onclick="deleteItem(${index})" class="text-slate-500 hover:text-red-500 transition-colors hover:scale-110 active:scale-95" title="Delete item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </td>
        `;
        fragment.appendChild(row);
    });
    
    inventoryTableBody.innerHTML = '';
    inventoryTableBody.appendChild(fragment);
}

/**
 * Render inventory as grid
 */
function renderGrid() {
    const tableView = document.getElementById('tableView');
    const gridView = document.getElementById('gridView');

    tableView.classList.add('hidden');
    gridView.classList.remove('hidden');
    
    gridView.className = isCompact 
        ? "grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-px bg-[var(--border-light)] border border-[var(--border-medium)] rounded grid-view"
        : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-[var(--border-light)] border border-[var(--border-medium)] rounded grid-view";

    const fragment = document.createDocumentFragment();
    
    inventory.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `bg-[var(--bg-secondary)] border border-[var(--border-light)] aspect-square flex flex-col ${isCompact ? 'p-2' : 'p-4'} group hover:border-[var(--accent)] transition-all relative grid-card`;

        const gridColorText = (!isCompact && instantColorTranslation) ? getColorDisplayText(item.colorID) : (item.colorID ? 'C' + item.colorID : 'DEF');

        card.innerHTML = `
            <div class="flex-grow flex items-center justify-center overflow-hidden mb-2 cursor-zoom-in group-hover:scale-105 transition-transform duration-300" onclick="inspectPart('${item.imageURL}', '${item.partID}', '${item.description}')">
                <img src="${item.imageURL}" class="object-contain w-full h-full img-glow">
            </div>
            <div class="flex justify-between items-end cursor-pointer hover:bg-white/10 p-2 -m-2 rounded transition-colors" onclick="openGridEdit(${index})">
                <div>
                    <div class="mono text-[10px] font-bold leading-tight" style="color: var(--accent)">${item.partID}</div>
                    <div class="mono text-[8px] mt-0.5 flex items-center gap-1" style="${showColorText && getColorHex(item.colorID) ? `color: ${getColorHex(item.colorID)}` : 'color: var(--text-tertiary)'}">
                        ${showColorSquares && item.colorID ? `<div class="w-3 h-3 border border-white/30 rounded-sm flex-shrink-0" style="background-color: ${getColorHex(item.colorID) || '#ffffff'}" title="${findColorByID(item.colorID)?.name || ''}"></div>` : ''}
                        <span>${gridColorText}</span>
                    </div>
                </div>
                <div class="mono text-xs font-bold text-right" style="color: var(--accent)">x${item.quantity}</div>
            </div>
        `;
        fragment.appendChild(card);
    });
    
    gridView.innerHTML = '';
    gridView.appendChild(fragment);
}

/**
 * Toggle density (compact vs normal)
 */
function toggleDensity() {
    isCompact = !isCompact;
    localStorage.setItem('clutchIndex_compact', isCompact);
    const densityIndicator = document.getElementById('densityIndicator');
    densityIndicator.style.left = isCompact ? '50%' : '0';
    renderInventory();
}

/**
 * Switch between table and grid layout
 */
function switchLayout(layout) {
    currentLayout = layout;
    ['viewTable', 'viewGrid'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const isActive = id === 'view' + layout.charAt(0).toUpperCase() + layout.slice(1);
        btn.classList.toggle('active', isActive);
    });
    renderInventory();
}

/**
 * Render import preview table
 */
function renderImportPreview(rows) {
    const previewContainer = document.getElementById('importPreview');
    const previewHead = document.getElementById('previewHead');
    const previewBody = document.getElementById('previewBody');
    
    if (!rows || rows.length === 0) {
        previewContainer.classList.add('hidden');
        return;
    }

    previewContainer.classList.remove('hidden');
    previewHead.innerHTML = '';
    previewBody.innerHTML = '';

    // Header row with Column 1, Column 2, etc.
    const headerRow = document.createElement('tr');
    columnHeaders.forEach((h, i) => {
        const th = document.createElement('th');
        th.className = "px-4 py-3 text-left text-[10px] text-slate-400 uppercase font-bold border-b border-white/10 bg-white/5";
        th.innerHTML = `<span style="color: var(--accent)" class="block mb-0.5 opacity-70">Col ${i+1}</span>`;
        headerRow.appendChild(th);
    });
    previewHead.appendChild(headerRow);

    // Display first 3 data rows
    rows.slice(0, 3).forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-white/5 hover:bg-white/5 transition-colors";
        columnHeaders.forEach((_, i) => {
            const td = document.createElement('td');
            td.className = "px-4 py-3 truncate max-w-[180px] text-slate-400 text-[11px] mono";
            td.innerText = row[i] !== undefined ? row[i] : '-';
            tr.appendChild(td);
        });
        previewBody.appendChild(tr);
    });
}
