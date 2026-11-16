// TaskNest - Central Task Storage

const TASK_STORAGE_KEY = "tasknest_tasks";


// Get all saved tasks
function getTasks() {
    try {
        return JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return [];
    }
}


// Save tasks and notify other components
function saveTasks(tasks) {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));

    window.dispatchEvent(new CustomEvent("tasksUpdated"));
}


// Create a new task
function createTask(taskData) {
    const now = new Date().toISOString();

    const newTask = {
        id: crypto.randomUUID(),

        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,

        status: taskData.status || "active",

        createdAt: now,

        completedAt: taskData.status === "completed" ? now : null
    };

    const tasks = getTasks();

    tasks.push(newTask);

    saveTasks(tasks);

    return newTask;
}


// Get a task using its ID
function getTaskById(taskId) {
    const tasks = getTasks();

    return tasks.find(task => task.id === taskId);
}


// Update an existing task
function updateTask(taskId, updatedData) {
    const tasks = getTasks();

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        console.error("Task not found:", taskId);
        return false;
    }

    const oldTask = tasks[taskIndex];

    const updatedTask = {
        ...oldTask,
        ...updatedData
    };

    // Record when the task is completed
    if (
        updatedData.status === "completed" &&
        oldTask.status !== "completed"
    ) {
        updatedTask.completedAt = new Date().toISOString();
    }

    // Clear completion time if the task becomes active again
    if (updatedData.status === "active") {
        updatedTask.completedAt = null;
    }

    tasks[taskIndex] = updatedTask;

    saveTasks(tasks);

    return updatedTask;
}


// Delete a task
function deleteTask(taskId) {
    const tasks = getTasks();

    const updatedTasks = tasks.filter(task => task.id !== taskId);

    if (updatedTasks.length === tasks.length) {
        return false;
    }

    saveTasks(updatedTasks);

    return true;
}


// Handle task form submission
window.addEventListener("taskFormSubmitted", event => {
    try {
        createTask(event.detail);
    } catch (error) {
        console.error("Unable to create task:", error);
        alert("Unable to save the task. Please try again.");
    }
});