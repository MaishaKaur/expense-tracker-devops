import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// ── Pure functions (easily unit-testable) ─────────────────

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; email: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
}

// ── DB-dependent functions ────────────────────────────────

export async function registerUser(email: string, name: string, password: string) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already registered');

  const hash = await hashPassword(password);
  const result = await pool.query(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, name, hash]
  );
  return result.rows[0];
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) throw new Error('Invalid credentials');

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken(user.id, user.email);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}
