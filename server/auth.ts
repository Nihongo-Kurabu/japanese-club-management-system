import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';

export interface AuthContext {
  token: string;
  email: string;
  role: 'FACULTY' | 'ADMIN';
  roleId?: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

// In-memory rate limiting map: ip/email -> { attempts: number, lastAttempt: number }
const rateLimitMap = new Map<string, { attempts: number; firstAttempt: number }>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { attempts: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > windowMs) {
    rateLimitMap.set(key, { attempts: 1, firstAttempt: now });
    return true;
  }

  if (entry.attempts >= maxAttempts) {
    return false;
  }

  entry.attempts++;
  return true;
}

export function createSessionToken(
  email: string,
  role: 'FACULTY' | 'ADMIN',
  roleId?: string,
  permissions: string[] = []
): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const sessions = db.getActiveSessions();
  sessions[token] = {
    email: email.trim().toLowerCase(),
    role,
    roleId,
    permissions,
    expiresAt
  };
  db.save();
  return token;
}

export function invalidateSession(token: string): void {
  const sessions = db.getActiveSessions();
  delete sessions[token];
  db.save();
}

export function invalidateAllSessionsForEmail(email: string): void {
  const normEmail = email.trim().toLowerCase();
  const sessions = db.getActiveSessions();
  for (const token of Object.keys(sessions)) {
    if (sessions[token].email === normEmail) {
      delete sessions[token];
    }
  }
  db.save();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies && req.cookies.auth_token);

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const sessions = db.getActiveSessions();
  const session = sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete sessions[token];
      db.save();
    }
    res.status(401).json({ error: 'Session expired. Please log in again.' });
    return;
  }

  // Check if admin is suspended or revoked
  if (session.role === 'ADMIN') {
    const admin = db.getAdministrators().find((a) => a.email.toLowerCase() === session.email.toLowerCase());
    if (!admin || admin.status !== 'ACTIVE') {
      delete sessions[token];
      db.save();
      res.status(403).json({ error: 'Your administrator account has been suspended or revoked. Contact faculty.' });
      return;
    }
  }

  req.auth = {
    token,
    email: session.email,
    role: session.role as 'FACULTY' | 'ADMIN',
    roleId: session.roleId,
    permissions: session.permissions
  };

  next();
}

export function requireFaculty(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.auth?.role !== 'FACULTY') {
      res.status(403).json({ error: 'Access denied. Faculty privileges required.' });
      return;
    }
    next();
  });
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, () => {
      if (req.auth?.role === 'FACULTY') {
        next();
        return;
      }

      const hasPerm = req.auth?.permissions.includes('all') || req.auth?.permissions.includes(permission);
      if (!hasPerm) {
        res.status(403).json({ error: `Forbidden: Missing required permission "${permission}".` });
        return;
      }
      next();
    });
  };
}
