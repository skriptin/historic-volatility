import { jsonResponse } from "./getstockreturns";
let PACF = null;

document.getElementById("garch-PACF").addEventListener('submit', async(event) => {
    event.preventDefault();

    if (!jsonResponse){
        console.warn("No stock data available in jsonResponse. Please fetch data first.");
        return;
    }

    const requestData = {
        stock_returns: jsonResponse
    };

    try{
        const response = await fetch('/get_pacf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

    }
    catch (error) {
        responseElement.textContent = `Error occurred while fetching data: ${error.message}`;
        console.log(error);
    }


});

