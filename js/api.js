/**
 * API MODULE
 * Handles all API calls to Rebrickable and related data fetching
 */

// --- Color Management ---
/**
 * Fetch all available LEGO colors from Rebrickable API
 */
async function fetchColors() {
    try {
        const response = await fetch(`https://rebrickable.com/api/v3/lego/colors/?page_size=1000&ordering=name`, {
            headers: { 'Authorization': `key ${API_KEY}` }
        });
        const data = await response.json();
        colors = data.results;
        return colors;
    } catch (e) {
        console.error('Failed to fetch colors:', e);
        return [];
    }
}

/**
 * Check if a color ID exists in the colors array
 */
function isValidColorID(str) {
    if (!colors) return false;
    const num = parseInt(str);
    if (isNaN(num)) return false;
    return colors.some(c => c.id === num);
}

// --- Part Data Fetching ---
/**
 * Fetch part data from Rebrickable API
 * Handles both regular parts and element IDs
 * @param {string} id - Part ID or Element ID
 * @param {string|null} colorID - Optional color ID for color variant lookup
 * @returns {Object} Part data with description and imageURL
 */
async function fetchPartData(id, colorID = null) {
    const cleanID = String(id).trim().replace(/\.0$/, '');
    try {
        const isElement = cleanID.length >= 6 && !isNaN(cleanID);
        
        // Use specialized color endpoint if colorID is provided
        let url;
        if (colorID && !isElement) {
            url = `https://rebrickable.com/api/v3/lego/parts/${cleanID}/colors/${colorID}/`;
        } else {
            url = isElement 
                ? `https://rebrickable.com/api/v3/lego/elements/${cleanID}/`
                : `https://rebrickable.com/api/v3/lego/parts/${cleanID}/`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `key ${API_KEY}` }
        });
        
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        
        if (colorID && !isElement) {
            return {
                description: data.part_img_url ? `Part ${cleanID} in ${data.color_name}` : 'Unknown Color Variant',
                imageURL: data.part_img_url || 'https://placehold.co/100x100/1a1a1a/ccff00?text=Color+Not+Found'
            };
        }

        return {
            description: isElement ? data.part.name : data.name,
            imageURL: isElement ? data.element_img_url : data.part_img_url
        };
    } catch (e) {
        return {
            description: 'Unknown Element',
            imageURL: 'https://placehold.co/100x100/1a1a1a/ccff00?text=Part+Not+Found'
        };
    }
}

/**
 * Refresh part data by fetching from API
 */
async function refreshPartData(index) {
    const item = inventory[index];
    if (!item) return;
    const apiData = await fetchPartData(item.partID, item.colorID);
    item.description = apiData.description;
    item.imageURL = apiData.imageURL;
}

/**
 * Refresh all part data in inventory
 */
async function refreshAllParts() {
    await Promise.all(inventory.map((_, i) => refreshPartData(i)));
    saveToStorage();
}
