import express, {Request, Response} from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {UserInfoByMail, registerUser} from "../user/user.query";

dotenv.config();

const router = express.Router();
const tokenSecret = process.env.SECRET ?? 'epytodo-secret';
const tokenIssuer = 'http://localhost:' + (process.env.PORT ?? '3000');

function createToken(payload: { id: number; email: string; name: string; firstname: string }) {
    return jwt.sign(payload, tokenSecret, {
        expiresIn: '7d',
        issuer: tokenIssuer,
        algorithm: 'HS256'
    });
}

router.post('/login', async function(req: Request, res: Response) {

    const data = req.body;

    if (!data || !data.email || !data.password) {
        return res.status(400).json({ msg: 'Bad parameter'});
    }

    try {
        const user = await UserInfoByMail(data.email);
        if (!user) {
            return res.status(401).json({ msg: 'Invalid Credentials' });
        }

        const passwordMatch = await new Promise<boolean>((resolve, reject) => {
            bcrypt.compare(data.password, user.password, (err, same) => {
                if (err) return reject(err);
                resolve(same);
            });
        });

        if (!passwordMatch) {
            return res.status(401).json({ msg: 'Invalid Credentials' });
        }

        const token = createToken({
            id: user.id,
            email: user.email,
            name: user.name,
            firstname: user.firstname
        });

        res.status(200).json({ "token": token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.post('/register', async function(req: Request, res: Response) {

    const data = req.body;

    if (!data || !data.email || !data.name || !data.firstname || !data.password) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }

    try {
        const existingUser = await UserInfoByMail(data.email);
        if (existingUser) {
            return res.status(409).json({ msg: 'Account already exists' });
        }

        const hashedPassword = await new Promise<string>((resolve, reject) => {
            bcrypt.hash(data.password, 10, function(err, hash) {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });
        
        await registerUser(data.email, hashedPassword, data.name, data.firstname);
        const user = await UserInfoByMail(data.email);
        if (!user) {
            return res.status(500).json({ msg: 'Internal server error' });
        }

        const token = createToken({
            id: user.id,
            email: user.email,
            name: user.name,
            firstname: user.firstname
        });

        res.status(200).json({ "token": token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

export default router;