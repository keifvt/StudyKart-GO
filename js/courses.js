
import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    let coursesData = dataService.getAllCourses();
    
    let isEditing = false;
    let currentEditId = null;

    const courseGrid = document.getElementById("course-grid");
    const addNewCourseBtn = document.getElementById("add-new-course-btn");

    const modal = document.getElementById("course-modal");
    const modalTitle = document.getElementById("modal-title");
    const closeModalBtn = modal.querySelector(".btn-close-modal");
    const cancelBtn = document.getElementById("cancel-course-btn");
    const courseForm = document.getElementById("course-form");
    const formSubmitBtn = document.getElementById("form-submit-btn");
    const hiddenCourseId = document.getElementById("course-id");
    
    const scheduleContainer = document.getElementById("schedule-builder-container");
    const componentContainer = document.getElementById("grading-weights-container");
    const addScheduleBtn = document.getElementById("add-schedule-btn");
    const addComponentBtn = document.getElementById("add-component-btn");
    const weightTotalDisplay = document.getElementById("weight-total-display");
    const weightTotalSpan = weightTotalDisplay.querySelector("span");

    const courseNameInput = document.getElementById("course-name");
    const courseInstructorInput = document.getElementById("course-instructor");
    const courseColorInput = document.getElementById("course-color");


    function openModal(isEditMode = false, course = null) {
        resetForm();
        isEditing = isEditMode;

        if (isEditing && course) {
            modalTitle.textContent = "Edit Course";
            formSubmitBtn.textContent = "Save Changes";
            currentEditId = course.id;
            hiddenCourseId.value = course.id;
            courseNameInput.value = course.name;
            courseInstructorInput.value = course.professor;
            courseColorInput.value = course.color;
            course.schedules.forEach(addScheduleEntry);
            course.gradingWeights.forEach(addComponentEntry);
        } else {
            modalTitle.textContent = "New Course";
            formSubmitBtn.textContent = "Create";
            currentEditId = null;
            hiddenCourseId.value = "";
            addScheduleEntry();
            addComponentEntry();
        }
        updateTotalWeight();
        modal.classList.add("active");
    }

    function closeModal() {
        modal.classList.remove("active");
        resetForm();
    }
    
    function resetForm() {
        courseForm.reset();
        scheduleContainer.innerHTML = "";
        componentContainer.innerHTML = "";
        courseColorInput.value = "#a5f3fc";
        weightTotalDisplay.classList.remove("invalid");
        weightTotalSpan.textContent = "0";
        isEditing = false;
        currentEditId = null;
        hiddenCourseId.value = "";
    }

    
    function addScheduleEntry(schedule = null) {
        const entry = document.createElement("div");
        entry.className = "schedule-entry";
        const day = schedule ? schedule.day : 'MON';
        const startTime = schedule ? schedule.startTime : '09:00';
        const endTime = schedule ? schedule.endTime : '10:30';
        const room = schedule ? schedule.room : '';
        const dayBtnGroup = document.createElement("div");
        dayBtnGroup.className = "day-btn-group";
         ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach(d => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "day-btn";
            if (d === day) button.classList.add("active");
            button.dataset.day = d;
            button.textContent = d;
            dayBtnGroup.appendChild(button);
        });
        const controlsWrapper = document.createElement("div");
        controlsWrapper.className = "schedule-controls-wrapper";
        const timeInputs = document.createElement("div");
        timeInputs.className = "schedule-time-inputs";
        const startTimeInput = document.createElement("input");
        startTimeInput.type = "time";
        startTimeInput.className = "schedule-start-time";
        startTimeInput.value = startTime;
        startTimeInput.required = true;
        const arrowSpan = document.createElement("span");
        arrowSpan.textContent = "→";
        const endTimeInput = document.createElement("input");
        endTimeInput.type = "time";
        endTimeInput.className = "schedule-end-time";
        endTimeInput.value = endTime;
        endTimeInput.required = true;
        timeInputs.appendChild(startTimeInput);
        timeInputs.appendChild(arrowSpan);
        timeInputs.appendChild(endTimeInput);
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn-delete-entry";
        deleteButton.setAttribute("aria-label", "Delete schedule");
        deleteButton.innerHTML = "&times;";
        controlsWrapper.appendChild(timeInputs);
        controlsWrapper.appendChild(deleteButton);
        const roomInputDiv = document.createElement("div");
        roomInputDiv.className = "schedule-room-input";
        const roomInput = document.createElement("input");
        roomInput.type = "text";
        roomInput.className = "schedule-room";
        roomInput.placeholder = "Room (Optional)";
        roomInput.value = room;
        roomInputDiv.appendChild(roomInput);
        entry.appendChild(dayBtnGroup);
        entry.appendChild(controlsWrapper);
        entry.appendChild(roomInputDiv);
        scheduleContainer.appendChild(entry);
    }

    function addComponentEntry(component = null) {
        const entry = document.createElement("div");
        entry.className = "component-entry";
        const name = component ? component.name : '';
        const weight = component ? component.weight : '';
        entry.innerHTML = `
            <input type="text" class="component-name-input" placeholder="Component Name (e.g., Quizzes)" value="${name}" required>
            <input type="number" class="component-weight-input" placeholder="Weight %" value="${weight}" min="0" max="100" required>
            <button type="button" class="btn-delete-entry" aria-label="Delete component">&times;</button>
        `;
        componentContainer.appendChild(entry);
    }
    scheduleContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-btn')) {
            e.target.parentElement.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
        if (e.target.classList.contains('btn-delete-entry')) {
            e.target.closest('.schedule-entry').remove();
        }
    });
    componentContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-entry')) {
            e.target.closest('.component-entry').remove();
            updateTotalWeight();
        }
    });
    componentContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('component-weight-input')) {
            updateTotalWeight();
        }
    });
    addScheduleBtn.addEventListener("click", () => addScheduleEntry());
    addComponentBtn.addEventListener("click", () => addComponentEntry());


    function updateTotalWeight() {
        let total = 0;
        const weightInputs = componentContainer.querySelectorAll('.component-weight-input');
        weightInputs.forEach(input => {
            total += parseInt(input.value) || 0;
        });
        weightTotalSpan.textContent = total;
        if (total === 100) {
            weightTotalDisplay.classList.remove("invalid");
        } else {
            weightTotalDisplay.classList.add("invalid");
        }
        return total;
    }

    courseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const courseName = courseNameInput.value.trim();
        const selectedColor = courseColorInput.value;

        const schedules = [];
        scheduleContainer.querySelectorAll('.schedule-entry').forEach(entry => {
            schedules.push({
                day: entry.querySelector('.day-btn.active').dataset.day,
                startTime: entry.querySelector('.schedule-start-time').value,
                endTime: entry.querySelector('.schedule-end-time').value,
                room: entry.querySelector('.schedule-room').value.trim()
            });
        });

        const gradingWeights = [];
        componentContainer.querySelectorAll('.component-entry').forEach(entry => {
            gradingWeights.push({
                name: entry.querySelector('.component-name-input').value.trim(),
                weight: parseInt(entry.querySelector('.component-weight-input').value) || 0,
                entries: [] 
            });
        });

        if (!courseName) {
            alert("Please enter a course name.");
            return;
        }
        if (updateTotalWeight() !== 100) {
            alert("Total grading weight must be exactly 100%.");
            return;
        }


        const courseData = {
            id: isEditing ? currentEditId : Date.now(),
            name: courseName,
            professor: courseInstructorInput.value.trim(),
            color: selectedColor,
            schedules: schedules,
            gradingWeights: gradingWeights
        };

        dataService.saveCourse(courseData);

        loadAndRender(); 
        closeModal();
    });
    
    function renderCourses() 
    {
        courseGrid.innerHTML = ""; 
        if (coursesData.length === 0) {
            courseGrid.innerHTML = "<p class=\"empty-state-message\">No courses added yet. Click '+ Add New Course' to start!</p>";
            return;
        }
        
        coursesData.forEach(course => {
            const card = document.createElement("article");
            card.className = "course-card";
            card.style.setProperty('--course-color', course.color);
            card.dataset.id = course.id;
            card.innerHTML = `
                <div class="course-card-actions">
                    <button class="btn-actions" aria-label="Course options">...</button>
                    <div class="actions-menu">
                        <button class="btn-edit-course" data-id="${course.id}">Edit</button>
                        <button class="btn-delete-course" data-id="${course.id}">Delete</button>
                    </div>
                </div>
                <div class="course-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48px" height="48px" style="color: ${course.color}; opacity: 0.8;">
                        <path d="M10 4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                    </svg>
                </div>
                <h3>${course.name}</h3>
                <p>${course.professor || 'No Instructor'}</p>
            `;

            card.addEventListener("click", (e) => 
            {
                if (!e.target.closest(".course-card-actions")) {
                    window.location.href = `course-detail.html?id=${course.id}`;
                }
            });

            courseGrid.appendChild(card);
        });
    }

    courseGrid.addEventListener("click", (e) => {
        const target = e.target;
        
        if (target.classList.contains("btn-edit-course")) {
            e.stopPropagation();
            const courseId = parseInt(target.dataset.id);
            const courseToEdit = coursesData.find(c => c.id === courseId);
            if (courseToEdit) {
                openModal(true, courseToEdit);
            }
        }
        
        if (target.classList.contains("btn-delete-course")) {
            const courseId = parseInt(target.dataset.id);
            if (confirm(`Are you sure you want to delete this course? This action cannot be undone.`)) {
                
                dataService.deleteCourse(courseId);
                
                loadAndRender();
            }
        }
    });

    function loadAndRender() {
        coursesData = dataService.getAllCourses();
        renderCourses();
    }
    

    function init() {
        addNewCourseBtn.addEventListener("click", () => openModal(false));
        closeModalBtn.addEventListener("click", closeModal);
        cancelBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        renderCourses();
    }

    init(); 
});