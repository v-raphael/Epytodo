const express = require("express");
const cors = require("cors");

const app = express();
const API_URL = "http://localhost:3000";

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Helper : forward a request to epytodo (port 3000)
// ─────────────────────────────────────────────
async function proxyRequest(req, res, method, path, body = null) {
    try {
        const options = {
            method,
            headers: { "Content-Type": "application/json" }
        };

        // Forward the Authorization header (JWT token) if present
        if (req.headers.authorization) {
            options.headers["Authorization"] = req.headers.authorization;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${path}`, options);

        let data;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        res.status(response.status).json(data);
    } catch (err) {
        console.error(`Proxy error [${method} ${path}]:`, err.message);
        res.status(500).json({ error: "Proxy failed", details: err.message });
    }
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

// POST /register
app.post("/register", async (req, res) => {
    await proxyRequest(req, res, "POST", "/register", req.body);
});

// POST /login
app.post("/login", async (req, res) => {
    await proxyRequest(req, res, "POST", "/login", req.body);
});

// ─────────────────────────────────────────────
// TODOS  →  /todos
// ─────────────────────────────────────────────

// GET /todos — récupérer tous les todos
app.get("/todos", async (req, res) => {
    await proxyRequest(req, res, "GET", "/todos");
});

// GET /todos/:id — récupérer un todo par son id
app.get("/todos/:id", async (req, res) => {
    await proxyRequest(req, res, "GET", `/todos/${req.params.id}`);
});

// POST /todos — créer un nouveau todo
app.post("/todos", async (req, res) => {
    await proxyRequest(req, res, "POST", "/todos", req.body);
});

// PUT /todos/:id — mettre à jour un todo
app.put("/todos/:id", async (req, res) => {
    await proxyRequest(req, res, "PUT", `/todos/${req.params.id}`, req.body);
});

// DELETE /todos/:id — supprimer un todo
app.delete("/todos/:id", async (req, res) => {
    await proxyRequest(req, res, "DELETE", `/todos/${req.params.id}`);
});

// ─────────────────────────────────────────────
// USER  →  /user  (profil de l'utilisateur connecté)
// ─────────────────────────────────────────────

// GET /user — infos de l'utilisateur connecté (via token)
app.get("/user", async (req, res) => {
    await proxyRequest(req, res, "GET", "/user");
});

// GET /user/todos — todos de l'utilisateur connecté
app.get("/user/todos", async (req, res) => {
    await proxyRequest(req, res, "GET", "/user/todos");
});

// ─────────────────────────────────────────────
// USERS  →  /users  (gestion par id / email)
// ─────────────────────────────────────────────

// GET /users/:id — récupérer un utilisateur par id ou email
app.get("/users/:id", async (req, res) => {
    await proxyRequest(req, res, "GET", `/users/${req.params.id}`);
});

// PUT /users/:id — mettre à jour un utilisateur
app.put("/users/:id", async (req, res) => {
    await proxyRequest(req, res, "PUT", `/users/${req.params.id}`, req.body);
});

// DELETE /users/:id — supprimer un utilisateur
app.delete("/users/:id", async (req, res) => {
    await proxyRequest(req, res, "DELETE", `/users/${req.params.id}`);
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
app.listen(5000, "0.0.0.0", () => {
    console.log("Proxy API running on port 5000");
    console.log(`Forwarding requests to epytodo on port 3000`);
});