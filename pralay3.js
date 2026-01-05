window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("main-content").style.display = "block";
    }, 1000);
});
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    let msb  = document.getElementById("messageBOX");
    let msg  = document.getElementById("message");

    msb.className="";
    msg.className="";

    if (user == "" && pass == "") {
        msg.innerText = " Please fill out "
        msg.classList.add("warning");
    }
    else if (user === "admin" && pass === "admin") {
        msg.innerText = " ";
        msg.classList.add("success");
        window.location.href = "http://127.0.0.1:3000/Web Structure/index.html?serverWindowId=a4b8dd76-bfb3-4ef5-9f6a-b4b8bf6c18b5";
    } else {
        msg.innerText = " Incorrect-Credentials";
        msg.classList.add("wrong");
    }
    msb.classList.remove("hidden");
    setTimeout(()=> {
        msb.classList.add("hidden");
        msg.innerText="";
    },
    2000);
}