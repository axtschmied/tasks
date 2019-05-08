// Load the JSON data storing the tasks
// If there is no JSON data yet, use a default one
let jsonData;
if (localStorage.hasOwnProperty("tasksJson")) {
    jsonData = JSON.parse(localStorage.getItem("tasksJson"));
} else {
    jsonData = {
        tasks: {},
        lastState: {
            sortColumn: 2,
            sortDirection: 0,
            finishedFilter: true,
            inProgressFilter: true
        }
    }
}

// Function for saving the tasks into the JSON file
function saveJson() {
    localStorage.setItem("jsonTasks", JSON.stringify(jsonData));
}

// Function for generating a unique identifier for tasks
function generateUUID() {
    var d = Date.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Function for returning the current date in a formatted way
function getFormattedDate() {
    let d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    return d.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + " " + (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

// Function for determining if due date expired
function taskExpired(dueDate) {
    if (dueDate == "") {
        return false;
    } else {
        let d = new Date();
        let dueDateParts = dueDate.split("-");
        let dueDateYear = parseInt(dueDateParts[0]);
        let dueDateMonth = parseInt(dueDateParts[1]);
        let dueDateDay = parseInt(dueDateParts[2]);
        if (dueDateYear < d.getFullYear()) {
            return true;
        } else if (dueDateYear == d.getFullYear()) {
            if (dueDateMonth < d.getMonth() + 1) {
                return true;
            } else if (dueDateMonth == d.getMonth() + 1) {
                if (dueDateDay < d.getDate()) {
                    return true;
                }
            }
        }
        return false;
    }
}

// Function for checking if date format is correct
function isDateFormatCorrect(date) {
    let regex = new RegExp("^\\d{4}\\-\\d{2}\\-\\d{2}$");
    return regex.test(date);
}

// Function for filtering tasks
function filterTasks() {
    filteredTasks = {};
    for (key in jsonData.tasks) {
        if (jsonData.lastState.finishedFilter && jsonData.tasks[key][7] == "Finished") {
            filteredTasks[key] = jsonData.tasks[key];
        } else if (jsonData.lastState.inProgressFilter && jsonData.tasks[key][7] == "In progress") {
            filteredTasks[key] = jsonData.tasks[key];
        }
    }

    sortTasks();
}

// Function for sorting tasks according to settings in jsonData.lastState
// Secondary sorting condition is always the time of addition in ascending order
function sortTasks() {
    let auxArray = [];
    for (key in filteredTasks) {
        auxArray.push([key, filteredTasks[key][1], filteredTasks[key][jsonData.lastState.sortColumn - 1]]);
    }

    if (jsonData.lastState.sortColumn == 6) {
        auxArray.sort((a, b) => {
            if (a[2] == b[2]) {
                if (b[1] > a[1]) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                switch (a[2]) {
                    case "Low":
                        a[2] = 1;
                        break;
                    case "Normal":
                        a[2] = 2;
                        break;
                    case "High":
                        a[2] = 3;
                        break;
                }
                switch (b[2]) {
                    case "Low":
                        b[2] = 1;
                        break;
                    case "Normal":
                        b[2] = 2;
                        break;
                    case "High":
                        b[2] = 3;
                        break;
                }
                if (jsonData.lastState.sortDirection == 0 && b[2] > a[2]) {
                    return -1;
                } else if (jsonData.lastState.sortDirection == 1 && a[2] > b[2]) {
                    return -1;
                } else {
                    return 1;
                }
            }
        });
    } else {
        auxArray.sort((a, b) => {
            if (a[2] == b[2]) {
                if (b[1] > a[1]) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                if (jsonData.lastState.sortDirection == 0 && b[2] > a[2]) {
                    return -1;
                } else if (jsonData.lastState.sortDirection == 1 && a[2] > b[2]) {
                    return -1;
                } else {
                    return 1;
                }
            }
        });
    }

    clearTaskTable();
    for (let ii = 0; ii < auxArray.length; ii++) {
        addTaskToTable(auxArray[ii][0], filteredTasks[auxArray[ii][0]]);
    }
}

// Function for checking if selected JSON file is valid
function checkFile(content) {
    try {
        let tmp = JSON.parse(content);
        if (tmp.hasOwnProperty("tasks")
            && typeof tmp.tasks == "object"
            && tmp.hasOwnProperty("lastState")
            && tmp.lastState.hasOwnProperty("sortColumn")
            && tmp.lastState.hasOwnProperty("sortDirection")
            && tmp.lastState.hasOwnProperty("finishedFilter")
            && tmp.lastState.hasOwnProperty("inProgressFilter")) {
            return true;
        } else {
            return false;
        }
    }
    catch (exception) {
        return false;
    }
}

// Save tasks when window is refreshed or closed
window.onbeforeunload = function () {
    localStorage.setItem("tasksJson", JSON.stringify(jsonData));
}