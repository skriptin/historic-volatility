

document.getElementById('SMA-volatility').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        window_length: formData.get('window')
    };

    const responseElement = document.getElementById('response-sma');
    responseElement.textContent = '';
    let errorMessage = '';
    console.log("hello world")


    try {
        const response = await fetch('/calc_sma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log("hello world");
            console.log(jsonResponse);
            responseElement.textContent = `Success`;
            responseElement.style.color = 'green';
        } else {
            const errorText = await response.text();
            responseElement.textContent = 'Error occurred: make sure the window length is valid';
            responseElement.style.color = 'red';
        }
    } 
    catch (error) {
        responseElement.textContent = `Error occurred while getting sma data: ${error.message}`;
        responseElement.style.color = 'red';
    }
});
