(async function verifyAccess() {
    const token = localStorage.getItem("token");
    const splash = document.getElementById('splash-screen');
    const content = document.getElementById('main-content');
    const container = document.querySelector('.container');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text');

    // Change to "" when you deploy to Render
    const API_URL = ""; 

    if (!token) {
        window.location.replace("index.html");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/dashboard-data`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            
            // 1. Inject server data
            if (welcomeMessage) welcomeMessage.innerText = `My Dearest ${data.user},`;
            if (questionText) questionText.innerText = data.message;

            // 2. Prepare the reveal
            if (container) {
                container.style.setProperty("display", "block", "important");
                container.style.setProperty("opacity", "1", "important");
            }
            if (content) {
                content.style.setProperty("display", "block", "important");
                content.style.setProperty("opacity", "1", "important");
            }

            // 3. Smooth Fade Out of Splash Screen
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => {
                    splash.style.display = "none";
                    document.body.style.overflow = "auto";
                }, 800);
            }, 1000); // Partner sees the heart for at least 1 second

        } else {
            throw new Error("Invalid Token");
        }
    } catch (e) {
        // Hacker Path: Clear token and kick out after a small delay
        localStorage.removeItem("token");
        setTimeout(() => {
            window.location.replace("index.html");
        }, 1200); 
    }
})();

function handleYes() {
    const questionContainer = document.querySelector('.proposal-question');
    if (questionContainer) {
        questionContainer.innerHTML = "I am the happiest person alive! ❤️💍";
        questionContainer.style.color = "#2ecc71";
    }
    alert("She said YES!");
}

function handleNo() {
    alert("Take all the time you need, my love.");
}

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}