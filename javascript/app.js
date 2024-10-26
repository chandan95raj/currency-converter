const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertButton = document.getElementById("convert");
const swapButton = document.getElementById("swap");
const resetButton = document.getElementById("reset");
const result = document.getElementById("result");
const errorMessage = document.getElementById("error-message");

const baseURL = "https://v6.exchangerate-api.com/v6/8db7739e6288167ec792b984/latest/";

async function populateCurrencyOptions() {
    try {
        const response = await fetch(baseURL + "USD");
        const data = await response.json();
        const currencies = Object.keys(data.conversion_rates);

        currencies.forEach(currency => {
            const option1 = document.createElement("option");
            option1.value = currency;
            option1.textContent = currency;
            if (currency === "USD") option1.selected = true;
            fromCurrency.appendChild(option1);
            
            const option2 = document.createElement("option");
            option2.value = currency;
            option2.textContent = currency;
            if (currency === "INR") option2.selected = true;
            toCurrency.appendChild(option2);
        });
    } catch (error) {
        displayError("Failed to load currency list. Please try again.");
    }
}


async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount <= 0) {
        displayError("Please enter a valid amount.");
        return;
    }
    
    try {
        const response = await fetchWithTimeout(baseURL + from, 5000);
        const data = await response.json();

        if (data.conversion_rates[to]) {
            const convertedAmount = (amount * data.conversion_rates[to]).toFixed(2);
            result.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
            errorMessage.textContent = "";
        } else {
            displayError("This currency is not available.");
        }
    } catch (error) {
        displayError(error.message);
    }
}

function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
}


function displayError(message) {
    errorMessage.textContent = message;
}

function resetForm() {
    amountInput.value = "";
    fromCurrency.value = "USD";
    toCurrency.value = "INR";
    result.textContent = "";
    errorMessage.textContent = "";
}


async function fetchWithTimeout(resource, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(resource, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
        }
        throw new Error("Failed to fetch data. Please check your network.");
    }
}


convertButton.addEventListener("click", convertCurrency);
swapButton.addEventListener("click", swapCurrencies);
resetButton.addEventListener("click", resetForm);

populateCurrencyOptions();
