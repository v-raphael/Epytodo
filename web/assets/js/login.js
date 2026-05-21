const send = document.querySelector(".btn-login");

send.addEventListener("click", login);

async function login(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:5000/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log(data);

        if (response.ok && data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=86400`;
            window.location.href = "/todos/todo.html"
        } else {
            alert("Error during registration");
        }

    } catch (e) {

        console.error(e);

        alert("Unable to connect to server");
    }
}