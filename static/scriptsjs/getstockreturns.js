
let jsonResponse = null;
document.getElementById('script-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        ticker: formData.get('ticker'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date')
    };

    const responseElement = document.getElementById('response');
    responseElement.textContent = '';
    let errorMessage = '';
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (startDate.getTime() > endDate.getTime()) {
        errorMessage = 'End Date cannot be earlier than Start Date.';
    }
    if (errorMessage) {
        responseElement.textContent = errorMessage;
        responseElement.style.color = 'red';
        return;
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
            console.log("hello world")
            console.log(jsonResponse)
            responseElement.textContent = `Success getting returns`;
            responseElement.style.color = 'green';
        } else {
            const errorText = await response.text();
            responseElement.textContent = 'Error occurred: make sure the ticker and dates are valid';
            responseElement.style.color = 'red';
        }
    } 
    catch (error) {
        responseElement.textContent = `Error occurred while fetching data: ${error.message}`;
        responseElement.style.color = 'red';
    }
});
