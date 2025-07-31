import { stock_returns } from './getstockreturns.js';

let lastPacfPlotUrl = null;

export function initalizePacfListeners() {
    const pacfFormButton = document.getElementById('pacf-form');
    const pacfViewButton = document.getElementById('view-pacf-plot-button');
    const pacfConfigPopup = document.getElementById('pacf-popup');
    const pacfModal = document.getElementById('pacf-modal-popup');
    const pacfModalClose = document.getElementById('close-pacf-modal');
    const pacfImgPlot = document.getElementById('pacf-img-plot');
    const responsePacf = document.getElementById('response-pacf');

    if (!pacfFormButton || !pacfViewButton || !pacfConfigPopup || !pacfModal || !pacfModalClose || !pacfImgPlot) {
        console.warn("failed to fetch pacf buttons or modal elements");
        return;
    }

    pacfFormButton.addEventListener('submit', handlePacfFormButton);
    pacfViewButton.addEventListener('click', function(event) {
        // Position the popup next to the PACF config popup
        const configRect = pacfConfigPopup.getBoundingClientRect();
        pacfModal.style.position = 'absolute';
        pacfModal.style.display = 'block';
        pacfModal.style.visibility = 'hidden';
        let top = configRect.top + window.scrollY;
        let left = configRect.right + window.scrollX + 4;
        const popupWidth = pacfModal.offsetWidth;
        const popupHeight = pacfModal.offsetHeight;
        if (left + popupWidth > window.innerWidth - 10) {
            left = configRect.left + window.scrollX - popupWidth - 4;
        }
        if (left < 10) left = 10;
        if (top + popupHeight > window.innerHeight - 10) {
            top = window.innerHeight - popupHeight - 10;
        }
        if (top < 10) top = 10;
        pacfModal.style.top = `${top}px`;
        pacfModal.style.left = `${left}px`;
        pacfModal.style.visibility = '';
        pacfModal.classList.add('active');
        if (lastPacfPlotUrl) {
            pacfImgPlot.src = lastPacfPlotUrl;
            pacfImgPlot.style.display = '';
            responsePacf.textContent = '';
        } else {
            pacfImgPlot.src = '';
            pacfImgPlot.style.display = 'none';
            responsePacf.textContent = 'No PACF plot has been fetched yet.';
        }
        event.stopPropagation();
        // Close on outside click
        window.addEventListener('click', function handler(e) {
            if (
                pacfModal.classList.contains('active') &&
                !pacfModal.contains(e.target) &&
                e.target !== pacfViewButton
            ) {
                pacfModal.classList.remove('active');
                pacfModal.style.display = 'none';
                window.removeEventListener('click', handler);
            }
        });
    });
    pacfModalClose.addEventListener('click', () => {
        pacfModal.classList.remove('active');
        pacfModal.style.display = 'none';
    });
}

async function handlePacfFormButton(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (!stock_returns.returns) {
        console.warn("Fetch data first");
        return;
    }
    const dataToSend = {
        alpha: formData.get('pacf-alpha'),
        nlags: formData.get('n-lags'),
        stock_returns: stock_returns.returns
    };
    try {
        const response = await fetch('/get_pacf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });
        if (response.ok) {
            const blob = await response.blob();
            lastPacfPlotUrl = URL.createObjectURL(blob);
        } else {
            lastPacfPlotUrl = null;
        }
    } catch (error) {
        lastPacfPlotUrl = null;
    }
}
