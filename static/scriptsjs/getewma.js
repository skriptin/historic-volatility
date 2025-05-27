import { update_chart } from './vol_chart.js';
import { stock_returns } from './getstockreturns.js';
import { addSeriesToListUI } from './series.js';

let ewmaListenerAttached = false;


async function handleEwmaFormSubmit(event){
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        alpha: formData.get('ewma-alpha')
    }

    console.log("User has submitted ewma forum with parameters:")
    console.log(`Alpha: ${data.alpha}`)
    
    if (data.alpha > 1 || 0 > data.alpha){
        console.warn("Alpha not between 0 and 1");
        return;
    }

    if (!stock_returns.returns){
        console.warn("No stock data available in jsonResponse. Please fetch data first.");
        return;
    }

    const requestData = {
        alpha: data.alpha,
        stock_returns: stock_returns.returns
    };

    try {
        const response = await fetch('/calc_ewma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const jsonResponse_ewma = await response.json();
            console.log("EWMA data", jsonResponse_ewma);
            //plot chart and labels
            update_chart(jsonResponse_ewma, `EWMA(${data.alpha})`);
            addSeriesToListUI(`EWMA(${data.alpha})`);

        } else {
            const errorData = await response.json(); 
            const errorMessage = errorData.error || 'Unknown error occurred.';
            console.error("Error fetching EWMA data:", response.status, errorMessage);

        }
    } 
    catch (error) {
        console.error("Fetch error for SMA:", error);

    }

}

export function initalizeEwmaForm() {
    console.log('Attaching Event Listern to ewma forum');
    const ewmaForm = document.getElementById('EWMA-volatility');

    if (ewmaForm && !ewmaListenerAttached) {
        ewmaForm.addEventListener('submit', handleEwmaFormSubmit);
        ewmaListenerAttached = true;
        console.log('EWMA form event listener attached.');
    } else if (ewmaForm && ewmaListenerAttached) {
        console.log('EWMA form event listener already attached, not adding again.');
    } else if (!ewmaForm) {
        console.warn('SMA form (#SMA-volatility) not found when trying to attach listener.');
    }
}