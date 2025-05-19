
let jsonResponse = null;

const stock_returns = {
    returns: null,
    ticker: null,
    start_date: null,
    end_date: null
};

document.getElementById('script-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        ticker: formData.get('ticker'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date')
    };
    
    console.log("User has submitted get data forum with parameters:")
    console.log(`Start date: ${data.start_date} End Date: ${data.end_date} Ticker: ${data.ticker}`)

    const responseElement = document.getElementById('response');
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (startDate.getTime() > endDate.getTime()) {
        responseElement.textContent = 'End Date cannot be earlier than Start Date.';
        responseElement.className = 'response-message error';
        return;
    }

    for(const field in stock_returns){
        if (Object.hasOwnProperty.call(stock_returns, field)){
            stock_returns[field] = null;
        }
    }
    responseElement.textContent = 'Fetching data..'
    responseElement.className = 'response-message';

    try {
        const response = await fetch('/get_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        if (response.ok) {
            jsonResponse = await response.json();
            console.log(jsonResponse);

            stock_returns.returns = jsonResponse;
            stock_returns.ticker = ticker;
            stock_returns.start_date = startDate;
            stock_returns.end_date = endDate;

            responseElement.textContent = `Success getting returns`;
            responseElement.className = 'response-message success';
        } else {
            const errorText = await response.text();
            responseElement.textContent = 'Error occurred: make sure the ticker and dates are valid';
            console.log(jsonResponse)
            responseElement.className = 'response-message error';
        }
    } 
    catch (error) {
        responseElement.textContent = `Error occurred while fetching data: ${error.message}`;
        console.log(jsonResponse)
        responseElement.className = 'response-message error';
    }
});

export { stock_returns };
