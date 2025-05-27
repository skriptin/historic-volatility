import { stock_returns } from './getstockreturns.js';



let pacfFormButtonInitalized = false;
let pacfViewButtonInitalized = false;

export function initalizePacfListeners(){

    const pacfFormButton = document.getElementById('pacf-form');
    const pacfViewButton = document.getElementById('view-pacf-plot-button');

    if(!pacfFormButton || !pacfViewButton){
        console.warn("failed to fetch pacf buttons");
        return;
    }
    if(!pacfFormButtonInitalized || !pacfViewButtonInitalized){
        pacfFormButton.addEventListener('submit', handlePacfFormButton);
        pacfViewButton.addEventListener('button', handlePacfViewButton);
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
            console.log('%c ', `font-size: 1px; padding: 100px 200px; background: url(${imageUrl}) no-repeat; background-size: contain;`);

        } else {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || `Server error: ${response.status}`;
            } catch(e) {
                errorMessage = `Server error: ${response.status}. Check console.`;
                console.error("SMA Server returned non-JSON:", await response.text());
            }
        console.error("Error fetching PACF plot:", response.status, errorMessage);
        }
    }
    catch (error) {
        console.error("Error fetching PACF", error);
    }
}

function handlePacfViewButton(event){

}