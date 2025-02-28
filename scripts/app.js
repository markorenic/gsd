// DOM Elements
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');
const pomodoroButton = document.getElementById('pomodoro');
const shortBreakButton = document.getElementById('short-break');
const longBreakButton = document.getElementById('long-break');
const completedSessionsElement = document.getElementById('completed-sessions');
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const sessionTaskList = document.getElementById('session-task-list');
const characterElement = document.getElementById('character');
const characterMessageElement = document.getElementById('character-message');
const progressFillElement = document.getElementById('progress-fill');
const completedTasksCountElement = document.getElementById('completed-tasks-count');
const remainingTasksCountElement = document.getElementById('remaining-tasks-count');
const totalTasksCountElement = document.getElementById('total-tasks-count');
const startSessionButton = document.getElementById('start-session');
const endSessionButton = document.getElementById('end-session');
const sessionSetupElement = document.getElementById('session-setup');
const timerContainerElement = document.getElementById('timer-container');
const sessionProgressElement = document.getElementById('session-progress');
const newsletterForm = document.getElementById('newsletter-form');
const emailInput = document.getElementById('email-input');
const subscriptionMessage = document.getElementById('subscription-message');
const toggleSceneButton = document.getElementById('toggle-scene');

// Timer variables
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let currentMode = 'pomodoro';
let completedSessions = 0;
let isSessionActive = false;

// Character messages
const messages = {
    planning: [
        "Let's plan our work session!",
        "What tasks do you want to complete today?",
        "Planning leads to success!",
        "Let's make a great task list!"
    ],
    start: [
        "Let's get started!",
        "Ready to be productive?",
        "Time to focus!",
        "Let's do this together!"
    ],
    working: [
        "You're doing great!",
        "Keep going!",
        "Stay focused!",
        "You've got this!",
        "I'm working with you!"
    ],
    shortBreak: [
        "Ahhh, taking a quick breather! 😌",
        "Stretching my wings! Time for you to stretch too!",
        "Break time! Rest your eyes and mind.",
        "I'm relaxing with you! Short breaks boost productivity.",
        "Enjoying this short break! We earned it!"
    ],
    longBreak: [
        "Time for a good long break! Relaxing... 😴",
        "You've earned this rest! I'm taking it easy too.",
        "Let's recharge together! Maybe grab a snack?",
        "Ahh, this is nice! Long breaks help us stay fresh.",
        "Relaxing after great work! Your brain needs this time."
    ],
    completed: [
        "Task completed! Awesome!",
        "Great job finishing that task!",
        "One more down, you're on fire!",
        "Progress feels good, doesn't it?"
    ],
    sessionComplete: [
        "Session complete! You're amazing!",
        "Look at all you've accomplished!",
        "Great work today!",
        "You should be proud of yourself!"
    ]
};

// Tasks array
let tasks = [];
let sessionTasks = [];

// Add a variable to track manual override
let manualSceneOverride = false;
let currentScene = 'auto'; // 'auto', 'day', or 'night'

