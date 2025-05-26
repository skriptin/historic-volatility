
import { initializeSmaForm } from './getsma.js';
import { initalizeEwmaForm } from './getewma.js';
import { initalizeSeriesList, initializeVolatilityIndicesSubmenu } from './series.js';
//import { initializePacfListeners } from "./pacf.js";

document.addEventListener('DOMContentLoaded', () => {
    // Getting buttons and their popup mappings and inititalization functions
    const buttonPopupMappings = [
        { buttonId: 'toggle-consol-window', popupId: 'consol-popup' , initFunctions: [] },
        { buttonId: 'open-studies-tab',     popupId: 'studies-popup',  initFunctions: [initializeSmaForm, initalizeEwmaForm] }, 
        { buttonId: 'open-series-tab',      popupId: 'series-popup'  , initFunctions: [initalizeSeriesList, initializeVolatilityIndicesSubmenu] },
        { buttonId: 'calculate-pacf',       popupId: 'pacf-popup'    , initFunctions: [] }, 
        { buttonId: 'model-builder-view',   popupId: 'model-builder-popup' , initFunctions: [] },
        { buttonId: 'right-toolbox-info-tab', popupId: 'info-popup' , initFunctions: [] }
    ];

    function closeAllActivePopups(exceptionPopupId = null) {
        const activePopups = document.querySelectorAll('.popup-menu.active');
        activePopups.forEach(activePopup => {
            if (activePopup.id !== exceptionPopupId) {
                activePopup.classList.remove('active');
                buttonPopupMappings.forEach(map => {
                    if (map.popupId === activePopup.id) {
                        const btn = document.getElementById(map.buttonId);
                        if (btn) btn.classList.remove('active');
                    }
                });
            }
        });
    }
                                                                                console.log("About to poll for button clicks");
    buttonPopupMappings.forEach(mapping => {
        const buttonElement = document.getElementById(mapping.buttonId);
        const popupElement = document.getElementById(mapping.popupId);
                                                                                console.log(`${buttonElement.id} loaded ${popupElement.id} loaded`);
        if(buttonElement && popupElement){

            buttonElement.addEventListener('click', function(event) {
                event.stopPropagation();
                const isAlreadyActive = popupElement.classList.contains('active');
                                                                                console.log(`${buttonElement.id} clicked, Active: ${isAlreadyActive}`);

                // Close other buttons
                closeAllActivePopups(popupElement.id);

                if(isAlreadyActive){
                    popupElement.classList.remove('active');
                    buttonElement.classList.remove('active');
                }else {
                    const buttonRect = buttonElement.getBoundingClientRect();

                    let topPosition = buttonRect.top + window.scrollY;
                    let leftPosition = buttonRect.right + 5 + window.scrollX;

                    if(leftPosition + popupElement.offsetWidth > window.innerWidth - 10){
                        leftPosition = buttonRect.left = popupElement.offsetWidth -5;
                    }
                    if(leftPosition < 10) leftPosition = 10;
                    if(topPosition + popupElement.offsetHeight > window.innerHeight - 10){
                        topPosition = window.innerHeight - popupElement.offsetHeight - 10;
                    }
                    if(topPosition < 10) topPosition = 10;

                    popupElement.style.top = '${topPosition}px';
                    popupElement.style.left = '${leftPosition}px';

                    popupElement.classList.add('active');
                    buttonElement.classList.add('active');

                    if (mapping.initFunctions){
                                                                    console.log(`Calling Initfunction for popup: ${mapping.popupId}`);
                        mapping.initFunctions.forEach(initFunc => {
                            initFunc();
                        });
                    }
                }
            });

            const closeButton = popupElement.querySelector(`.close-popup-button`);
            if(closeButton){
                closeButton.addEventListener('click', function() {
                    popupElement.classList.remove('active');
                    buttonElement.classList.remove('active');
                });
            }
        } else {
            if(!buttonElement) console.warn(`Button ${mapping.buttonId} not found`);
            if(!popupElement) console.warn(`Popup with Id ${mapping.popupId} not found`);
        }
    });

    document.addEventListener('click', function(event) {
        const activePopup = document.querySelector('.popup-menu.active');
        if (activePopup) {
            let clickedOnTriggerButton = false;
            buttonPopupMappings.forEach(mapping => {
                const btn = document.getElementById(mapping.buttonId);
                if (btn && (btn === event.target || btn.contains(event.target))) {
                    clickedOnTriggerButton = true;
                }
            });

            if (!activePopup.contains(event.target) && !clickedOnTriggerButton) {
                closeAllActivePopups();
            }
        }
    });
});