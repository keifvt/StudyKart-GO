import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    const timerDisplay = document.querySelector(".timer-display");
    const startBtn = document.getElementById("btn-start");
    const pauseBtn = document.getElementById("btn-pause");
    const resetBtn = document.getElementById("btn-reset");
    const flowInput = document.getElementById("flow-time");
    const shortRestInput = document.getElementById("short-rest-time");
    const longRestInput = document.getElementById("long-rest-time");
    const logList = document.querySelector(".log-list");
    const totalTimeDisplay = document.querySelector(".log-total .total-time");
    const pageTitle = document.title; 
    
    let alarmSound = null; 

    let timerInterval = null;
    let timerState = "idle";
    let currentMode = "flow"; 
    let flowDuration = parseInt(flowInput.value, 10) * 60;
    let shortRestDuration = parseInt(shortRestInput.value, 10) * 60;
    let longRestDuration = parseInt(longRestInput.value, 10) * 60;
    let secondsRemaining = flowDuration;
    let flowSessionsCompleted = 0;
    
    let totalFocusSecondsToday = 0; 
    

    function startTimer() {
       
        // --- THIS IS THE FIX ---
        // Added 'timerState === "finished"' to the condition
        if (timerState === "idle" || timerState === "paused" || timerState === "finished") {
        // --- END OF FIX ---
            
            timerState = "running";
            updateButtonStates(); 
            setInputDisabled(true); 


            clearInterval(timerInterval);

            timerInterval = setInterval(() => {
                if (secondsRemaining > 0) {
                    secondsRemaining--;
                    updateTimerDisplay();
                } else {
                    handleTimerEnd();
                }
            }, 1000); 
        }
    }

    function pauseTimer() {
        if (timerState === "running") {
            timerState = "paused";
            clearInterval(timerInterval);
            updateButtonStates();
            setInputDisabled(false); 
            document.title = pageTitle; 
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerState = "idle";
        currentMode = "flow"; 
        flowSessionsCompleted = 0; 
        
        updateDurationsFromInput(); 
        secondsRemaining = flowDuration; 
        
        updateTimerDisplay();
        updateButtonStates();
        setInputDisabled(false);
        document.title = pageTitle;
        
        logList.innerHTML = ''; 
        
        totalFocusSecondsToday = dataService.getTodayFocusSeconds(); // Load today's total from storage
        updateTotalTime();
    }

    function handleTimerEnd() {
        clearInterval(timerInterval);
        timerState = "finished"; 
        alarmSound?.play(); 

        let sessionDurationSeconds = 0;
        let sessionName = "";

        if (currentMode === "flow") {
            sessionDurationSeconds = flowDuration;
            sessionName = "Flow Session";
            flowSessionsCompleted++;

            dataService.logStudySession('focus', flowDuration);
            addLogEntry(sessionName, sessionDurationSeconds / 60); 

            if (flowSessionsCompleted > 0 && flowSessionsCompleted % 4 === 0) {
                currentMode = "long";
                secondsRemaining = longRestDuration;
            } else {
                currentMode = "short";
                secondsRemaining = shortRestDuration;
            }
        } else {
             sessionDurationSeconds = (currentMode === 'short' ? shortRestDuration : longRestDuration);
             sessionName = `${currentMode === 'short' ? 'Short' : 'Long'} Rest`;
             addLogEntry(sessionName, sessionDurationSeconds / 60); 

            currentMode = "flow";
            secondsRemaining = flowDuration;
        }

        updateTimerDisplay();
        updateButtonStates();
        setInputDisabled(false); 
        document.title = ` ${sessionName} Complete!`;
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        const displayString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerDisplay.textContent = displayString;

        if (timerState === 'running') {
            document.title = `${displayString} - ${currentMode === 'flow' ? 'Focus' : 'Rest'} | ${pageTitle}`;
        }
    }

    function updateButtonStates() {
        switch (timerState) {
            case 'idle':
            case 'finished':
                if (currentMode === 'flow') {
                    startBtn.textContent = "Begin Focus";
                } else if (currentMode === 'short') {
                    startBtn.textContent = "Start Short Rest";
                } else { 
                    startBtn.textContent = "Start Long Rest";
                }
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                pauseBtn.textContent = "Pause"; 
                break;
            case 'running':
                startBtn.textContent = currentMode === 'flow' ? "Focusing..." : "Resting...";
                
                startBtn.disabled = true;
                
                pauseBtn.disabled = false;
                pauseBtn.textContent = "Pause";
                break;
            case 'paused':
                startBtn.textContent = "Resume";
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                pauseBtn.textContent = "Paused";
                break;
        }
         resetBtn.disabled = (timerState === 'idle' && currentMode === 'flow' && secondsRemaining === flowDuration);
    }


    function updateDurationsFromInput() {
        const newFlow = parseInt(flowInput.value, 10) * 60;
        const newShort = parseInt(shortRestInput.value, 10) * 60;
        const newLong = parseInt(longRestInput.value, 10) * 60;

        flowDuration = newFlow > 0 ? newFlow : 25 * 60;
        shortRestDuration = newShort > 0 ? newShort : 5 * 60;
        longRestDuration = newLong > 0 ? newLong : 15 * 60; 

        if (timerState === 'idle' || timerState === 'finished') {
             if (currentMode === 'flow') {
                 secondsRemaining = flowDuration;
             } else if (currentMode === 'short') {
                 secondsRemaining = shortRestDuration;
             } else { // long
                 secondsRemaining = longRestDuration;
             }
             updateTimerDisplay();
             updateButtonStates();
        }
    }

    function setInputDisabled(disabled) {
        flowInput.disabled = disabled;
        shortRestInput.disabled = disabled;
        longRestInput.disabled = disabled;
    }


    function addLogEntry(sessionName, minutes) {
        const li = document.createElement("li");
        li.className = "log-item";
        li.innerHTML = `<span>${sessionName}</span><span>${Math.round(minutes)} min</span>`;
        logList.prepend(li); 

        if (sessionName === "Flow Session") {
             // Re-fetch the new total from dataService
             totalFocusSecondsToday = dataService.getTodayFocusSeconds();
             updateTotalTime();
        }
    }

    function updateTotalTime() {
        const totalMinutes = Math.floor(totalFocusSecondsToday / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        totalTimeDisplay.textContent = `${hours}h ${minutes}m`;
    }

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    flowInput.addEventListener("input", updateDurationsFromInput);
    shortRestInput.addEventListener("input", updateDurationsFromInput);
    longRestInput.addEventListener("input", updateDurationsFromInput);

    updateDurationsFromInput(); 
    resetTimer(); 
});