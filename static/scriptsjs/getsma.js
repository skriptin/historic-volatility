import { update_chart } from './vol_chart.js';
import { stock_returns } from './getstockreturns.js';

let smaFormListenerAttached = false;

function initalizeSMAForm(){
    document.getElementById('SMA-volatility').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const window = formData.get('window');

        console.log("User has submitted sma forum with parameters:")
        console.log(`Window Length: ${window}`)


        if (!stock_returns.returns){
            console.warn("No stock data available in stock_returns.returns. Please fetch data first.");
            return;
        }
        if (window <= 0){
            console.warn("Invalid window length entered")

        }

        const requestData = {
            window: window,
            stock_returns: stock_returns.returns
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
                const jsonResponse = await response.json();
                console.log("SMA data", jsonResponse);


                // Plot on chart
                console.log("Sending SMA data to update chart");
                update_chart(jsonResponse, `SMA(${window})`);

            } else {
                const errorData = await response.json(); 
                const errorMessage = errorData.error || 'Unknown error occurred.';
                console.error("Error fetching SMA data:", response.status, errorMessage);

            }
        } 
        catch (error) {
            console.error("Fetch error for SMA:", error);
        }
    });
}

export { initalizeSMAForm };










