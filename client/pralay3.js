// 1️⃣ SPLASH SCREEN LOGIC (KEEP THIS)
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("main-content").style.display = "block";
    }, 1000);
});


// 2️⃣ LOGIN LOGIC (REPLACED OLD FAKE LOGIN)
async function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    let msb  = document.getElementById("messageBOX");
    let msg  = document.getElementById("message");

    msb.className = "";
    msg.className = "";

    if (!user || !pass) {
        msg.innerText = "Please fill out all fields";
        msg.classList.add("warning");
        msb.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);

            msg.innerText = "Login successful!";
            msg.classList.add("success");
            msb.classList.remove("hidden");

            setTimeout(() => {
                window.location.href = "proposal_dashboard.html";
            }, 1200);
        } else {
            msg.innerText = data.message || "Incorrect credentials";
            msg.classList.add("wrong");
            msb.classList.remove("hidden");
        }
    } catch (err) {
        msg.innerText = "Server error. Is backend running?";
        msg.classList.add("wrong");
        msb.classList.remove("hidden");
    }

    setTimeout(() => {
        msb.classList.add("hidden");
        msg.innerText = "";
    }, 2000);
}
