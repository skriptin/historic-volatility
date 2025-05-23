import { update_chart } from './vol_chart.js';
import { stock_returns } from './getstockreturns.js';

let smaFormListenerAttached = false;

async function handleSmaFormSubmit(event) { 
    event.preventDefault();
    const formData = new FormData(event.target);
    const windowValue = formData.get('window'); 

    console.log("User has submitted SMA form with parameters:");
    console.log(`Window Length: ${windowValue}`);


    if (!stock_returns.returns || Object.keys(stock_returns.returns).length === 0 ) {
        console.warn("No stock data available for SMA. Please fetch data first.");
        return;
    }
    if (!windowValue || parseInt(windowValue) <= 0 || isNaN(parseInt(windowValue))) {
        console.warn("Invalid window length entered for SMA:", windowValue);
        return;
    }

    const requestData = {
        window: parseInt(windowValue),
        stock_returns: stock_returns.returns 
    };

    try {
        const response = await fetch('/calc_sma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const smaJsonResponse = await response.json();
            console.log("SMA data", smaJsonResponse);
            update_chart(smaJsonResponse, `SMA(${windowValue})`);
        } else {
            let errorMessage = 'Unknown error occurred.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || `Server error: ${response.status}`;
            } catch(e) {
                errorMessage = `Server error: ${response.status}. Check console.`;
                console.error("SMA Server returned non-JSON:", await response.text());
            }
        console.error("Error fetching SMA data:", response.status, errorMessage);
        }
    }
    catch (error) {
        console.error("Fetch error for SMA:", error);
    }
}

export function initializeSmaForm() {
    console.log('Attaching Event Listern to sma forum');
    const smaForm = document.getElementById('SMA-volatility');

    if (smaForm && !smaFormListenerAttached) {
        smaForm.addEventListener('submit', handleSmaFormSubmit);
        smaFormListenerAttached = true;
        console.log('SMA form event listener attached.');
    } else if (smaForm && smaFormListenerAttached) {
        console.log('SMA form event listener already attached, not adding again.');
    } else if (!smaForm) {
        console.warn('SMA form (#SMA-volatility) not found when trying to attach listener.');
    }
}









