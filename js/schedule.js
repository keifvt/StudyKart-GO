import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    const HOUR_HEIGHT_PX = 60;
    
    const timeLabelsCol = document.getElementById("time-labels-col");
    const legendContainer = document.getElementById("schedule-legend");
    const scheduleGrid = document.querySelector(".schedule-grid"); // Get the grid container
    let coursesData = [];

    let earliestHour = 7; 
    let latestHour = 19;  


    
    function renderSchedule() {
        clearSchedule();
        generateTimeLabels();
        
        if (coursesData.length === 0) {
            console.log("No course data found.");
            return;
        }

        coursesData.forEach(course => {
            course.schedules.forEach(schedule => {
                renderCourseBlock(course, schedule);
            });
            renderLegendItem(course);
        });
    }

    
 
    function generateTimeLabels() {

        const totalHours = latestHour - earliestHour;
        const totalHeight = totalHours * HOUR_HEIGHT_PX;
        document.querySelectorAll('.day-column').forEach(col => {
             col.style.minHeight = `${totalHeight}px`;
        });
        timeLabelsCol.style.minHeight = `${totalHeight}px`;
        for (let hour = earliestHour; hour < latestHour; hour++) {
            const label = document.createElement("div");
            label.className = "time-label";
            const displayHour = hour === 0 ? 12 : (hour === 12 ? 12 : hour % 12);
            const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
            label.textContent = `${displayHour}${ampm}`;
            label.style.top = `${(hour - earliestHour) * HOUR_HEIGHT_PX}px`;
            timeLabelsCol.appendChild(label);
        }
    }


    function renderCourseBlock(course, schedule) {

        const dayColumn = document.querySelector(`.day-column[data-day="${schedule.day}"]`);
        if (!dayColumn) return;
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        const totalStartMinutesFromOrigin = (startHour - earliestHour) * 60 + startMin;
        const top = Math.max(0, totalStartMinutesFromOrigin);
        const totalStartMinutes = (startHour * 60) + startMin;
        const totalEndMinutes = (endHour * 60) + endMin;
        const height = totalEndMinutes - totalStartMinutes;
        const block = document.createElement("div");
        block.className = "course-block";
        
        // --- ADD THESE ---
        block.dataset.courseId = course.id; // Add course ID
        block.style.cursor = "pointer"; // Show it's clickable
        // --- END OF ADD ---
        
        block.style.top = `${top}px`;
        block.style.height = `${height}px`;
        block.style.backgroundColor = `${course.color}CC`;
        block.innerHTML = `
            <strong>${course.name}</strong>
            <span>${course.professor || ''}</span>
            <span style="font-size: 0.75em; opacity: 0.8;">${schedule.room || ''}</span> 
        `;
         const existingBlocks = dayColumn.querySelectorAll('.course-block');
         let overlaps = false;
         existingBlocks.forEach(existingBlock => {
             const existingTop = parseInt(existingBlock.style.top);
             const existingHeight = parseInt(existingBlock.style.height);
             if (top < (existingTop + existingHeight) && (top + height) > existingTop) {
                 overlaps = true;
                 existingBlock.classList.add('overlap');
             }
         });
         if (overlaps) block.classList.add('overlap');
        dayColumn.appendChild(block);
    }
    

    function renderLegendItem(course) {
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
            <div class="legend-color-box" style="background-color: ${course.color}"></div>
            <span>${course.name}</span>
        `;
        legendContainer.appendChild(item);
    }

    function clearSchedule() {
        timeLabelsCol.innerHTML = "";
        document.querySelectorAll('.day-column').forEach(col => {
            col.innerHTML = "";
        });
        legendContainer.innerHTML = "";
    }
    
    function loadData() {
        const data = dataService.getAllCourses();
        
        if (data && data.length > 0) {
            coursesData = data;

            let minHour = 24;
            let maxHour = 0;

            coursesData.forEach(course => {
                course.schedules.forEach(schedule => {
                    const startH = parseInt(schedule.startTime.split(':')[0]);
                    const endH = parseInt(schedule.endTime.split(':')[0]);
                    const endM = parseInt(schedule.endTime.split(':')[1]);
                    if (startH < minHour) minHour = startH;
                    const effectiveEndHour = (endM > 0) ? endH + 1 : endH;
                    if (effectiveEndHour > maxHour) maxHour = effectiveEndHour;
                });
            });

            if (minHour < 24) { 
                earliestHour = Math.max(0, minHour - 1);
                latestHour = Math.min(24, maxHour + 1);
            } else {
                earliestHour = 7;
                latestHour = 19;
            }
        } else {
            coursesData = [];
            earliestHour = 7;
            latestHour = 19;
        }
    }

    function init() {
        loadData();
        renderSchedule();
        
        if (scheduleGrid) {
            scheduleGrid.addEventListener("click", (e) => {
                const courseBlock = e.target.closest(".course-block");
                if (courseBlock && courseBlock.dataset.courseId) {
                    window.location.href = `course-detail.html?id=${courseBlock.dataset.courseId}`;
                }
            });
        }
    }
    
    init();
});