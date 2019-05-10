// Get HTML elements
// Buttons
const addTaskButton = document.querySelector("#add-task");
const clearTasksButton = document.querySelector("#clear-tasks");
const exportTasksButton = document.querySelector("#export-tasks");
const importTasksButton = document.querySelector("#import-tasks");
const switchViewButton = document.querySelector("#switch-view");
const finishedFilter = document.querySelector("#finished-filter");
const inProgressFilter = document.querySelector("#in-progress-filter");
const addRefreshButton = document.querySelector("#add-refresh-task");
const deleteTaskButton = document.querySelector("#delete-task");
const yesButton = document.querySelector("#clear-confirmation-yes");
const noButton = document.querySelector("#clear-confirmation-no");

// Divs
const taskListDiv = document.querySelector("#tasks");
const calendarDiv = document.querySelector("#tasks-calendar");

// Hidden input field for opening files
const importTasksInput = document.querySelector("#import-tasks-input");

// Popup windows
const addTaskPopup = document.querySelector("#add-task-popup");
const clearConfirmationPopup = document.querySelector("#clear-confirmation-popup");
const blocker = document.querySelector("#blocker");
const popups = [addTaskPopup, clearConfirmationPopup];

// Input fields
const summaryInput = document.querySelector("#summary");
const originatorInput = document.querySelector("#originator");
const descriptionInput = document.querySelector("#description");
const dueDateInput = document.querySelector("#due-date");
const priorityInput = document.querySelector("#priority");
const progressInput = document.querySelector("#progress");
const stateInput = document.querySelector("#state");
const inputFields = [summaryInput, originatorInput, descriptionInput, dueDateInput, priorityInput, progressInput, stateInput];

// Input labels
const progressLabel = document.querySelector("#progress-label");
const stateLabel = document.querySelector("#state-label");

// Table elements
const taskTable = document.querySelector("#tasks").querySelector("table");
const headerRow = document.querySelector("#task-header-row");
const tableHeaders = headerRow.querySelectorAll("th");
const sortMarkerRow = document.querySelector("#sort-markers");
const sortMarkers = document.querySelectorAll("td");

// Search fields
const searchFieldSelector = document.querySelector("#search-field");
const searchTextInput = document.querySelector("#search-text");
const searchLogicSelector = document.querySelector("#search-logic");

for (let ii = 1; ii < tableHeaders.length; ii++) {
    let option = document.createElement("option");
    option.text = tableHeaders[ii].innerHTML;
    option.value = ii - 1;
    searchFieldSelector.add(option);
}

// Colors
const greenColor = "#4CBB17";
const redColor = "#FF2400";
const normalColor = "#D4D4D4";
const grayishGreenColor = "#59855D";
const grayishRedColor = "#B24C4C";
const darkGrayColor = "#0E0E0E";

// State variables
let addRefreshState = 0; // 0: add state, 1: refresh state
let importingTasks = false;
let clickedRow;
let rowIndex = 2;
let filteredTasks = {};
let searchResults = {};

// Function for adding tasks to table
function addTaskToTable(uuid, task) {
    let newRow = taskTable.insertRow(rowIndex);
    newRow.addEventListener("click", event => taskRowCallback(newRow));
    newRow.setAttribute("uuid", uuid);
    let newCell = newRow.insertCell(0);
    newCell.innerHTML = rowIndex - 1;
    newCell.align = "center";
    let cellIndex = 1;
    task.forEach(attrib => {
        newCell = newRow.insertCell(cellIndex);
        if (cellIndex == 1 || cellIndex == 4) {
            newCell.align = "left";
        } else {
            newCell.align = "center";
        }
        cellIndex++;
    });
    refreshTask(newRow, task);
    rowIndex++;
}

