import { stock_returns } from './getstockreturns.js'
import { update_chart } from './vol_chart.js';  
import { addSeriesToListUI } from './series.js';

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
    const models = ['GARCH', 'EGARCH', 'HARCH', 'APGARCH', 'FIGARCH'];

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
            q: 0,
            o: 0,
            p: 0,
            mean: formData.get("mean-model"),
            lags: formData.get("lags"),
            dist: formData.get("distribution"),
            name: formData.get("model-name"),
            model: `${formId}`,
            lags_vol: [],
            ticker: stock_returns.ticker,
            power: 2.0
        };
        if (formId == "garch"){
            requestData.model = "garch";
            requestData.p = parseInt(formData.get("p"));
            requestData.q = parseInt(formData.get("q"));
        }
        else if (formId == "egarch"){
            requestData.model = "egarch";
            requestData.o = parseInt(formData.get("o"));
            requestData.p = parseInt(formData.get("p"));
            requestData.q = parseInt(formData.get("q"));


        }else if (formId == "harch"){
            requestData.model = "harch";
            requestData.lags_vol = formData.get("lags_vol");

        }
        else if (formId == "figarch"){
            requestData.model = "figarch";
            requestData.p = parseInt(formData.get("p"));
            requestData.q = parseInt(formData.get("q"));
        }
        else{
            requestData.model ="apgarch";
            requestData.o = formData.get("o");
            requestData.p = parseInt(formData.get("p"));
            requestData.power = formData.get("power");
            requestData.q = parseInt(formData.get("q"));

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
            //This is where the model list elements are implemented
            try{
                generateModelInfoHTML(data);
            }
            catch (error){
                console.error("Error generating model div", error);
            }
        })
        .catch(error => {
            console.error('Error fitting model:', error);
        });

    });


}

function generateModelInfoHTML(data){
    if (!data) return console.warn("Model Data not Recieved from backend");
    const model_name = data["Model Summary"]["Model Name"];
    const modelList = document.querySelector('.model-list');
    const newListElement = document.createElement('li');
    if (!model_name || !modelList || !newListElement) return console.error(
        "Error Creating and fetching list attributes");

    newListElement.className = "model-info";
    newListElement.id = `${model_name}`;
    const model_box_div = document.createElement("div");
    model_box_div.className="model-box";

    generateModelSummary(data["Model Summary"], model_box_div);

    generateModelTable(
        data["Volatility Model"], 
        `${data["Model Summary"]["Vol Model"]} Parameters`,
        model_box_div
    );

    generateModelTable(
        data["Mean Model"],
        `${data["Model Summary"]["Mean Model"]} Parameters`,
        model_box_div
    );

    generateButtons(model_name, model_box_div);

    newListElement.appendChild(model_box_div);
    modelList.appendChild(model_box_div);
}

function generateModelTable(tableData, groupTitle, parentDiv) {
    if (!tableData || typeof tableData !== "object") return console.error("Invalid table data");

    // Create group title
    const titleElement = generateSimpleElement("div", "group-title", groupTitle);
    parentDiv.appendChild(titleElement);

    // Create table and append headers
    const table = document.createElement("table");
    table.className = "parameter-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    ["Parameter", "Value", "Std Err", "p-value"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        if (text !== "Parameter") th.className = "numeric";
        headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = document.createElement("tbody");

    for (const param in tableData) {
        if (!tableData[param]) continue;

        const row = document.createElement("tr");

        // Extract values
        const val = tableData[param]["Value"] ?? "";
        const err = tableData[param]["Std Error"] ?? "";
        const pval = tableData[param]["P value"] ?? "";

        // First cell: param name
        const tdName = document.createElement("td");
        tdName.textContent = param;
        row.appendChild(tdName);

        // Numeric cells
        [val, err, pval].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            td.className = "numeric";
            row.appendChild(td);
        });

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    parentDiv.appendChild(table);
}

function generateModelSummary(data, model_box_div){
    //Generate model summary
    const model_header = generateSimpleElement("h3", "item-name", data["Model Name"]);
    model_box_div.appendChild(model_header);

    const model_summary_div = generateSimpleElement("div", "model-summary", "");
    model_box_div.appendChild(model_summary_div);

    const fields = [
        ["Creation Date", "Date"],
        ["Security", "Trained On"],
        ["No. Observations", "Samples"],
        ["Distribution", "Distribution"],
        ["Vol Model", "Volatility Model"],
        ["Mean Model", "Mean Model"],
        ["AIC", "AIC"],
        ["BIC", "BIC"],
        ["R-squared", "R-squared"],
        ["Log-Likelihood", "Log-Likelihood"]
    ];
    // Append each field as a <p> element with "Label: value"
    fields.forEach(([key, label]) => {
        if (data[key] !== undefined) {
            generateSimpleElementWAppend(
                "p",
                "",
                `${label}: ${data[key]}`,
                model_summary_div
            );
        }
    });
}

function generateButtons(model_name, parent_div){

    const item_actions = generateSimpleElement("div","item-actions", "");
    parent_div.appendChild(item_actions);

    const forecast_label = document.createElement("label");
    forecast_label.setAttribute("for", `forecast-days-${model_name}`);
    forecast_label.textContent = "Days to Forecast:";
    item_actions.appendChild(forecast_label);

    const forecast_input = document.createElement("input");
    forecast_input.type = "number";
    forecast_input.id = `forecast-days-${model_name}`;
    forecast_input.name = "forecast-days";
    forecast_input.min = 1;
    forecast_input.required = true;
    item_actions.appendChild(forecast_input);

    const forecast_button = document.createElement("button");
    forecast_button.className = "forecast-btn";
    forecast_button.setAttribute("data-model", model_name);
    forecast_button.textContent = "Forecast";
    item_actions.appendChild(forecast_button);
    forecast_button.addEventListener("click", function(event) {
        createForecastLister(event, forecast_input, model_name);
    });


    const plot_btn = document.createElement("button");
    plot_btn.className = "plot-btn";
    plot_btn.setAttribute("data-model", model_name);
    plot_btn.textContent = "Plot";
    item_actions.appendChild(plot_btn);

    const save_btn = document.createElement("button");
    save_btn.className = "save-btn";
    save_btn.setAttribute("data-model", model_name);
    save_btn.textContent = "Save";
    item_actions.appendChild(save_btn);

    const delete_btn = document.createElement("button");
    delete_btn.className = "delete_btn";
    delete_btn.setAttribute("data-model", model_name);
    delete_btn.textContent = "Delete";
    item_actions.appendChild(delete_btn);

}

function createForecastLister(event, forecast_input, model_name){
    event.stopPropagation();
    const horizon = parseInt(forecast_input.value);

    if (horizon <= 0 || !model_name){
        console.warn("Invalid forecast / Model name");
        return;
    }


    const requestData = {
        Horizon: horizon,
        ModelName: model_name
    };
    console.log(requestData);



    fetch('/forecast', {
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
        //Send the forecast to the chart
        update_chart(data, model_name);
        addSeriesToListUI(model_name);
        console.log("Chart updateed sucesffuly");

    })
    .catch(error => {
        console.error('Error Forecasting', error);
    });


}





function generateSimpleElement(element_type, className, text){
    const newElement = document.createElement(element_type);
    if (!newElement) return console.error("Error Creating newElement");
    newElement.className = className;
    newElement.textContent = text;
    return newElement;
}

function generateSimpleElementWAppend(element_type, className, text, parent){
    const newElement = document.createElement(element_type);
    if (!newElement) return console.error("Error Creating newElement");
    newElement.className = className;
    newElement.textContent = text;
    parent.appendChild(newElement);
}
