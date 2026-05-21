import jwt, {TokenExpiredError, JsonWebTokenError} from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import {UserInfoByMail} from "../routes/user/user.query";

const tokenIssuer = 'http://localhost:' + (process.env.PORT ?? '3000');
const trustedIssuers = [tokenIssuer];

export interface JWTPayload {
    id: number;
    email: string;
    name: string;
    firstname: string;
    iat?: number;
    exp?: number;
    iss?: string;
}

export interface AuthenticatedRequest extends Request {
    user?: Awaited<ReturnType<typeof UserInfoByMail>>;
}

export class TokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TokenError";
    }
}

export async function verify_token(token: string): Promise<JWTPayload> {
    const secret = process.env.SECRET ?? '';
    if (!token) {
        throw new TokenError("Token missing");
    }
    
    try {
        const decodedToken = jwt.verify(token, secret, {
            issuer: tokenIssuer,
            algorithms: ['HS256']
        }) as JWTPayload;
        if (decodedToken.iss && !trustedIssuers.includes(decodedToken.iss)) {
            throw new TokenError("Token is not valid");
        }

        return decodedToken;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new TokenError("Token is not valid");
        }
        if (error instanceof JsonWebTokenError) {
            throw new TokenError("Token is not valid");
        }
        if (error instanceof TokenError) {
            throw error;
        }
        throw new TokenError("Token is not valid");
    }
}

function getBearerToken(request: Request): string | null {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
        const bodyToken = typeof request.body?.token === "string" ? request.body.token : null;
        if (bodyToken) {
            return bodyToken;
        }

        const queryToken = typeof request.query?.token === "string" ? request.query.token : null;
        if (queryToken) {
            return queryToken;
        }

        return null;
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        const bodyToken = typeof request.body?.token === "string" ? request.body.token : null;
        if (bodyToken) {
            return bodyToken;
        }

        const queryToken = typeof request.query?.token === "string" ? request.query.token : null;
        if (queryToken) {
            return queryToken;
        }

        return null;
    }

    return token;
}

export async function verifyTokenOnly(request: Request, response: Response, next: NextFunction) {
    try {
        const token = getBearerToken(request);

        if (!token) {
            return response.status(401).json({ msg: "No token, authorization denied" });
        }

        const decodedToken = await verify_token(token);
        (request as any).decodedToken = decodedToken;
        return next();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Token is not valid";
        return response.status(401).json({ msg: message });
    }
}
