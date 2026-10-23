import { CloudflareEnv } from '../../_lib/types';
import { jsonResponse, errorResponse, hashPasswordSha256 } from '../../_lib/utils';
import { ensureD1Tables } from '../../_lib/db';

export async function onRequestPost(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const rawEmail = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!rawEmail || !rawEmail.includes('@')) {
      return errorResponse('Please enter a valid email address.', 400);
    }
    if (!password) {
      return errorResponse('Please enter your password.', 400);
    }

    const passHash = await hashPasswordSha256(password);

    if (env && env.DB) {
      await ensureD1Tables(env);
      const row = await env.DB.prepare('SELECT * FROM sonic_accounts WHERE email = ? LIMIT 1').bind(rawEmail).first();
      if (!row) {
        return errorResponse('No Sonic account found for this email.', 404, 'auth/user-not-found');
      }

      if (row.password_hash && row.password_hash !== passHash) {
        return errorResponse('Incorrect password. Please try again.', 401, 'auth/wrong-password');
      }

      let profile = {
        uid: row.uid,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        photoURL: row.photo_url || null,
        hasManualPassword: Boolean(row.has_manual_password)
      };

      let musicData = null;
      try {
        if (row.profile_json) profile = { ...profile, ...JSON.parse(row.profile_json) };
        if (row.music_data_json) musicData = JSON.parse(row.music_data_json);
      } catch (_) {}

      return jsonResponse({
        success: true,
        user: profile,
        musicData
      });
    }

    // Dev/fallback mode when D1 is not attached
    const emailPrefix = rawEmail.split('@')[0] || 'user';
    return jsonResponse({
      success: true,
      user: {
        uid: `sb_${emailPrefix}`,
        email: rawEmail,
        username: emailPrefix,
        displayName: emailPrefix,
        photoURL: null,
        hasManualPassword: true
      },
      musicData: null
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Login failed', 500);
  }
}
