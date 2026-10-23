import { CloudflareEnv } from '../../_lib/types';
import { jsonResponse, errorResponse, hashPasswordSha256 } from '../../_lib/utils';
import { ensureD1Tables } from '../../_lib/db';

export async function onRequestPost(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const rawEmail = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const incomingUid = String(body?.uid || '').trim();
    const incomingDisplayName = String(body?.displayName || '').trim();

    if (!rawEmail || !rawEmail.includes('@')) {
      return errorResponse('Please enter a valid email address.', 400);
    }
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters.', 400);
    }

    const emailPrefix = rawEmail.split('@')[0] || 'music_lover';
    const cleanUsername = emailPrefix.replace(/[^a-z0-9_.-]/g, '') || 'user';
    const passHash = await hashPasswordSha256(password);
    const nowIso = new Date().toISOString();
    const uid = incomingUid || `sb_${cleanUsername}_${Math.random().toString(36).slice(2, 8)}`;
    const displayName = incomingDisplayName || emailPrefix;

    const profileObj = {
      uid,
      email: rawEmail,
      username: cleanUsername,
      displayName,
      photoURL: null,
      hasManualPassword: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    if (env && env.DB) {
      await ensureD1Tables(env);
      const existing = await env.DB.prepare('SELECT email FROM sonic_accounts WHERE email = ? LIMIT 1').bind(rawEmail).first();
      if (existing) {
        return errorResponse('This email is already associated with an account. Please switch to Sign In.', 409, 'auth/email-already-in-use');
      }

      await env.DB.prepare(`
        INSERT INTO sonic_accounts
        (email, uid, username, display_name, photo_url, password_hash, has_manual_password, profile_json, music_data_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).bind(rawEmail, uid, cleanUsername, displayName, null, passHash, JSON.stringify(profileObj), null, nowIso, nowIso).run();
    }

    return jsonResponse({
      success: true,
      user: profileObj,
      musicData: null
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Registration failed', 500);
  }
}
