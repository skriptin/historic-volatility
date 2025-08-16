const resizeBtn = document.getElementById('resize-btn');
const chartToolbar = document.querySelector('.chart-toolbar'); 

resizeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chartToolbar.classList.toggle('expanded');
    console.log("Expand button clicked"); 
});