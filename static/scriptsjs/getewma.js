import { update_chart } from './vol_chart.js';
import { stock_returns } from './getstockreturns.js';


document.getElementById('EWMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        alpha: formData.get('alpha')
    }


    console.log("User has submitted ewma forum with parameters:")
    console.log(`Alpha: ${data.alpha}`)
    
    if (data.alpha > 1 || 0 > data.alpha){

        responseElement_ewma.textContent = 'Invalid Alpha value, make sure alpha is between 0 and 1'
        responseElement_ewma.class = 'response-message warning'
        return;
    }
    const responseElement_ewma = document.getElementById("response-ewma")

    if (!stock_returns.returns){
        console.warn("No stock data available in jsonResponse. Please fetch data first.");
        responseElement_ewma.textContent = "please fetch stock data first";
        responseElement_ewma.class = 'response-message warning';
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
            responseElement_ewma.textContent = `Success getting EWMA`;
            responseElement_ewma.class = 'response-message success'
            //plot chart
            update_chart(jsonResponse_ewma, `EWMA(${data.alpha})`);

        } else {
            const errorData = await response.json(); 
            const errorMessage = errorData.error || 'Unknown error occurred.';
            console.error("Error fetching EWMA data:", response.status, errorMessage);
            responseElement_ewma.textContent = `An unknown server error has occured`;
            responseElement_ewma.class = 'response-message error'
        }
    } 
    catch (error) {
        console.error("Fetch error for SMA:", error);
        responseElement_ewma.textContent = `Error occurred while fetching data`;
        responseElement_ewma.class = 'response-message error'
    }


});