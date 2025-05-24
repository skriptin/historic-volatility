import { removeDatasetFromChart } from "./vol_chart.js";


let plottedSeriesList = null;
let SeriesListInitalized = false;

export function initalizeSeriesList(){
    console.log("initalizing series list");
    if(!SeriesListInitalized){
        plottedSeriesList = document.getElementById('plotted-series list');
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
    removeButton.addEventListener('click', function() {
        console.log(`Attempting to remove series: ${datasetLabel}`);
        listItem.remove();
        removeDatasetFromChart(datasetLabel); 
    });

    listItem.appendChild(labelSpan);
    listItem.appendChild(removeButton);
    plottedSeriesList.appendChild(listItem);

    console.log(`Added ${datasetLabel} to series list`);
}

