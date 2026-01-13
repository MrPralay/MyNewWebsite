async function startProposal() {
    const splash = document.getElementById('splash-screen');
    const container = document.getElementById('main-container');
    const welcome = document.getElementById('welcomeMessage');
    const proposal = document.getElementById('proposal-text');

    try {
        const response = await fetch("/api/dashboard-data");
        
        if (response.ok) {
            const data = await response.json();
            
            // 1. Inject the data from server
            if (welcome) welcome.innerText = `My Dearest ${data.user},`;
            if (proposal) proposal.innerText = data.message;

            // 2. Unlock the container (it's currently display:none)
            if (container) {
                container.style.display = "block";
                // Small delay to allow opacity transition to work
                setTimeout(() => { container.style.opacity = "1"; }, 100);
            }

            // 3. Fade out the splash screen
            setTimeout(() => {
                if (splash) {
                    splash.style.opacity = "0";
                    setTimeout(() => {
                        splash.style.display = "none";
                    }, 1000);
                }
            }, 2500); // 2.5 seconds gives time to see the heart

        } else {
            // If the server says no cookie/invalid token
            window.location.replace("/");
        }
    } catch (err) {
        console.error("Error loading dashboard:", err);
        window.location.replace("/");
    }
}

// --- Interaction Functions ---

function handleYes() {
    const questionDiv = document.getElementById('proposal-text');
    if (questionDiv) {
        questionDiv.innerHTML = "<h2 style='color: #d63384; font-family: \"Parisienne\", cursive;'>I am the happiest person alive! ❤️💍</h2>";
    }
    // You can add confetti or other effects here later!
    alert("She said YES!");
}

function handleNo() {
    alert("Take all the time you need, my love. I'll always be here.");
}

function logout() {
    // We call the server to clear the cookie
    fetch("/api/logout", { method: "POST" })
    .then(() => {
        // Clear local storage just in case
        localStorage.removeItem("token");
        // Go back to login
        window.location.replace("/");
    })
    .catch(err => {
        window.location.replace("/");
    });
}

// --- Start the sequence ---
startProposal();