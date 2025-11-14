class DataService {
    constructor() {
        this.COURSES_KEY = "studyKartCourses";
        this.PROFILE_KEY = "studyKartProfile";
        this.TASKS_KEY = "studyKartTasks";
        this.GAMIFICATION_KEY = "studyKartGamification"; 
    }



    saveProfile(profileData) {
        try {
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profileData));
        } catch (e) {
            console.error("Error saving profile to localStorage:", e);
        }
    }

    getProfile() {
        try {
            const data = localStorage.getItem(this.PROFILE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error getting profile from localStorage:", e);
            return null;
        }
    }


    getAllCourses() {
        try {
            const data = localStorage.getItem(this.COURSES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error getting courses from localStorage:", e);
            return [];
        }
    }

    _saveAllCourses(coursesArray) {
        try {
            localStorage.setItem(this.COURSES_KEY, JSON.stringify(coursesArray));
        } catch (e) {
            console.error("Error saving courses to localStorage:", e);
        }
    }

    saveCourse(courseData) {
        const courses = this.getAllCourses();
        const index = courses.findIndex(c => c.id === courseData.id);
        
        // --- THIS IS THE FIX ---
        // When editing, make sure to merge with old data to preserve
        // links, files, and studySets that aren't in the edit form.
        if (index !== -1) {
            const oldCourse = courses[index];
            courses[index] = { ...oldCourse, ...courseData }; 
        } else {
            // When creating, add the new empty arrays
            courseData.links = [];
            courseData.files = [];
            courseData.studySets = [];
            courses.push(courseData);
        }
        // --- END OF FIX ---

        this._saveAllCourses(courses);
    }

    deleteCourse(courseId) {
        let courses = this.getAllCourses();
        courses = courses.filter(c => c.id !== courseId);
        this._saveAllCourses(courses);
    }

    getCourseById(courseId) {
        const idToFind = Number(courseId);
        const courses = this.getAllCourses();
        return courses.find(c => c.id === idToFind) || null;
    }

    getAllTasks() {
        try {
            const data = localStorage.getItem(this.TASKS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error getting tasks from localStorage:", e);
            return [];
        }
    }

    _saveAllTasks(tasksArray) {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasksArray));
        } catch (e) {
            console.error("Error saving tasks to localStorage:", e);
        }
    }

    saveTask(taskData) {
        const tasks = this.getAllTasks();
        const index = tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            tasks[index] = taskData; // Update existing
            console.log("Updating task:", taskData.id);
        } else {
            tasks.push(taskData); // Add new
            console.log("Adding new task:", taskData.id);
        }
        this._saveAllTasks(tasks);
    }

    deleteTask(taskId) {
        let tasks = this.getAllTasks();
        const idToDelete = Number(taskId);
        tasks = tasks.filter(t => t.id !== idToDelete);
        this._saveAllTasks(tasks);
        console.log("Deleted task:", taskId);
    }

    updateTaskStatus(taskId, newStatus) {
        const tasks = this.getAllTasks();
        const idToUpdate = Number(taskId);
        const task = tasks.find(t => t.id === idToUpdate);
        if (task && ['todo', 'inprogress', 'completed'].includes(newStatus)) { 
            task.status = newStatus;
            this._saveAllTasks(tasks);
            console.log(`Updated task ${taskId} status to ${newStatus}`);
        } else {
            console.error(`Task not found or invalid status: ${taskId}, ${newStatus}`);
        }
    }

 
  
    getGamificationData() {
        try {
            const data = localStorage.getItem(this.GAMIFICATION_KEY);
            if (data) {
                return JSON.parse(data);
            } else {
                return {
                    studyHistory: {} 
                };
            }
        } catch (e) {
            console.error("Error getting gamification data:", e);
            return null;
        }
    }

    
    saveGamificationData(data) {
        try {
            localStorage.setItem(this.GAMIFICATION_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving gamification data:", e);
        }
    }

    _getTodayISO() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    getTodayFocusSeconds() {
        const data = this.getGamificationData();
        const today = this._getTodayISO();
        if (data && data.studyHistory && data.studyHistory[today]) {
            return data.studyHistory[today].totalSeconds || 0;
        }
        return 0;
    }

    logStudySession(type, seconds = 0, dateString = null) {
        const data = this.getGamificationData();
        const dayToLog = dateString ? dateString : this._getTodayISO(); 
        
    
        if (!data.studyHistory[dayToLog]) {
            data.studyHistory[dayToLog] = {
                count: 0,
                focusCount: 0,
                taskCount: 0,
                totalSeconds: 0
            };
        }
        
        if (type === 'focus') {
            data.studyHistory[dayToLog].count = (data.studyHistory[dayToLog].count || 0) + 1;
            data.studyHistory[dayToLog].focusCount = (data.studyHistory[dayToLog].focusCount || 0) + 1;
            
            if (seconds > 0) {
                if (dayToLog === this._getTodayISO()) {
                    data.studyHistory[dayToLog].totalSeconds += seconds; 
                }
            }
        } else if (type === 'task') {
            data.studyHistory[dayToLog].taskCount = (data.studyHistory[dayToLog].taskCount || 0) + 1;
        }
  
        this.saveGamificationData(data);
        console.log(`Logged ${type} session (${seconds}s) for ${dayToLog}.`);
    }

    removeStudySession(type, dateString = null) {
        const data = this.getGamificationData();
        const dayToLog = dateString ? dateString : this._getTodayISO();
        
        if (!data.studyHistory[dayToLog]) {
            return;
        }
        
        if (type === 'task' && data.studyHistory[dayToLog].taskCount > 0) {
            data.studyHistory[dayToLog].taskCount--;
            console.log(`Removed 'task' session for ${dayToLog}.`);
        } else if (type === 'focus' && data.studyHistory[dayToLog].focusCount > 0) {
            data.studyHistory[dayToLog].focusCount--;
            if (data.studyHistory[dayToLog].count > 0) {
                data.studyHistory[dayToLog].count--;
            }
            console.log(`Removed 'focus' session for ${dayToLog}.`);
        }
        
        this.saveGamificationData(data);
    }


} 


export const dataService = new DataService();