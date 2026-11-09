import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';

// ============================================================
// AUTHENTICATION TYPES
// ============================================================

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

interface SessionRecord {
  email: string;
  role: string;
  roleId?: string;
  permissions: string[];
  expiresAt: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// ============================================================
// CONFIGURATION
// ============================================================

const SESSION_DURATION = 24 * 60 * 60 * 1000;

const rateLimitStore = new Map<string, RateLimitRecord>();

// ============================================================
// RATE LIMITING
// ============================================================

/**
 * Checks whether a request is within the configured rate limit.
 *
 * @param key Unique identifier for the rate-limit bucket.
 * @param maxAttempts Maximum permitted attempts.
 * @param windowMs Time window in milliseconds.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return true;
  }

  if (existing.count >= maxAttempts) {
    return false;
  }

  existing.count += 1;

  return true;
}

/**
 * Removes expired rate-limit records.
 * This prevents the in-memory store from growing indefinitely.
 */
function cleanupRateLimits(): void {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================================
// SESSION TOKEN MANAGEMENT
// ============================================================

/**
 * Creates a cryptographically secure session token.
 *
 * Default session duration: 24 hours.
 */
export function createSessionToken(
  email: string,
  role: 'FACULTY' | 'ADMIN',
  roleId?: string,
  permissions: string[] = []
): string {
  const token = crypto.randomBytes(32).toString('hex');

  const session: SessionRecord = {
    email: email.trim().toLowerCase(),
    role,
    roleId,
    permissions: [...new Set(permissions)],
    expiresAt: Date.now() + SESSION_DURATION
  };

  db.getActiveSessions()[token] = session;

  db.save();

  return token;
}

/**
 * Invalidates one session token.
 */
export function invalidateSession(token: string): boolean {
  const sessions = db.getActiveSessions();

  if (!sessions[token]) {
    return false;
  }

  delete sessions[token];

  db.save();

  return true;
}

/**
 * Invalidates all sessions belonging to one email address.
 *
 * Useful when:
 * - An administrator is suspended.
 * - An administrator is revoked.
 * - Faculty changes account access.
 * - An account needs to be forcibly logged out.
 */
export function invalidateAllSessionsForEmail(
  email: string
): number {
  const normalizedEmail = email.trim().toLowerCase();
  const sessions = db.getActiveSessions();

  let removedCount = 0;

  for (const [token, session] of Object.entries(sessions)) {
    if (session.email.trim().toLowerCase() === normalizedEmail) {
      delete sessions[token];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    db.save();
  }

  return removedCount;
}

// ============================================================
// TOKEN EXTRACTION
// ============================================================

/**
 * Extracts a bearer token from the Authorization header.
 *
 * Also supports the auth_token cookie if cookie-parser
 * is installed and configured in server.ts.
 */
function extractToken(req: Request): string | null {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();

    if (token) {
      return token;
    }
  }

  const requestWithCookies = req as Request & {
    cookies?: Record<string, string>;
  };

  const cookieToken = requestWithCookies.cookies?.auth_token;

  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// ============================================================
// SESSION VALIDATION
// ============================================================

/**
 * Validates a token against the active session store.
 *
 * Also verifies that the administrator account is still active.
 */
function validateSession(
  token: string
): AuthContext | null {
  const sessions = db.getActiveSessions();

  const session = sessions[token] as SessionRecord | undefined;

  if (!session) {
    return null;
  }

  // Check session expiration.
  if (Date.now() >= session.expiresAt) {
    delete sessions[token];
    db.save();

    return null;
  }

  const normalizedEmail = session.email.trim().toLowerCase();

  // Validate the underlying account.
  if (session.role === 'ADMIN') {
    const admin = db.getAdministrators().find(
      (item) =>
        item.email.trim().toLowerCase() === normalizedEmail
    );

    if (!admin || admin.status !== 'ACTIVE') {
      delete sessions[token];
      db.save();

      return null;
    }

    // Use current permissions rather than stale permissions
    // captured when the session was originally created.
    return {
      token,
      email: admin.email,
      role: 'ADMIN',
      roleId: admin.roleId,
      permissions: Array.isArray(admin.permissions)
        ? admin.permissions
        : []
    };
  }

  if (session.role === 'FACULTY') {
    const faculty = db.getFaculty().find(
      (item) =>
        item.email.trim().toLowerCase() === normalizedEmail
    );

    if (!faculty) {
      delete sessions[token];
      db.save();

      return null;
    }

    return {
      token,
      email: faculty.email,
      role: 'FACULTY',
      permissions: ['all']
    };
  }

  // Reject unknown session roles.
  delete sessions[token];
  db.save();

  return null;
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * Requires a valid authenticated session.
 *
 * Adds the authenticated user's information to req.auth.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please log in.'
    });

    return;
  }

