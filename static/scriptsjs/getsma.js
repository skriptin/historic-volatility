import { update_chart } from './vol_chart.js';
import { jsonResponse } from './getstockreturns.js';

document.getElementById('SMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const window = formData.get('window');

    console.log("User has submitted sma forum with parameters:")
    console.log(`Window Length: ${window}`)

    const responseElement_sma = document.getElementById('response-sma');
    if (!jsonResponse){
        console.warn("No stock data available in jsonResponse. Please fetch data first.");
        responseElement_sma.textContent = "Please fetch stock data first using the form above.";
        responseElement_sma.style.color = 'orange';
        return;
    }


    const requestData = {
        window: window,
        stock_returns: jsonResponse
    };

    try {
        const response = await fetch('/calc_sma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const jsonResponse_sma = await response.json();
            console.log("SMA data", jsonResponse_sma);
            responseElement_sma .textContent = `Success getting sma`;
            responseElement_sma .style.color = 'green';

            // Plot on chart
            console.log("Sending SMA data to update chart");
            update_chart(jsonResponse_sma, `SMA(${window}) Volatility`);

        } else {
            const errorText = await response.json();
            const errorData = await response.json(); 
            const errorMessage = errorData.error || 'Unknown error occurred.';
            console.error("Error fetching SMA data:", response.status, errorData);
            responseElement_sma.textContent = `Error occurred: ${errorMessage}`;
            responseElement_sma.style.color = 'red';
        }
    } 
    catch (error) {
        console.error("Fetch error for SMA:", error);
        responseElement_sma.textContent = `Error occurred while fetching data: ${error.message}`;
        responseElement_sma.style.color = 'red';
    }

});
