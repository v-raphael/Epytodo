import express, {Request, Response} from "express";
import { verifyTokenOnly, AuthenticatedRequest } from "../../middleware/auth";
import { UsersInformation, UserInfoByMail, UserInfoById, DeleteById, UpdateUserById} from "./user.query";
import {CheckTodoById, createTodos, DeleteTodoById, FindTodosByData, FindTodosByID, FindTodosByUserId, TodosInformation} from "../todos/todos.query"
import { JsonWebTokenError } from "jsonwebtoken";

const user_route = express.Router();
const users_route = express.Router();

user_route.get('/', verifyTokenOnly, async function(req: Request, res: Response) {
    const decodedToken = (req as any).decodedToken;
    const id = decodedToken.id;

    if (!id)
        res.status(404).json({ msg: "Not found"});
    try {
        const users = await UserInfoById(id);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error' });
    }
});

user_route.get('/todos', verifyTokenOnly, async function(req: Request, res: Response) {

    const decodedToken = (req as any).decodedToken;
    const id = decodedToken.id;

    if (!id)
        res.status(404).json({ msg: "Not found"});
    try {
        const todos = await FindTodosByUserId(id);
        res.status(200).json([{todos}]);
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error' });
    }
});

users_route.put('/:id', verifyTokenOnly, async function(req: Request, res: Response) {

    try {
        const id = req.params.id;
        const data = req.body;

        if (!data.email || !data.password || !data.name || !data.firstname)
                return res.status(400).json({ msg : 'Invalid request' });
        const temp = await UpdateUserById(id, data.email, data.password, data.name, data.firstname);

        if (!temp) {
            return res.status(404).json({ msg: 'Not found' });
        }
        const returnid = await UserInfoById(id);
        res.status(200).json(returnid);
    } catch (error) {
            res.status(500).json({ msg: 'Internal server error' });
    }
});

users_route.delete('/:id', verifyTokenOnly, async function(req: Request, res: Response) {
    
    try {
        const id = req.params.id;
        const temp = await DeleteById(id);
        if (!temp) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.status(200).json({ msg: `Successfully deleted record number: ${id}`});
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error' });
    }
});

users_route.get('/', verifyTokenOnly, async function(req: Request, res: Response) {
    res.status(400).json({ message: 'Invalid request' });
});

users_route.get('/:id', verifyTokenOnly, async function(req: Request, res: Response) {
    const param = req.params.id;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    try {
        if (emailPattern.test(param)) {
            const user = await UserInfoByMail(param);
            if (!user)
                return res.status(404).json({ msg: 'Not found' });
            res.status(200).json(user);
        } else {
            const user = await UserInfoById(param);
            if (!user)
                return res.status(404).json({ msg: 'Not found' });
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error' });
    }
});

export default user_route;
export {users_route};