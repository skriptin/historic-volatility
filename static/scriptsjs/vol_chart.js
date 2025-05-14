//import { Colors } from 'chart.js';
//Chart.register(Colors);

let volChart = null; // Global chart instance


function initializeChart() {
    const ctx = document.getElementById('vol_chart').getContext('2d');

    volChart = new Chart(ctx, {
        type: 'line',

        data: {
            labels: [], // X-axis labels
            datasets: [] // Initial dataset
        },

        options: {
            responsive: true,
            animaion: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date', // Label for x-axis
                        font: {
                            size: 28
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volatility', // Label for y-axis
                        font: {
                            size: 28
                        }
                    },
                    beginAtZero: true, // Start y-axis from 0
                    suggestedMax: 200 // Scale y-axis up to 200
                }
            },
            plugins: {
                colors: {
                    forceOverride: true
                }
            }

        }
    });
    console.log("Chart initialized!"); 
}

function update_chart(newDataObject, datasetLabel){
    if (!volChart){
        console.log('Vol chart not initalized');
        return;
    }

    const labels = Object.keys(newDataObject);
    const values = Object.values(newDataObject);
    console.log("Updating chart with labels: " + labels)
    console.log("Updating chart with dataset: " + values)

}



// Call initializeChart when the page loads
document.addEventListener('DOMContentLoaded', initializeChart);
export {update_chart}

