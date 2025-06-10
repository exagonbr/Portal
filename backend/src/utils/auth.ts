import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

export async function getUserFromRequest(req: Request): Promise<User | null> {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        
        const user = await db('User')
            .leftJoin('roles', 'User.role_id', 'roles.id')
            .where('User.id', decoded.userId)
            .select('User.id', 'User.email', 'User.name', 'roles.name as role')
            .first();

        return user || null;
    } catch (error) {
        console.error('Error getting user from request:', error);
        return null;
    }
}
