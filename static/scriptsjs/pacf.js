import { stock_returns } from './getstockreturns.js';



let pacfFormButtonInitalized = false;
let pacfViewButtonInitalized = false;

// Store the last fetched PACF plot image URL
let lastPacfPlotUrl = null;

export function initalizePacfListeners(){
    const pacfFormButton = document.getElementById('pacf-form');
    const pacfViewButton = document.getElementById('view-pacf-plot-button');
    const pacfModal = document.getElementById('pacf-modal-popup');
    const pacfModalClose = document.getElementById('close-pacf-modal');
    const pacfImgPlot = document.getElementById('pacf-img-plot');
    const responsePacf = document.getElementById('response-pacf');

    if(!pacfFormButton || !pacfViewButton || !pacfModal || !pacfModalClose || !pacfImgPlot){
        console.warn("failed to fetch pacf buttons or modal elements");
        return;
    }
    if(!pacfFormButtonInitalized || !pacfViewButtonInitalized){
        pacfFormButton.addEventListener('submit', handlePacfFormButton);
        pacfViewButton.addEventListener('click', handlePacfViewButton);
        pacfModalClose.addEventListener('click', () => {
            pacfModal.style.display = 'none';
        });
        // Optional: clicking outside modal closes it
        window.addEventListener('click', (event) => {
            if (event.target === pacfModal) {
                pacfModal.style.display = 'none';
            }
        });
        console.log("PACF form button and view button initalized");
        pacfFormButtonInitalized = true;
        pacfViewButtonInitalized = true;
    }
}

async function handlePacfFormButton(event){
    event.preventDefault();

    const formData = new FormData(event.target);
    console.log("Pacf forum submitted fetching image...");

    if(!stock_returns.returns){
        console.warn("Fetch data first");
        return;
    }

    const dataToSend = {
        alpha: formData.get('pacf-alpha'),
        nlags: formData.get('n-lags'),
        stock_returns: stock_returns.returns
    };

    console.log(`With parameters:${dataToSend.alpha},${dataToSend.nlags}`);

    try {
        const response = await fetch('/get_pacf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            lastPacfPlotUrl = imageUrl;
            // Optionally, show a toast or update UI to indicate plot is ready
            console.log('PACF plot fetched and stored.');
        } else {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || `Server error: ${response.status}`;
            } catch(e) {
                errorMessage = `Server error: ${response.status}. Check console.`;
                console.error("SMA Server returned non-JSON:", await response.text());
            }
            lastPacfPlotUrl = null;
            console.error("Error fetching PACF plot:", response.status, errorMessage);
        }
    }
    catch (error) {
        lastPacfPlotUrl = null;
        console.error("Error fetching PACF", error);
    }
}

function handlePacfViewButton(event){
    const pacfModal = document.getElementById('pacf-modal-popup');
    const pacfImgPlot = document.getElementById('pacf-img-plot');
    const responsePacf = document.getElementById('response-pacf');
    if (lastPacfPlotUrl) {
        pacfImgPlot.src = lastPacfPlotUrl;
        responsePacf.textContent = '';
    } else {
        pacfImgPlot.src = '';
        responsePacf.textContent = 'No PACF plot has been fetched yet.';
    }
    pacfModal.style.display = 'block';
}