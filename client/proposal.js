(async function verifyAccess() {
    const splash = document.getElementById('splash-screen');
    const content = document.getElementById('main-content');
    const container = document.querySelector('.container');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text');

    try {
        // SSR MAGIC: No need to manually send headers! 
        // The browser automatically sends the 'token' cookie.
        const response = await fetch("/api/dashboard-data");

        if (response.ok) {
            const data = await response.json();
            
            // 1. Inject server data
            if (welcomeMessage) welcomeMessage.innerText = `My Dearest ${data.user},`;
            if (questionText) questionText.innerText = data.message;

            // 2. Prepare the Reveal
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
            }, 1000); 

        } else {
            // If the API says no, redirect to login
            throw new Error("Unauthorized");
        }
    } catch (e) {
        window.location.replace("/");
    }
})();

// Button Interactions
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
    // Call the logout route to clear the cookie
    fetch("/api/logout", { method: "POST" })
        .then(() => {
            localStorage.removeItem("token");
            window.location.replace("/");
        });
}