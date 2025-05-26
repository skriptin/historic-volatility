import { stock_returns } from "./getstockreturns.js";



let pacfFormButtonInitalized = false;
let pacfViewButtonInitalized = false;

export function initalizePacfListeners(){

    const pacfFormButton = document.getElementById('get_pacf');
    const pacfViewButton = document.getElementById('view-pacf-plot-button');

    if(!pacfFormButton || !pacfViewButton){
        console.warn("failed to fetch pacf buttons");
        return;
    }
    if(!pacfFormButtonInitalized || !pacfViewButtonInitalized){
        pacfFormButton.addEventListener('submit', handlePacfFormButton);
        pacfViewButton.addEventListener('button', handlePacfViewButton);
        console.log("PACF form button and view button initalized");
        pacfFormButtonInitalized = true;
        pacfViewButtonInitalized = true;
    }
}

function handlePacfFormButton(event){
    event.preventdefault();
    const FormData = new FormData(event.target);

    const dataToSend = {
        alpha: FormData.get('pacf-alpha'),
        nlags: FormData.get('n-lags'),
        returns: stock_returns.returns
    }




}

function handlePacfViewButton(event){

}