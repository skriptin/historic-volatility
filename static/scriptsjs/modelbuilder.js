import { stock_returns } from './getstockreturns.js'
var dateList = [];

// ---- Validation functions ----
function validateLags(lagsStr) {
  const regex = /^ *\d+ *(?:, *\d+ *)*$/;
  if (!regex.test(lagsStr)) {
    alert('Lags must be a single integer or comma-separated list of integers.');
    return false;
  }
  return true;
}

function validateDateRange(start, end) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
        alert("Dates must be in YYYY-MM-DD format.");
        return false;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("One or both dates are invalid.");
        return false;
    }
    const minDate = new Date("1900-01-01");
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (startDate < minDate) {
        alert("Start date cannot be earlier than 1900-01-01.");
        return false;
    }
    if (endDate > today) {
        alert("End date cannot be later than today.");
        return false;
    }
    if (startDate >= endDate) {
        alert("Start date must be earlier than end date.");
        return false;
    }
    return true;
}

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
                const form_div = document.getElementById(`${m.toLowerCase()}-div`);
                if (form_div) {
                    form_div.style.display = (m === selected) ? 'block' : 'none';
                    if (m == selected){
                        const scrollBox = form_div.querySelector('#dateListContainer');
                        if (scrollBox) scrollBox.innerHTML = "";
                        dateList = [];
                        initModelForm(m.toLowerCase());
                    }
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
    const form_div = document.getElementById(`${formId}-div`);
    if (!form_div) return console.warn(`Form ${formId}-form not found`);

    if (form_div.dataset.initialized === 'true') return;
    form_div.dataset.initialized = 'true'; 
    console.log(`Initializing form for ${formId}`);

    const form = form_div.querySelector(`form`);
    if (!form) console.warn("Form not found");
    const dateInput = form_div.querySelector('#date-list');
    const scrollBox = form_div.querySelector('#dateListContainer');
    const hiddenInput = form_div.querySelector('#dateRangesInput');
    const addButton = form_div.querySelector('#add-date-range-button');

    if (!dateInput || !scrollBox || !hiddenInput || !addButton || !form) {
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

        if (!validateDateRange(start, end)) {
            alert("Invalid date range. Please check your input.");
            console.warn("Invalid date range:", start, end);
            return;
        }
        dateList.push([start, end]);

        const item = document.createElement('div');
        item.textContent = `${start} - ${end}`;
        scrollBox.appendChild(item);

        hiddenInput.value = JSON.stringify(dateList);
        dateInput.value = '';
    });

    form.addEventListener('submit', (event) =>  {
        event.preventDefault();
        console.log(`${formId} submitted`);
        console.log(form);


        // Request data formmating based on model case
        const formData = new FormData(form);
        const requestData = {
            dates: dateList,
            p: parseInt(formData.get("p")),
            q: parseInt(formData.get("q")),
            o: 0,
            mean: formData.get("mean-model"),
            lags: formData.get("lags"),
            dist: formData.get("distribution"),
            name: formData.get("model-name"),
            model: "",
            lags_vol: [],
            ticker: stock_returns.ticker
        };
        if (formId == "garch"){
            requestData.model = "garch";
        }
        else if (formId == "egarch"){
            requestData.model = "egarch";
            requestData.o = parseInt(formData.get("o"));
        }else {
            requestData.model = "harch";
            requestData.lags_vol = formData.get("lags_vol");
        }
        console.log(JSON.stringify(requestData));
        // Submit model fit request and handle response
        fetch('/fit_model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                console.error(`Server responded with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Model fit successful:', data);
            // TODO: update UI based on response data
        })
        .catch(error => {
            console.error('Error fitting model:', error);
        });

    });


}

