import { stock_returns } from './getstockreturns.js';

let pacfFormInitalized = false;


function async handelePacfFormSubmit(event, pacfResponseOutput, pacfImg){
    event.preventDefault();

    pacfResponseOutput.className = 'data-output-area'; 

    if ( !stock_returns.returns ) {
        console.warn("No stock return data available. Please fetch data first.");
        return;
    }

    const dataToSend = { stock_returns: stock_returns.returns };

    console.log(`Requesting PACF for: ${dataType}`);

    try {
        const response = await fetch('/get_pacf', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        pacfResponseOutput.innerHTML = ''; 

        if (response.ok) {
            const structuredPacfData = await response.json();
            console.log(`PACF Data received for ${dataType}:`, structuredPacfData);

            if (Object.keys(structuredPacfData).length === 0) {
                pacfResponseOutput.innerHTML = '<p style="text-align:center; color:orange;">Not enough data or no PACF results returned.</p>';
                pacfResponseOutput.classList.add('warning-state');
                return;
            }

            const titleElement = document.createElement('h4');
            titleElement.textContent = titleText;
            pacfResponseOutput.appendChild(titleElement);

            const lagKeys = Object.keys(structuredPacfData).sort((a, b) => {
                const numA = parseInt(a.split(' ')[1]);
                const numB = parseInt(b.split(' ')[1]);
                return numA - numB;
            });

            for (const lagKey of lagKeys) {
                if (Object.hasOwnProperty.call(structuredPacfData, lagKey)) {
                    const dataTuple = structuredPacfData[lagKey];
                    const pacfValue = dataTuple[0];
                    const ciTuple = dataTuple[1];
                    const isSignificant = dataTuple[2];
                    const lagNumber = parseInt(lagKey.split(' ')[1]);

                    const lagDiv = document.createElement('div');
                    lagDiv.classList.add('pacf-lag-row');

                    if (lagNumber === 0) {
                        lagDiv.classList.add('lag-zero');
                    } else if (isSignificant) {
                        lagDiv.classList.add('significant');
                    } else {
                        lagDiv.classList.add('not-significant');
                    }

                    lagDiv.textContent =
                        `${lagKey}: Value: ${pacfValue.toFixed(4)}, ` +
                        `CI: [${ciTuple[0].toFixed(4)}, ${ciTuple[1].toFixed(4)}], ` +
                        `Significant: ${isSignificant}`;

                    pacfResponseOutput.appendChild(lagDiv);
                }
            }
        } else {
            const errorMessage = await response.json();
            console.log("Server error occured:", errorMessageq);
        }


    } catch (error) {
        console.error(`Network or script error fetching PACF:`, error);
    }









}


export function initalizePacfListeners(){
    console.log("Initalizing Pacf forum");
    const pacfForm = document.getElementById('pacf-form');
    const pacfResponseOutput = document.getElementById('response-pacf');
    const pacfImg = document.getElementById('pacf-img-plot');
    if(!pacfForm || !pacfDataOutput || !pacfImg) {console.log("Failed to fetch pacf"); return;}

    if(!pacfFormInitalized){
    pacfForm.addEventListener('submit', handelePacfFormSubmit);
    pacfFormInitalized = true
    }


}




async function fetchAndDisplayPacf() {
    const dataType = 'squared_returns';
    const titleText = "PACF of Squared Returns";



    pacfResponseOutput.innerHTML = '<p style="text-align:center; color:#555;">Calculating PACF...</p>';
    pacfResponseOutput.className = 'data-output-area'; 

    if ( !stock_returns.returns ) {
        console.warn("No stock return data available. Please fetch data first.");
        pacfResponseOutput.innerHTML = '<p text-align:center;">Please fetch stock data first.</p>';
        pacfResponseOutput.class = 'response-message warning'
        return;
    }

    const dataToSend = { stock_returns: stock_returns.returns };

    console.log(`Requesting PACF for: ${dataType}`);

    try {
        const response = await fetch('/get_pacf', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        pacfResponseOutput.innerHTML = ''; 

        if (response.ok) {
            const structuredPacfData = await response.json();
            console.log(`PACF Data received for ${dataType}:`, structuredPacfData);

            if (Object.keys(structuredPacfData).length === 0) {
                pacfResponseOutput.innerHTML = '<p style="text-align:center; color:orange;">Not enough data or no PACF results returned.</p>';
                pacfResponseOutput.classList.add('warning-state');
                return;
            }

            const titleElement = document.createElement('h4');
            titleElement.textContent = titleText;
            pacfResponseOutput.appendChild(titleElement);

            const lagKeys = Object.keys(structuredPacfData).sort((a, b) => {
                const numA = parseInt(a.split(' ')[1]);
                const numB = parseInt(b.split(' ')[1]);
                return numA - numB;
            });

            for (const lagKey of lagKeys) {
                if (Object.hasOwnProperty.call(structuredPacfData, lagKey)) {
                    const dataTuple = structuredPacfData[lagKey];
                    const pacfValue = dataTuple[0];
                    const ciTuple = dataTuple[1];
                    const isSignificant = dataTuple[2];
                    const lagNumber = parseInt(lagKey.split(' ')[1]);

                    const lagDiv = document.createElement('div');
                    lagDiv.classList.add('pacf-lag-row');

                    if (lagNumber === 0) {
                        lagDiv.classList.add('lag-zero');
                    } else if (isSignificant) {
                        lagDiv.classList.add('significant');
                    } else {
                        lagDiv.classList.add('not-significant');
                    }

                    lagDiv.textContent =
                        `${lagKey}: Value: ${pacfValue.toFixed(4)}, ` +
                        `CI: [${ciTuple[0].toFixed(4)}, ${ciTuple[1].toFixed(4)}], ` +
                        `Significant: ${isSignificant}`;

                    pacfResponseOutput.appendChild(lagDiv);
                }
            }
        } else {
            const errorMessage = await response.json();
            console.log("Server error occured:", errorMessageq);
        }


    } catch (error) {
        console.error(`Network or script error fetching PACF:`, error);
    }
}

// Event listener for the PACF form submission
if (pacfForm) {
    pacfForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log("PACF form submitted (for squared returns).");
        fetchAndDisplayPacf(); // Call the main function
    });
} else {
    console.warn("Form with ID 'find-PACF' not found. PACF functionality will not be triggered.");
}