// Initialize the app
function init() {
    console.log('Initializing app');
    updateTimerDisplay();
    updateCharacter('planning');
    setupEventListeners();
    updateTimeBasedBackground();
    
    // Check if it's nighttime and create stars if needed
    const now = new Date();
    const hours = now.getHours();
    const isDaytime = hours >= 6 && hours < 18;
    
    if (!isDaytime) {
        const characterScene = document.getElementById('character-scene');
        createStars(characterScene);
    }
    
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('pendingTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Make sure init is called when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Setup event listeners
function setupEventListeners() {
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    pomodoroButton.addEventListener('click', () => setTimerMode('pomodoro'));
    shortBreakButton.addEventListener('click', () => setTimerMode('shortBreak'));
    longBreakButton.addEventListener('click', () => setTimerMode('longBreak'));
    
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    startSessionButton.addEventListener('click', startSession);
    endSessionButton.addEventListener('click', endSession);
    
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    
    // Add event listener for scene toggle
    toggleSceneButton.addEventListener('click', toggleScene);
    
    console.log('Event listeners set up');
}

// Session functions
function startSession() {
    if (tasks.length === 0) {
        alert('Please add at least one task before starting your session.');
        return;
    }
    
    isSessionActive = true;
    
    // Copy tasks to session tasks
    sessionTasks = JSON.parse(JSON.stringify(tasks));
    
    // Update UI
    sessionSetupElement.style.display = 'none';
    timerContainerElement.style.display = 'block';
    sessionProgressElement.style.display = 'block';
    
    // Update stats
    updateSessionStats();
    
    // Render session tasks
    renderSessionTasks();
    
    // Update character
    updateCharacter('start');
    
    // Save original tasks as pending
    localStorage.setItem('pendingTasks', JSON.stringify(tasks));
    
    // Clear task input
    taskInput.value = '';
    
    // Automatically start the timer
    startTimer();
}

function endSession() {
    if (isRunning) {
        pauseTimer();
    }
    
    // Calculate completion percentage
    const completedCount = sessionTasks.filter(task => task.completed).length;
    const totalCount = sessionTasks.length;
    const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Show completion message
    let message;
    if (completionPercentage === 100) {
        message = "Amazing! You completed all your tasks!";
    } else if (completionPercentage >= 75) {
        message = "Great job! You completed most of your tasks!";
    } else if (completionPercentage >= 50) {
        message = "Good work! You completed many of your tasks!";
    } else if (completionPercentage > 0) {
        message = "You made progress! Every completed task counts!";
    } else {
        message = "Session ended. Ready to try again?";
    }
    
    alert(message);
    
    // Reset session
    isSessionActive = false;
    sessionTasks = [];
    tasks = [];
    
    // Update UI
    sessionSetupElement.style.display = 'block';
    timerContainerElement.style.display = 'none';
    sessionProgressElement.style.display = 'none';
    
    // Update character
    updateCharacter('planning');
    
    // Clear localStorage
    localStorage.removeItem('pendingTasks');
    
    // Reset timer
    resetTimer();
    
    // Clear task lists
    renderTasks();
    renderSessionTasks();
}

function updateSessionStats() {
    const completedCount = sessionTasks.filter(task => task.completed).length;
    const totalCount = sessionTasks.length;
    const remainingCount = totalCount - completedCount;
    
    completedTasksCountElement.textContent = completedCount;
    remainingTasksCountElement.textContent = remainingCount;
    totalTasksCountElement.textContent = totalCount;
    
    // Update progress bar
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    progressFillElement.style.width = `${progressPercentage}%`;
    
    // If all tasks are completed, celebrate!
    if (completedCount === totalCount && totalCount > 0) {
        celebrateCompletion();
    }
}

function celebrateCompletion() {
    // Only celebrate if we haven't already
    if (characterMessageElement.textContent.includes("all tasks")) return;
    
    // Add celebration animation
    characterElement.style.transform = 'scale(1.2)';
    characterMessageElement.textContent = "You've completed all tasks! Amazing!";
    characterMessageElement.style.backgroundColor = '#ffe66d';
    
    setTimeout(() => {
        characterElement.style.transform = 'scale(1)';
        characterMessageElement.style.backgroundColor = 'white';
        updateCharacter('sessionComplete');
    }, 3000);
}

// Timer functions
function startTimer() {
    console.log('Start timer clicked');
    if (isRunning) return;
    
    isRunning = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
    
    // Update character to working state
    updateCharacter('working');
    
    timer = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timer);
                timerComplete();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    console.log('Pause timer clicked');
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timer);
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // Update character to paused state
    updateCharacter('start');
}

