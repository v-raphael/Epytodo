import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_ROOT_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const port = 3306;

export const pool = mysql.createPool({
	host,
	user,
	password,
	database,
	port,
	dateStrings: true,
	waitForConnections: true,
	connectionLimit: 10,
});
