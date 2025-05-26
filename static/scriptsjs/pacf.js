import { stock_returns } from './getstockreturns.js';

let pacfListenersInitialized = false;

// --- DOM Element Getters ---
function getPacfElements() {
    const pacfPopup = document.getElementById('pacf-popup');
    const pacfForm = document.getElementById('pacf-form');
    const nLagsInput = document.getElementById('n-lags');
    const alphaInput = document.getElementById('pacf-alpha');
    const viewPlotButton = document.getElementById('view-pacf-plot-button');
    const pacfModal = document.getElementById('pacf-modal-popup');
    const pacfImageElement = document.getElementById('pacf-img-plot');
    const pacfDataContainer = document.getElementById('response-pacf'); // Renamed for clarity
    const closeButtons = document.querySelectorAll('.close-popup-button');

    if (!pacfPopup || !pacfForm || !viewPlotButton || !pacfModal || !pacfImageElement || !pacfDataContainer) {
        console.error("PACF UI Error: One or more essential PACF DOM elements are missing.");
        return null;
    }
    return {
        pacfPopup,
        pacfForm,
        nLagsInput,
        alphaInput,
        viewPlotButton,
        pacfModal,
        pacfImageElement,
        pacfDataContainer,
        closeButtons
    };
}

// --- UI Helper Functions ---
function showElement(element) {
    if (element) element.style.display = 'block'; // Or 'flex', or add/remove 'active' class
}

function hideElement(element) {
    if (element) element.style.display = 'none'; // Or add/remove 'active' class
}

// --- PACF Data Rendering (directly into the container) ---
function renderPacfDataIntoContainer(structuredPacfData, containerElement, titleText = "PACF Results") {
    containerElement.innerHTML = ''; // Clear previous results

    if (!structuredPacfData || Object.keys(structuredPacfData).length === 0) {
        console.warn("renderPacfDataIntoContainer: No PACF data provided or data is empty. Container will be empty.");
        // No DOM message, just console. Container remains cleared.
        return;
    }

    const titleElement = document.createElement('h4');
    titleElement.textContent = titleText;
    containerElement.appendChild(titleElement);

    const lagKeys = Object.keys(structuredPacfData).sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
        return numA - numB;
    });

    for (const lagKey of lagKeys) {
        if (Object.prototype.hasOwnProperty.call(structuredPacfData, lagKey)) {
            const dataTuple = structuredPacfData[lagKey];
            const pacfValue = dataTuple[0];
            const ciTuple = dataTuple[1];
            const isSignificant = dataTuple[2];
            const lagNumber = parseInt(lagKey.replace(/[^0-9]/g, ''), 10);

            const lagDiv = document.createElement('div');
            lagDiv.classList.add('pacf-lag-row');

            if (lagNumber === 0) {
                lagDiv.classList.add('lag-zero');
            } else if (isSignificant) {
                lagDiv.classList.add('significant');
            } else {
                lagDiv.classList.add('not-significant');
            }

            lagDiv.textContent =
                `${lagKey}: Value: ${pacfValue.toFixed(4)}, ` +
                `CI: [${ciTuple[0].toFixed(4)}, ${ciTuple[1].toFixed(4)}], ` +
                `Significant: ${isSignificant}`;
            containerElement.appendChild(lagDiv);
        }
    }
    // Ensure the container has its base class if it was removed
    containerElement.className = 'data-output-area';
}

