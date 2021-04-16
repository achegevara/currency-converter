function getRate(currency) {
    let apiURL = 'https://www.nbrb.by/api/exrates/rates/';
    let url = apiURL + currency + '?parammode=2';
    return fetch(url)
            .then((resp) => resp.json())
            .then((resp) => resp.Cur_OfficialRate/resp.Cur_Scale).catch(err => alert('Incorrect currency code'));
};

function toByn(value, curr) {
    return getRate(curr).then(resp => value*resp).catch(err => alert(err));
}

function round(value, decimals) {
   return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode != 46 &&(charCode < 48 || charCode > 57)))
        return false;
    return true;
}

function addEventToInput(input) {
    input.onpaste = function() {return false};
    input.oninput = processInput;
    input.onkeypress = isNumberKey;
    input.onclick = function(event) {
        if(event.target.value == 0) {
            event.target.value = "";
            }
        }
    input.onkeydown = function (e) {
        if (e.currentTarget.value.indexOf(".") != '-1' || e.currentTarget.value.indexOf(",") != '-1') { 
            return !(/[.,]/.test(e.key));
            }
        }
    }
    
function addEventToSelect(select) {
    select.onchange = processInput;
}

function addEvents() {
    let trs = document.querySelectorAll('tr');
    for(let tr of trs) {
        let inputs = tr.querySelectorAll('input');
        for(let input of inputs) {
            addEventToInput(input);
        }
        let selects = tr.querySelectorAll('select');
        for(let select of selects) {
            addEventToSelect(select);
        }
    }
    let addCurr = document.getElementById('addCurr');
    addCurr.onchange = addCurrency;

    let clearButton = document.getElementById('clear');
    clearButton.onclick = function() {
    let inputs = document.getElementsByClassName('input');
    for (let input of inputs) {
        input.value = "";
    }
}
}
addEvents();

let latestValues = {};

function processInput(event) {
    let eventValue;
    let nearSelect;
    if(event.target.tagName == 'INPUT') {
        eventValue = event.target.value;
        nearSelect = event.target.closest('tr').querySelector('select');
        
    
    } else if(event.target.tagName == 'SELECT') {
        nearSelect = event.target;
        eventValue = event.target.closest('tr').querySelector('input').value;
    }
    
    latestValues.lastSelect = nearSelect;
    latestValues.lastValue = eventValue;

    if(nearSelect.value == 'BYN') {
        fromBynToCur(eventValue);
    } else {
        toByn(eventValue, nearSelect.value).then(resp => fromBynToCur(resp));
        }
}

let table = document.getElementById('table');

function fromBynToCur(valueByn) {
    let selects = table.querySelectorAll('select');
    
    for(let select of selects) {
        let parentRow = select.closest('tr');
        if(parentRow == latestValues.lastSelect.closest('tr')) {
            continue;
        }
        if(select.value == 'BYN') {
            try {
                parentRow.querySelector('input').value = round(valueByn, 2);
            }
            catch(err) {
                err => alert(err);
            }
        } else {
            getRate(select.value).then(resp => parentRow.querySelector('input').value = round(valueByn/resp, 2))
            .catch(err => alert(err));
        }
    }
}

let optionValuesArray = [];

function checkOption() {
    let options = table.querySelectorAll('option');
    for (let option of options) {
        if(!optionValuesArray.includes(option.value)) {
        optionValuesArray.push(option.value);
        }
    }
}

function addPrevOptions(select) {
    checkOption();
    for(let optia of optionValuesArray) {
        select.add(new Option(optia, optia));
    }
}

function addNewOption(newOptionValue) {
    let selects = table.querySelectorAll('select');
    if(!optionValuesArray.includes(newOptionValue)) {
        for(let select of selects) {
            select.add(new Option(newOptionValue, newOptionValue));
        }
        selects[selects.length-1].selectedIndex = optionValuesArray.length;
        } else {
            selects[selects.length-1].value = newOptionValue;
    }
    addEvents();
    optionValuesArray = [];
}

function countAfterAdd(value, select) {
    if (select != undefined){
      if(select.value == 'BYN') {
          fromBynToCur(value);
      } else {
          toByn(value, select.value).then(resp => fromBynToCur(resp));
          }
    }
}

function addCurrency(event) {
    let selectValue = event.target.value;
    table.insertAdjacentHTML('beforeend', 
    '<tr class="tableRow"><td class="cell">\
    <input type="text" placeholder="0.00" class="input"></td><td class="cell">\
    <select class="select"></select></td></tr>');
    let newOption = document.createElement('option');
    newOption.value = selectValue;
    newOption.text = selectValue;
   
    let selects = table.querySelectorAll('select');
    addPrevOptions(selects[selects.length-1]);
    addNewOption(newOption.value);
    countAfterAdd(latestValues.lastValue, latestValues.lastSelect);
}
