import {pool} from "../../config/db";

export async function createTodos(
    title: string,
    description: string,
    due_time: string,
    status: string,
    user_id: number
) {
    const query = "INSERT INTO todo (title, description, due_time, status, user_id) VALUES (?, ?, ?, ?, ?)";
    const [result]: any = await pool.execute(query, [title, description, due_time, status, user_id]);
    return result.insertId;
}

export async function FindTodosByID(
    id: number
) {
    const query = "SELECT * FROM todo WHERE id = ? LIMIT 1";
    const [rows]: any = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

export async function FindTodosByUserId(
    id: number
) {
    const query = "SELECT * FROM todo WHERE user_id = ?";
    const [rows]: any = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

export async function TodosInformation() {
    const query = "SELECT * FROM todo";
    const [rows]: any = await pool.execute(query);
    return rows;
}

export async function FindTodosByData(
    title: string,
    description: string,
    due_time: string
) {
    const query = "SELECT id FROM todo WHERE title = ? AND description = ? AND due_time = ? LIMIT 1";
    const [rows]: any = await pool.execute(query, [title, description, due_time]);
    return rows.length > 0 ? rows[0].id : null;
}

export async function DeleteTodoById(
    id: number
) {
    const query = "DELETE FROM todo WHERE id = ?";
    return pool.execute(query, [id]);
}

export async function CheckTodoById(
    id: number
) {
    const [rows] = await pool.execute(
        "SELECT id, title, description, due_time, user_id FROM todo WHERE id = ? LIMIT 1",
        [id]
    );
    const results = rows as any[];
    return results.length ? results[0] : null;
}
