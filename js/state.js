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
let showColorText = localStorage.getItem('clutchIndex_showColorText') !== 'false'; // Show color ID in actual color
let showColorSquares = localStorage.getItem('clutchIndex_showColorSquares') !== 'false'; // Show color squares next to color ID
let instantColorTranslation = localStorage.getItem('clutchIndex_instantTranslation') === 'true'; // Show names instead of IDs
let showThemeToggle = localStorage.getItem('clutchIndex_showThemeToggle') === 'true'; // Visibility of the header toggle (defaults to false)

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

/**
 * Toggle color text display (color ID in actual color)
 */
function toggleColorText() {
    showColorText = !showColorText;
    localStorage.setItem('clutchIndex_showColorText', showColorText);
    renderInventory();
}

/**
 * Toggle color squares display
 */
function toggleColorSquares() {
    showColorSquares = !showColorSquares;
    localStorage.setItem('clutchIndex_showColorSquares', showColorSquares);
    renderInventory();
}

/**
 * Toggle instant color translation (ID to Name)
 */
function toggleInstantTranslation() {
    instantColorTranslation = !instantColorTranslation;
    localStorage.setItem('clutchIndex_instantTranslation', instantColorTranslation);
    renderInventory();
}

/**
 * Toggle header theme switch visibility
 */
function toggleShowThemeToggle() {
    showThemeToggle = !showThemeToggle;
    localStorage.setItem('clutchIndex_showThemeToggle', showThemeToggle);
    applyThemeToggleVisibility();
}

/**
 * Find a color by ID from the colors array
 */
function findColorByID(colorID) {
    if (!colorID || colors.length === 0) return null;
    return colors.find(c => c.id.toString() === colorID.toString());
}

/**
 * Get hex color from color ID (for styling)
 */
function getColorHex(colorID) {
    const color = findColorByID(colorID);
    if (color && color.rgb) {
        return '#' + color.rgb;
    }
    return null;
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
    localStorage.setItem('clutchIndex_data', JSON.stringify(inventory));
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
