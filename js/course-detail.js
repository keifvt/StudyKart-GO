import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {
    let currentCourseId = null;
    let currentCourse = null;
    let allTasks = [];
    let reviewTerms = [];
    let currentCardIndex = 0;
    
    const dayOrder = { "MON": 1, "TUE": 2, "WED": 3, "THU": 4, "FRI": 5, "SAT": 6, "SUN": 7 };

    // === Main Page Elements ===
    const courseNameTitle = document.getElementById("course-name-title");
    const courseInstructor = document.getElementById("course-instructor");
    const courseSchedule = document.getElementById("course-schedule");
    const courseLocation = document.getElementById("course-location");
    const tabLinks = document.querySelectorAll(".tab-link");
    const editCourseBtn = document.getElementById("edit-course-btn");

    // === To-Do Tab Elements ===
    const taskListContainer = document.getElementById("task-list-container");
    const taskFilterStatus = document.getElementById("task-filter-status");
    const addTaskForCourseBtn = document.getElementById("add-task-for-course");
    const addTaskModal = document.getElementById("add-task-modal");
    const taskForm = document.getElementById("new-task-form");
    const hiddenTaskCourseInput = document.getElementById("task-course");
    const closeTaskModalBtn = addTaskModal?.querySelector(".btn-close-modal");
    const cancelTaskBtn = addTaskModal?.querySelector(".form-actions .btn-secondary");

    // === Files Tab Elements ===
    const filesListContainer = document.getElementById("files-list-container");
    const addFileBtn = document.getElementById("add-file-btn");
    const addFileModal = document.getElementById("add-file-modal");
    const addFileForm = document.getElementById("add-file-form");
    const addFileInput = document.getElementById("add-file-input");
    const fileDropZone = document.querySelector(".file-drop-zone");
    const fileNameDisplay = document.getElementById("file-name-display");
    const closeFileModalBtn = addFileModal?.querySelector(".btn-close-modal");
    const cancelFileBtn = addFileModal?.querySelector(".form-actions .btn-secondary");
    const editFileModal = document.getElementById("edit-file-modal");
    const editFileForm = document.getElementById("edit-file-form");
    const closeEditFileModalBtn = editFileModal?.querySelector(".btn-close-modal");
    const cancelEditFileBtn = editFileModal?.querySelector(".form-actions .btn-secondary");

    // === Links Tab Elements ===
    const linksListContainer = document.getElementById("links-list-container");
    const addLinkBtn = document.getElementById("add-link-btn");
    const addLinkModal = document.getElementById("add-link-modal");
    const addLinkForm = document.getElementById("add-link-form");
    const closeLinkModalBtn = addLinkModal?.querySelector(".btn-close-modal");
    const cancelLinkBtn = addLinkModal?.querySelector(".form-actions .btn-secondary");
    const editLinkModal = document.getElementById("edit-link-modal");
    const editLinkForm = document.getElementById("edit-link-form");
    const closeEditLinkModalBtn = editLinkModal?.querySelector(".btn-close-modal");
    const cancelEditLinkBtn = editLinkModal?.querySelector(".form-actions .btn-secondary");

    // === Study Sets Tab Elements ===
    const setsListContainer = document.getElementById("sets-list-container");
    const addSetBtn = document.getElementById("add-set-btn");
    const addSetModal = document.getElementById("add-set-modal");
    const setForm = document.getElementById("new-set-form");
    const setTermsContainer = document.getElementById("set-terms-container");
    const addTermCardBtn = document.getElementById("add-term-card-btn");
    const closeSetModalBtn = addSetModal?.querySelector(".btn-close-modal");
    const cancelSetBtn = addSetModal?.querySelector(".form-actions .btn-secondary");
    const hiddenSetIdInput = document.getElementById("set-id");

    // === Review Modal Elements ===
    const reviewModal = document.getElementById("review-modal");
    const reviewSetTitle = document.getElementById("review-set-title");
    const closeReviewBtn = document.getElementById("close-review-btn");
    const closeReviewBtnBottom = document.getElementById("review-close-btn-bottom");
    const flashcardContainer = document.getElementById("flashcard-container");
    const flashcard = document.querySelector(".flashcard"); 
    
    const cardFront = document.getElementById("card-front");
    const cardBack = document.getElementById("card-back");
    const reviewShuffleBtn = document.getElementById("review-shuffle-btn");
    const reviewPrevBtn = document.getElementById("review-prev-btn");
    const reviewNextBtn = document.getElementById("review-next-btn");
    const reviewCounter = document.getElementById("review-counter");

    // === Course Edit Modal Elements ===
    const courseModal = document.getElementById("course-modal");
    const modalTitle = document.getElementById("modal-title");
    const closeCourseModalBtn = courseModal.querySelector(".btn-close-modal");
    const cancelCourseBtn = document.getElementById("cancel-course-btn");
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
    const courseInstructorInput = document.getElementById("modal-course-instructor");
    const courseColorInput = document.getElementById("course-color");


    function init() {
        const params = new URLSearchParams(window.location.search);
        currentCourseId = parseInt(params.get('id'));
        if (!currentCourseId) {
            courseNameTitle.textContent = "Course not found";
            return;
        }

        currentCourse = dataService.getCourseById(currentCourseId);
        allTasks = dataService.getAllTasks();

        if (!currentCourse) {
            courseNameTitle.textContent = "Course not found";
            return;
        }

        if (!currentCourse.links) currentCourse.links = [];
        if (!currentCourse.files) currentCourse.files = [];
        if (!currentCourse.studySets) currentCourse.studySets = [];

        renderCourseDetails();
        renderFilteredTasks();
        renderFiles();
        renderLinks();
        renderStudySets();
        
        // --- Event Listeners ---
        tabLinks.forEach(link => link.addEventListener("click", handleTabClick));

        // To-Do
        taskFilterStatus.addEventListener("change", renderFilteredTasks);
        addTaskForCourseBtn.addEventListener("click", openTaskModal);
        taskForm.addEventListener("submit", handleTaskFormSubmit);
        closeTaskModalBtn.addEventListener("click", closeTaskModal);
        cancelTaskBtn.addEventListener("click", closeTaskModal);
        taskListContainer.addEventListener('change', handleTaskCheckboxChange);
        taskListContainer.addEventListener('click', handleTaskActions);

        // Files
        addFileBtn.addEventListener("click", openFileModal);
        addFileForm.addEventListener("submit", handleFileFormSubmit);
        closeFileModalBtn.addEventListener("click", closeFileModal);
        cancelFileBtn.addEventListener("click", closeFileModal);
        filesListContainer.addEventListener("click", handleFileActions);
        editFileForm.addEventListener("submit", handleEditFileFormSubmit);
        closeEditFileModalBtn.addEventListener("click", closeEditFileModal);
        cancelEditFileBtn.addEventListener("click", closeEditFileModal);
        setupFileInput(addFileInput, fileDropZone, fileNameDisplay);

        // Links
        addLinkBtn.addEventListener("click", () => openLinkModal(null, false));
        addLinkForm.addEventListener("submit", handleAddLinkFormSubmit);
        closeLinkModalBtn.addEventListener("click", closeLinkModal);
        cancelLinkBtn.addEventListener("click", closeLinkModal);
        linksListContainer.addEventListener("click", handleLinkActions);
        editLinkForm.addEventListener("submit", handleEditLinkFormSubmit);
        closeEditLinkModalBtn.addEventListener("click", closeEditLinkModal);
        cancelEditLinkBtn.addEventListener("click", closeEditLinkModal);

        // Study Sets
        addSetBtn.addEventListener("click", () => openSetModal(null));
        setForm.addEventListener("submit", handleSetFormSubmit);
        addTermCardBtn.addEventListener("click", () => renderTermCard());
        setTermsContainer.addEventListener("click", handleTermCardDelete);
        closeSetModalBtn.addEventListener("click", closeSetModal);
        cancelSetBtn.addEventListener("click", closeSetModal);
        setsListContainer.addEventListener("click", handleSetActions);

        // Review Modal
        // --- THIS IS THE FIX ---
        // Add listener to the container, but toggle the class on the card
        flashcardContainer.addEventListener("click", () => flashcard.classList.toggle("is-flipped"));
        // --- END OF FIX ---
        closeReviewBtn.addEventListener("click", closeReviewModal);
        closeReviewBtnBottom.addEventListener("click", closeReviewModal);
        reviewNextBtn.addEventListener("click", nextCard);
        reviewPrevBtn.addEventListener("click", prevCard);
        reviewShuffleBtn.addEventListener("click", shuffleCards);

        // Course Edit
        editCourseBtn.addEventListener("click", () => openCourseModal(true, currentCourse));
        closeCourseModalBtn.addEventListener("click", closeCourseModal);
        cancelCourseBtn.addEventListener("click", closeCourseModal);
        courseModal.addEventListener("click", (e) => {
            if (e.target === courseModal) closeCourseModal();
        });
        scheduleContainer.addEventListener('click', handleScheduleClick);
        componentContainer.addEventListener('click', handleComponentClick);
        componentContainer.addEventListener('input', handleComponentInput);
        addScheduleBtn.addEventListener("click", () => addScheduleEntry());
        addComponentBtn.addEventListener("click", () => addComponentEntry());
        courseForm.addEventListener("submit", handleCourseFormSubmit);
    }
    
    function renderCourseDetails() {
        courseNameTitle.textContent = currentCourse.name;
        courseInstructor.textContent = currentCourse.professor || "Not set";
        
        document.documentElement.style.setProperty('--course-color', currentCourse.color);

        const sortedSchedules = [...currentCourse.schedules].sort((a, b) => {
            return (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
        });
        
        const scheduleText = sortedSchedules.map(s => 
            `${s.day} ${s.startTime} - ${s.endTime}`
        ).join('\n'); // Use newline for wrapping

        const locations = [...new Set(sortedSchedules.map(s => s.room).filter(r => r))];
        const locationText = locations.length > 0 ? locations.join(', ') : "Not set";
        
        courseSchedule.textContent = scheduleText || "Not set";
        courseLocation.textContent = locationText;
    }

    // --- Tab Switching ---
    function handleTabClick(e) {
        e.preventDefault();
        
        tabLinks.forEach(link => link.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        
        const tabLink = e.target;
        tabLink.classList.add("active");
        
        const tabId = tabLink.dataset.tab;
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) {
            targetPane.classList.add("active");
        }
    }
    
    // --- To-Do Functions ---
    function handleTaskCheckboxChange(e) {
        const checkbox = e.target.closest('.task-complete-checkbox');
        if (!checkbox) return;
        
        const taskId = parseInt(checkbox.dataset.taskId);
        const isChecked = checkbox.checked;
        if (isNaN(taskId)) return;

        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;
        
        const wasCompleted = task.status === 'completed';
        const newStatus = isChecked ? 'completed' : 'todo';
        
        dataService.updateTaskStatus(taskId, newStatus);
        task.status = newStatus;

        const taskDueDate = task.dueDate;
        if (isChecked && !wasCompleted) {
            dataService.logStudySession('task', 0, taskDueDate);
        } else if (!isChecked && wasCompleted) {
            dataService.removeStudySession('task', taskDueDate);
        }
        
        renderFilteredTasks();
    }
    
    function handleTaskActions(e) {
         const deleteButton = e.target.closest('.btn-delete-task');
         if(deleteButton) {
             const taskId = parseInt(deleteButton.dataset.taskId);
             if (confirm("Are you sure you want to delete this task?")) {
                 dataService.deleteTask(taskId);
                 allTasks = dataService.getAllTasks();
                 renderFilteredTasks();
             }
         }
    }

    function renderFilteredTasks() {
        const filter = taskFilterStatus.value;
        const courseTasks = allTasks.filter(task => task.courseId === currentCourseId);
        
        let tasksToRender = (filter === 'ongoing') ?
            courseTasks.filter(t => t.status !== 'completed') :
            courseTasks.filter(t => t.status === 'completed');
        
        tasksToRender.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        taskListContainer.innerHTML = ""; 
        
        if (tasksToRender.length === 0) {
            const message = filter === 'ongoing' ? "No tasks to accomplish" : "No completed tasks";
            taskListContainer.innerHTML = `<div class="no-tasks-message">${message}</div>`;
            return;
        }
        
        tasksToRender.forEach(task => {
            const taskCardHTML = createTaskCardHTML(task, currentCourse);
            taskListContainer.insertAdjacentHTML("beforeend", taskCardHTML);
        });
    }

    function openTaskModal() {
        taskForm.reset();
        hiddenTaskCourseInput.value = currentCourseId; 
        document.getElementById("task-modal-title").textContent = "New Task";
        addTaskModal.classList.add("active");
    }

    function closeTaskModal() {
        addTaskModal.classList.remove("active");
    }

    function handleTaskFormSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            id: Date.now(),
            name: document.getElementById("task-name").value.trim(),
            courseId: parseInt(hiddenTaskCourseInput.value),
            dueDate: document.getElementById("task-due-date").value,
            priority: document.getElementById("task-priority").value,
            status: "todo"
        };

        if (!taskData.name || !taskData.dueDate) {
            alert("Please fill in all fields.");
            return;
        }

        dataService.saveTask(taskData);
        allTasks = dataService.getAllTasks();
        renderFilteredTasks();
        closeTaskModal();
    }

    function createTaskCardHTML(task, course) {
        const isCompleted = task.status === 'completed';
        let formattedDate = isCompleted ? `Completed` : `Due: ${task.dueDate}`;
        const cardStyle = !isCompleted ? `style="background-color: ${course.color}33;"` : '';
        const cardClasses = `task-card ${isCompleted ? 'completed' : ''}`;

        return `
            <article class="${cardClasses}" data-task-id="${task.id}" ${cardStyle}>
                <input type="checkbox" class="task-complete-checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''}>
                <h3>${task.name}</h3>
                <div class="task-card-buttons">
                    <button class="btn-edit-task" data-task-id="${task.id}" aria-label="Edit task">&#9998;</button>
                    <button class="btn-delete-task" data-task-id="${task.id}" aria-label="Delete task">&times;</button>
                </div>
                <span class="task-subject" style="color: ${course.color};">${course.name}</span>
                <span class="task-due-date">${formattedDate}</span>
                ${!isCompleted ? `<span class="task-priority ${task.priority}">${task.priority}</span>` : ''}
            </article>
        `;
    }
    
    // --- Link Functions ---
    function renderLinks() {
        linksListContainer.innerHTML = "";
        if (!currentCourse.links || currentCourse.links.length === 0) {
            linksListContainer.innerHTML = `
                <div class="empty-state-container">
                    <i class="fa-solid fa-link"></i>
                    <p>No links added yet.</p>
                </div>`;
            return;
        }
        
        currentCourse.links.forEach(link => {
            const linkHTML = `
                <div class="link-item" data-id="${link.id}">
                    <i class="fa-solid fa-link link-item-icon"></i>
                    <div class="link-item-details">
                        <a href="${link.url}" target="_blank" class="link-item-title">${link.title}</a>
                        <span class="link-item-url" data-url="${link.url}">${link.url}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-action edit" data-id="${link.id}" aria-label="Edit link"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn-action delete" data-id="${link.id}" aria-label="Delete link"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            linksListContainer.insertAdjacentHTML("beforeend", linkHTML);
        });
    }
    
    function handleLinkActions(e) {
        const editBtn = e.target.closest(".btn-action.edit");
        const deleteBtn = e.target.closest(".btn-action.delete");
        const urlSpan = e.target.closest(".link-item-url");

        if (editBtn) {
            const linkId = parseInt(editBtn.dataset.id);
            const link = currentCourse.links.find(l => l.id === linkId);
            if (link) openLinkModal(link, true);
        } else if (deleteBtn) {
            const linkId = parseInt(deleteBtn.dataset.id);
            if (confirm("Are you sure you want to delete this link?")) {
                currentCourse.links = currentCourse.links.filter(link => link.id !== linkId);
                dataService.saveCourse(currentCourse);
                renderLinks();
            }
        } else if (urlSpan) {
            window.open(urlSpan.dataset.url, '_blank');
        }
    }
    
    function openLinkModal(link = null, isEdit = false) {
        if (isEdit) {
            document.getElementById("edit-link-id").value = link.id;
            document.getElementById("edit-link-title").value = link.title;
            document.getElementById("edit-link-url").value = link.url;
            editLinkModal.classList.add("active");
        } else {
            addLinkForm.reset();
            addLinkModal.classList.add("active");
        }
    }
    
    function closeLinkModal() { addLinkModal.classList.remove("active"); }
    function closeEditLinkModal() { editLinkModal.classList.remove("active"); }
    
    function handleAddLinkFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById("add-link-title").value.trim();
        const url = document.getElementById("add-link-url").value.trim();
        
        if (!title || !url) return alert("Please fill in all fields.");
        
        currentCourse.links.push({ id: Date.now(), title, url });
        dataService.saveCourse(currentCourse);
        renderLinks();
        closeLinkModal();
    }
    
    function handleEditLinkFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("edit-link-id").value);
        const title = document.getElementById("edit-link-title").value.trim();
        const url = document.getElementById("edit-link-url").value.trim();

        if (!title || !url) return alert("Please fill in all fields.");
        
        const linkIndex = currentCourse.links.findIndex(l => l.id === id);
        if (linkIndex > -1) {
            currentCourse.links[linkIndex] = { id, title, url };
            dataService.saveCourse(currentCourse);
            renderLinks();
            closeEditLinkModal();
        }
    }
    
    // --- File Functions ---
    function renderFiles() {
        filesListContainer.innerHTML = "";
        if (!currentCourse.files || currentCourse.files.length === 0) {
            filesListContainer.innerHTML = `
                <div class="empty-state-container">
                    <i class="fa-solid fa-file"></i>
                    <p>No files added yet.</p>
                </div>`;
            return;
        }
        
        currentCourse.files.forEach(file => {
            const fileHTML = `
                <div class="file-item" data-id="${file.id}">
                    <i class="fa-solid fa-file-arrow-down file-item-icon"></i>
                    <div class="file-item-details">
                        <a href="${file.dataUrl}" download="${file.name}" class="file-item-name">${file.name}</a>
                        <span class="file-item-type">${file.type}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-action edit" data-id="${file.id}" aria-label="Edit file name"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn-action delete" data-id="${file.id}" aria-label="Delete file"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            filesListContainer.insertAdjacentHTML("beforeend", fileHTML);
        });
    }
    
    function handleFileActions(e) {
        const editBtn = e.target.closest(".btn-action.edit");
        const deleteBtn = e.target.closest(".btn-action.delete");

        if (editBtn) {
            const fileId = parseInt(editBtn.dataset.id);
            const file = currentCourse.files.find(f => f.id === fileId);
            if (file) openFileModal(file, true);
        } else if (deleteBtn) {
            const fileId = parseInt(deleteBtn.dataset.id);
            if (confirm("Are you sure you want to delete this file?")) {
                currentCourse.files = currentCourse.files.filter(f => f.id !== fileId);
                dataService.saveCourse(currentCourse);
                renderFiles();
            }
        }
    }

    function openFileModal(file = null, isEdit = false) {
        if (isEdit) {
            document.getElementById("edit-file-id").value = file.id;
            document.getElementById("edit-file-name").value = file.name;
            editFileModal.classList.add("active");
        } else {
            addFileForm.reset();
            fileNameDisplay.textContent = "No file chosen";
            fileDropZone.classList.remove("drag-over");
            addFileModal.classList.add("active");
        }
    }
    
    function closeFileModal() { addFileModal.classList.remove("active"); }
    function closeEditFileModal() { editFileModal.classList.remove("active"); }
    
    function handleFileFormSubmit(e) {
        e.preventDefault();
        const file = addFileInput.files[0];
        let name = document.getElementById("add-file-name").value.trim();

        if (!file) return alert("Please select a file.");
        if (!name) name = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            const newFile = {
                id: Date.now(),
                name: name,
                type: file.type,
                size: file.size,
                dataUrl: dataUrl
            };
            
            currentCourse.files.push(newFile);
            dataService.saveCourse(currentCourse);
            renderFiles();
            closeFileModal();
        };
        reader.readAsDataURL(file);
    }
    
    function handleEditFileFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("edit-file-id").value);
        const name = document.getElementById("edit-file-name").value.trim();
        
        if (!name) return alert("Please enter a file name.");

        const fileIndex = currentCourse.files.findIndex(f => f.id === id);
        if (fileIndex > -1) {
            currentCourse.files[fileIndex].name = name;
            dataService.saveCourse(currentCourse);
            renderFiles();
            closeEditFileModal();
        }
    }

    function setupFileInput(fileInput, dropZone, nameDisplay) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                nameDisplay.textContent = fileInput.files[0].name;
            } else {
                nameDisplay.textContent = "No file chosen";
            }
        });

        ['dragover', 'dragenter'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add("drag-over");
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove("drag-over");
            });
        });

        dropZone.addEventListener("drop", (e) => {
            fileInput.files = e.dataTransfer.files;
            if (fileInput.files.length > 0) {
                nameDisplay.textContent = fileInput.files[0].name;
            }
        });
    }

    // --- Study Set Functions ---
    function renderStudySets() {
        setsListContainer.innerHTML = "";
        if (!currentCourse.studySets || currentCourse.studySets.length === 0) {
            setsListContainer.innerHTML = `
                <div class="empty-state-container" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-clone"></i>
                    <p>No study sets created.</p>
                </div>`;
            return;
        }
        
        currentCourse.studySets.forEach(set => {
            const setHTML = `
                <div class="set-item-card" data-id="${set.id}">
                    <h3>${set.title}</h3>
                    <p>${set.terms.length} term${set.terms.length !== 1 ? 's' : ''}</p>
                    <div class="set-item-actions">
                        <button class="btn btn-secondary btn-review" data-id="${set.id}">Review</button>
                        <button class="btn btn-primary btn-edit" data-id="${set.id}">Edit</button>
                        <button class="btn-action delete" data-id="${set.id}" aria-label="Delete set"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            setsListContainer.insertAdjacentHTML("beforeend", setHTML);
        });
    }
    
    function handleSetActions(e) {
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-action.delete");
        const reviewBtn = e.target.closest(".btn-review");

        if (editBtn) {
            const setId = parseInt(editBtn.dataset.id);
            const studySet = currentCourse.studySets.find(s => s.id === setId);
            if (studySet) openSetModal(studySet);
        } else if (deleteBtn) {
            const setId = parseInt(deleteBtn.dataset.id);
            if (confirm("Are you sure you want to delete this study set?")) {
                currentCourse.studySets = currentCourse.studySets.filter(s => s.id !== setId);
                dataService.saveCourse(currentCourse);
                renderStudySets();
            }
        } else if (reviewBtn) {
            const setId = parseInt(reviewBtn.dataset.id);
            openReviewModal(setId);
        }
    }

    function openSetModal(studySet = null) {
        setForm.reset();
        setTermsContainer.innerHTML = "";
        if (studySet) {
            document.getElementById("set-modal-title").textContent = "Edit Study Set";
            hiddenSetIdInput.value = studySet.id;
            document.getElementById("set-title").value = studySet.title;
            studySet.terms.forEach(term => renderTermCard(term));
        } else {
            document.getElementById("set-modal-title").textContent = "Create Study Set";
            hiddenSetIdInput.value = "";
            renderTermCard(); // Add one blank card
        }
        addSetModal.classList.add("active");
    }
    
    function closeSetModal() {
        addSetModal.classList.remove("active");
    }
    
    function renderTermCard(term = null) {
        const termCard = document.createElement("div");
        termCard.className = "term-card";
        
        const termId = term ? term.id : Date.now();
        termCard.dataset.id = termId;
        
        termCard.innerHTML = `
            <div class="form-group" style="grid-column: 1;">
                <label for="term-${termId}">Term</label>
                <input type="text" id="term-${termId}" class="term-input" value="${term ? term.term : ''}" placeholder="Enter term">
            </div>
            <button type="button" class="term-card-delete" aria-label="Delete term card">&times;</button>
            <div class="form-group" style="grid-column: 1;">
                <label for="def-${termId}">Definition</label>
                <input type="text" id="def-${termId}" class="definition-input" value="${term ? term.definition : ''}" placeholder="Enter definition">
            </div>
        `;
        setTermsContainer.appendChild(termCard);
    }
    
    function handleTermCardDelete(e) {
        const deleteBtn = e.target.closest(".term-card-delete");
        if (!deleteBtn) return;
        
        if (setTermsContainer.children.length > 1) {
            deleteBtn.closest(".term-card").remove();
        } else {
            alert("You must have at least one term.");
        }
    }
    
    function handleSetFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById("set-title").value.trim();
        if (!title) {
            alert("Please enter a title for the study set.");
            return;
        }
        
        const terms = [];
        setTermsContainer.querySelectorAll(".term-card").forEach(card => {
            const term = card.querySelector(".term-input").value.trim();
            const definition = card.querySelector(".definition-input").value.trim();
            if (term && definition) {
                terms.push({
                    id: parseInt(card.dataset.id),
                    term,
                    definition
                });
            }
        });
        
        if (terms.length === 0) {
            alert("Please add at least one valid term and definition.");
            return;
        }
        
        const setId = parseInt(hiddenSetIdInput.value);
        if (setId) {
            // Edit existing set
            const setIndex = currentCourse.studySets.findIndex(s => s.id === setId);
            if (setIndex > -1) {
                currentCourse.studySets[setIndex].title = title;
                currentCourse.studySets[setIndex].terms = terms;
            }
        } else {
            // Create new set
            const newSet = {
                id: Date.now(),
                title,
                terms
            };
            currentCourse.studySets.push(newSet);
        }
        
        dataService.saveCourse(currentCourse);
        renderStudySets();
        closeSetModal();
    }

    // --- Review Modal Functions ---
    function openReviewModal(setId) {
        const studySet = currentCourse.studySets.find(s => s.id === setId);
        if (!studySet || studySet.terms.length === 0) {
            alert("This study set is empty!");
            return;
        }
        
        reviewSetTitle.textContent = studySet.title;
        reviewTerms = [...studySet.terms]; // Copy terms
        currentCardIndex = 0;
        
        showCard(currentCardIndex);
        reviewModal.classList.add("active");
    }
    
    function closeReviewModal() {
        reviewModal.classList.remove("active");
    }
    
    function showCard(index) {
        const term = reviewTerms[index];
        cardFront.textContent = term.term;
        cardBack.textContent = term.definition;
        reviewCounter.textContent = `${index + 1} / ${reviewTerms.length}`;
        flashcard.classList.remove("is-flipped");
        
        // Disable/Enable nav buttons
        reviewPrevBtn.disabled = (index === 0);
        reviewNextBtn.disabled = (index === reviewTerms.length - 1);
    }
    
    function nextCard() {
        if (currentCardIndex < reviewTerms.length - 1) {
            currentCardIndex++;
            showCard(currentCardIndex);
        }
    }
    
    function prevCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            showCard(currentCardIndex);
        }
    }
    
    function shuffleCards() {
        // Fisher-Yates Shuffle
        for (let i = reviewTerms.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reviewTerms[i], reviewTerms[j]] = [reviewTerms[j], reviewTerms[i]];
        }
        currentCardIndex = 0;
        showCard(currentCardIndex);
    }
    
    // --- Course Edit Modal Functions (Shared) ---
    function openCourseModal(isEditMode = false, course = null) {
        resetCourseForm();
        if (isEditMode && course) {
            modalTitle.textContent = "Edit Course";
            formSubmitBtn.textContent = "Save Changes";
            hiddenCourseId.value = course.id;
            courseNameInput.value = course.name;
            courseInstructorInput.value = course.professor;
            courseColorInput.value = course.color;
            course.schedules.forEach(addScheduleEntry);
            course.gradingWeights.forEach(addComponentEntry);
        }
        updateTotalWeight();
        courseModal.classList.add("active");
    }

    function closeCourseModal() {
        courseModal.classList.remove("active");
        resetCourseForm();
    }
    
    function resetCourseForm() {
        courseForm.reset();
        scheduleContainer.innerHTML = "";
        componentContainer.innerHTML = "";
        courseColorInput.value = "#a5f3fc";
        weightTotalDisplay.classList.remove("invalid");
        weightTotalSpan.textContent = "0";
        hiddenCourseId.value = "";
    }
    
    function handleCourseFormSubmit(e) {
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
                entries: JSON.parse(entry.dataset.entries || '[]') 
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
            ...currentCourse, // Preserves files, links, studySets
            id: currentCourseId,
            name: courseName,
            professor: courseInstructorInput.value.trim(),
            color: selectedColor,
            schedules: schedules,
            gradingWeights: gradingWeights
        };

        dataService.saveCourse(courseData);
        currentCourse = dataService.getCourseById(currentCourseId); // Re-fetch
        
        renderCourseDetails();
        closeCourseModal();
    }
    
    function addScheduleEntry(schedule = null) {
        const entry = document.createElement("div");
        entry.className = "schedule-entry";
        const day = schedule ? schedule.day : 'MON';
        const startTime = schedule ? schedule.startTime : '09:00';
        const endTime = schedule ? schedule.endTime : '10:30';
        const room = schedule ? schedule.room : '';
        entry.innerHTML = `
            <div class="day-btn-group">
                ${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `
                    <button type="button" class="day-btn ${d === day ? 'active' : ''}" data-day="${d}">${d}</button>
                `).join('')}
            </div>
            <div class="schedule-controls-wrapper">
                <div class="schedule-time-inputs">
                    <input type="time" class="schedule-start-time" value="${startTime}" required>
                    <span>&rarr;</span>
                    <input type="time" class="schedule-end-time" value="${endTime}" required>
                </div>
                <button type="button" class="btn-delete-entry" aria-label="Delete schedule">&times;</button>
            </div>
            <div class="schedule-room-input">
                <input type="text" class="schedule-room" placeholder="Room (Optional)" value="${room}">
            </div>
        `;
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
        entry.dataset.entries = component ? JSON.stringify(component.entries || []) : JSON.stringify([]);
        componentContainer.appendChild(entry);
    }
    
    function handleScheduleClick(e) {
        if (e.target.classList.contains('day-btn')) {
            e.target.parentElement.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
        if (e.target.classList.contains('btn-delete-entry')) {
            e.target.closest('.schedule-entry').remove();
        }
    }
    
    function handleComponentClick(e) {
        if (e.target.classList.contains('btn-delete-entry')) {
            e.target.closest('.component-entry').remove();
            updateTotalWeight();
        }
    }
    
    function handleComponentInput(e) {
        if (e.target.classList.contains('component-weight-input')) {
            updateTotalWeight();
        }
    }

    function updateTotalWeight() {
        let total = 0;
        componentContainer.querySelectorAll('.component-weight-input').forEach(input => {
            total += parseInt(input.value) || 0;
        });
        weightTotalSpan.textContent = total;
        weightTotalDisplay.classList.toggle("invalid", total !== 100);
        return total;
    }

    init();

});
