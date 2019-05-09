// Get HTML elements
const calendarBody = document.querySelector("#calendar-body");
const calendarHeader = document.querySelector("#calendar-header");
const yearInput = document.getElementById("year-input");
const monthSelector = document.getElementById("month-selector");
const previousMonthButton = document.querySelector("#previous-month");
const nextMonthButton = document.querySelector("#next-month");

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

updateCalendar(currentYear, currentMonth);

// Event listeners
previousMonthButton.addEventListener("click", event => {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    updateCalendar(currentYear, currentMonth);
});

nextMonthButton.addEventListener("click", event => {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    updateCalendar(currentYear, currentMonth);
});

function jumpToDate() {
    currentYear = parseInt(yearInput.value);
    if (isNaN(currentYear)) {
        return;
    }
    currentMonth = parseInt(monthSelector.value);
    updateCalendar(currentYear, currentMonth);
}

yearInput.addEventListener("input", event => {
    jumpToDate();
});

monthSelector.addEventListener("change", event => {
    jumpToDate();
});

// Function to update the calendar, even if it is not visible
function updateCalendar(year, month) {
    let firstDay = (new Date(year, month)).getDay();
    if (firstDay == 0) {
        firstDay = 6;
    } else {
        firstDay--;
    }
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

    calendarBody.innerHTML = "";
    calendarHeader.innerHTML = months[month] + " " + year;
    yearInput.value = year;
    monthSelector.value = month;

    let date = 1;
    let prevYear = (month === 0) ? year - 1 : year;
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevMonthDate = 33 - new Date(prevYear, prevMonth, 32).getDate() - firstDay;
    let nextYear = (month === 11) ? year + 1 : year;
    let nextMonth = (month + 1) % 12;
    let nextMonthDate = 1;

    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode((prevMonthDate + 1 < 10) ? "0" + (prevMonthDate + 1) : (prevMonthDate + 1));
                cell.id = "calendar-" + prevYear + "-" + (prevMonth < 10 ? "0" + prevMonth : prevMonth) + "-" + (prevMonthDate < 10 ? "0" + prevMonthDate : prevMonthDate);
                cell.classList.add("prev-next-month-day");
                cell.setAttribute("valign", "top");
                cell.appendChild(cellText);
                row.appendChild(cell);
                prevMonthDate++;
            }
            else if (date > daysInMonth) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode((nextMonthDate + 1 < 10) ? "0" + (nextMonthDate + 1) : (nextMonthDate + 1));
                cell.id = "calendar-" + nextYear + "-" + (nextMonth < 10 ? "0" + nextMonth : nextMonth) + "-" + (nextMonthDate < 10 ? "0" + nextMonthDate : nextMonthDate);
                cell.classList.add("prev-next-month-day");
                cell.setAttribute("valign", "top");
                cell.appendChild(cellText);
                row.appendChild(cell);
                nextMonthDate++;
            }
            else {
                let cell = document.createElement("td");
                let cellText = document.createTextNode((date < 10) ? "0" + date : date);
                cell.id = "calendar-" + year + "-" + (month + 1 < 10 ? "0" + (month + 1) : (month + 1)) + "-" + (date < 10 ? "0" + date : date);
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("today");
                } else {
                    cell.classList.add("current-month-day");
                }
                cell.setAttribute("valign", "top");
                cell.appendChild(cellText);
                row.appendChild(cell);
                date++;
            }
        }

        calendarBody.appendChild(row);
    }

    addTasksToCalendar(year, month);
}

// Function for adding tasks to the calendar
/* Tasks are added based on their due date, tasks without due date are ignored. Only the tasks are considered that have their due date in the month currenly displayed in the calendar. Search and filters are not considered. */
function addTasksToCalendar(year, month) {
    let prevYear = (month === 0) ? year - 1 : year;
    let prevMonth = (month === 0) ? 11 : month - 1;
    let nextYear = (month === 11) ? year + 1 : year;
    let nextMonth = (month + 1) % 12;
    for (let key in jsonData.tasks) {
        if (jsonData.tasks[key][4] == "") {
            continue;
        }
        if (jsonData.tasks[key][4].includes(year + "-" + ((month < 10) ? "0" + month : month))
            || jsonData.tasks[key][4].includes(prevYear + "-" + ((prevMonth < 10) ? "0" + prevMonth : prevMonth))
            || jsonData.tasks[key][4].includes(nextYear + "-" + ((nextMonth < 10) ? "0" + nextMonth : nextMonth))) {
            let cell = document.querySelector("#calendar-" + jsonData.tasks[key][4]);
            if (cell) {
                let subtable = cell.querySelector(".subtable");
                if (subtable == null) {
                    subtable = document.createElement("table");
                    subtable.classList.add("subtable");
                    cell.appendChild(subtable);
                }

                let row = subtable.insertRow(subtable.rows.length);
                row.addEventListener("click", event => taskRowCallback(row));
                row.setAttribute("uuid", key);
                let subcell = row.insertCell(row.cells.length);
                subcell.innerHTML = jsonData.tasks[key][0];

                if (jsonData.tasks[key][7] == "Finished") {
                    row.style.backgroundColor = grayishGreenColor;
                } else if (taskExpired(jsonData.tasks[key][4])) {
                    row.style.backgroundColor = grayishRedColor;
                }
            }
        }
    }
}