  const auth = validateSession(token);

  if (!auth) {
    res.status(401).json({
      error: 'Your session is invalid or expired. Please log in again.'
    });

    return;
  }

  req.auth = auth;

  next();
}

// ============================================================
// FACULTY AUTHORIZATION
// ============================================================

/**
 * Allows only authenticated faculty members.
 */
export function requireFaculty(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requireAuth(req, res, () => {
    if (!req.auth) {
      res.status(401).json({
        error: 'Authentication required.'
      });

      return;
    }

    if (req.auth.role !== 'FACULTY') {
      res.status(403).json({
        error: 'Faculty authorization required.'
      });

      return;
    }

    next();
  });
}

// ============================================================
// PERMISSION CHECKING
// ============================================================

/**
 * Checks whether an authenticated user has a specific permission.
 *
 * Faculty members have full access.
 * Administrators must possess the requested permission or 'all'.
 */
export function requirePermission(
  permission: string
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    requireAuth(req, res, () => {
      const auth = req.auth;

      if (!auth) {
        res.status(401).json({
          error: 'Authentication required.'
        });

        return;
      }

      // Faculty has unrestricted administrative access.
      if (auth.role === 'FACULTY') {
        next();
        return;
      }

      const permissions = auth.permissions || [];

      if (
        permissions.includes('all') ||
        permissions.includes(permission)
      ) {
        next();
        return;
      }

      res.status(403).json({
        error: 'You do not have permission to perform this action.',
        requiredPermission: permission
      });
    });
  };
}

// ============================================================
// MULTIPLE PERMISSION CHECKING
// ============================================================

/**
 * Allows access when the user has ANY ONE of the supplied
 * permissions.
 *
 * Example:
 *
 * requireAnyPermission([
 *   'events_view',
 *   'events_manage',
 *   'attendance_manage'
 * ])
 */
export function requireAnyPermission(
  requiredPermissions: string[]
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    requireAuth(req, res, () => {
      const auth = req.auth;

      if (!auth) {
        res.status(401).json({
          error: 'Authentication required.'
        });

        return;
      }

      if (auth.role === 'FACULTY') {
        next();
        return;
      }

      const userPermissions = auth.permissions || [];

      const hasPermission =
        userPermissions.includes('all') ||
        requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        );

      if (hasPermission) {
        next();
        return;
      }

      res.status(403).json({
        error: 'You do not have sufficient permissions.',
        requiredAnyOf: requiredPermissions
      });
    });
  };
}

// ============================================================
// ADMINISTRATOR ROLE CHECKING
// ============================================================

/**
 * Restricts access to specific administrator roles.
 *
 * Example:
 *
 * requireRole(['role-president', 'role-event-mgr'])
 */
export function requireRole(
  allowedRoleIds: string[]
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    requireAuth(req, res, () => {
      const auth = req.auth;

      if (!auth) {
        res.status(401).json({
          error: 'Authentication required.'
        });

        return;
      }

      if (auth.role === 'FACULTY') {
        next();
        return;
      }

      if (
        auth.roleId &&
        allowedRoleIds.includes(auth.roleId)
      ) {
        next();
        return;
      }

      res.status(403).json({
        error: 'Your administrator role does not have access to this resource.'
      });
    });
  };
}

// ============================================================
// EXPIRED SESSION CLEANUP
// ============================================================

/**
 * Removes expired sessions from the database.
 */
export function cleanupExpiredSessions(): number {
  const sessions = db.getActiveSessions();

  const now = Date.now();
  let removedCount = 0;

  for (const [token, session] of Object.entries(sessions)) {
    if (now >= session.expiresAt) {
      delete sessions[token];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    db.save();
  }

  return removedCount;
}

// ============================================================
// AUTHENTICATION MAINTENANCE
// ============================================================

/**
 * Can be called during server startup to remove expired
 * sessions and old rate-limit records.
 */
export function runAuthMaintenance(): void {
  cleanupExpiredSessions();
  cleanupRateLimits();
}