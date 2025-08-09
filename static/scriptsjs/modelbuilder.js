

export function initializeModelBuilder() { 
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownList = document.getElementById('dropdown-list');
    const modelHeader = document.getElementById('model-header');
    const garchForm = document.getElementById('garch-form');
    console.log("Initializing Model Builder");
    if (!dropdownBtn || !dropdownList || !modelHeader || !garchForm) {
        console.warn("Failed to fetch model builder elements");
        return;
    }

    dropdownBtn.addEventListener('click', () => {
        dropdownList.style.display =
            dropdownList.style.display === 'block' ? 'none' : 'block';
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const modelName = item.getAttribute('data-model');
            modelHeader.textContent = modelName + " Model";
            dropdownBtn.textContent = modelName + " ▼";
            dropdownList.style.display = 'none';

            // Show GARCH form if GARCH is selected
            if (modelName === "GARCH") {
                garchForm.style.display = 'block';
            } else {
                garchForm.style.display = 'none';
            }
        });
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', (e) => {
        if (!e.target.matches('#dropdown-btn')) {
            dropdownList.style.display = 'none';
        }
    });
}
