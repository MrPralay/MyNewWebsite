window.addEventListener("load", () => {
    setTimeout(() => {
        // Keeping your splash/loader logic
        document.getElementById("loader").style.display = "none";
        document.getElementById("main-content").style.display = "block";
    }, 1000);
});

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
        // Ensure you have the leading slash "/" for the API call
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
            // OPTIONAL: You can still store the token in localStorage if you want
            // but the Cookie set by the server is what actually "unlocks" the SSR page.
            localStorage.setItem("token", data.token);

            // UPDATED: Standardized success message
            msg.innerText = "Login successful!";
            msg.classList.add("success");
            msb.classList.remove("hidden");

            setTimeout(() => {
                // SSR CHANGE: Redirect to the ROUTE using replace to kill history loops
                window.location.replace("/dashboard"); 
            }, 1200);
        } else {
            // UPDATED: Clear any old tokens on failure so manipulation can't reuse them
            localStorage.removeItem("token");
            
            msg.innerText = data.message || "Incorrect credentials";
            msg.classList.add("wrong");
            msb.classList.remove("hidden");
            setTimeout(() => {
                msb.classList.add("hidden");
                msg.innerText = "";
            }, 2000);
        }
    } catch (err) {
        msg.innerText = "Server error. Is backend running?";
        msg.classList.add("wrong");
        msb.classList.remove("hidden");
        setTimeout(() => {
            msb.classList.add("hidden");
            msg.innerText = "";
        }, 2000);
    }
}