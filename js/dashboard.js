import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    const app = document.querySelector(".app-container"); 
    const headerProfileButton = document.querySelector(".profile-button"); 
    const clickableProfileCard = document.getElementById("clickable-profile-card");

    // === Welcome Modal Elements ===
    const welcomeModal = document.getElementById("profile-setup-modal");
    const welcomeForm = document.getElementById("profile-form");
    const welcome_nameInput = document.getElementById("name");
    const welcome_schoolInput = document.getElementById("school");
    const welcome_birthdayInput = document.getElementById("birthday");
    const welcome_yearInput = document.getElementById("year");
    const welcome_quoteInput = document.getElementById("quote");
    const welcome_decorationInput = document.getElementById("decoration");
    const welcome_avatarInput = document.getElementById("avatar");
    const welcome_cardColorInput = document.getElementById("id-card-color");
    // --- MODIFICATION: File upload elements for Welcome modal ---
    const welcome_fileInput = document.getElementById("profile-picture-upload");
    const welcome_fileDropZone = document.getElementById("profile-drop-zone");
    const welcome_fileNameDisplay = document.getElementById("profile-file-name-display");
    const welcome_fileRemoveBtn = document.getElementById("remove-profile-picture-btn");
    let welcome_fileDataUrl = null;

    // === Edit Modal Elements ===
    const editModal = document.getElementById("edit-profile-modal");
    const editForm = document.getElementById("edit-profile-form");
    const edit_nameInput = document.getElementById("edit-name");
    const edit_schoolInput = document.getElementById("edit-school");
    const edit_birthdayInput = document.getElementById("edit-birthday");
    const edit_yearInput = document.getElementById("edit-year");
    const edit_quoteInput = document.getElementById("edit-quote");
    const edit_decorationInput = document.getElementById("edit-decoration");
    const edit_avatarInput = document.getElementById("edit-avatar");
    const edit_cardColorInput = document.getElementById("edit-id-card-color");
    // --- MODIFICATION: File upload elements for Edit modal ---
    const edit_fileInput = document.getElementById("edit-profile-picture-upload");
    const edit_fileDropZone = document.getElementById("edit-profile-drop-zone");
    const edit_fileNameDisplay = document.getElementById("edit-profile-file-name-display");
    const edit_fileRemoveBtn = document.getElementById("edit-remove-profile-picture-btn");
    let edit_fileDataUrl = null; // Store Data URL for saving
    let edit_removePicture = false; // Flag to remove picture
  
    // === Dashboard UI Elements ===
    const greetingName = document.getElementById("greeting-name");
    const greetingQuote = document.getElementById("greeting-quote");
    const cardName = document.getElementById("card-name");
    const cardSchool = document.getElementById("card-school");
    const cardBirthday = document.getElementById("card-birthday");
    const cardYear = document.getElementById("card-year");
    const cardDecoration = document.getElementById("card-decoration");

    // ... (rest of the widget selectors are correct) ...
    const todoWidgetCard = document.querySelector(".todo-widget"); 
    const todoList = document.querySelector(".todo-widget .todo-list");
    const todoWidgetAddTaskBtn = document.getElementById("todo-widget-add-btn"); 
    const todoWidgetSeeAllLink = document.querySelector(".todo-widget .btn-link");

    const snapshotTasksDone = document.querySelector(".snapshot-stats .stat-item:nth-child(1) strong");
    const snapshotFocusTime = document.querySelector(".snapshot-stats .stat-item:nth-child(2) strong");
    const snapshotGWA = document.querySelector(".snapshot-stats .stat-item:nth-child(3) strong");
    const nextClassName = document.querySelector(".next-class-widget .class-name");
    const nextClassTime = document.querySelector(".next-class-widget .class-time");
    const nextClassLocation = document.querySelector(".next-class-widget .class-location");
    const habitGrid = document.getElementById("habit-grid");
    
    const focusWidgetCard = document.querySelector(".focus-widget-mini");
    const focusWidgetTimerDisplay = document.querySelector(".focus-widget-mini .time-text");

    function setupFileInput(fileInput, dropZone, nameDisplay, removeBtn, dataUrlContainer, uploadIcon, uploadText, previewImg) {
        
        function handleFile(file) {
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    dataUrlContainer.url = e.target.result;
                    
                    if (previewImg) {
                        previewImg.src = e.target.result;
                        previewImg.style.display = "block"; // Show preview
                    }
                    nameDisplay.style.display = "none"; // Hide "No file chosen" text

                    removeBtn.style.display = "block";

                    if (fileInput.id === 'edit-profile-picture-upload') {
                        edit_removePicture = false;
                    }

                    if (uploadIcon) uploadIcon.style.display = "none";
                    if (uploadText) uploadText.style.display = "none";
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a valid image file.");
            }
        }

        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });

        ['dragover', 'dragenter'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault(); e.stopPropagation(); dropZone.classList.add("drag-over");
            });
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault(); e.stopPropagation(); dropZone.classList.remove("drag-over");
            });
        });

        dropZone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });

        removeBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            fileInput.value = null; 
            dataUrlContainer.url = null; 
            nameDisplay.textContent = "No file chosen";
            nameDisplay.style.display = "block"; // Show "No file chosen" text
            removeBtn.style.display = "none";
            
            if (previewImg) {
                previewImg.src = "";
                previewImg.style.display = "none"; // Hide preview
            }
            
            if (removeBtn.id === 'edit-remove-profile-picture-btn') {
                edit_removePicture = true;
            }

            if (uploadIcon) uploadIcon.style.display = "block";
            if (uploadText) uploadText.style.display = "block";
        });
    }


    function updateProfileIcon(element, profile) {
        if (!element) return;

        element.textContent = "";
        element.style.backgroundImage = "";
        element.style.backgroundColor = "";
        element.style.borderRadius = "";

        if (profile.profilePictureUrl) {
            element.style.backgroundImage = `url(${profile.profilePictureUrl})`;
            element.style.borderRadius = "12px"; 
            element.style.backgroundColor = "#eee"; 
        } else {
            element.style.backgroundColor = profile.cardColor || "#888";
            element.style.borderRadius = "12px"; 
            element.textContent = profile.avatar || (profile.name || "S").charAt(0).toUpperCase();
        }
    }

    function formatSecondsToHoursMinutes(seconds) {
        if (isNaN(seconds) || seconds === 0) {
            return "0h 0m";
        }
        const totalMinutes = Math.floor(seconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    function updateDashboardUI(profile) {
        if (!profile) return; 

        greetingName.textContent = profile.name || greetingName.textContent;
        cardName.textContent = profile.name || cardName.textContent;
        cardSchool.textContent = profile.school || cardSchool.textContent;
        cardBirthday.textContent = profile.birthday || cardBirthday.textContent;
        cardYear.textContent = profile.year || cardYear.textContent;
        
        if (profile.quote && profile.quote.trim() !== "") {
            greetingQuote.textContent = `"${profile.quote}"`;
        }
        if (profile.decoration && profile.decoration.trim() !== "") {
            cardDecoration.textContent = profile.decoration;
        }
        
 
        const cardProfileIcon = clickableProfileCard.querySelector(".profile-icon");
        updateProfileIcon(headerProfileButton, profile);
        updateProfileIcon(cardProfileIcon, profile);

        if (profile.cardColor && clickableProfileCard) {
            clickableProfileCard.style.borderColor = profile.cardColor;
            clickableProfileCard.style.borderWidth = '1px';
            clickableProfileCard.style.borderStyle = 'solid';
        }
    }

    function openProfileModal() {

        const edit_uploadIcon = document.getElementById("edit-profile-upload-icon");
        const edit_uploadText = document.getElementById("edit-profile-upload-text");
        const edit_previewImg = document.getElementById("edit-profile-preview-img"); // Get preview img

        const profile = dataService.getProfile();
        if (profile) {
            edit_nameInput.value = profile.name;
            edit_schoolInput.value = profile.school;
            edit_birthdayInput.value = profile.birthday;
            edit_yearInput.value = profile.year;
            edit_quoteInput.value = profile.quote;
            edit_decorationInput.value = profile.decoration;
            edit_avatarInput.value = profile.avatar;
            edit_cardColorInput.value = profile.cardColor || "#ffffff";
           

            edit_fileDataUrl = null;
            edit_removePicture = false;
            edit_fileInput.value = null;
            if (profile.profilePictureUrl) {
                edit_fileNameDisplay.style.display = "none"; 
                edit_fileRemoveBtn.style.display = "block";

                if (edit_previewImg) { 
                    edit_previewImg.src = profile.profilePictureUrl;
                    edit_previewImg.style.display = "block";
                }
                if (edit_uploadIcon) edit_uploadIcon.style.display = "none";
                if (edit_uploadText) edit_uploadText.style.display = "none";
            } 
            
            else {
                edit_fileNameDisplay.textContent = "No file chosen";
                edit_fileNameDisplay.style.display = "block"; 
                edit_fileRemoveBtn.style.display = "none";

                if (edit_previewImg) { 
                    edit_previewImg.src = "";
                    edit_previewImg.style.display = "none";
                }
                if (edit_uploadIcon) edit_uploadIcon.style.display = "block";
                if (edit_uploadText) edit_uploadText.style.display = "block";
            }
        }
        editModal.classList.add("active");
    }


    function handleWelcomeFormSubmit(e) {
        e.preventDefault(); 
        const profileData = {
            name: welcome_nameInput.value,
            school: welcome_schoolInput.value,
            birthday: welcome_birthdayInput.value,
            year: welcome_yearInput.value,
            quote: welcome_quoteInput.value,
            decoration: welcome_decorationInput.value,
            avatar: welcome_avatarInput.value,
            cardColor: welcome_cardColorInput.value,
            profilePictureUrl: welcome_fileDataUrl 
        };
        dataService.saveProfile(profileData);
        dataService.getGamificationData(); 
        welcomeModal.style.display = "none"; 
        
        updateDashboardUI(profileData);
        updateAllWidgets();
    }

    function handleEditFormSubmit(e) {
        e.preventDefault();
        
        const profileData = dataService.getProfile() || {};

        profileData.name = edit_nameInput.value;
        profileData.school = edit_schoolInput.value;
        profileData.birthday = edit_birthdayInput.value;
        profileData.year = edit_yearInput.value;
        profileData.quote = edit_quoteInput.value;
        profileData.decoration = edit_decorationInput.value;
        profileData.avatar = edit_avatarInput.value;
        profileData.cardColor = edit_cardColorInput.value;

        // Handle profile picture deletion or update
        if (edit_removePicture) {
            // User explicitly removed the picture
            profileData.profilePictureUrl = null;
        } else if (edit_fileDataUrl) { 
            // User uploaded a new picture
            profileData.profilePictureUrl = edit_fileDataUrl;
        }
       
        dataService.saveProfile(profileData);
        editModal.classList.remove("active");
        updateDashboardUI(profileData);
    }

    function updateAllWidgets() {
        loadToDoWidget();
        loadSnapshotWidget();
        loadNextClassWidget();
        renderHabitHeatmap();
        setupWidgetLinks();
    }
    
   

    function loadToDoWidget() {
        if (!todoList) return;

        const allTasks = dataService.getAllTasks();
        const upcomingTasks = allTasks
            .filter(task => task.status === 'todo' || task.status === 'inprogress')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        todoList.innerHTML = "";

        if (upcomingTasks.length === 0) {
            todoList.innerHTML = `<li class="todo-item" style="justify-content: center; color: #888;">No upcoming tasks!</li>`;
            return;
        }

        upcomingTasks.slice(0, 3).forEach(task => {
            const course = dataService.getCourseById(task.courseId) || { name: 'General', color: '#888' };
            const li = document.createElement("li");
            li.className = "todo-item";
            li.innerHTML = `
                <div class="item-details">
                    <label for="todo-dash-${task.id}">
                        <span class="item-tag" style="--tag-color: ${course.color};">${course.name}</span>
                        <span class="item-title">${task.name}</span>
                        <span class="item-date">Due: ${task.dueDate}</span>
                    </label>
                </div>
                <input type="checkbox" class="todo-checkbox" id="todo-dash-${task.id}" ${task.status === 'completed' ? 'checked' : ''} disabled>
            `;
            todoList.appendChild(li);
        });
    }


    function calculateComponentGrade(component) {
        const totalScore = component.entries.reduce((sum, e) => sum + (e.score || 0), 0);
        const totalMax   = component.entries.reduce((sum, e) => sum + (e.total || 0), 0);
        const componentPercent = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        const weightedGrade = componentPercent * (component.weight / 100);
        return { componentPercent, weightedGrade };
    }


    function loadSnapshotWidget() {
        const allTasks = dataService.getAllTasks();
        const completedTasks = allTasks.filter(task => task.status === 'completed').length;
        const totalTasks = allTasks.length;
        if (snapshotTasksDone) {
            snapshotTasksDone.textContent = `${completedTasks}/${totalTasks}`;
        }

        if (snapshotFocusTime) {
            const totalSeconds = dataService.getTodayFocusSeconds();
            snapshotFocusTime.textContent = formatSecondsToHoursMinutes(totalSeconds);
        }

        if (snapshotGWA) {
            const courses = dataService.getAllCourses();
            if (courses.length === 0) {
                snapshotGWA.textContent = "N/A";
                return;
            }

            let totalWeightedGradeSum = 0;
            courses.forEach(course => {
                let courseFinalGrade = 0;
                course.gradingWeights.forEach(component => {
                    const { weightedGrade } = calculateComponentGrade(component);
                    courseFinalGrade += weightedGrade;
                });
                totalWeightedGradeSum += courseFinalGrade;
            });

            const averageGWA = totalWeightedGradeSum / courses.length;
            snapshotGWA.textContent = `${averageGWA.toFixed(2)}%`;
        }
    }
    

    function loadNextClassWidget() {
        if (!nextClassName) return;

        const courses = dataService.getAllCourses();
        if (courses.length === 0) {
            nextClassName.textContent = "No Courses";
            nextClassTime.textContent = "-";
            nextClassLocation.textContent = "Add courses to see schedule";
            return;
        }

        const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const now = new Date();
        const today = dayMap[now.getDay()];
        const currentTime = now.toTimeString().slice(0, 5); 

        const upcomingClasses = [];
        courses.forEach(course => {
            course.schedules.forEach(schedule => {
                if (schedule.day === today && schedule.startTime > currentTime) {
                    upcomingClasses.push({
                        courseName: course.name,
                        startTime: schedule.startTime,
                        room: course.room || "No room"
                    });
                }
            });
        });

        if (upcomingClasses.length === 0) {
            nextClassName.textContent = "No More Classes";
            nextClassTime.textContent = "Done!";
            nextClassLocation.textContent = "Enjoy your free time!";
            return;
        }

        upcomingClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
        const nextClass = upcomingClasses[0];

        const [hour, minute] = nextClass.startTime.split(':');
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

        nextClassTime.textContent = `${displayHour}:${minute} ${ampm}`;
        nextClassName.textContent = nextClass.courseName.toUpperCase();
        nextClassLocation.textContent = nextClass.room;
    }


    function setupWidgetLinks() {
        if (todoWidgetSeeAllLink) {
            todoWidgetSeeAllLink.href = "tasks.html";
        }
        
        if (todoWidgetCard) {
            todoWidgetCard.addEventListener("click", (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    window.location.href = "tasks.html";
                }
            });
        }
        
        if (focusWidgetCard) {
            focusWidgetCard.addEventListener("click", () => {
                window.location.href = "pomodoro.html?addTask=true";
            });
        }

        if(focusWidgetTimerDisplay) {
            focusWidgetTimerDisplay.textContent = "25:00";
        }
    }

    function initializeDashboard() {
        const profile = dataService.getProfile();
        if (profile) {
            if (welcomeModal) welcomeModal.classList.remove("active"); 
            updateDashboardUI(profile);
        } else {
            welcomeModal.classList.add("active");
        }

        updateAllWidgets(); 
    }

    function renderHabitHeatmap() {
        if (!habitGrid) return; 
        habitGrid.innerHTML = ""; 
        
        const gamificationData = dataService.getGamificationData();
        const studyHistory = gamificationData.studyHistory || {};
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthName = today.toLocaleString('default', { month: 'long' });
        const titleElement = document.getElementById("heatmap-title");
        if (titleElement) {
            titleElement.textContent = `Study Activity (${monthName} ${currentYear})`;
        }

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); 

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const totalDaysInMonth = lastDayOfMonth.getDate();

        for (let i = 0; i < startDayOfWeek; i++) {
            const paddingBlock = document.createElement("div");
            paddingBlock.className = "heatmap-block padding";
            habitGrid.appendChild(paddingBlock);
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const monthString = String(currentMonth + 1).padStart(2, '0');
            const dayString = String(day).padStart(2, '0');
            const dateString = `${currentYear}-${monthString}-${dayString}`;

            const dayData = studyHistory[dateString];
            
            const activityCount = dayData ? (dayData.count || 0) : 0;
            const focusCount = dayData ? (dayData.focusCount || 0) : 0;
            const taskCount = dayData ? (dayData.taskCount || 0) : 0;

            let level = 0;
            if (activityCount === 0) {
                level = 0;
            } else if (activityCount === 1) {
                level = 1;
            } else if (activityCount <= 3) {
                level = 2;
            } else if (activityCount <= 5) {
                level = 3;
            } else {
                level = 4;
            }
            
            const block = document.createElement("div");
            block.className = `heatmap-block level-${level}`;
            
            const dayNumber = document.createElement("span");
            dayNumber.className = "day-number";
            dayNumber.textContent = day;
            block.appendChild(dayNumber);
            
            let activityMessage = "No activity";
            if (focusCount > 0 || taskCount > 0) {
                let messages = [];
                if (focusCount > 0) {
                    messages.push(`${focusCount} focus session${focusCount > 1 ? 's' : ''}`);
                }
                if (taskCount > 0) {
                    messages.push(`${taskCount} task${taskCount > 1 ? 's' : ''} completed`);
                }
                activityMessage = messages.join('\n');
            } 
            else if (activityCount > 0) {
                activityMessage = `${activityCount} focus session${activityCount > 1 ? 's' : ''}`;
            }
            
            block.title = `${dateString}\n${activityMessage}`;

            habitGrid.appendChild(block);
        }
    }

    if (welcomeForm) {
        welcomeForm.addEventListener("submit", handleWelcomeFormSubmit);

        const welcome_uploadIcon = document.getElementById("profile-upload-icon");
        const welcome_uploadText = document.getElementById("profile-upload-text");
        const welcome_previewImg = document.getElementById("profile-preview-img");

        setupFileInput(welcome_fileInput, welcome_fileDropZone, welcome_fileNameDisplay, welcome_fileRemoveBtn, { 
            get url() { return welcome_fileDataUrl; }, 
            set url(val) { welcome_fileDataUrl = val; } 
        }, welcome_uploadIcon, welcome_uploadText, welcome_previewImg);
    }
    if (editForm) {
        editForm.addEventListener("submit", handleEditFormSubmit);

        const edit_uploadIcon = document.getElementById("edit-profile-upload-icon");
        const edit_uploadText = document.getElementById("edit-profile-upload-text");
        const edit_previewImg = document.getElementById("edit-profile-preview-img");

        setupFileInput(edit_fileInput, edit_fileDropZone, edit_fileNameDisplay, edit_fileRemoveBtn, { 
            get url() { return edit_fileDataUrl; }, 
            set url(val) { edit_fileDataUrl = val; } 
        }, edit_uploadIcon, edit_uploadText,edit_previewImg);

    }


    if (clickableProfileCard) {
        clickableProfileCard.addEventListener("click", openProfileModal);
    }

    if (headerProfileButton) {
        headerProfileButton.addEventListener("click", openProfileModal);
    }

    if (editModal) {
        editModal.querySelector('.btn-close-modal').addEventListener('click', () => {
            editModal.classList.remove('active');
        });
        editModal.querySelector('[data-close="edit-profile-modal"]').addEventListener('click', () => {
            editModal.classList.remove('active');
        });
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.classList.remove('active');
            }
        });
    }


    if (todoWidgetAddTaskBtn) {
        todoWidgetAddTaskBtn.addEventListener("click", () => {
            window.location.href = "tasks.html?addTask=true"; 
        });
    }

    initializeDashboard(); 
    
});