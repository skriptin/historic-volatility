import { Colors } from 'chart.js';
Chart.register(Colors);

let volChart = null; // Global chart instance


function initializeChart() {
    const ctx = document.getElementById('vol_chart').getContext('2d');

    // Predefined labels (x-axis) and datasets (y-axis)

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
}

function formatjson(data){
    labels = list(data.keys)
    values = list(data.values)
}

function updatechart(labels, values, volChart){
    
}

// Call initializeChart when the page loads
document.addEventListener('DOMContentLoaded', initializeChart);