// Function for refreshing task
function refreshTask(row, task) {
    let cells = row.querySelectorAll("td");
    for (let ii = 1; ii < cells.length; ii++) {
        cells[ii].innerHTML = task[ii - 1];
        if (ii == 5) {
            if (taskExpired(task[ii - 1]) && task[7] == "In progress") {
                cells[ii].style.color = redColor;
            } else {
                cells[ii].style.color = normalColor;
            }
        } else if (ii == 6) {
            if (task[ii - 1] == "High") {
                cells[ii].style.fontStyle = "normal";
                cells[ii].style.fontWeight = "bold";
            } else if (task[ii - 1] == "Normal") {
                cells[ii].style.fontStyle = "normal";
                cells[ii].style.fontWeight = "normal";
            } else {
                cells[ii].style.fontStyle = "italic";
                cells[ii].style.fontWeight = "normal";
            }
        }
        else if (ii == 7) {
            cells[ii].innerHTML += "%";
            if (task[ii - 1] < 20) {
                cells[ii].style.color = "orange";
            } else if (task[ii - 1] < 80) {
                cells[ii].style.color = "yellow";
            } else {
                cells[ii].style.color = greenColor;
            }
        } else if (ii == 8) {
            if (task[ii - 1] == "Finished") {
                cells[ii].style.color = greenColor;
            } else {
                cells[ii].style.color = normalColor;
            }
        }
    }
}

// Function for clearing the task table
function clearTaskTable() {
    for (let ii = taskTable.rows.length - 1; ii >= 2; ii--) {
        taskTable.deleteRow(ii);
    }
    rowIndex = 2;
}

// Function for collecting inputs
function collectInputs() {
    let task = [];
    for (let ii = 0; ii < (addRefreshState == 1 ? inputFields.length : inputFields.length - 2); ii++) {
        task.push(inputFields[ii].value);
    }
    if (addRefreshState == 0) {
        task.push(0);
        task.push("In progress");
    }

    if (task[5] < 0) {
        task[5] = 0;
    } else if (task[5] > 100) {
        task[5] = 100;
    }

    if (task[3] == "" || isDateFormatCorrect(task[3])) {
        return task;
    } else {
        alert("Incorrect date format!");
        return;
    }
}

// Function for writing task attributes into input fields
function writeInputFields(task) {
    summaryInput.value = task[0];
    originatorInput.value = task[2];
    descriptionInput.value = task[3];
    dueDateInput.value = task[4];
    priorityInput.value = task[5];
    progressInput.value = task[6];
    stateInput.value = task[7];
}

// Function for clearing all input fields
function clearInputFields() {
    for (let ii = 0; ii < inputFields.length; ii++) {
        inputFields[ii].value = "";
    }
    priorityInput.value = "Low";
}

// Event listeners
// Callback function of task rows
function taskRowCallback(row) {
    popups.forEach(popup => {
        popup.classList.remove("popup");
        popup.classList.add("hidden");
    });
    addRefreshState = 1;
    clickedRow = row;
    addRefreshButton.innerHTML = "Refresh task";
    deleteTaskButton.classList.remove("hidden");
    deleteTaskButton.classList.add("active-button");
    progressLabel.classList.remove("hidden");
    progressInput.classList.remove("hidden");
    stateLabel.classList.remove("hidden");
    stateInput.classList.remove("hidden");
    blocker.style.display = "block";
    addTaskPopup.classList.remove("hidden");
    addTaskPopup.classList.add("popup");
    let uuid = row.getAttribute("uuid");
    writeInputFields(jsonData.tasks[uuid]);
}

// Add task button
addTaskButton.addEventListener("click", event => {
    popups.forEach(popup => {
        popup.classList.remove("popup");
        popup.classList.add("hidden");
    });
    addRefreshState = 0;
    addRefreshButton.innerHTML = "Add task";
    deleteTaskButton.classList.remove("active-button");
    deleteTaskButton.classList.add("hidden");
    stateInput.classList.add("hidden");
    stateLabel.classList.add("hidden");
    progressInput.classList.add("hidden");
    progressLabel.classList.add("hidden");
    blocker.style.display = "block";
    clearInputFields();
    addTaskPopup.classList.remove("hidden");
    addTaskPopup.classList.add("popup");
});

