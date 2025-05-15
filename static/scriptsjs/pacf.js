import { jsonResponse } from './getstockreturns.js';
let PACF = null;

document.getElementById("find-PACF").addEventListener('submit', async(event) => {
    event.preventDefault();

    console.log("User has submitted to pacf forum");

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


        if(response.ok){
            const jsonResponse_ewma = await response.json();
            console.log("Partial Autocorrelation Coefficents:", jsonResponse_ewma)
        }

    }
    catch (error) {
        console.log("An unknown error has occured" + error);
    }


});

