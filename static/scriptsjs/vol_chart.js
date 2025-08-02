
let volChart = null; // Global chart instance


function initializeChart() {
    const ctx = document.getElementById('vol_chart').getContext('2d');

    volChart = new Chart(ctx, {
        type: 'line',

        data: {
            labels: [], 
            datasets: [] 
        },

        options: {
            responsive: true,
            animaion: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: 'bold',
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volatility', // Label for y-axis
                        font: {
                            size: 14,
                            weight: 'bold',                        }
                    },
                    beginAtZero: true, // Start y-axis from 0
                    min: 0,
                    max: 200 
                }
            },
            plugins: {
               legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                // --- ZOOM PLUGIN CONFIGURATION ---
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',       
                        threshold: 5,

                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        pinch: {
                            enabled: true,
                        },
                        drag: {
                            enabled: false, 
                        },
                        mode: 'xy',      
                    },
                    limits: {
                        y: {
                            min: 0,        
                            max: 200,      
                            minRange: 30   
                        }
                    }
                }
            },
            

        }
    });
    console.log("Chart initialized!"); 
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 200); 
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r}, ${g}, ${b})`;
}


/**
 * Adds a new line (dataset) to the chart or updates an existing one.
 * - Manages a master list of X-axis labels (e.g., dates), adding any new ones and sorting them.
 * - Ensures all datasets (old and new) align to this master list of X-axis labels.
 *
 * @param {Object} newDataObject - The data for the single line to be added/updated.
 *                                 Format: { "xLabel1": value1, "xLabel2": value2, ... }
 *                                 Example: { "2023-01-01": 10, "2023-01-02": 12 }
 * @param {string} datasetLabel - A unique name for this line (e.g., "SMA 10").
 *                                This is used to identify the line for updates or removal.
 */
function update_chart(newDataObject, datasetLabel) {
    if (!volChart) {
        console.error('Chart not initialized. Call initializeChart() first.');
        return;
    }
    if (typeof newDataObject !== 'object' || newDataObject === null || Object.keys(newDataObject).length === 0) {
        console.error('newDataObject must be a non-empty object containing {label: value} pairs.');
        return;
    }
    if (typeof datasetLabel !== 'string' || datasetLabel.trim() === '') {
        console.error('datasetLabel must be a non-empty string to name the dataset.');
        return;
    }

    // The chart maintains one set of X-axis labels that all datasets will use.
    const labelsFromNewData = Object.keys(newDataObject);
    const existingChartLabels = volChart.data.labels || [];

    // Combine current chart labels with labels from the new data, ensuring no duplicates.
    let masterXLabels = Array.from(new Set([...existingChartLabels, ...labelsFromNewData]));

    // Sort these master labels (e.g., chronologically for dates).
    masterXLabels.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA) && !isNaN(dateB)) { // If both are valid dates
            return dateA - dateB; // Sort by date
        }
        return String(a).localeCompare(String(b)); // Otherwise, sort as strings
    });

    // Assign the definitive, sorted labels to the chart.
    volChart.data.labels = masterXLabels;

    // --- 2. Re-align Data for ALL Previously Existing Datasets ---
    volChart.data.datasets.forEach(dataset => {
        // Only re-align datasets that have their original raw data stored.
        if (dataset.originalData && dataset.label !== datasetLabel) { // Don't re-align the one we're currently processing yet
            const realignedData = masterXLabels.map(label => {
                return dataset.originalData[label] !== undefined ? dataset.originalData[label] : null;
            });
            dataset.data = realignedData;
        }
    });

    // --- 3. Prepare Data for the Incoming (New or to-be-Updated) Dataset ---
    // The incoming `newDataObject` also needs its data points aligned with the `masterXLabels`.
    const alignedDataForIncoming = masterXLabels.map(label => {
        return newDataObject[label] !== undefined ? newDataObject[label] : null;
    });

    // --- 4. Find, Update, or Add the Dataset ---
    const existingDatasetIndex = volChart.data.datasets.findIndex(ds => ds.label === datasetLabel);

    if (existingDatasetIndex > -1) {
        // An existing dataset with the same label was found
        console.log(`Updating existing dataset: ${datasetLabel}`);
        const datasetToUpdate = volChart.data.datasets[existingDatasetIndex];
        datasetToUpdate.data = alignedDataForIncoming;
        datasetToUpdate.originalData = { ...newDataObject };
    } else {
        // No dataset with this label exists
        console.log(`Adding new dataset: "${datasetLabel}"`);
        const newDataset = {
            label: datasetLabel,                 
            data: alignedDataForIncoming,        
            originalData: { ...newDataObject },  
            borderColor: getRandomColor(),      
            backgroundColor: 'transparent',      
            fill: false,                         
            tension: 0.1,                        
            pointRadius: 0,                     
            pointHoverRadius: 5,                
            pointHitRadius: 10,                 
            pointBorderWidth: 1,                 
        };
        volChart.data.datasets.push(newDataset);
    }

    volChart.update(); 
    console.log(`Chart updated. Total X-Labels: ${masterXLabels.length}, Total Datasets: ${volChart.data.datasets.length}`);
}

function removeDatasetFromChart(datasetLabelToRemove) {
    if (volChart && volChart.data && volChart.data.datasets) {
        const datasetIndex = volChart.data.datasets.findIndex(
            dataset => dataset.label === datasetLabelToRemove
        );

        if (datasetIndex > -1) {
            volChart.data.datasets.splice(datasetIndex, 1); 
            volChart.update(); 
            console.log(`Dataset "${datasetLabelToRemove}" removed from chart.`);
        } else {
            console.warn(`Dataset "${datasetLabelToRemove}" not found in chart to remove.`);
        }
    } else {
        console.error("Chart instance not available for removing dataset.");
    }
}


document.addEventListener('DOMContentLoaded', initializeChart);
export { update_chart, removeDatasetFromChart }

