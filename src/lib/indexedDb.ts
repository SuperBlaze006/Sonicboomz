import { openDB, DBSchema } from 'idb';

export interface SavedTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioBlob: Blob;
  downloadedAt: number;
  ownerKey?: string;
  storageKey?: string;
}

interface MusicDBSchema extends DBSchema {
  downloads: {
    key: string;
    value: SavedTrack;
  };
  account_downloads: {
    key: string; // `${ownerKey}::${id}`
    value: SavedTrack;
  };
}

const DB_NAME = 'MusicAppOfflineDB';
const LEGACY_STORE = 'downloads';
const ACCOUNT_STORE = 'account_downloads';

async function getDB() {
  return openDB<MusicDBSchema>(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(LEGACY_STORE)) {
        db.createObjectStore(LEGACY_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ACCOUNT_STORE)) {
        db.createObjectStore(ACCOUNT_STORE, { keyPath: 'storageKey' });
      }
      if (oldVersion < 2 && db.objectStoreNames.contains(LEGACY_STORE)) {
        try {
          db.deleteObjectStore(LEGACY_STORE);
          db.createObjectStore(LEGACY_STORE, { keyPath: 'id' });
        } catch (_) {}
      }
    },
  });
}

function makeStorageKey(ownerKey: string, trackId: string): string {
  return `${ownerKey || 'guest'}::${trackId}`;
}

export async function saveToIndexedDB(
  track: SavedTrack,
  ownerKey: string = 'guest',
  maxLimit?: number
): Promise<boolean> {
  const db = await getDB();
  const normalizedOwner = ownerKey || 'guest';
  const limit = maxLimit ?? (normalizedOwner === 'guest' ? 3 : 10);
  const storageKey = makeStorageKey(normalizedOwner, track.id);

  const tx = db.transaction(ACCOUNT_STORE, 'readwrite');
  const all = await tx.store.getAll();
  const ownerTracks = all.filter((item) => (item.ownerKey || 'guest') === normalizedOwner);
  const alreadyExists = ownerTracks.some((item) => item.id === track.id);

  if (!alreadyExists && ownerTracks.length >= limit) {
    await tx.done;
    return false;
  }

  const record: SavedTrack = {
    ...track,
    ownerKey: normalizedOwner,
    storageKey,
  };
  await tx.store.put(record);
  await tx.done;
  return true;
}

export async function getFromIndexedDB(id: string, ownerKey: string = 'guest'): Promise<SavedTrack | undefined> {
  const db = await getDB();
  return db.get(ACCOUNT_STORE, makeStorageKey(ownerKey || 'guest', id));
}

export async function getAllFromIndexedDB(ownerKey: string = 'guest'): Promise<SavedTrack[]> {
  const db = await getDB();
  const normalizedOwner = ownerKey || 'guest';
  const all = await db.getAll(ACCOUNT_STORE);
  return all
    .filter((item) => (item.ownerKey || 'guest') === normalizedOwner)
    .sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0));
}

export async function enforceOwnerLimitIndexedDB(
  ownerKey: string = 'guest',
  maxLimit?: number
): Promise<SavedTrack[]> {
  const db = await getDB();
  const normalizedOwner = ownerKey || 'guest';
  const limit = maxLimit ?? (normalizedOwner === 'guest' ? 3 : 10);
  const all = await db.getAll(ACCOUNT_STORE);
  const ownerTracks = all
    .filter((item) => (item.ownerKey || 'guest') === normalizedOwner)
    .sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0));

  if (ownerTracks.length > limit) {
    const toRemove = ownerTracks.slice(limit);
    const tx = db.transaction(ACCOUNT_STORE, 'readwrite');
    for (const item of toRemove) {
      if (item.storageKey) {
        await tx.store.delete(item.storageKey);
      }
    }
    await tx.done;
    return ownerTracks.slice(0, limit);
  }

  return ownerTracks;
}

export async function deleteFromIndexedDB(id: string, ownerKey: string = 'guest') {
  const db = await getDB();
  const normalizedOwner = ownerKey || 'guest';
  await db.delete(ACCOUNT_STORE, makeStorageKey(normalizedOwner, id));
}

export async function clearOwnerIndexedDB(ownerKey: string = 'guest') {
  const db = await getDB();
  const normalizedOwner = ownerKey || 'guest';
  const all = await db.getAll(ACCOUNT_STORE);
  const tx = db.transaction(ACCOUNT_STORE, 'readwrite');
  for (const item of all) {
    if ((item.ownerKey || 'guest') === normalizedOwner && item.storageKey) {
      await tx.store.delete(item.storageKey);
    }
  }
  await tx.done;
}

export async function migrateGuestDownloadsToUser(userOwnerKey: string, maxAccountLimit: number = 10) {
  if (!userOwnerKey || userOwnerKey === 'guest') return;
  const db = await getDB();
  const all = await db.getAll(ACCOUNT_STORE);
  const guestTracks = all
    .filter((item) => (item.ownerKey || 'guest') === 'guest')
    .sort((a, b) => (a.downloadedAt || 0) - (b.downloadedAt || 0));

  if (guestTracks.length === 0) return;

  // Never migrate more than the 3-song guest limit even if stale records existed
  const allowedGuestTracks = guestTracks.slice(0, 3);

  const userTracks = all.filter((item) => item.ownerKey === userOwnerKey);
  const existingUserTrackIds = new Set(userTracks.map((t) => t.id));
  let currentCount = userTracks.length;

  const tx = db.transaction(ACCOUNT_STORE, 'readwrite');
  for (const gTrack of allowedGuestTracks) {
    if (!existingUserTrackIds.has(gTrack.id) && currentCount < maxAccountLimit) {
      const migrated: SavedTrack = {
        ...gTrack,
        ownerKey: userOwnerKey,
        storageKey: makeStorageKey(userOwnerKey, gTrack.id),
      };
      await tx.store.put(migrated);
      existingUserTrackIds.add(gTrack.id);
      currentCount++;
    }
  }
  // Always purge all guest records after migration
  for (const gTrack of guestTracks) {
    if (gTrack.storageKey) {
      await tx.store.delete(gTrack.storageKey);
    }
  }
  await tx.done;
}
