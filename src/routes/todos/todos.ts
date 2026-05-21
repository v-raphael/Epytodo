import express, {Request, Response} from "express";
const todos_route = express.Router();
import {CheckTodoById, createTodos, DeleteTodoById, FindTodosByData, FindTodosByID, TodosInformation} from "./todos.query"
import {verifyTokenOnly} from "../../middleware/auth";

todos_route.get('/', verifyTokenOnly, async function(req: Request, res: Response) {
    try {
        const temp = await TodosInformation();
        res.status(200).json([{temp}]);
    } catch(error) {
        res.status(500).json({ msg: 'Internal server error' })
    }
});

todos_route.get('/:id', verifyTokenOnly, async function(req: Request, res: Response) {
    try {
        const getid = req.params.id;
        const temp = await FindTodosByID(getid);
        if (!temp) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.status(200).json(temp);
    } catch(error) {
        res.status(500).json({ msg: 'Internal server error' })
    }
});

todos_route.post('/', verifyTokenOnly, async function(req: Request, res: Response) {
        const data = req.body;
        const decodedToken = (req as any).decodedToken;

        if (!data || !data.title || !data.description || !data.due_time) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }
        if (!data.status)
            data.status = 'not started';
        if (data.status !== 'not started' && data.status !== 'todo' && data.status !== 'in progress' && data.status !== 'done') {
            return res.status(400).json({ msg: 'Bad parameter' });
        }
        try {
            const createdTodoId = await createTodos(data.title, data.description, data.due_time, data.status, decodedToken.id);
            if (!createdTodoId) {
                return res.status(500).json({ msg: 'Internal server error' });
            }
            const createdTodo = await FindTodosByID(createdTodoId);
            if (!createdTodo) {
                return res.status(500).json({ msg: 'Internal server error' });
            }
            res.status(201).json(createdTodo);
        } catch (error) {
            res.status(500).json({ msg: 'Internal server error' });
        }
});

todos_route.put('/:id', verifyTokenOnly, async function(req: Request, res: Response) {
    res.status(400).json({ msg: 'Bad parameter' });
});

todos_route.delete('/:id', verifyTokenOnly, async function(req: Request, res: Response) {

    if (!req.params.id) {
        return res.status(400).json({ msg: 'Bad parameter'});
    }
    try {
        const check_todo = await CheckTodoById(req.params.id);
        if (!check_todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }

        const delete_todo = await DeleteTodoById(req.params.id);
        if (!delete_todo) {
            return res.status(500).json({ msg: 'Internal server error' });
        }
        return res.status(200).json({ msg: `Successfully deleted record number: ${req.params.id}`});
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});

export default todos_route;