// --- PACF Form Submission Handler ---
async function handlePacfFormSubmit(event, elements) {
    event.preventDefault();
    const { nLagsInput, alphaInput, pacfDataContainer, pacfImageElement } = elements;

    // Clear previous results from display areas
    pacfDataContainer.innerHTML = '';
    pacfDataContainer.className = 'data-output-area'; // Reset class
    pacfImageElement.src = "";

    console.log("Attempting to fetch PACF data...");

    if (!stock_returns.returns || stock_returns.returns.length === 0) {
        console.warn("PACF Fetch Aborted: No stock return data available. Please fetch stock data first.");
        return;
    }

    const nLags = parseInt(nLagsInput.value, 10);
    const alpha = parseFloat(alphaInput.value);

    if (isNaN(nLags) || nLags <= 0 || isNaN(alpha) || alpha <= 0 || alpha >= 1) {
        console.error("PACF Fetch Aborted: Invalid input for n-Lags or Alpha.", { nLags, alpha });
        return;
    }

    const dataToSend = {
        stock_returns: stock_returns.returns,
        nlags: nLags,
        alpha: alpha
    };

    console.log(`Requesting PACF with n-lags: ${nLags}, alpha: ${alpha}`);

    try {
        const response = await fetch('/get_pacf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("PACF Data received from server:", result);

            if (result.pacf_values) {
                renderPacfDataIntoContainer(result.pacf_values, pacfDataContainer, "PACF of Returns");
            } else {
                console.warn("No 'pacf_values' found in server response. Data table will be empty.");
            }

            if (result.plot_image_path) {
                pacfImageElement.src = result.plot_image_path;
                // If base64: pacfImageElement.src = `data:image/png;base64,${result.plot_image_path}`;
                console.log("PACF plot image path set.");
            } else {
                console.warn("No 'plot_image_path' found in server response. Image will be empty.");
            }
        } else {
            const errorBody = await response.text(); // Get raw error for logging
            console.error("PACF Fetch Failed: Server error.", { status: response.status, body: errorBody });
        }
    } catch (error) {
        console.error("PACF Fetch Failed: Network or script error.", error);
    }
}

// --- Main Initialization Function ---
export function initializePacfListeners() {
    if (pacfListenersInitialized) {
        return;
    }
    console.log("Initializing PACF popup listeners...");

    const elements = getPacfElements();
    if (!elements) {
        console.error("Could not initialize PACF popup: essential elements missing.");
        return; // Stop if elements not found
    }

    const { pacfPopup, pacfForm, viewPlotButton, pacfModal, closeButtons } = elements;

    // Form submission
    pacfForm.addEventListener('submit', (event) => handlePacfFormSubmit(event, elements));

    // "View" button to show the modal
    viewPlotButton.addEventListener('click', () => {
        console.log("View PACF plot button clicked.");
        // Check if there's actually an image or data before showing, or just show.
        // For simplicity, just show it. User will see empty areas if data fetch failed.
        if (elements.pacfImageElement.src || elements.pacfDataContainer.innerHTML.trim() !== '') {
            showElement(pacfModal);
        } else {
            console.warn("View PACF plot: Modal not shown as there is no plot image or PACF data to display yet. Please submit the form first.");
            // Optionally, you could briefly flash a message in the console or disable the button
            // if the data hasn't been fetched, but per your request, no UI messages.
        }
    });

    // Generic close button handler
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPopupId = button.dataset.targetPopup;
            console.log(`Close button clicked for target: ${targetPopupId}`);
            if (targetPopupId === "pacf-popup") {
                hideElement(pacfPopup);
            } else if (targetPopupId === "modal popup-content" || targetPopupId === "pacf-modal-popup") {
                // The HTML uses "modal popup-content" for the inner modal's close button
                hideElement(pacfModal);
            } else {
                // Fallback for other potential close buttons if their data-target-popup matches an ID
                const targetElement = document.getElementById(targetPopupId);
                if (targetElement) {
                    hideElement(targetElement);
                } else {
                    console.warn(`Close button targeted non-existent element ID: ${targetPopupId}`);
                }
            }
        });
    });

    pacfListenersInitialized = true;
    console.log("PACF popup listeners initialized successfully.");
}

// Example of how you might call this from your main UI interaction script:
// This assumes there's a button somewhere else that opens the 'pacf-popup' initially.
// When that button is clicked, you would:
// 1. Make 'pacf-popup' visible.
// 2. Call initializePacfPopup() (it will only run its setup once).

/*
// In your ui_interactions.js or similar:
const openPacfButton = document.getElementById('id-of-button-that-opens-the-pacf-popup');
const pacfPopupElement = document.getElementById('pacf-popup');

if (openPacfButton && pacfPopupElement) {
    openPacfButton.addEventListener('click', () => {
        pacfPopupElement.style.display = 'block'; // Or however you show it
        initializePacfPopup(); // Safe to call multiple times due to the guard
    });
}
*/