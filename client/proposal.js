(async function verifyAccess() {
    // 1. Configuration
    const token = localStorage.getItem("token");
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text');
    const loader = document.getElementById("loader");
    const content = document.getElementById("main-content");

    // Use absolute URL for local testing, change to "" for Render
    const API_URL = ""; 

    // 2. Immediate Redirect if no token exists
    if (!token) {
        window.location.replace("index.html");
        return;
    }

    try {
        // 3. Verify token with server (The Wall)
        const response = await fetch(`${API_URL}/api/dashboard-data`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // 4. Inject real data from server
            if (welcomeMessage) welcomeMessage.innerText = `My Dearest ${data.user},`;
            if (questionText) questionText.innerText = data.message;

            // 5. Reveal UI only after successful verification
            if (loader) loader.style.display = "none";
            if (content) {
                content.style.visibility = "visible";
                content.style.opacity = "1";
                content.style.display = "block";
            }
        } else {
            // Server rejected token (Hacker/Expired)
            throw new Error("Unauthorized");
        }
    } catch (e) {
        // Clear storage and kick back to login
        localStorage.removeItem("token");
        window.location.replace("index.html");
    }
})();

// 6. Button Interactions
function handleYes() {
    const questionContainer = document.querySelector('.proposal-question');
    if (questionContainer) {
        questionContainer.innerHTML = "I am the happiest person alive! ❤️💍";
        questionContainer.style.color = "#2ecc71";
    }
    alert("She said YES!");
}

function handleNo() {
    const noBtn = document.querySelector('.no-btn');
    alert("Take all the time you need, my love.");
    if (noBtn) {
        noBtn.innerText = "Still thinking...";
        noBtn.style.opacity = "0.5";
        noBtn.disabled = true;
    }
}

// 7. Logout
function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}