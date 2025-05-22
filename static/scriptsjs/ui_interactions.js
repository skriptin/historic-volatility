// ui_interactions.js (or your relevant script)

document.addEventListener('DOMContentLoaded', () => {
    const studiesButton = document.getElementById('open-studies-tab'); // Correct button ID
    const studiesPopup = document.getElementById('studies-popup');   // Correct popup ID

    if (studiesButton && studiesPopup) {
        // Event listener for the "Studies" button
        studiesButton.addEventListener('click', function(event) {
            event.stopPropagation(); 

            const isVisible = studiesPopup.classList.contains('active');
            console.log("studies button clicked");
            // Basic positioning (adjust as needed)
            const buttonRect = studiesButton.getBoundingClientRect();
            studiesPopup.style.top = `${buttonRect.top + window.scrollY}px`; 
            studiesPopup.style.left = `${buttonRect.right + 5 + window.scrollX}px`; 

            studiesPopup.classList.toggle('active'); // This toggles display via CSS
        });

        // Close button within the "Studies" popup
        const closeButton = studiesPopup.querySelector('.close-popup-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                studiesPopup.classList.remove('active');
            });
        }

        // Optional: Close when clicking outside
        document.addEventListener('click', function(event) {
            if (studiesPopup.classList.contains('active') && 
                !studiesPopup.contains(event.target) && 
                event.target !== studiesButton) {
                studiesPopup.classList.remove('active');
            }
        });
    } else {
        if (!studiesButton) console.warn("Studies button ('open-studies-tab') not found.");
        if (!studiesPopup) console.warn("Studies popup ('studies-popup') not found.");
    }
});