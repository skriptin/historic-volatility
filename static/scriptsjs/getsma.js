import { update_chart } from './vol_chart.js';
import { stock_returns } from './getstockreturns.js';

document.getElementById('SMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const window = formData.get('window');

    console.log("User has submitted sma forum with parameters:")
    console.log(`Window Length: ${window}`)

    const responseElement_sma = document.getElementById('response-sma');

    if (!stock_returns.returns){
        console.warn("No stock data available in stock_returns.returns. Please fetch data first.");
        responseElement_sma.textContent = "Please fetch stock data first using the form above.";
        responseElement_sma.class = 'response-message warning';
        return;
    }
    if (window <= 0){
        console.warn("Invalid window length entered")
        responseElement_sma.textContent = 'Invalid window length enter, make sure window > 0'
        responseElement_sma.class = 'response-message warning'
    }

    const requestData = {
        window: window,
        stock_returns: stock_returns.returns
    };

    responseElement_sma.textContent = `Calculating sma ${window}`
    responseElement_sma.class = 'response-message'

    try {
        const response = await fetch('/calc_sma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log("SMA data", jsonResponse);
            responseElement_sma.textContent = `Success getting sma`;
            responseElement_sma.class = 'response-message success'

            // Plot on chart
            console.log("Sending SMA data to update chart");
            update_chart(jsonResponse, `SMA(${window})`);

        } else {
            const errorData = await response.json(); 
            const errorMessage = errorData.error || 'Unknown error occurred.';
            console.error("Error fetching SMA data:", response.status, jsonResponse, errorMessage);
            responseElement_sma.textContent = `An unknown server error has occured`;
            responseElement_sma.class = 'response-message error';
        }
    } 
    catch (error) {
        console.error("Fetch error for SMA:", error);
        responseElement_sma.textContent = `An unknown fetch error has occured`;
        responseElement_sma.class = 'response-message error';
    }

});
