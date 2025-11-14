
import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    let coursesData = [];
    let currentCourseId = null;

    const courseTabsContainer = document.getElementById("course-tabs-container");
    const gradeDetailsContainer = document.getElementById("grade-details-container");

    const addEntryModal = document.getElementById("add-entry-modal");
    const addEntryForm = document.getElementById("add-entry-form");
    const cancelEntryBtn = document.getElementById("cancel-entry-btn");
    const closeModalBtn = addEntryModal.querySelector(".btn-close-modal");
    const componentNameHiddenInput = document.getElementById("entry-component-name");

    
    function loadData() {
        const data = dataService.getAllCourses();
        
        if (data) {
            coursesData = data;
            if (!currentCourseId && coursesData.length > 0) {
                currentCourseId = coursesData[0].id;
            }
        }
    }

    function renderCourseTabs() {
        courseTabsContainer.innerHTML = "";
        coursesData.forEach(course => {
            const tab = document.createElement("button");
            tab.className = "course-tab";
            tab.textContent = course.name;
            tab.dataset.id = course.id;
            if (course.id === currentCourseId) {
                tab.classList.add("active");
                tab.style.setProperty('--active-course-color', course.color);
            }
            tab.addEventListener("click", () => handleTabClick(course.id));
            courseTabsContainer.appendChild(tab);
        });
    }

    function renderGradeDetails(courseId) {
        const course = coursesData.find(c => c.id === courseId);
        if (!course) {
            gradeDetailsContainer.innerHTML = "<p>Select a course to see grade details.</p>";
            return;
        }
        gradeDetailsContainer.innerHTML = "";
        let overallFinalGrade = 0;
        const headerCard = document.createElement("div");
        headerCard.className = "course-header-card";
        headerCard.innerHTML = `
            <h2>Grade Breakdown for ${course.name}</h2>
            <p>${course.professor || ''}</p>
        `;
        gradeDetailsContainer.appendChild(headerCard);
        course.gradingWeights.forEach(component => {
            const { componentPercent, weightedGrade } = calculateComponentGrade(component);
            overallFinalGrade += weightedGrade;
            const card = document.createElement("div");
            card.className = "component-card";
            let headerHTML = `
                <div class="component-header">
                    <h3>${component.name} (${component.weight}%)</h3>
                    <span>Current Contribution: ${weightedGrade.toFixed(2)}%</span>
                </div>
            `;
            let tableHTML = `
                <div class="grade-table-container">
                    <table class="grade-table">
                        <thead>
                            <tr><th>Activity</th><th>Score</th><th>Total</th><th>%</th></tr>
                        </thead>
                        <tbody>
            `;
            if (component.entries.length > 0) {
                component.entries.forEach(entry => {
                    const percent = entry.total > 0 ? (entry.score / entry.total) * 100 : 0;
                    tableHTML += `
                        <tr>
                            <td>${entry.name}</td>
                            <td>${entry.score}</td>
                            <td>${entry.total}</td>
                            <td>${percent.toFixed(0)}%</td>
                        </tr>
                    `;
                });
            } else {
                tableHTML += `<tr><td colspan="4" style="text-align: center; color: #888;">No entries added yet.</td></tr>`;
            }
            tableHTML += `</tbody></table></div>`;
            let footerHTML = `
                <div class="component-footer">
                    <button class="btn-add-entry" data-component-name="${component.name}">+ Add Entry</button>
                    </div>
            `;
            card.innerHTML = headerHTML + tableHTML + footerHTML;
            gradeDetailsContainer.appendChild(card);
        });
        const finalGradeCard = document.createElement("div");
        finalGradeCard.className = "final-grade-card";
        finalGradeCard.innerHTML = `
            <h2>Total Weighted Grade</h2>
            <div class="final-grade-value">${overallFinalGrade.toFixed(2)}%</div>
        `;
        gradeDetailsContainer.appendChild(finalGradeCard);
    }

    function calculateComponentGrade(component) {
        const totalScore = component.entries.reduce((sum, e) => sum + (e.score || 0), 0);
        const totalMax   = component.entries.reduce((sum, e) => sum + (e.total || 0), 0);
        const componentPercent = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        const weightedGrade = componentPercent * (component.weight / 100);
        return { componentPercent, weightedGrade };
    }
    
    function handleTabClick(courseId) {
        currentCourseId = courseId;
        renderCourseTabs();
        renderGradeDetails(courseId);
    }
    
    function handleEntryFormSubmit(e) {
        e.preventDefault();
        
        const componentName = componentNameHiddenInput.value;
        const activityName = document.getElementById("entry-activity-name").value;
        const score = parseFloat(document.getElementById("entry-score").value);
        const total = parseFloat(document.getElementById("entry-total").value);

        if (!activityName || isNaN(score) || isNaN(total)) {
            alert("Please fill out all fields correctly.");
            return;
        }
        
        const course = coursesData.find(c => c.id === currentCourseId);
        if (!course) return;
        const component = course.gradingWeights.find(w => w.name === componentName);
        if (!component) return;

        component.entries.push({
            name: activityName,
            score: score,
            total: total
        });
        
        dataService.saveCourse(course);

        renderGradeDetails(currentCourseId);
        closeEntryModal();
    }
    
    function openEntryModal(componentName) {
        addEntryForm.reset();
        componentNameHiddenInput.value = componentName;
        addEntryModal.querySelector("#entry-modal-title").textContent = `Add to ${componentName}`;
        addEntryModal.classList.add("active");
    }
    function closeEntryModal() {
        addEntryModal.classList.remove("active");
    }
    gradeDetailsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-add-entry")) {
            const componentName = e.target.dataset.componentName;
            openEntryModal(componentName);
        }
    });
    cancelEntryBtn.addEventListener("click", closeEntryModal);
    closeModalBtn.addEventListener("click", closeEntryModal);
    addEntryModal.addEventListener("click", (e) => {
        if (e.target === addEntryModal) closeEntryModal();
    });

    function init() {
        loadData();
        if (coursesData.length > 0) {
            renderCourseTabs();
            renderGradeDetails(currentCourseId);
        } else {
            gradeDetailsContainer.innerHTML = `<p class=\"empty-state-message\">You haven't added any courses yet. Go to the <strong>Courses</strong> tab to get started!</p>`;
        }
        
        addEntryForm.addEventListener("submit", handleEntryFormSubmit);
    }

    init();
});