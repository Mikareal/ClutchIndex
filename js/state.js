/**
 * STATE MANAGEMENT
 * Handles all application state and localStorage persistence
 */

// --- Core State Variables ---
let inventory = JSON.parse(localStorage.getItem('clutchIndex_data')) || [];
let stagedData = [];
let columnHeaders = [];
let colors = [];

// --- UI State Variables ---
let currentLayout = 'table'; // 'table' or 'grid'
let isCompact = localStorage.getItem('clutchIndex_compact') === 'true';
let currentTheme = localStorage.getItem('clutchIndex_theme') || 'cyan';
let currentMode = localStorage.getItem('clutchIndex_mode') || 'dark';
let gridEditIndex = null;
let fileType = ''; // To store the type of the file being imported

// --- State Persistence ---
/**
 * Save inventory to localStorage and re-render
 */
function saveToStorage() {
    localStorage.setItem('clutchIndex_data', JSON.stringify(inventory));
    renderInventory();
}

/**
 * Save theme to localStorage and apply it
 */
function saveTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('clutchIndex_theme', theme);
}

/**
 * Save mode (dark/light) to localStorage and apply it
 */
function saveMode(mode) {
    currentMode = mode;
    localStorage.setItem('clutchIndex_mode', mode);
}

/**
 * Save custom color to localStorage
 */
function saveCustomColor(hex) {
    localStorage.setItem('clutchIndex_customColor', hex);
}

/**
 * Get stored custom color or return default
 */
function getStoredCustomColor() {
    return localStorage.getItem('clutchIndex_customColor') || '#06b6d4';
}

// --- Inventory State Methods ---
/**
 * Add new item to inventory or increment existing
 */
function addToInventory(partID, quantity, colorID, description, imageURL) {
    const existing = inventory.find(i => i.partID === partID && i.colorID === colorID);
    if (existing) {
        existing.quantity += quantity;
    } else {
        inventory.push({ partID, quantity, colorID, description, imageURL });
    }
    saveToStorage();
}

/**
 * Update quantity of inventory item
 */
function updateQuantity(index, newVal) {
    if (typeof newVal === 'number') {
        inventory[index].quantity = Math.max(0, inventory[index].quantity + newVal);
    } else {
        const val = parseInt(newVal) || 0;
        inventory[index].quantity = Math.max(0, val);
    }
    saveToStorage();
}

/**
 * Update part ID for inventory item
 */
function updatePartID(index, val) {
    inventory[index].partID = val.trim().replace(/\.0$/, '');
    saveToStorage();
}

/**
 * Update color ID for inventory item
 */
function updateColorID(index, val) {
    inventory[index].colorID = val.trim();
    saveToStorage();
}

/**
 * Update description for inventory item
 */
function updateDescription(index, val) {
    inventory[index].description = val.trim() || 'Unknown Element';
    saveToStorage();
}

/**
 * Delete item from inventory
 */
function deleteItem(index) {
    inventory.splice(index, 1);
    saveToStorage();
}

/**
 * Clear all inventory
 */
function clearInventory() {
    inventory = [];
    saveToStorage();
}
