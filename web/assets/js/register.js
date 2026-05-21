const send = document.querySelector(".btn-register");

send.addEventListener("click", register);

async function register(event) {

    event.preventDefault();

    const firstname = document.getElementById("firstname").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:5000/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                firstname,
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {

            document.cookie = `token=${data.token}; path=/; max-age=86400`;

            window.location.href = "/todos/todo.html";

        } else {
            alert("No token received or error during registration");
        }

    } catch (e) {
        console.error(e);
        alert("Unable to connect to server");
    }
}