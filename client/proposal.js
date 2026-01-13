(async function verifyAccess() {
    // 1. Configuration
    const token = localStorage.getItem("token");
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text');
    const loader = document.getElementById("loader");
    const content = document.getElementById("main-content");
    const container = document.querySelector('.container');

    // Set to "http://localhost:5000" for local testing
    // Set to "" when you deploy to Render
    const API_URL = ""; 

    // 2. Immediate Redirect if no token exists
    if (!token) {
        window.location.replace("index.html");
        return;
    }

    try {
        // 3. Verify token with server
        const response = await fetch(`${API_URL}/api/dashboard-data`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // 4. Inject Server Data
            if (welcomeMessage) welcomeMessage.innerText = `My Dearest ${data.user},`;
            if (questionText) questionText.innerText = data.message;

            // 5. UNLOCK THE UI (The "Reveal")
            // Remove the white background lockdown
            document.body.style.setProperty("background", "", "important");
            document.documentElement.style.setProperty("background", "", "important");
            
            // Force the container and content to show using !important
            if (container) {
                container.style.setProperty("display", "block", "important");
                container.style.setProperty("opacity", "1", "important");
            }
            
            if (content) {
                content.style.setProperty("display", "block", "important");
                content.style.setProperty("opacity", "1", "important");
            }
            
            // Hide the loader
            if (loader) {
                loader.style.setProperty("display", "none", "important");
            }
            
            // Allow scrolling again
            document.body.style.setProperty("overflow", "auto", "important");

        } else {
            // Server rejected token (Burp Suite manipulation or Expired Session)
            throw new Error("Unauthorized");
        }
    } catch (e) {
        console.error("Access denied:", e);
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