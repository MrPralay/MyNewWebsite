(async function initProposal() {
    const splash = document.getElementById('splash-screen');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const questionText = document.getElementById('proposal-text');

    try {
        // Fetch data using the cookie automatically
        const response = await fetch("/api/dashboard-data");

        if (response.ok) {
            const data = await response.json();
            
            // Inject data
            if (welcomeMessage) welcomeMessage.innerText = `My Dearest ${data.user},`;
            if (questionText) questionText.innerText = data.message;

            // Reveal the content
            document.querySelector('.container').style.display = "block";

            // Smooth Fade Out of Splash
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => {
                    splash.style.display = "none";
                }, 800);
            }, 1500); // Give them a moment to see the heart

        } else {
            window.location.replace("/");
        }
    } catch (e) {
        window.location.replace("/");
    }
})();

function handleYes() {
    document.querySelector('.proposal-question').innerHTML = "I am the happiest person alive! ❤️💍";
    alert("She said YES!");
}

function logout() {
    fetch("/api/logout", { method: "POST" }).then(() => {
        window.location.replace("/");
    });
}