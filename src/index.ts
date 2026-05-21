import express from "express";
import dotenv from "dotenv";
import {pool} from "./config/db";
import authRouter from "./routes/auth/auth";
import userRoute, { users_route as usersRoute } from "./routes/user/user";
import TodosRoute from "./routes/todos/todos";

const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(express.json());

async function startServer(): Promise<void> {
	try {
		const connection = await pool.getConnection();
		connection.release();

		app.listen(port, () => {
			console.log(`epytodo launched on port ${port}`);
			console.log("Database is ready");
		});
	} catch (error) {
		console.error("Database connection failed");
		console.error(error);
		process.exit(1);
	}
	
	app.get("/", (req: express.Request, res: express.Response) => {
		res.status(200).json({ message: 'Welcome to Epytodo' });
	});
	app.use("/", authRouter);
	app.use("/user", userRoute);
	app.use("/users", usersRoute);
	app.use("/todos", TodosRoute);
}

void startServer();
