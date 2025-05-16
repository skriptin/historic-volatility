import { update_chart } from './vol_chart.js';
import { jsonResponse } from './getstockreturns.js';


document.getElementById('EWMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        alpha: formData.get('alpha')
    }


    console.log("User has submitted ewma forum with parameters:")
    console.log(`Alpha: ${data.alpha}`)
    
    if (data.alpha > 1 || 0 > data.alpha){
        alert("Alpha must be between 0 and 1")
        return;
    }
    const responseElement_ewma = document.getElementById("response-ewma")

    if (!jsonResponse){
        console.warn("No stock data available in jsonResponse. Please fetch data first.");
        responseElement_ewma.textContent = "Please fetch stock data first using the form above.";
        responseElement_ewma.style.color = 'orange';
        return;
    }


    const requestData = {
        alpha: data.alpha,
        stock_returns: jsonResponse
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
            responseElement_ewma .textContent = `Success getting EWMA`;
            responseElement_ewma .style.color = 'green';
            //plot chart
            update_chart(jsonResponse_ewma, `EWMA(${data.alpha})`);

        } else {
            const errorText = await response.json();
            const errorData = await response.json(); 
            const errorMessage = errorData.error || 'Unknown error occurred.';
            console.error("Error fetching SMA data:", response.status, errorData);
            responseElement_ewma.textContent = `Error occurred: ${errorMessage}`;
            responseElement_ewma.style.color = 'red';
        }
    } 
    catch (error) {
        console.error("Fetch error for SMA:", error);
        responseElement_ewma.textContent = `Error occurred while fetching data: ${error.message}`;
        responseElement_ewma.style.color = 'red';
    }


});