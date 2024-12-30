
let jsonResponse_sma = null;
document.getElementById('SMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        window: formData.get('window'),
    };

    console.log("User has submitted sma forum with parameters:")
    console.log(`Window Length: ${data.window}`)


    const responseElement_sma = document.getElementById('response-sma');

    try {
        const response = await fetch('/calc_sma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        if (response.ok) {
            jsonResponse_sma = await response.json();
            console.log(jsonResponse_sma)
            responseElement_sma .textContent = `Success getting sma`;
            responseElement_sma .style.color = 'green';
        } else {
            const errorText = await response.text();
            responseElement_sma .textContent = 'Error occurred: make sure the window length is valid';
            responseElement_sma .style.color = 'red';
        }
    } 
    catch (error) {
        responseElement_sma .textContent = `Error occurred while fetching data: ${error.message}`;
        responseElement_sma .style.color = 'red';
    }

});