// Clear tasks button
clearTasksButton.addEventListener("click", event => {
    popups.forEach(popup => {
        popup.classList.remove("popup");
        popup.classList.add("hidden");
    });
    blocker.style.display = "block";
    clearConfirmationPopup.classList.remove("hidden");
    clearConfirmationPopup.classList.add("popup");
});

// Export tasks button
exportTasksButton.addEventListener("click", event => {
    let textToWrite = JSON.stringify(jsonData);
    let textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    let fileNameToSaveAs = "tasks.json";
    let downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    downloadLink.click();
});

// Import tasks button
importTasksButton.addEventListener("click", event => {
    importingTasks = true;
    clearTasksButton.click();
});

// Switch view button
switchViewButton.addEventListener("click", event => {
    if (jsonData.lastState.calendarView) {
        jsonData.lastState.calendarView = false;
        calendarDiv.classList.add("hidden");
        taskListDiv.classList.remove("hidden");
        switchViewButton.innerHTML = "Switch to calendar view";
    } else {
        jsonData.lastState.calendarView = true;
        taskListDiv.classList.add("hidden");
        calendarDiv.classList.remove("hidden");
        switchViewButton.innerHTML = "Switch to list view";
    }

    saveJson();
});

// Filter finished tasks button
finishedFilter.addEventListener("click", event => {
    if (jsonData.lastState.finishedFilter) {
        jsonData.lastState.finishedFilter = false;
        finishedFilter.classList.remove("active-button");
        finishedFilter.classList.add("inactive-button");
    } else {
        jsonData.lastState.finishedFilter = true;
        finishedFilter.classList.remove("inactive-button");
        finishedFilter.classList.add("active-button");
    }

    filterTasks();
    saveJson();
});

// Filter in-progress tasks button
inProgressFilter.addEventListener("click", event => {
    if (jsonData.lastState.inProgressFilter) {
        jsonData.lastState.inProgressFilter = false;
        inProgressFilter.classList.remove("active-button");
        inProgressFilter.classList.add("inactive-button");
    } else {
        jsonData.lastState.inProgressFilter = true;
        inProgressFilter.classList.remove("inactive-button");
        inProgressFilter.classList.add("active-button");
    }

    filterTasks();
    saveJson();
});

// Add or refresh task button
addRefreshButton.addEventListener("click", event => {
    let task = collectInputs();
    if (task == undefined) {
        return;
    }
    addTaskPopup.classList.remove("popup");
    addTaskPopup.classList.add("hidden");
    blocker.style.display = "none";

    if (addRefreshState == 0) {
        let uuid = generateUUID();
        task.splice(1, 0, getFormattedDate());
        jsonData.tasks[uuid] = task;
    }
    else {
        let uuid = clickedRow.getAttribute("uuid");
        task.splice(1, 0, jsonData.tasks[uuid][1]);
        if (task[7] == "Finished") {
            task[6] = 100;
        }
        jsonData.tasks[uuid] = task;
        refreshTask(clickedRow, task);
    }

    filterTasks();
    updateCalendar(currentYear, currentMonth);
    saveJson();
});

// Delete task button
deleteTaskButton.addEventListener("click", event => {
    let uuid = clickedRow.getAttribute("uuid");
    delete jsonData.tasks[uuid];
    addTaskPopup.classList.remove("popup");
    addTaskPopup.classList.add("hidden");
    blocker.style.display = "none";

    filterTasks();
    updateCalendar(currentYear, currentMonth);
    saveJson();
});

