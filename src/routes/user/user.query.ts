import {pool} from "../../config/db";
import bcrypt from "bcryptjs";

export async function registerUser(
    email: string,
    password: string,
    name: string,
    firstname: string
) {
    const query = "INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)";
    return pool.execute(query, [email, password, name, firstname]);
}

export async function UpdateUserById(
    id: number,
    email: string,
    password: string,
    name: string,
    firstname: string
) {
    const hpassword = await bcrypt.hash(password, 10);
    const query = "UPDATE user SET email = ?, password = ?, firstname = ?, name = ?";
    const [rows]: any = await pool.execute(query, [email, hpassword, name, firstname])
    return rows.affectedRows;
}

export async function DeleteById(id: number)
{
    const query = "DELETE FROM user WHERE id = ?";
    const [rows]: any = await pool.execute(query, [id]);
    return rows.affectedRows;
}

export async function UserById(id: number)
{
    const query = "SELECT * FROM user WHERE id = ? LIMIT 1";
    const [rows]: any = await pool.execute(query, [id]);
    return rows.lenght > 0 ? rows[0] : null;
}

export async function UsersInformation() {
    const query = "SELECT * FROM user";
    return pool.execute(query);
}

export async function UserInfoByMail(email: string) {
    const [rows] = await pool.execute(
        "SELECT id, email, password, created_at, firstname, name FROM user WHERE email = ? LIMIT 1",
        [email]
    );  
    const results = rows as any[];
    return results.length ? results[0] : null;
}

export async function UserInfoById(id: number) {
    const [rows] = await pool.execute(
        "SELECT id, email, password, created_at, firstname, name FROM user WHERE id = ? LIMIT 1",
        [id]
    );
    const results = rows as any[];
    return results.length ? results[0] : null;
}

export async function ChangeEmailUser(id: number)
{
    const query = "UPDATE email FROM user WHERE id = ? LIMIT 1";
    return pool.execute(query, [id]);
}