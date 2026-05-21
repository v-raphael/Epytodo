function getToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("token="))
        ?.split("=")[1];
}

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;

        return Date.now() > exp;
    } catch (e) {
        return true;
    }
}

function checkAuth() {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
        document.cookie = "token=; path=/; max-age=0";
        window.location.href = "../auth/login.html";
        return;
    }
    document.body.style.display = "block";
}

checkAuth();