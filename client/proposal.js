// This runs as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // 1. Personalize the Greeting by decoding the JWT
    try {
        if (token) {
            // Decodes the middle part of the JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            if (payload.username && welcomeMessage) {
                welcomeMessage.innerText = `My Dearest ${payload.username},`;
            }
        }
    } catch (e) {
        console.error("Token decoding failed:", e);
    }
});

// 2. Logic for the 'Yes' Button
function handleYes() {
    const questionContainer = document.querySelector('.proposal-question');
    if (questionContainer) {
        questionContainer.innerHTML = "I am the happiest person alive! ❤️💍";
        questionContainer.style.color = "#2ecc71";
    }
    alert("She said YES! My heart is full. I love you forever!");
}

// 3. Logic for the 'No' Button
function handleNo() {
    const noBtn = document.querySelector('.no-btn');
    alert("Take all the time you need, my love. My heart belongs to you regardless. 😊");
    
    if (noBtn) {
        noBtn.innerText = "Still thinking...";
        noBtn.style.opacity = "0.5";
        noBtn.disabled = true;
    }
}

// 4. Logout Function
function logout() {
    if (confirm("Are you sure you want to leave this moment?")) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
}