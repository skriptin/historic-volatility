import { removeDatasetFromChart, update_chart } from "./vol_chart.js";
import { stock_returns } from "./getstockreturns.js";

let plottedSeriesList = document.getElementById('plotted-series-list');
let SeriesListInitalized = false;


export function initalizeSeriesList(){
    console.log("initalizing series list");
    if(!SeriesListInitalized){
        plottedSeriesList = document.getElementById('plotted-series-list');
        if(plottedSeriesList) console.log("Series list initalized succesfully");
        SeriesListInitalized = true;
    } else {
        console.log("series list already initalized");
    }
}

export function addSeriesToListUI(datasetLabel){

    if (!plottedSeriesList){
        console.warn("plotted-series list element not found");
        return;
    }
    if (plottedSeriesList.querySelector(`li[data-dataset-label="${datasetLabel}"]`)) {
        console.log(`Series "${datasetLabel}" already in UI list.`);
        return;
    }

    //Create element on UI
    const listItem = document.createElement('li');
    listItem.setAttribute('data-dataset-label', datasetLabel);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = datasetLabel;

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-series-button');
    removeButton.title = `Remove ${datasetLabel}`;
    removeButton.innerHTML = '×';
    
    //Remove from chart
    removeButton.addEventListener('click', function(event) {
        event.stopPropagation();

        console.log(`Attempting to remove series: ${datasetLabel}`);
        listItem.remove();
        removeDatasetFromChart(datasetLabel); 
    });

    listItem.appendChild(labelSpan);
    listItem.appendChild(removeButton);
    plottedSeriesList.appendChild(listItem);

    console.log(`Added ${datasetLabel} to series list`);
}

export function initializeVolatilityIndicesSubmenu() {
    console.log("Initializing Volatility Indices submenu");
    const volatilityIndicesTrigger = document.getElementById('volatility-indicies-trigger');
    const volatilityIndicesSubmenu = document.getElementById('volatility-indicies-submenu');

    if (volatilityIndicesTrigger && volatilityIndicesSubmenu) {
        if (!volatilityIndicesTrigger.dataset.listenerAttached) {
            volatilityIndicesTrigger.addEventListener('click', function(event) {
                event.stopPropagation(); 

                volatilityIndicesSubmenu.classList.toggle('active');
                const arrow = volatilityIndicesTrigger.querySelector('.trigger-arrow');
                if (arrow) {
                    arrow.textContent = volatilityIndicesSubmenu.classList.contains('active') ? '▼' : '▶';
                }

                if (volatilityIndicesSubmenu.classList.contains('active')) {
                    setupSubmenuItemAddListeners(volatilityIndicesSubmenu);
                }
                console.log("Volatility Indices submenu toggled. Active:", volatilityIndicesSubmenu.classList.contains('active'));
            });
            volatilityIndicesTrigger.dataset.listenerAttached = 'true';
            console.log("Listener attached to Volatility Indices trigger.");
        }

        if (volatilityIndicesSubmenu.classList.contains('active')) {
            setupSubmenuItemAddListeners(volatilityIndicesSubmenu);
        }

    } else {
        if (!volatilityIndicesTrigger) console.warn("Volatility Indices trigger not found.");
        if (!volatilityIndicesSubmenu) console.warn("Volatility Indices submenu not found.");
    }
}

// Function to set up listerns is Volatility Indicies submenu
function setupSubmenuItemAddListeners(submenuElement) {
    if (!submenuElement) return;

    const addButtons = submenuElement.querySelectorAll('.add-item-button');
    addButtons.forEach(button => {
        if (!button.dataset.addListenerAttached) {
            button.addEventListener('click', async function(event) { 
                event.stopPropagation(); 
                const symbolToAdd = this.dataset.indexSymbol; 
                const indexName = this.dataset.indexName;
                console.log(`"Add" button clicked for index: ${symbolToAdd}`);

                if(!stock_returns.start_date || !stock_returns.end_date){
                    console.warn("No stock returns, please fetch returns");
                    return;
                }

                const requestData = {
                    ticker: symbolToAdd,
                    start_date: stock_returns.start_date,
                    end_date: stock_returns.end_date
                }

                try {
                    console.log("Fetching index data");
                    console.log(requestData);
                    const response = await fetch('/get_index', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams(requestData)
                    });

                    if(response.ok){
                        const jsonResponse = await response.json();
                        console.log(jsonResponse);
                        update_chart(jsonResponse, `${indexName}`);
                        addSeriesToListUI(`${indexName}`);

                    } else{
                        const jsonResponse = await response.json();
                        console.log("Server error occured", jsonResponse);
                        // Print to consol
                    }

                }
                catch(error){
                    console.warn("Fetch error occured");

                }



            });
            button.dataset.addListenerAttached = 'true';
            console.log(`"Add" listener attached for symbol: ${button.dataset.indexSymbol}`);
        }
    });
}