function resetTimer() {
    console.log('Reset timer clicked');
    clearInterval(timer);
    isRunning = false;
    setTimerMode(currentMode, true);
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function timerComplete() {
    // Play notification sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
    audio.play();
    
    if (currentMode === 'pomodoro') {
        completedSessions++;
        completedSessionsElement.textContent = completedSessions;
        
        // After 4 pomodoros, take a long break
        if (completedSessions % 4 === 0) {
            setTimerMode('longBreak');
            updateCharacter('longBreak');
        } else {
            setTimerMode('shortBreak');
            updateCharacter('shortBreak');
        }
    } else {
        setTimerMode('pomodoro');
        updateCharacter('start');
    }
    
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function setTimerMode(mode, skipReset = false) {
    currentMode = mode;
    
    // Remove active class from all mode buttons
    pomodoroButton.classList.remove('active');
    shortBreakButton.classList.remove('active');
    longBreakButton.classList.remove('active');
    
    // Set timer based on mode
    if (mode === 'pomodoro') {
        minutes = 25;
        pomodoroButton.classList.add('active');
    } else if (mode === 'shortBreak') {
        minutes = 5;
        shortBreakButton.classList.add('active');
    } else if (mode === 'longBreak') {
        minutes = 15;
        longBreakButton.classList.add('active');
    }
    
    seconds = 0;
    
    if (!skipReset) {
        clearInterval(timer);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        
        // Update character based on mode
        updateCharacter(mode === 'pomodoro' ? 'start' : mode);
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Task functions
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') return;
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.push(task);
    renderTasks();
    
    taskInput.value = '';
    taskInput.focus();
}

function toggleTaskComplete(id, isSessionTask = false) {
    const taskArray = isSessionTask ? sessionTasks : tasks;
    const task = taskArray.find(task => task.id === id);
    
    if (task) {
        task.completed = !task.completed;
        
        if (isSessionTask) {
            updateSessionStats();
            updateCharacter('completed');
            
            // Reset to working state after 3 seconds if timer is running
            if (isRunning) {
                setTimeout(() => {
                    updateCharacter('working');
                }, 3000);
            }
            
            renderSessionTasks();
        } else {
            renderTasks();
        }
    }
}

function deleteTask(id, isSessionTask = false) {
    if (isSessionTask) {
        const taskIndex = sessionTasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            sessionTasks.splice(taskIndex, 1);
            updateSessionStats();
            renderSessionTasks();
        }
    } else {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            renderTasks();
        }
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty-task';
        emptyMessage.textContent = 'No tasks yet. Add one above!';
        taskList.appendChild(emptyMessage);
        return;
    }
    
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        taskActions.appendChild(deleteButton);
        
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);
        
        taskList.appendChild(taskItem);
    });
}

function renderSessionTasks() {
    sessionTaskList.innerHTML = '';
    
    if (sessionTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty-task';
        emptyMessage.textContent = 'No tasks in this session.';
        sessionTaskList.appendChild(emptyMessage);
        return;
    }
    
    sessionTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id, true));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        
        // Make the entire task item clickable
        taskItem.addEventListener('click', (e) => {
            // Prevent double-triggering when clicking directly on the checkbox
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleTaskComplete(task.id, true);
            }
        });
        
        sessionTaskList.appendChild(taskItem);
    });
}

// Character functions
function updateCharacter(state) {
    // Remove all states
    characterElement.classList.remove('working', 'resting');
    
    // Add appropriate state
    if (state === 'working' || state === 'pomodoro') {
        characterElement.classList.add('working');
    } else if (state === 'shortBreak' || state === 'longBreak') {
        characterElement.classList.add('resting');
    }
    
    // Update message
    const messageArray = messages[state] || messages.planning;
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
    characterMessageElement.textContent = randomMessage;
}

// Newsletter functions
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (email === '') return;
    
    // Show loading state
    const submitButton = newsletterForm.querySelector('button');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitButton.disabled = true;
    
    // Use Formspree for the actual submission
    const formData = new FormData();
    formData.append('email', email);
    
    fetch('https://formspree.io/f/mzzdnevz', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        // Success
        subscriptionMessage.textContent = `Thanks for subscribing! We've sent a confirmation to ${email}`;
        subscriptionMessage.style.color = 'green';
        emailInput.value = '';
    })
    .catch(error => {
        // Error
        subscriptionMessage.textContent = 'Oops! There was a problem submitting your subscription.';
        subscriptionMessage.style.color = 'var(--danger-color)';
        console.error('Error:', error);
    })
    .finally(() => {
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Clear success/error message after 5 seconds
        setTimeout(() => {
            subscriptionMessage.textContent = '';
        }, 5000);
    });
}

