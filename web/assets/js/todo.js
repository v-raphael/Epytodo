const API_URL = "http://localhost:5000";

let currentFilter = "my";
let todos = [];

function getToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("token="))
        ?.split("=")[1];
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

const toApiStatus = s => s.replace(/-/g, " ");
const toFrontStatus = s => s.replace(/ /g, "-");

function formatDue(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const STATUS_LABELS = {
    "not-started": "Not started",
    "todo": "Todo",
    "in-progress": "In progress",
    "done": "Done"
};

const STATUS_CLASSES = {
    "not-started": "pill-not-started",
    "todo": "pill-todo",
    "in-progress": "pill-in-progress",
    "done": "pill-done"
};

function showToast(msg, isError = false) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;
            color:#fff;font-size:14px;z-index:9999;opacity:0;transition:opacity .3s;
            max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.2);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? "#ef4444" : "#22c55e";
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 2800);
}

function extractArray(data) {
    if (!data) return [];
    if (Array.isArray(data) && data[0]?.temp !== undefined)
        return Array.isArray(data[0].temp) ? data[0].temp : [data[0].temp];
    if (Array.isArray(data) && data[0]?.todos !== undefined) {
        const inner = data[0].todos;
        return Array.isArray(inner) ? inner : (inner ? [inner] : []);
    }
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && !data.msg) return [data];
    return [];
}

async function fetchMyTodos() {
    const res = await fetch(`${API_URL}/user/todos`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return extractArray(data).map(normalizeTodo);
}

async function fetchAllTodos() {
    const res = await fetch(`${API_URL}/todos`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return extractArray(data).map(normalizeTodo);
}

async function fetchTodos() {
    try {
        todos = currentFilter === "all-tasks"
            ? await fetchAllTodos()
            : await fetchMyTodos();
        renderList();
    } catch (err) {
        console.error("fetchTodos error:", err);
        showToast("Failed to load tasks.", true);
    }
}

function normalizeTodo(t) {
    return {
        id: String(t.id),
        name: t.title || t.name || "",
        status: toFrontStatus(t.status || "not started"),
        description: t.description || "",
        due: t.due_time || t.due || null
    };
}

async function createTodo(name, status, description, due) {
    const body = {
        title: name,
        description: description || "",
        due_time: due || null,
        status: toApiStatus(status)
    };

    const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || `HTTP ${res.status}`);
    }
    return res.json();
}

async function deleteTodo(id) {
    const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || `HTTP ${res.status}`);
    }
    return res.json();
}

function renderTodoItem(todo) {
    const item = document.createElement("div");
    item.className = "todo-item";
    item.dataset.id = todo.id;

    const due = todo.due ? `<div class="todo-due">${formatDue(todo.due)}</div>` : "";

    const desc = todo.description ? `<p class="todo-desc">${escapeHtml(todo.description)}</p>` : "";

    item.innerHTML = `
        <div class="todo-body">
            <div class="todo-top">
                <span class="todo-name">${escapeHtml(todo.name)}</span>
                <span class="pill todo-pill ${STATUS_CLASSES[todo.status]}">${STATUS_LABELS[todo.status]}</span>
            </div>
            ${desc}
            ${due}
        </div>
        <div class="todo-actions">
            <button class="icon-btn delete delete-btn" data-id="${todo.id}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `;
    return item;
}

function renderList() {
    const list = document.getElementById("todoList");
    list.innerHTML = "";

    const statusFilters = ["not-started", "todo", "in-progress", "done"];
    const filtered = statusFilters.includes(currentFilter)
        ? todos.filter(t => t.status === currentFilter)
        : todos;

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center;opacity:.5;margin-top:2rem;">No tasks to display.</p>`;
        return;
    }

    filtered.forEach(todo => list.appendChild(renderTodoItem(todo)));
}

function getFormValues() {
    const name = document.getElementById("todoName").value.trim();
    const status = document.querySelector("input[name=\"status\"]:checked")?.value || "not-started";
    const description = document.getElementById("todoDesc").value.trim();
    const due = document.getElementById("todoDue").value;
    return { name, status, description, due };
}

function clearForm() {
    document.getElementById("todoName").value = "";
    document.getElementById("todoDesc").value = "";
    document.getElementById("todoDue").value = "";
    const defaultRadio = document.querySelector("input[name=\"status\"][value=\"not-started\"]");
    if (defaultRadio) defaultRadio.checked = true;
}

document.getElementById("addBtn").addEventListener("click", async () => {
    const { name, status, description, due } = getFormValues();
    if (!name) {
        const input = document.getElementById("todoName");
        input.focus();
        input.style.borderColor = "#ef4444";
        setTimeout(() => input.style.borderColor = "", 1500);
        return;
    }

    const btn = document.getElementById("addBtn");
    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
        await createTodo(name, status, description, due);
        clearForm();
        await fetchTodos();
        showToast("Task added!");
    } catch (err) {
        console.error("createTodo error:", err);
        showToast("Error adding task: " + err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = "+ Add task";
    }
});

document.getElementById("todoList").addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-btn");

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (!confirm("Delete this task?")) return;
        try {
            await deleteTodo(id);
            await fetchTodos();
            showToast("Task deleted.");
        } catch (err) {
            console.error("deleteTodo error:", err);
            showToast("Error deleting task: " + err.message, true);
        }
    }
});

document.getElementById("filters").addEventListener("click", async (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const prev = currentFilter;
    currentFilter = btn.dataset.filter;

    const sourceChanged =
        (prev === "all-tasks" && currentFilter !== "all-tasks") ||
        (prev !== "all-tasks" && currentFilter === "all-tasks");

    if (sourceChanged) {
        await fetchTodos();
    } else {
        renderList();
    }
});

fetchTodos();