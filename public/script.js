const nametag = document.querySelector("#childNameTag");
const settingsSaveBtn = document.querySelector("#settingsSaveBtn");
const depositBtn = document.querySelector("#depositBtn");
const withdrawBtn = document.querySelector("#withdrawBtn");
const transactionTypeId = document.querySelector("#transactionTypeId");
const transactionModalInputGroup = document.querySelector("#transactionModalInputGroup");
const tableBody = document.querySelector("#tableBody");
const transactionBtn = document.querySelector("#transactionBtn");
const interestInput = document.getElementById("interestFormControlInput");
const interestSwitch = document.getElementById('interestSwitch');
let interestInterval;
let interestBank = 0;
let currentBalance = 0;
const currFormatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

interestInput.removeAttribute('required');

//New toys and grandma's love are constants (of course!)
const transactions = [
    {
        number: 1,
        date: '12/4/1997',
        transaction: 60.00,
        description: 'Gift from grandma'
    },
    {
        number: 2,
        date: '12/5/1997',
        transaction: -60.00,
        description: 'Bought new toy'
    }
];

//Default interest rate settings
const settings = {
    interestRate: 0,
    enabled: false
}

//Loads defaults and shows starting account balance
function initialize() {
    if (localStorage.getItem("transactions") !== null) {
        loadTransactions();
    updateBalance();
    } else {
        localStorage.setItem("transactions", JSON.stringify([]));
    }

    if (localStorage.getItem("interestSettings") === null) {
        localStorage.setItem('interestSettings', JSON.stringify(settings)); 
    }
    // let transactions = JSON.parse(localStorage.getItem('transactions'));
    // window.localStorage.setItem('transactions', JSON.stringify(transactions));
    // localStorage.setItem('interestSettings', JSON.stringify(settings));
    
    // loadInterestRateSettings();
}

//Adds constant transactions to table
function loadTransactions() {
    let transactions = JSON.parse(window.localStorage.getItem('transactions'));    
    for (var i = 0; i < transactions.length; i++) {
        appendTransactionToTable(transactions[i].number, transactions[i].date, transactions[i].transaction, transactions[i].description);
    }
}

function loadInterestRateSettings() {
    let interestRateSettings = JSON.parse(localStorage.getItem("interestSettings"));
    interestInput.innerText = interestRateSettings.interestRate;
    interestSwitch.checked = interestRateSettings.enabled;
}

//Adjusts interest rate settings when values are changed
function updateInterestRateSettings() {
    let interestRateSettings = JSON.parse(localStorage.getItem("interestSettings"));
    interestRateSettings.interestRate = parseFloat(interestInput.value);
    interestRateSettings.enabled = interestSwitch.checked;    
    localStorage.setItem('interestSettings', JSON.stringify(interestRateSettings));
    setupInterestAccrual();
}

function setupInterestAccrual() {
    if (interestSwitch.checked) {
        if (interestInterval) {
            clearInterval(interestInterval);
        }
        interestInterval = setInterval(accruedInterest, 5000);
    } else {
        clearInterval(interestInterval);
    }
}

//Updates interest rate settings upon save button click in dropdown menu
settingsSaveBtn.addEventListener('click', () => {
    updateInterestRateSettings();
});

function accruedInterest() {
    let rate = parseFloat(JSON.parse(localStorage.getItem('interestSettings')).interestRate)/100;
    let currBal = currentBalance;
    let intTransaction = {
        date: new Date(Date.now()).toLocaleString().split(',')[0],
        intAmount: (currBal * rate),
        info: "Interest Payment"
    };
    deposit(intTransaction.date, intTransaction.intAmount, intTransaction.info)
    updateBalance();
}

//Adds transaction data to table
function appendTransactionToTable(number, date, transaction, description) {
    let tr = document.createElement('tr');
        let numberData = document.createElement('th');
        numberData.innerText = number;
        let dateData = document.createElement('th');
        dateData.innerText = date;
        let transactionData = document.createElement('td');
        transactionData.innerText = currFormatter.format(transaction);
        let descriptionData = document.createElement('td');        
        descriptionData.innerText = description;

        tr.append(numberData, dateData, transactionData, descriptionData);
        tableBody.prepend(tr);
}

//Takes input from deposit modal and converts to add to transaction table
function deposit(date, transaction, description) {
    let transactions = JSON.parse(localStorage.getItem('transactions'));
    let length = transactions.length ?? 0;
    let newTransaction = {
        number: length + 1,
        date: date,
        transaction: transaction,
        description: description
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    appendTransactionToTable(newTransaction.number, newTransaction.date, newTransaction.transaction, newTransaction.description);
    return newTransaction.transaction;
}

//Takes input from withdraw modal and adds converts to add to transaction table
function withdraw(date, transaction, description) {
    let transactions = JSON.parse(localStorage.getItem('transactions'));
    let length = transactions.length ?? 0;
    let newTransaction = {
        number: length + 1,
        date: date,
        transaction: -transaction,
        description: description
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    appendTransactionToTable(newTransaction.number, newTransaction.date, newTransaction.transaction, newTransaction.description);
    return newTransaction.transaction;
}

//Adjusts balance after deposit/withdrawal and interest accrued
function updateBalance() {
    let balanceTag = document.getElementById('balance');
    let transactions = JSON.parse(localStorage.getItem("transactions"));
    if (transactions == null) {
        return;
    }
    let balance = 0;
    for (i = 0; i < transactions.length; i++) {
        balance += transactions[i].transaction;
    }
    currentBalance = balance;
    balanceTag.innerText = currFormatter.format(balance);
}

//
depositBtn.addEventListener('click', () => {
    transactionTypeId.innerText = "Deposit";
    transactionModalInputGroup.innerText = "+$";
});

//
withdrawBtn.addEventListener('click', () => {
    transactionTypeId.innerText = "Withdraw";
    transactionModalInputGroup.innerText = "-$";
});

//
transactionBtn.addEventListener("click", () => {
    if (transactionTypeId.innerText == "Deposit") {
        deposit(new Date(Date.now()).toLocaleString().split(',')[0], parseFloat(document.querySelector("#amount").value), document.querySelector("#description").value);
        updateBalance();
    } else {
        withdraw(new Date(Date.now()).toLocaleString().split(',')[0], parseFloat(document.querySelector("#amount").value), document.querySelector("#description").value);
        updateBalance();
    }
    
})

initialize();

