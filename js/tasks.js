import { dataService } from './data.js'; 

document.addEventListener("DOMContentLoaded", () => {

    const addTaskModal = document.getElementById("add-task-modal");
    const addTaskBtn = document.getElementById("add-new-task-btn");
    const taskForm = document.getElementById("new-task-form");
    const courseSelect = document.getElementById("task-course");


    const modalTitle = document.getElementById("modal-title");
    const modalSubmitBtn = taskForm.querySelector("button[type='submit']");
    const taskIdInput = document.getElementById("task-id"); 


    const closeModalBtn = addTaskModal?.querySelector(".btn-close-modal");
    const cancelBtn = addTaskModal?.querySelector(".form-actions .btn-secondary");


    const todoColumnList = document.getElementById("column-todo")?.querySelector(".task-list");
    const inProgressColumnList = document.getElementById("column-inprogress")?.querySelector(".task-list");
    const missedColumnList = document.getElementById("column-missed")?.querySelector(".task-list"); 
    const completedColumnList = document.getElementById("column-completed")?.querySelector(".task-list");
    const tasksBoard = document.querySelector(".tasks-board");

    const filterBySelect = document.getElementById("filter-by");
    const sortBySelect = document.getElementById("sort-by");


    function populateCourseDropdown() {
        const courses = dataService.getAllCourses();
        courseSelect.innerHTML = '<option value="" disabled selected>Select a course</option>'; 

        if (courses && courses.length > 0) {
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id; 
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        } else {
            courseSelect.innerHTML = '<option value="" disabled selected>Create a course first!</option>';
        }
    }

    function populateFilterDropdown() {
        if (!filterBySelect) return;

        filterBySelect.innerHTML = '<option value="all">All</option>'; 

        const priorities = ['high', 'medium', 'low'];
        const priorityGroup = document.createElement("optgroup");
        priorityGroup.label = "Priorities";
        priorities.forEach(p => {
            const option = document.createElement("option");
            option.value = `priority-${p}`;
            option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
            priorityGroup.appendChild(option);
        });
        filterBySelect.appendChild(priorityGroup);

        const courses = dataService.getAllCourses();
        if (courses.length > 0) {
            const courseGroup = document.createElement("optgroup");
            courseGroup.label = "Courses";
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = `course-${course.id}`;
                option.textContent = course.name;
                courseGroup.appendChild(option);
            });
            filterBySelect.appendChild(courseGroup);
        }
    }


    function openModal(task = null) {
        populateCourseDropdown(); 
        
        if (task) {
            modalTitle.textContent = "Edit Task";
            modalSubmitBtn.textContent = "Save Changes";

            taskIdInput.value = task.id;
            document.getElementById("task-name").value = task.name;
            document.getElementById("task-course").value = task.courseId;
            document.getElementById("task-due-date").value = task.dueDate;
            document.getElementById("task-priority").value = task.priority;

        } else {
            modalTitle.textContent = "Create New Task";
            modalSubmitBtn.textContent = "Save Task";
            taskForm.reset();
            taskIdInput.value = "";
        }
        
        addTaskModal?.classList.add("active");
    }

    function closeModal() {
        addTaskModal?.classList.remove("active");
        taskForm.reset();
        taskIdInput.value = ""; 
    }

    function handleTaskFormSubmit(event) {
        event.preventDefault();

        const taskName = document.getElementById("task-name").value.trim();
        const courseId = parseInt(courseSelect.value);
        const dueDate = document.getElementById("task-due-date").value;
        const priority = document.getElementById("task-priority").value;
        const existingTaskId = parseInt(taskIdInput.value); 

        if (!taskName || !courseId || !dueDate || !priority) {
            alert("Please fill in all required fields.");
            return;
        }

        let taskData;

        if (existingTaskId) {
            const originalTask = dataService.getAllTasks().find(t => t.id === existingTaskId);
            taskData = {
                id: existingTaskId,
                name: taskName,
                courseId: courseId,
                dueDate: dueDate,
                priority: priority,
                status: originalTask.status || "todo"
            };
        } else {
            taskData = {
                id: Date.now(),
                name: taskName,
                courseId: courseId,
                dueDate: dueDate,
                priority: priority,
                status: "todo"
            };
        }

        dataService.saveTask(taskData);

        loadAndRenderTasks(); 
        populateFilterDropdown(); 
        closeModal();
    }


     function createTaskCardHTML(task, computedStatus = null) {
        const course = dataService.getCourseById(task.courseId) || { name: `Course ID ${task.courseId}`, color: '#cccccc' };
        const subjectClass = course.name.toLowerCase().replace(/\s+/g, '-');

        const displayStatus = computedStatus || task.status;
        const isMissed = displayStatus === 'missed';
        const isCompleted = task.status === 'completed';

        let formattedDate = `Due: ${task.dueDate}`;
        if (isCompleted) {
            formattedDate = `Completed`;
        } else if (isMissed) {
            formattedDate = `<span class="missed-text">Missed: ${task.dueDate}</span>`;
        }

        const cardClasses = `task-card ${isMissed ? 'missed-deadline' : ''} ${isCompleted ? 'completed' : ''}`;
        
        let cardStyle = '';
        if (displayStatus === 'todo' || displayStatus === 'inprogress') {
            cardStyle = `style="background-color: ${course.color}33;"`;
        }

        const checkboxHTML = `
            <input type="checkbox" 
                   class="task-complete-checkbox" 
                   data-task-id="${task.id}" 
                   ${isCompleted ? 'checked' : ''} 
                   ${isMissed ? 'disabled' : ''}>
        `;


        return `
            <article class="${cardClasses}" data-task-id="${task.id}" draggable="${!isCompleted && !isMissed}" ${cardStyle}>
                ${checkboxHTML}
                
                <h3>${task.name}</h3>

                <div class="task-card-buttons">
                    <button class="btn-edit-task" data-task-id="${task.id}" aria-label="Edit task">&#9998;</button>
                    <button class="btn-delete-task" data-task-id="${task.id}" aria-label="Delete task">&times;</button>
                </div>

                <span class="task-subject ${subjectClass}" style="color: ${course.color};">
                    ${course.name}
                </span>
                <span class="task-due-date">${formattedDate}</span>
                ${(displayStatus !== 'completed' && displayStatus !== 'missed') ? `<span class="task-priority ${task.priority}">${task.priority}</span>` : ''}
            </article>
        `;
    }

    

    function loadAndRenderTasks() {
        let tasks = dataService.getAllTasks();
        const filterValue = filterBySelect ? filterBySelect.value : 'all';
        const sortValue = sortBySelect ? sortBySelect.value : 'due-date';

        let filteredTasks = tasks;
        if (filterValue.startsWith('priority-')) {
            const priority = filterValue.split('-')[1];
            filteredTasks = tasks.filter(t => t.priority === priority);
        } else if (filterValue.startsWith('course-')) {
            const courseId = parseInt(filterValue.split('-')[1]);
            filteredTasks = tasks.filter(t => t.courseId === courseId);
        }

        const priorityMap = { high: 3, medium: 2, low: 1 };
        if (sortValue === 'priority') {
            filteredTasks.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));
        } else if (sortValue === 'name') {
            filteredTasks.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        }

        if(todoColumnList) todoColumnList.innerHTML = '';
        if(inProgressColumnList) inProgressColumnList.innerHTML = '';
        if(missedColumnList) missedColumnList.innerHTML = '';
        if(completedColumnList) completedColumnList.innerHTML = '';

        let todoCount = 0;
        let inProgressCount = 0;
        let missedCount = 0;
        let completedCount = 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (filteredTasks && filteredTasks.length > 0) {
            filteredTasks.forEach(task => {
                const [year, month, day] = task.dueDate.split('-').map(Number);
                const taskDueDate = new Date(year, month - 1, day); 

                let cardHTML = '';
                let computedStatus = task.status;

                if (taskDueDate < todayStart && task.status !== 'completed') {
                    computedStatus = 'missed';
                    cardHTML = createTaskCardHTML(task, computedStatus);
                    if(missedColumnList) missedColumnList.insertAdjacentHTML('beforeend', cardHTML);
                    missedCount++;
                
                } else if (task.status === 'completed') {
                    cardHTML = createTaskCardHTML(task, computedStatus);
                    if(completedColumnList) completedColumnList.insertAdjacentHTML('beforeend', cardHTML);
                    completedCount++;

                } else if (task.status === 'inprogress') {
                    cardHTML = createTaskCardHTML(task, computedStatus);
                    if(inProgressColumnList) inProgressColumnList.insertAdjacentHTML('beforeend', cardHTML);
                    inProgressCount++;

                } else { 
                    cardHTML = createTaskCardHTML(task, computedStatus);
                    if(todoColumnList) todoColumnList.insertAdjacentHTML('beforeend', cardHTML);
                    todoCount++;
                }
            });
        } else {
             if(todoColumnList) todoColumnList.innerHTML = '<p class="no-tasks-message">No tasks match your filter!</p>';
        }

        updateColumnHeaders(todoCount, inProgressCount, completedCount, missedCount);
        addDragAndDropListeners(); 
    }

    function updateColumnHeaders(todo, inprogress, completed, missed) {
        const todoHeader = document.getElementById("column-todo")?.querySelector("h2");
        const inProgressHeader = document.getElementById("column-inprogress")?.querySelector("h2");
        const missedHeader = document.getElementById("column-missed")?.querySelector("h2"); 
        const completedHeader = document.getElementById("column-completed")?.querySelector("h2");

        if(todoHeader) todoHeader.textContent = `To Do (${todo})`;
        if(inProgressHeader) inProgressHeader.textContent = `In Progress (${inprogress})`;
        if(missedHeader) missedHeader.textContent = `Missed Deadline (${missed})`; 
        if(completedHeader) completedHeader.textContent = `Completed (${completed})`;
    }

    function handleDeleteTask(taskId) {
         const taskToDelete = dataService.getAllTasks().find(t => t.id === taskId);
         if (confirm(`Are you sure you want to delete task "${taskToDelete?.name || 'this task'}"?`)) {
             dataService.deleteTask(taskId); 
             loadAndRenderTasks(); 
         }
    }


    let draggedItem = null; 

    function addDragAndDropListeners() {
        const taskCards = tasksBoard.querySelectorAll('.task-card:not(.missed-deadline, [draggable="false"])'); 
        const columns = tasksBoard.querySelectorAll('.task-column');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        columns.forEach(column => {
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('dragenter', handleDragEnter);
            column.addEventListener('dragleave', handleDragLeave);
            column.addEventListener('drop', handleDrop);
        });
    }

    function handleDragStart(e) {
        if (e.target.matches('.task-complete-checkbox, .btn-delete-task, .btn-edit-task')) {
            e.preventDefault();
            return;
        }
        draggedItem = this; 
        setTimeout(() => this.style.display = 'none', 0); 
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
       setTimeout(() => {
           if(draggedItem) { 
                draggedItem.style.display = 'grid'; 
           }
            draggedItem = null; 
            tasksBoard.querySelectorAll('.task-column').forEach(col => col.classList.remove('drag-over'));
        }, 0);
    }


    function handleDragOver(e) {
        e.preventDefault(); 
        const targetColumn = e.target.closest('.task-column');
        if (targetColumn && (targetColumn.id === 'column-completed' || targetColumn.id === 'column-missed')) {
             e.dataTransfer.dropEffect = 'none';
        } else {
             e.dataTransfer.dropEffect = 'move';
        }
    }

    function handleDragEnter(e) {
        e.preventDefault();
        const targetColumn = this.closest('.task-column');
        if (targetColumn && targetColumn.id !== 'column-completed' && targetColumn.id !== 'column-missed') {
            this.classList.add('drag-over'); 
        }
    }

    function handleDragLeave(e) {
        if (e.target === this || !this.contains(e.relatedTarget)) {
             this.classList.remove('drag-over');
        }
    }


    function handleDrop(e) {
        e.preventDefault(); 
        e.stopPropagation(); 

        this.classList.remove('drag-over'); 

        if (this.id === 'column-completed' || this.id === 'column-missed') {
             if (draggedItem) {
                draggedItem.style.display = 'grid'; 
                draggedItem = null;
             }
             return;
        }

        if (draggedItem && this.classList.contains('task-column')) {
            const taskId = parseInt(draggedItem.dataset.taskId);
            let newStatus = 'todo'; 

            if (this.id === 'column-inprogress') {
                newStatus = 'inprogress';
            }
            
            dataService.updateTaskStatus(taskId, newStatus);
            loadAndRenderTasks();
            console.log(`Task ${taskId} dropped into ${this.id}, status updated to ${newStatus}`);
        }
        
        if (draggedItem) {
            draggedItem.style.display = 'grid'; 
            draggedItem = null;
        }
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", () => openModal(null)); 
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (addTaskModal) {
        addTaskModal.addEventListener("click", (e) => {
            if (e.target === addTaskModal) closeModal();
        });
    }

    if (taskForm) taskForm.addEventListener("submit", handleTaskFormSubmit);


    if (tasksBoard) {
        tasksBoard.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.btn-delete-task');
            const editButton = e.target.closest('.btn-edit-task'); 

            if (deleteButton) {
                const taskId = parseInt(deleteButton.dataset.taskId);
                if (!isNaN(taskId)) { 
                    handleDeleteTask(taskId);
                }
            }
            
            if (editButton) {
                const taskId = parseInt(editButton.dataset.taskId);
                if (!isNaN(taskId)) {
                    const taskToEdit = dataService.getAllTasks().find(t => t.id === taskId);
                    if (taskToEdit) {
                        openModal(taskToEdit); 
                    }
                }
            }
        });

        tasksBoard.addEventListener('change', (e) => {
            const checkbox = e.target.closest('.task-complete-checkbox');
            if (checkbox) {
                const taskId = parseInt(checkbox.dataset.taskId);
                const isChecked = checkbox.checked;
                
                if (!isNaN(taskId)) {
                    const task = dataService.getAllTasks().find(t => t.id === taskId);
                    const wasCompleted = task.status === 'completed';
                    const newStatus = isChecked ? 'completed' : 'todo'; 
                    
                    dataService.updateTaskStatus(taskId, newStatus);
                    
                 
                    const taskDueDate = task.dueDate;
                    if (isChecked && !wasCompleted) {
                        dataService.logStudySession('task', 0, taskDueDate);
                    } else if (!isChecked && wasCompleted) {
                        dataService.removeStudySession('task', taskDueDate);
                    }
                    
                    loadAndRenderTasks(); 
                }
            }
        });
    }
    

    if (filterBySelect) {
        filterBySelect.addEventListener("change", loadAndRenderTasks);
    }
    if (sortBySelect) {
        sortBySelect.addEventListener("change", loadAndRenderTasks);
    }



    function initializeTasksPage() {
        populateCourseDropdown(); 
        populateFilterDropdown(); 
        loadAndRenderTasks();

        const params = new URLSearchParams(window.location.search);
        if (params.get('addTask') === 'true') {
            openModal(null);
        }
   

}
 initializeTasksPage(); 
});