// "Yes" button in confirmation popup
yesButton.addEventListener("click", event => {
    clearTaskTable();
    jsonData.tasks = {};
    clearConfirmationPopup.classList.remove("popup");
    clearConfirmationPopup.classList.add("hidden");
    blocker.style.display = "none";

    if (importingTasks) {
        importTasksInput.click();
        let file = importTasksInput.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = function (event) {
            console.log("here");
            let content = event.target.result;
            if (checkFile(content)) {
                jsonData = JSON.parse(content);

                for (let ii = 0; ii <= 1; ii++) {
                    tableHeaders[jsonData.lastState.sortColumn].click();
                    finishedFilter.click();
                    inProgressFilter.click();
                }
            } else {
                alert("Invalid file selected!");
            }
        };
        reader.readAsText(file);

        importingTasks = false;
    }

    updateCalendar(currentYear, currentMonth);
    saveJson();
});

// "No" button in confirmation popup
noButton.addEventListener("click", event => {
    importingTasks = false;
    clearConfirmationPopup.classList.remove("popup");
    clearConfirmationPopup.classList.add("hidden");
    blocker.style.display = "none";
});

// Click outside of popup window
blocker.addEventListener("click", event => {
    popups.forEach(popup => {
        popup.classList.remove("popup");
        popup.classList.add("hidden");
    });
    blocker.style.display = "none";
});

// Table header and sort markers
function sortListener(col) {
    if (col == jsonData.lastState.sortColumn) {
        if (jsonData.lastState.sortDirection == 0) {
            jsonData.lastState.sortDirection = 1;
            sortMarkers[col].innerHTML = "Descending";
            sortMarkers[col].classList.remove("ascending");
            sortMarkers[col].classList.add("descending");
        } else {
            jsonData.lastState.sortDirection = 0;
            sortMarkers[col].innerHTML = "Ascending";
            sortMarkers[col].classList.remove("descending");
            sortMarkers[col].classList.add("ascending");
        }
    } else {
        sortMarkers[jsonData.lastState.sortColumn].classList.remove("ascending");
        sortMarkers[jsonData.lastState.sortColumn].classList.remove("descending");
        sortMarkers[jsonData.lastState.sortColumn].innerHTML = "";
        jsonData.lastState.sortColumn = col;
        jsonData.lastState.sortDirection = 0;
        sortMarkers[col].innerHTML = "Ascending";
        sortMarkers[col].classList.add("ascending");
    }

    sortTasks();
    saveJson();
}

// Event listeners of the search bar
async function searchBarCallback() {
    let temporarySearchResults = await filterSearchResults();
    searchResults = {};
    for (let key in temporarySearchResults) {
        searchResults[key] = temporarySearchResults[key];
    }
    sortTasks();
}

// Search field selection changed
searchFieldSelector.addEventListener("change", event => {
    searchBarCallback();
});

// Search text changed
searchTextInput.addEventListener("input", event => {
    searchBarCallback();
});

// Search logic selection change
searchLogicSelector.addEventListener("change", event => {
    searchBarCallback();
});

for (let ii = 1; ii < tableHeaders.length - 1; ii++) {
    tableHeaders[ii].addEventListener("click", event => sortListener(ii));
    sortMarkers[ii].addEventListener("click", event => sortListener(ii));
}

// Pressing enter while the add/refresh task popup is visible
document.querySelector("body").addEventListener("keypress", event => {
    if (!addTaskPopup.classList.contains("hidden") && document.activeElement != descriptionInput && event.key == "Enter") {
        addRefreshButton.click();
    }
});

// Add content from JSON, restore last state before the app was closed
searchFieldSelector.value = jsonData.lastState.searchField;
searchTextInput.value = jsonData.lastState.searchText;
searchLogicSelector.value = jsonData.lastState.searchLogic;
for (let ii = 0; ii <= 1; ii++) {
    tableHeaders[jsonData.lastState.sortColumn].click();
    finishedFilter.click();
    inProgressFilter.click();
}

if (jsonData.lastState.calendarView) {
    jsonData.lastState.calendarView = false;
    switchViewButton.click();
}