
document.addEventListener("DOMContentLoaded", () => {
    
  
    function loadDateDisplay() {
        const currentDateDisplay = document.getElementById("current-date-display");
        
        if (currentDateDisplay) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
        }
    }

    loadDateDisplay();

});


