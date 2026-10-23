import { CloudflareEnv } from '../../_lib/types';
import { jsonResponse, errorResponse } from '../../_lib/utils';
import { ensureD1Tables } from '../../_lib/db';

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();

  if (!email) {
    return errorResponse('Email is required', 400);
  }

  if (env && env.DB) {
    try {
      await ensureD1Tables(env);
      const row = await env.DB.prepare('SELECT music_data_json FROM sonic_accounts WHERE email = ? LIMIT 1').bind(email).first();
      if (row && row.music_data_json) {
        return jsonResponse({
          success: true,
          musicData: JSON.parse(row.music_data_json)
        });
      }
    } catch (_) {}
  }

  return jsonResponse({ success: true, musicData: null });
}

export async function onRequestPost(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const email = String(body?.email || '').trim().toLowerCase();
    const musicData = body?.musicData;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    if (env && env.DB) {
      await ensureD1Tables(env);
      const nowIso = new Date().toISOString();
      await env.DB.prepare(`
        UPDATE sonic_accounts 
        SET music_data_json = ?, updated_at = ?
        WHERE email = ?
      `).bind(JSON.stringify(musicData || {}), nowIso, email).run();
    }

    return jsonResponse({
      success: true,
      message: 'Cloud data synchronized successfully'
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to save user data', 500);
  }
}
