
let jsonResponse_ewma = null
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
    const responseElement_ewma = document.getElementById("response-EWMA")


    try {
        const response = await fetch('/calc_ewma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        if (response.ok) {
            jsonResponse_sma = await response.json();
            console.log(jsonResponse_sma)
            responseElement_ewma .textContent = `Success getting EWMA`;
            responseElement_ewma .style.color = 'green';
        } else {
            const errorText = await response.text();
            responseElement_ewma .textContent = 'Error occurred: make sure alpha is valid';
            responseElement_ewma .style.color = 'red';
        }
    } 
    catch (error) {
        responseElement_ewma .textContent = `Error occurred while fetching data: ${error.message}`;
        responseElement_ewma .style.color = 'red';
    }


});