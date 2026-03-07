// Get elements
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("taskCounter");

// Add Task
function addTask() {

    let taskText = taskInput.value.trim();

    // Prevent empty tasks
    if (taskText === "") {
        alert("Task cannot be empty!");
        return;
    }

    // Create list item
    let li = document.createElement("li");

    // Checkbox for completion
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // Task text
    let span = document.createElement("span");
    span.textContent = taskText;
    span.className = "task-text";

    // Edit button
    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    // Delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    // Checkbox functionality
    checkbox.onclick = function () {
        span.classList.toggle("completed");
        updateCounter();
    };

    // Edit functionality
    editBtn.onclick = function () {
        let newTask = prompt("Edit your task:", span.textContent);
        if (newTask !== null && newTask.trim() !== "") {
            span.textContent = newTask;
        }
    };

    // Delete functionality
    deleteBtn.onclick = function () {
        taskList.removeChild(li);
        updateCounter();
    };

    // Append elements
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    // Clear input
    taskInput.value = "";

    updateCounter();
}

// Update completed/pending count
function updateCounter() {

    let tasks = taskList.querySelectorAll("li");
    let completed = taskList.querySelectorAll(".completed");

    let pending = tasks.length - completed.length;

    counter.textContent =
        "Completed: " + completed.length + " | Pending: " + pending;
}