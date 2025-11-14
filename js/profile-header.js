import { dataService } from './data.js';


function updateProfileIcon(element, profile) {
    if (!element) return;

    element.textContent = "";
    element.style.backgroundImage = "";
    element.style.backgroundColor = "";
    element.style.borderRadius = "";

    if (profile.profilePictureUrl) {

        element.style.backgroundImage = `url(${profile.profilePictureUrl})`;
        element.style.borderRadius = "50%"; 
        element.style.backgroundColor = "#eee";
    } else {

        element.style.backgroundColor = profile.cardColor || "#888";
        element.style.borderRadius = "50%"; 
        element.textContent = profile.avatar || (profile.name || "S").charAt(0).toUpperCase();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const profile = dataService.getProfile();
    if (!profile) return;

    const headerProfileButton = document.querySelector(".profile-button");
    if (!headerProfileButton) return; 
    updateProfileIcon(headerProfileButton, profile);

    headerProfileButton.addEventListener('click', () => {

        window.location.href = 'dashboard.html'; 
    });
});