import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await registerUser(email, name, password);
    return res.status(201).json({ message: 'User created', user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await loginUser(email, password);
    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return res.status(401).json({ error: message });
  }
}
