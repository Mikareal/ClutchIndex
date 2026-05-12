/**
 * UI MODULE
 * Handles all DOM rendering and visual updates
 */

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
    const modeSelect = document.getElementById('modeSelect');
    if (modeSelect) modeSelect.value = mode;
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
    const isHidden = sidebar.classList.contains('translate-x-full');
    
    if (isHidden) {
        sidebar.classList.remove('translate-x-full');
        if (colors.length === 0) {
            const fetched = await fetchColors();
            renderColorList(fetched);
        }
    } else {
        sidebar.classList.add('translate-x-full');
    }
}
function renderColorList(items) {
    const listContainer = document.getElementById('colorList');
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
        row.className = `hover:bg-[var(--bg-hover)] transition-colors group ${isCompact ? 'compact-row' : 'py-2'}`;
        
        const thumbSize = isCompact ? 'w-8 h-8' : 'w-12 h-12 border border-[var(--border-medium)]';
        const fontSize = isCompact ? 'text-xs' : 'text-sm';

        const brickContent = `<img src="${item.imageURL}" alt="${item.partID}" class="object-contain w-full h-full img-glow cursor-zoom-in" onclick="event.stopPropagation(); inspectPart('${item.imageURL}', '${item.partID}', '${item.description}')">
               <div class="hover-preview glass p-1 w-32 h-32 bottom-0 left-14 border border-accent/20"><img src="${item.imageURL}" class="w-full h-full object-contain"></div>`;

        row.innerHTML = `
            <td class="px-2 text-center">
                <div class="${thumbSize} mx-auto bg-black flex items-center justify-center overflow-hidden relative preview-container">
                    ${brickContent}
                </div>
            </td>
            <td class="px-4 mono ${fontSize} font-bold inline-editable relative text-center" style="color: var(--accent)"
                contenteditable="true" spellcheck="false"
                onblur="updatePartID(${index}, this.innerText); renderInventory();"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.partID}
                <button onclick="refreshPartData(${index})" class="sync-btn absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all" style="color: var(--accent)" title="Sync API Data">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </td>
            <td class="px-4 ${fontSize} italic cursor-edit hover:text-white transition-colors truncate max-w-[200px] sm:max-w-xs text-slate-400 inline-editable" style="color: var(--text-dim)"
                contenteditable="true" 
                spellcheck="false"
                onblur="updateDescription(${index}, this.innerText)"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.description}
            </td>
            <td class="px-4 mono text-[10px] uppercase tracking-widest inline-editable text-slate-500" style="color: var(--text-dim)"
                contenteditable="true" spellcheck="false"
                onblur="updateColorID(${index}, this.innerText)"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.colorID || 'Default'}
            </td>
            <td class="px-6 text-right mono ${fontSize} font-bold inline-editable" style="color: var(--accent)"
                contenteditable="true"
                spellcheck="false"
                onblur="updateQuantity(${index}, this.innerText)"
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">
                ${item.quantity}
            </td>
            <td class="px-6 text-right text-slate-700" style="color: var(--text-dim)">
                <button onclick="deleteItem(${index})" class="hover:text-red-500 transition-colors">
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
        ? "grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-px bg-[var(--border-light)] border border-[var(--border-medium)]"
        : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-[var(--border-light)] border border-[var(--border-medium)]";

    const fragment = document.createDocumentFragment();
    
    inventory.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `bg-[var(--bg-secondary)] border border-[var(--border-medium)] aspect-square flex flex-col ${isCompact ? 'p-2' : 'p-4'} group hover:border-[var(--accent)] transition-all relative`;
        
        card.innerHTML = `
            <div class="flex-grow flex items-center justify-center overflow-hidden mb-2 cursor-zoom-in" onclick="inspectPart('${item.imageURL}', '${item.partID}', '${item.description}')">
                <img src="${item.imageURL}" class="object-contain w-full h-full img-glow group-hover:scale-110 transition-transform">
            </div>
            <div class="flex justify-between items-end cursor-pointer hover:bg-white/10 p-1 -m-1 rounded transition-colors" onclick="openGridEdit(${index})">
                <div class="mono text-[10px] font-bold" style="color: var(--accent)">${item.partID}</div>
                <div class="flex flex-col items-end">
                    <div class="mono text-[8px] text-slate-500" style="color: var(--text-dim)">${item.colorID ? 'COL ' + item.colorID : ''}</div>
                    <div class="mono text-xs font-bold" style="color: var(--accent)">x${item.quantity}</div>
                </div>
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
