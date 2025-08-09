// modelbuilder.js
// Initializes the Model Builder dropdown and form toggling
export function initializeModelBuilder() {
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownList = document.getElementById('dropdown-list');
    const modelHeader = document.getElementById('model-header');
    if (!dropdownBtn || !dropdownList || !modelHeader) {
        console.warn('Model Builder: required elements not found');
        return;
    }

    // Define available models
    const models = ['GARCH', 'EGARCH', 'TARCH'];

    // Populate dropdown list
    dropdownList.innerHTML = '';
    models.forEach(name => {
        const li = document.createElement('li');
        li.classList.add('dropdown-item');
        li.textContent = name;
        li.dataset.model = name;
        dropdownList.appendChild(li);
    });

    // Toggle dropdown visibility
    dropdownBtn.addEventListener('click', event => {
        event.stopPropagation();
        // position dropdown relative to button
        const rect = dropdownBtn.getBoundingClientRect();
        dropdownList.style.position = 'fixed';
        dropdownList.style.top = `${rect.bottom + window.scrollY}px`;
        dropdownList.style.left = `${rect.left + window.scrollX}px`;
        dropdownList.style.zIndex = '1000';
        // toggle visibility
        dropdownList.style.display =
            dropdownList.style.display === 'block' ? 'none' : 'block';
    });

    // Handle selection
    dropdownList.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const selected = item.dataset.model;
            modelHeader.textContent = `${selected} Model`;
            dropdownBtn.textContent = `${selected} ▼`;
            dropdownList.style.display = 'none';

            // Show/hide corresponding form
            models.forEach(m => {
            const form = document.getElementById(`${m.toLowerCase()}-form`);
            if (form) form.style.display = (m === selected) ? 'block' : 'none';
            });
        });
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', event => {
        if (!dropdownBtn.contains(event.target) && 
            !dropdownList.contains(event.target)) {
            dropdownList.style.display = 'none';
        }
    });
}