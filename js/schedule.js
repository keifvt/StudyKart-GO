import { dataService } from './data.js';

document.addEventListener("DOMContentLoaded", () => {

    const HOUR_HEIGHT_PX = 60;
    
    const timeLabelsCol = document.getElementById("time-labels-col");
    const legendContainer = document.getElementById("schedule-legend");
    const scheduleGrid = document.querySelector(".schedule-grid"); 
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
        

        block.dataset.courseId = course.id; 
        block.style.cursor = "pointer"; 

        
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

    function exportScheduleToPDF() {
    const { jsPDF } = window.jspdf;
    const exportBtn = document.getElementById("export-pdf-btn");
    const scheduleGrid = document.querySelector(".schedule-grid");
    const legendContainer = document.getElementById("schedule-legend");
    const pageHeader = document.querySelector(".page-header");

    if (!scheduleGrid || !legendContainer || !pageHeader) {
        console.error("Missing elements to export!");
        return;
    }

    console.log("Generating PDF...");
    exportBtn.textContent = "Generating...";
    exportBtn.disabled = true;

    Promise.all([
        html2canvas(pageHeader),
        html2canvas(legendContainer),
        html2canvas(scheduleGrid, { scale: 2 })
    ]).then(([headerCanvas, legendCanvas, gridCanvas]) => {
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
        });

        const pagePadding = 20;
        const pdfWidth = pdf.internal.pageSize.getWidth() - (pagePadding * 2);
        
        let pdf_y_position = pagePadding;
        const headerHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
        pdf.addImage(headerCanvas.toDataURL('image/png'), 'PNG', pagePadding, pdf_y_position, pdfWidth, headerHeight);
        pdf_y_position += headerHeight + 10;

        const legendHeight = (legendCanvas.height * pdfWidth) / legendCanvas.width;
        pdf.addImage(legendCanvas.toDataURL('image/png'), 'PNG', pagePadding, pdf_y_position, pdfWidth, legendHeight);
        pdf_y_position += legendHeight + 10;
        
        const gridHeight = (gridCanvas.height * pdfWidth) / gridCanvas.width;
        pdf.addImage(gridCanvas.toDataURL('image/png'), 'PNG', pagePadding, pdf_y_position, pdfWidth, gridHeight);
        
        pdf.save("StudyKart-Schedule.pdf");

        console.log("PDF generated!");
        exportBtn.textContent = "Export PDF";
        exportBtn.disabled = false;

    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("Sorry, an error occurred while generating the PDF.");
        exportBtn.textContent = "Export PDF";
        exportBtn.disabled = false;
    });
}

    function init() {
        loadData();
        renderSchedule();

        const exportBtn = document.getElementById("export-pdf-btn");
        if (exportBtn) {
            exportBtn.addEventListener("click", exportScheduleToPDF);
        }
        
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
