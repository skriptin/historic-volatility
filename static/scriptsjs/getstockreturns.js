
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

    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (startDate.getTime() > endDate.getTime()) {

        /** Print Response to consol */
        return;
    }

    for(const field in stock_returns){
        if (Object.hasOwnProperty.call(stock_returns, field)){
            stock_returns[field] = null;
        }
    }


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

          /** Print Response to consol */

        } else {
            const errorText = await response.text();
            console.log(jsonResponse)
          /** Print Error Response to consol */
        }
    } 
    catch (error) {
        console.log(jsonResponse)
        /** Print Fetch error to consol */
    }
});

export { stock_returns };
