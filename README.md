# ClutchIndex - LEGO Inventory Manager

A modern, web-based LEGO inventory management system with API integration, multiple export formats, and customizable theming.

## 📋 Project Structure

```
ClutchIndex/
├── index.html              # Main HTML file (contains all UI markup)
├── app.js                  # Application initialization
├── config.js               # API configuration (API_KEY)
├── styles.css              # Global styling (Tailwind + custom variables)
├── README.md               # This file
│
└── js/                     # Modular JavaScript (loaded in dependency order)
    ├── state.js            # State management & persistence
    ├── api.js              # Rebrickable API interactions
    ├── ui.js               # DOM rendering & visual updates
    ├── modals.js           # Modal dialog management
    ├── data-import-export.js # File import/export functionality
    └── events.js           # Event listeners & keyboard shortcuts
```

## 🏗️ Architecture Overview

The application is organized into modular files that separate concerns and responsibilities:

### **app.js** - Main Entry Point
- Initializes the application on page load
- Coordinates module setup
- Applies saved user preferences (theme, layout, mode)

### **js/state.js** - State Management
- Manages all application state variables
- Handles localStorage persistence
- Provides state mutation functions:
  - `addToInventory()` - Add or increment items
  - `updateQuantity()` - Modify quantity
  - `updatePartID()` - Update part identifier
  - `updateColorID()` - Update color
  - `updateDescription()` - Update description
  - `deleteItem()` - Remove item
  - `clearInventory()` - Reset all data

**Key State Variables:**
- `inventory` - Array of LEGO parts
- `currentLayout` - 'table' or 'grid'
- `isCompact` - Density toggle state
- `currentTheme` - Active color theme
- `currentMode` - 'dark' or 'light'
- `colors` - Loaded color palette from Rebrickable

### **js/api.js** - API Integration
Handles all communication with Rebrickable API:
- `fetchColors()` - Load LEGO color palette
- `fetchPartData(id, colorID)` - Get part information
- `refreshPartData(index)` - Update single part from API
- `refreshAllParts()` - Update all parts from API
- `isValidColorID(str)` - Validate color existence

### **js/ui.js** - Rendering & UI
DOM rendering and visual state management:
- `setTheme(theme)` - Apply color theme
- `setMode(mode)` - Switch dark/light mode
- `updateCustomColor(hex)` - Set custom color
- `renderInventory()` - Main render dispatcher
- `renderTable()` - Render table view
- `renderGrid()` - Render grid/card view
- `switchLayout(layout)` - Switch between table/grid
- `toggleDensity()` - Compact/normal view
- `toggleGridBackground()` - Show/hide grid pattern

### **js/modals.js** - Modal Management
Controls all dialog overlays:
- **Grid Edit**: `openGridEdit()`, `closeGridEdit()`, `saveGridEdit()`
- **Quick Entry**: `openQuickEntry()`, `closeQuickEntry()`, `submitQuickEntry()`
- **Batch Paste**: `openBatchPaste()`, `closeBatchPaste()`, `submitBatchPaste()`
- **Settings**: `openSettings()`, `closeSettings()`
- **Export**: `openExportSettings()`, `closeExportSettings()`
- **Inspection**: `inspectPart()`, `closeInspection()`
- **Reset**: `openResetModal()`, `closeResetModal()`, `confirmReset()`

### **js/data-import-export.js** - Data I/O
Import and export functionality:
- **Import**: `handleFileUpload()`, `processImport()`
- **Export**: `exportData()`, with support for:
  - XLSX (Excel)
  - JSON (ClutchIndex format)
  - XML (BrickLink format)
  - CSV (comma/semicolon/tab-separated)
  - TXT (BrickLink mass search)
- **Backup**: `downloadBackup()`
- **Preview**: `renderImportPreview()`

### **js/events.js** - Event Handling
Central event listener management:
- `initializeEventListeners()` - Setup all events
- Layout/view toggles
- Keyboard shortcuts (Escape, alphanumeric quick entry)
- Modal close-on-outside-click
- Color search filtering
- Export/import button events

### **config.js** - Configuration
Single file containing:
```javascript
const API_KEY = 'your_rebrickable_api_key';
```
[Get your free API key from Rebrickable](https://rebrickable.com/api)

### **styles.css** - Styling
- CSS custom properties (theme colors)
- Dark/light mode variables
- Theme variants (cyan, blue, purple, green, rose, amber, bw)
- Tailwind integration

## 🔄 Data Flow

```
User Input
    ↓
Events (js/events.js)
    ↓
Modals (js/modals.js) [if needed]
    ↓
API Calls (js/api.js) [if needed]
    ↓
State Updates (js/state.js)
    ↓
localStorage Persistence
    ↓
UI Re-render (js/ui.js)
```

## 🎯 Key Features

### **Inventory Management**
- Add/edit/delete LEGO parts
- Track quantities and colors
- Support for part IDs and element IDs
- Inline editing on table cells

### **Multiple Views**
- **Table View**: Detailed columnar display
- **Grid/Card View**: Visual thumbnail display
- **Density Toggle**: Compact or spacious layouts

### **Data Import/Export**
- Import: JSON, CSV, TSV, TXT, XLSX
- Export: JSON, XML, CSV, TSV, TXT, XLSX
- Auto-detection of column headers
- Smart parsing of data formats

### **API Integration**
- Real-time part data from Rebrickable
- Color palette search and reference
- Part images and descriptions
- Automatic color ID validation

### **Customization**
- 7 built-in color themes
- Custom color picker
- Dark/light mode toggle
- Grid background pattern
- Auto-saving to localStorage

### **Keyboard Shortcuts**
- Press **any alphanumeric key** to open quick entry
- **Escape** closes all open modals
- **Enter** navigates through quick entry fields

## 🚀 Initialization Flow

```
1. HTML loads all script tags in order
2. State variables initialized (js/state.js)
3. API functions available (js/api.js)
4. UI functions available (js/ui.js)
5. Modal functions available (js/modals.js)
6. Data I/O functions available (js/data-import-export.js)
7. Events set up (js/events.js)
8. Main app initializes (app.js):
   - Apply saved theme
   - Apply saved mode
   - Render initial UI
   - Set up event listeners
   - Ready for user interaction
```

## 💾 LocalStorage Keys

- `clutchIndex_data` - Serialized inventory array
- `clutchIndex_theme` - Selected color theme
- `clutchIndex_mode` - Dark/light mode setting
- `clutchIndex_customColor` - Custom hex color

## 🔌 External Dependencies

- **Tailwind CSS** - Utility-first CSS framework (CDN)
- **XLSX (SheetJS)** - Excel/CSV file parsing (CDN)
- **Rebrickable API** - LEGO part database

## 📝 Adding New Features

To add a new feature:

1. **Determine which module** it belongs to:
   - UI rendering → `ui.js`
   - State changes → `state.js`
   - API calls → `api.js`
   - Modal/dialog → `modals.js`
   - Data I/O → `data-import-export.js`
   - Event handling → `events.js`

2. **Create the function** in the appropriate module

3. **Call the function** from:
   - HTML event handlers (onclick, etc.)
   - Other module functions
   - Event listeners in `events.js`

4. **Test** in the browser

## 🔧 Development Tips

- Use browser console for debugging: `console.log(inventory)`
- Check localStorage: `localStorage.getItem('clutchIndex_data')`
- Inspect theme variables: `getComputedStyle(document.documentElement).getPropertyValue('--accent')`
- Use Rebrickable API docs: https://rebrickable.com/api/

## 📜 License

See LICENSE file for details.

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.

---

**Last Updated:** May 12, 2026