// Add the toggle scene function
function toggleScene() {
    const characterScene = document.getElementById('character-scene');
    const toggleIcon = toggleSceneButton.querySelector('i');
    
    // If we're in auto mode, switch to manual mode
    if (currentScene === 'auto') {
        // If it's currently day, switch to night
        if (characterScene.classList.contains('day-scene')) {
            characterScene.classList.remove('day-scene');
            characterScene.classList.add('night-scene');
            toggleIcon.className = 'fas fa-sun';
            currentScene = 'night';
            createStars(characterScene);
            // Add dark mode to body
            document.body.classList.add('dark-mode');
        } else {
            characterScene.classList.remove('night-scene');
            characterScene.classList.add('day-scene');
            toggleIcon.className = 'fas fa-moon';
            currentScene = 'day';
            removeStars(characterScene);
            // Remove dark mode from body
            document.body.classList.remove('dark-mode');
        }
    } 
    // If we're already in manual mode, just toggle between day and night
    else if (currentScene === 'day') {
        characterScene.classList.remove('day-scene');
        characterScene.classList.add('night-scene');
        toggleIcon.className = 'fas fa-sun';
        currentScene = 'night';
        createStars(characterScene);
        // Add dark mode to body
        document.body.classList.add('dark-mode');
    } else {
        characterScene.classList.remove('night-scene');
        characterScene.classList.add('day-scene');
        toggleIcon.className = 'fas fa-moon';
        currentScene = 'day';
        removeStars(characterScene);
        // Remove dark mode from body
        document.body.classList.remove('dark-mode');
    }
    
    // Set manual override
    manualSceneOverride = true;
}

// Function to create stars
function createStars(sceneElement) {
    // Remove existing stars container if it exists
    removeStars(sceneElement);
    
    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'additional-stars';
    
    // Create random stars
    const starSizes = ['tiny', 'small', 'medium', 'large'];
    const numStars = 75; // Increased number of stars
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        
        // Weighted random size (more small stars, fewer large ones)
        const sizeIndex = Math.floor(Math.random() * 10);
        let size;
        if (sizeIndex < 4) size = 'tiny';
        else if (sizeIndex < 7) size = 'small';
        else if (sizeIndex < 9) size = 'medium';
        else size = 'large';
        
        star.className = `star ${size}`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay for twinkling effect
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random animation duration for more natural effect
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        
        // Add to container
        starsContainer.appendChild(star);
    }
    
    // Add to scene
    sceneElement.appendChild(starsContainer);
}

// Function to remove stars
function removeStars(sceneElement) {
    const existingStars = sceneElement.querySelector('.additional-stars');
    if (existingStars) {
        existingStars.remove();
    }
}

// Update the updateTimeBasedBackground function
function updateTimeBasedBackground() {
    // Skip if manual override is active
    if (manualSceneOverride) return;
    
    const now = new Date();
    const hours = now.getHours();
    const characterScene = document.getElementById('character-scene');
    
    // Check if it's daytime (between 6 AM and 6 PM)
    const isDaytime = hours >= 6 && hours < 18;
    
    if (isDaytime) {
        // Day scene
        characterScene.classList.remove('night-scene');
        characterScene.classList.add('day-scene');
        // Update toggle button icon
        if (toggleSceneButton) {
            toggleSceneButton.querySelector('i').className = 'fas fa-moon';
        }
        // Remove stars
        removeStars(characterScene);
    } else {
        // Night scene
        characterScene.classList.remove('day-scene');
        characterScene.classList.add('night-scene');
        // Update toggle button icon
        if (toggleSceneButton) {
            toggleSceneButton.querySelector('i').className = 'fas fa-sun';
        }
        // Create stars
        createStars(characterScene);
    }
    
    currentScene = 'auto';
}

// Initialize the app
init(); 