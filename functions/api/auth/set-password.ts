import { CloudflareEnv } from '../../_lib/types';
import { jsonResponse, errorResponse, hashPasswordSha256 } from '../../_lib/utils';
import { ensureD1Tables } from '../../_lib/db';

export async function onRequestPost(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const rawEmail = String(body?.email || '').trim().toLowerCase();
    const newPassword = String(body?.password || body?.newPassword || '');

    if (!rawEmail || !rawEmail.includes('@')) {
      return errorResponse('Invalid email address', 400);
    }
    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters.', 400);
    }

    const passHash = await hashPasswordSha256(newPassword);
    const nowIso = new Date().toISOString();

    if (env && env.DB) {
      await ensureD1Tables(env);
      await env.DB.prepare(`
        UPDATE sonic_accounts 
        SET password_hash = ?, has_manual_password = 1, updated_at = ?
        WHERE email = ?
      `).bind(passHash, nowIso, rawEmail).run();
    }

    return jsonResponse({
      success: true,
      hasManualPassword: true
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update password', 500);
  }
}
