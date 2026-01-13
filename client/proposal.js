// Runs immediately when dashboard loads
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // 🚫 No token at all → kick out immediately
    if (!token) {
        window.location.replace("index.html");
        return;
    }

    try {
        // 🔐 Ask backend to VERIFY the token
        const response = await fetch("/api/dashboard-data", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // ❌ Token invalid / fake / expired
        if (!response.ok) {
            throw new Error("Invalid token");
        }

        // ✅ Token is REAL → allow dashboard
        const data = await response.json();

        const welcomeMessage = document.getElementById("welcomeMessage");
        const questionText = document.getElementById("proposal-text");

        if (welcomeMessage) {
            welcomeMessage.innerText = `My Dearest ${data.user},`;
        }

        if (questionText) {
            questionText.innerText = data.message;
        }

    } catch (err) {
        // 🚨 Any failure = logout
        console.warn("Auth failed:", err.message);
        localStorage.removeItem("token");
        window.location.replace("index.html");
    }
});


// ❤️ YES button logic
function handleYes() {
    const box = document.querySelector(".proposal-question");
    if (box) {
        box.innerHTML = "I am the happiest person alive! ❤️💍";
        box.style.color = "#2ecc71";
    }
}


// 🙂 NO button logic
function handleNo() {
    const noBtn = document.querySelector(".no-btn");
    alert("Take all the time you need 😊");

    if (noBtn) {
        noBtn.innerText = "Still thinking...";
        noBtn.disabled = true;
        noBtn.style.opacity = "0.6";
    }
}


// 🚪 Logout
function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}
