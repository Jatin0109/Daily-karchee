// ==========================================
// DAILY KARCHEE - APP.JS
// Student Expense Manager
// ==========================================

const STORAGE_KEY = "dailyKarcheeExpenses";
const SETTINGS_KEY = "dailyKarcheeSettings";

// Get saved data
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
    monthlyBudget: 0,
    dailyBudget: 0,
    theme: "dark"
};


// ==========================================
// SAVE DATA
// ==========================================

function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


// ==========================================
// GET ELEMENT HELPER
// ==========================================

function getElement(...ids) {
    for (const id of ids) {
        const element = document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// ADD EXPENSE
// ==========================================

function addExpense(name, amount, category, date, note = "") {

    if (!name || !amount || Number(amount) <= 0) {
        alert("Please enter a valid expense name and amount.");
        return false;
    }

    const expense = {
        id: Date.now(),
        name: name,
        amount: Number(amount),
        category: category || "Other",
        date: date || new Date().toISOString().split("T")[0],
        note: note
    };

    expenses.push(expense);

    saveExpenses();
    updateDashboard();
    renderExpenses();

    return true;
}


// ==========================================
// DELETE EXPENSE
// ==========================================

function deleteExpense(id) {

    const confirmed = confirm("Do you want to delete this expense?");

    if (!confirmed) {
        return;
    }

    expenses = expenses.filter(expense => expense.id !== id);

    saveExpenses();
    updateDashboard();
    renderExpenses();
}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function getTotalExpenses() {
    return expenses.reduce((total, expense) => {
        return total + Number(expense.amount);
    }, 0);
}


// ==========================================
// TODAY'S EXPENSE
// ==========================================

function getTodayExpenses() {

    const today = new Date().toISOString().split("T")[0];

    return expenses
        .filter(expense => expense.date === today)
        .reduce((total, expense) => {
            return total + Number(expense.amount);
        }, 0);
}


// ==========================================
// THIS MONTH'S EXPENSE
// ==========================================

function getMonthlyExpenses() {

    const now = new Date();

    return expenses
        .filter(expense => {

            const expenseDate = new Date(expense.date);

            return (
                expenseDate.getMonth() === now.getMonth() &&
                expenseDate.getFullYear() === now.getFullYear()
            );

        })
        .reduce((total, expense) => {
            return total + Number(expense.amount);
        }, 0);
}


// ==========================================
// CATEGORY TOTAL
// ==========================================

function getCategoryTotal(category) {

    return expenses
        .filter(expense =>
            expense.category.toLowerCase() === category.toLowerCase()
        )
        .reduce((total, expense) => {
            return total + Number(expense.amount);
        }, 0);
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total = getTotalExpenses();
    const today = getTodayExpenses();
    const monthly = getMonthlyExpenses();

    // Total Expense
    const totalElement = getElement(
        "totalExpense",
        "totalExpenses",
        "total-expense"
    );

    if (totalElement) {
        totalElement.textContent = formatMoney(total);
    }


    // Today's Expense
    const todayElement = getElement(
        "todayExpense",
        "todayExpenses",
        "today-expense"
    );

    if (todayElement) {
        todayElement.textContent = formatMoney(today);
    }


    // Monthly Expense
    const monthlyElement = getElement(
        "monthlyExpense",
        "monthlyExpenses",
        "monthly-expense"
    );

    if (monthlyElement) {
        monthlyElement.textContent = formatMoney(monthly);
    }


    // Monthly Budget
    const budgetElement = getElement(
        "monthlyBudget",
        "monthly-budget"
    );

    if (budgetElement) {
        budgetElement.textContent = formatMoney(settings.monthlyBudget);
    }


    // Remaining Monthly Budget
    const remaining = settings.monthlyBudget - monthly;

    const remainingElement = getElement(
        "remainingBudget",
        "remaining-budget"
    );

    if (remainingElement) {

        remainingElement.textContent = formatMoney(
            Math.max(remaining, 0)
        );

        if (remaining < 0) {
            remainingElement.style.color = "#ff4d4d";
        } else {
            remainingElement.style.color = "";
        }
    }


    // Travel Expense
    const travelElement = getElement(
        "travelExpense",
        "travel-expense"
    );

    if (travelElement) {
        travelElement.textContent =
            formatMoney(getCategoryTotal("Travel"));
    }


    // Food Expense
    const foodElement = getElement(
        "foodExpense",
        "food-expense"
    );

    if (foodElement) {
        foodElement.textContent =
            formatMoney(getCategoryTotal("Food"));
    }


    // Gym / Diet Expense
    const gymElement = getElement(
        "gymExpense",
        "dietExpense",
        "gym-expense"
    );

    if (gymElement) {

        const gymTotal =
            getCategoryTotal("Gym") +
            getCategoryTotal("Diet");

        gymElement.textContent = formatMoney(gymTotal);
    }


    updateBudgetStatus();
}


// ==========================================
// BUDGET STATUS
// ==========================================

function updateBudgetStatus() {

    const monthly = getMonthlyExpenses();
    const today = getTodayExpenses();

    const monthlyStatus = getElement(
        "monthlyBudgetStatus",
        "monthly-budget-status"
    );

    const dailyStatus = getElement(
        "dailyBudgetStatus",
        "daily-budget-status"
    );


    if (monthlyStatus && settings.monthlyBudget > 0) {

        const percentage =
            (monthly / settings.monthlyBudget) * 100;

        monthlyStatus.textContent =
            Math.round(percentage) + "% of monthly budget used";

        if (percentage >= 100) {
            monthlyStatus.style.color = "#ff4d4d";
        } else if (percentage >= 80) {
            monthlyStatus.style.color = "#ffb020";
        } else {
            monthlyStatus.style.color = "#4ade80";
        }
    }


    if (dailyStatus && settings.dailyBudget > 0) {

        const percentage =
            (today / settings.dailyBudget) * 100;

        dailyStatus.textContent =
            Math.round(percentage) + "% of daily budget used";

        if (percentage >= 100) {
            dailyStatus.style.color = "#ff4d4d";
        } else {
            dailyStatus.style.color = "#4ade80";
        }
    }
}


// ==========================================
// RENDER EXPENSE HISTORY
// ==========================================

function renderExpenses() {

    const expenseList = getElement(
        "expenseList",
        "expensesList",
        "expense-history"
    );

    if (!expenseList) {
        return;
    }

    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty-expenses">
                <p>No expenses added yet.</p>
            </div>
        `;

        return;
    }


    const sortedExpenses = [...expenses].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });


    sortedExpenses.forEach(expense => {

        const item = document.createElement("div");

        item.className = "expense-item";

        item.innerHTML = `
            <div class="expense-info">

                <div class="expense-icon">
                    ${getCategoryIcon(expense.category)}
                </div>

                <div>
                    <h4>${escapeHTML(expense.name)}</h4>

                    <p>
                        ${expense.category} •
                        ${formatDate(expense.date)}
                    </p>

                    ${
                        expense.note
                            ? `<small>${escapeHTML(expense.note)}</small>`
                            : ""
                    }
                </div>

            </div>

            <div class="expense-right">

                <strong>
                    ${formatMoney(expense.amount)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            </div>
        `;

        expenseList.appendChild(item);
    });
}


// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",
        Travel: "🚗",
        Gym: "💪",
        Diet: "🥗",
        College: "🎓",
        Exam: "📝",
        Shopping: "🛍️",
        Bills: "💡",
        Entertainment: "🎬",
        Other: "💰"

    };

    return icons[category] || "💰";
}


// ==========================================
// PROTECT HTML
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// EXPENSE FORM
// ==========================================

function setupExpenseForm() {

    const form = getElement(
        "expenseForm",
        "addExpenseForm"
    );

    if (!form) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const nameInput = getElement(
            "expenseName",
            "name"
        );

        const amountInput = getElement(
            "expenseAmount",
            "amount"
        );

        const categoryInput = getElement(
            "expenseCategory",
            "category"
        );

        const dateInput = getElement(
            "expenseDate",
            "date"
        );

        const noteInput = getElement(
            "expenseNote",
            "note"
        );


        const success = addExpense(

            nameInput ? nameInput.value.trim() : "",

            amountInput ? amountInput.value : "",

            categoryInput
                ? categoryInput.value
                : "Other",

            dateInput
                ? dateInput.value
                : "",

            noteInput
                ? noteInput.value.trim()
                : ""

        );


        if (success) {

            form.reset();

            if (dateInput) {
                dateInput.value =
                    new Date().toISOString().split("T")[0];
            }

            closeModal();
        }

    });
}


// ==========================================
// SET TODAY AS DEFAULT DATE
// ==========================================

function setDefaultDate() {

    const dateInput = getElement(
        "expenseDate",
        "date"
    );

    if (dateInput && !dateInput.value) {

        dateInput.value =
            new Date().toISOString().split("T")[0];
    }
}


// ==========================================
// BUDGET SETTINGS
// ==========================================

function setupBudgetForm() {

    const form = getElement(
        "budgetForm",
        "settingsForm"
    );

    if (!form) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const monthlyInput = getElement(
            "monthlyBudgetInput",
            "budget"
        );

        const dailyInput = getElement(
            "dailyBudgetInput",
            "dailyBudget"
        );


        if (monthlyInput) {
            settings.monthlyBudget =
                Number(monthlyInput.value) || 0;
        }


        if (dailyInput) {
            settings.dailyBudget =
                Number(dailyInput.value) || 0;
        }


        saveSettings();

        updateDashboard();

        alert("Budget settings saved successfully!");
    });
}


// ==========================================
// THEME
// ==========================================

function loadTheme() {

    document.body.setAttribute(
        "data-theme",
        settings.theme || "dark"
    );
}


function toggleTheme() {

    settings.theme =
        settings.theme === "dark"
            ? "light"
            : "dark";

    document.body.setAttribute(
        "data-theme",
        settings.theme
    );

    saveSettings();
}


function setupThemeButton() {

    const button = getElement(
        "themeToggle",
        "theme-toggle"
    );

    if (button) {
        button.addEventListener("click", toggleTheme);
    }
}


// ==========================================
// MODAL
// ==========================================

function openModal() {

    const modal = getElement(
        "expenseModal",
        "addExpenseModal"
    );

    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}


function closeModal() {

    const modal = getElement(
        "expenseModal",
        "addExpenseModal"
    );

    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}


function setupModalButtons() {

    const addButton = getElement(
        "addExpenseBtn",
        "add-expense-btn"
    );

    const closeButton = getElement(
        "closeModal",
        "close-modal"
    );


    if (addButton) {
        addButton.addEventListener("click", openModal);
    }


    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }


    window.addEventListener("click", function (event) {

        const modal = getElement(
            "expenseModal",
            "addExpenseModal"
        );

        if (modal && event.target === modal) {
            closeModal();
        }

    });
}


// ==========================================
// EXPORT DATA TO CSV
// ==========================================

function exportExpenses() {

    if (expenses.length === 0) {
        alert("No expense data available to export.");
        return;
    }


    let csv =
        "Name,Amount,Category,Date,Note\n";


    expenses.forEach(expense => {

        csv += `"${expense.name}",`;
        csv += `"${expense.amount}",`;
        csv += `"${expense.category}",`;
        csv += `"${expense.date}",`;
        csv += `"${expense.note || ""}"\n`;

    });


    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "daily-karchee-expenses.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


function setupExportButton() {

    const button = getElement(
        "exportBtn",
        "exportData",
        "export-data"
    );

    if (button) {
        button.addEventListener(
            "click",
            exportExpenses
        );
    }
}


// ==========================================
// FEE TRACKING
// ==========================================

function getUpcomingFees() {

    return expenses.filter(expense =>
        expense.category === "College" ||
        expense.category === "Exam"
    );
}


// ==========================================
// SEARCH EXPENSES
// ==========================================

function setupSearch() {

    const searchInput = getElement(
        "searchExpense",
        "search"
    );

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener("input", function () {

        const search =
            this.value.toLowerCase();


        const items =
            document.querySelectorAll(
                ".expense-item"
            );


        items.forEach(item => {

            const text =
                item.textContent.toLowerCase();


            item.style.display =
                text.includes(search)
                    ? "flex"
                    : "none";

        });

    });
}


// ==========================================
// INITIALIZE APP
// ==========================================

function initializeApp() {

    loadTheme();

    setDefaultDate();

    setupExpenseForm();

    setupBudgetForm();

    setupThemeButton();

    setupModalButtons();

    setupExportButton();

    setupSearch();

    updateDashboard();

    renderExpenses();

    console.log("Daily Karchee is running successfully!");
}


// Run when page loads
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
