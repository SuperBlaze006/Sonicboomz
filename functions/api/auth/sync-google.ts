import { CloudflareEnv } from '../../_lib/types';
import { jsonResponse, errorResponse } from '../../_lib/utils';
import { ensureD1Tables } from '../../_lib/db';

export async function onRequestPost(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const rawEmail = String(body?.email || '').trim().toLowerCase();
    const incomingUid = String(body?.uid || '').trim();
    const incomingDisplayName = String(body?.displayName || '').trim();
    const photoURL = body?.photoURL || null;

    if (!rawEmail || !rawEmail.includes('@')) {
      return errorResponse('Invalid email address', 400);
    }

    const emailPrefix = rawEmail.split('@')[0] || 'user';
    const cleanUsername = emailPrefix.replace(/[^a-z0-9_.-]/g, '') || 'user';
    const nowIso = new Date().toISOString();

    if (env && env.DB) {
      await ensureD1Tables(env);
      let row = await env.DB.prepare('SELECT * FROM sonic_accounts WHERE email = ? LIMIT 1').bind(rawEmail).first();

      if (!row) {
        const uid = incomingUid || `sb_${cleanUsername}`;
        const displayName = incomingDisplayName || emailPrefix;
        const profileObj = {
          uid,
          email: rawEmail,
          username: cleanUsername,
          displayName,
          photoURL,
          hasManualPassword: false,
          createdAt: nowIso,
          updatedAt: nowIso
        };

        await env.DB.prepare(`
          INSERT INTO sonic_accounts
          (email, uid, username, display_name, photo_url, password_hash, has_manual_password, profile_json, music_data_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NULL, 0, ?, NULL, ?, ?)
        `).bind(rawEmail, uid, cleanUsername, displayName, photoURL, JSON.stringify(profileObj), nowIso, nowIso).run();

        row = await env.DB.prepare('SELECT * FROM sonic_accounts WHERE email = ? LIMIT 1').bind(rawEmail).first();
      }

      let profile = {
        uid: row.uid,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        photoURL: row.photo_url || photoURL,
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

    return jsonResponse({
      success: true,
      user: {
        uid: incomingUid || `sb_${cleanUsername}`,
        email: rawEmail,
        username: cleanUsername,
        displayName: incomingDisplayName || emailPrefix,
        photoURL,
        hasManualPassword: false
      },
      musicData: null
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Sync failed', 500);
  }
}
