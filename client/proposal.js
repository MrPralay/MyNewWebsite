// This runs as soon as the page loads
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text'); // Make sure you have this ID in HTML

    // 1. If no token at all, kick them out immediately
    if (!token) {
        window.location.href = "index.html"; 
        return;
    }

    try {
        // 2. ASK THE SERVER FOR THE SECRET DATA (The "Wall")
        // This is what stops Burp Suite. The server checks the JWT signature.
        const response = await fetch("/api/dashboard-data", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Success! Set the greeting and the secret message
            if (welcomeMessage) {
                welcomeMessage.innerText = `My Dearest ${data.user},`;
            }
            if (questionText) {
                questionText.innerText = data.message;
            }
        } else {
            // 3. HACK DETECTED! 
            // If Burp Suite was used to "fake" the login, the server will return 401/403.
            alert("Security Error: Invalid Session. Please log in properly.");
            localStorage.removeItem("token");
            window.location.href = "index.html";
        }
    } catch (e) {
        console.error("Connection failed:", e);
        window.location.href = "index.html";
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