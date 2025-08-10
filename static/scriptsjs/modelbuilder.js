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
    const models = ['GARCH', 'EGARCH', 'HARCH'];

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
                if (form) {
                    form.style.display = (m === selected) ? 'block' : 'none';
                    if (m == selected) initModelForm(m.toLowerCase());
                }
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

function initModelForm(formId) {
    console.log(`Initializing form for ${formId}`);
    const form = document.getElementById(`${formId}-form`);
    if (!form) return console.warn(`Form ${formId}-form not found`);

    if (form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true'; 

    const dateList = []; 
    const dateInput = form.querySelector('#date-list');
    const scrollBox = form.querySelector('#dateListContainer');
    const hiddenInput = form.querySelector('#dateRangesInput');
    const addButton = form.querySelector('#add-date-range-button');

    if (!dateInput || !scrollBox || !hiddenInput || !addButton) {
        console.warn(`Missing elements in form ${formId}`);
        return;
    }
    // Handle adding date ranges to the list
    addButton.addEventListener('click', () => {
         const input = dateInput.value.trim();
        const parts = input.split(/\s+/);
        if (parts.length !== 2) {
            alert("Please enter a start and end date separated by a space.");
            return;
        }

        const [start, end] = parts;
        if (!isValidDate(start) || !isValidDate(end)) {
            alert("Invalid date format. Use YYYY-MM-DD.");
            return;
        }

        dateList.push({ start, end });

        const item = document.createElement('div');
        item.textContent = `${start} - ${end}`;
        scrollBox.appendChild(item);

        hiddenInput.value = JSON.stringify(dateList);
        dateInput.value = '';
    });



}

function isValidDate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
}