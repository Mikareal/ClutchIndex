/**
 * CLUTCH INDEX - Main Application File
 * 
 * A LEGO inventory management system that allows users to:
 * - Track LEGO parts and quantities
 * - Switch between table and grid views
 * - Import/export data in multiple formats
 * - Search parts using Rebrickable API
 * - Customize themes and appearance
 * 
 * ARCHITECTURE:
 * - config.js: API configuration
 * - js/state.js: State management and persistence
 * - js/api.js: Rebrickable API interactions
 * - js/ui.js: DOM rendering and visual updates
 * - js/modals.js: Modal dialog management
 * - js/events.js: Event listeners and keyboard shortcuts
 * - js/data-import-export.js: File import/export functionality
 * 
 * All module files are loaded in the HTML file before this script.
 * Initialize the application by calling initApp() after page load.
 */

/**
 * Initialize the application
 * Called on page load to set up all listeners, apply themes, and render inventory
 */
function initApp() {
    // Apply saved theme and mode
    document.documentElement.setAttribute('data-theme', currentTheme);
    setMode(currentMode);
    setTheme(currentTheme);
    applyThemeToggleVisibility();

    // Initialize UI
    switchLayout(currentLayout);

    // Pre-fetch colors to populate inventory color names/squares
    fetchColors().then(() => renderInventory());

    // Initialize Density UI
    const densityIndicator = document.getElementById('densityIndicator');
    if (densityIndicator) densityIndicator.style.left = isCompact ? '50%' : '0';

    // Render inventory and hide skeleton
    renderInventory();
    
    // Simulate loading with a small delay for visual effect (150ms)
    setTimeout(() => {
        hideSkeletonLoader();
    }, 150);

    // Set up event listeners
    initializeEventListeners();

    console.log('✓ ClutchIndex initialized successfully');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
