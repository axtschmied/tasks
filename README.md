# Tasks
Simple task manager app running in the browser.

## Functionalities
*   Adding/modifying/deleting tasks
*   Setting the progress and the state (in progress/finished) of tasks
*   Sort tasks based on different properties
*   Search for tasks
*   View tasks in calender (based on due date)
*   Export/import tasks to/from JSON file

## Installation
You don't have to install anything, just clone or download this repository.

## Usage
The tasks will be saved into the browser's local storage, and this is not supported in every browser, if an HTML file is opened from the file system, and not provided by a server. Therefore the easiest way to use the app in any browser is the following. In a CMD window execute

```cmd
cd <path/to/repository/folder> && start /b python -m http.server 8000 && timeout 1 && start chrome.exe http://localhost:8000/
```

This example is for Windows, but can easily be adapted for Linux. This command will start a local server using Python from the folder into which you have saved this repository, then open it in Chrome (or any other browser). The 1 s timeout is necessary to wait for the server to start before trying to use it.

For convenience you can create a shortcut on Windows with the target set to

```cmd
C:\Windows\System32\cmd.exe /c cd <path/to/repository/folder> && start /b python -m http.server 8000 && timeout 1 && start chrome.exe http://localhost:8000/
```

After that you can start to add tasks. You can use HTML tags in the *Summary* and *Description* fields for formatting. Not necessary fields can be left blank.

The tasks that you already added can be viewed in a list or in the calendar, however the calendar will only show the tasks that have a valid due date set. To edit  or delete an existing task, just click on its row in the list view or the calendar view. To close the editing view and discard the modifications, just click anywhere outside the editing view.

You can sort tasks by any column in the list view by clicking on the given column's header. To filter tasks by their state, click on the *Finished* and *In progress* buttons in the header of the *State* column to show/hide the tasks in the given state. You can also search for tasks and select in which fields to search. The sorting and filtering also applies to the list of tasks matching the search expression.

The tasks are stored into the browser's local storage, therefore if you would like to create a backup or transfer tasks into another browser, you can use the *Export tasks* button to save the tasks and the current state of the tasks view into a JSON file. Then you can import this JSON file into another browser.
