import React, { useState, useMemo } from 'react';
import { Track, Playlist } from '../types';
import { 
  Heart, 
  Play, 
  Shuffle, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Music, 
  Menu, 
  Settings as SettingsIcon,
  ChevronLeft,
  ListPlus,
  Clock,
  Search,
  Sparkles,
  Share2,
  Check,
  X
} from 'lucide-react';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';

interface PlaylistsViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  favorites: Track[];
  playlists: Playlist[];
  onCreatePlaylist: (name: string, description?: string) => string;
  onDeletePlaylist: (playlistId: string) => void;
  onRenamePlaylist: (playlistId: string, newName: string, description?: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  onNavigateHome: () => void;
  onSelectArtist?: (artistName: string) => void;
  isAuthenticated?: boolean;
  onRequireSignIn?: () => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '3:20';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function calculateTotalDuration(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 195), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export function PlaylistsView({
  onOpenSidebar,
  onOpenSettings,
  favorites,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onRemoveTrackFromPlaylist,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  onNavigateHome,
  onSelectArtist,
  isAuthenticated = false,
  onRequireSignIn,
}: PlaylistsViewProps) {
  const handleRequestNewPlaylist = () => {
    if (!isAuthenticated) {
      if (onRequireSignIn) onRequireSignIn();
      return;
    }
    setIsCreateModalOpen(true);
  };
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [playlistSearch, setPlaylistSearch] = useState('');
  const [trackSearch, setTrackSearch] = useState('');

  // Permanent Liked Songs playlist object representation
  const likedSongsPlaylist: Playlist = useMemo(() => ({
    id: 'permanent-liked-songs',
    name: 'Liked Songs',
    description: 'Your permanent collection of favorited songs and top chart gems.',
    tracks: favorites,
    createdAt: 0,
    isPermanent: true
  }), [favorites]);

  // Active selected playlist
  const activePlaylist = useMemo(() => {
    if (selectedPlaylistId === 'permanent-liked-songs') {
      return likedSongsPlaylist;
    }
    return playlists.find(p => p.id === selectedPlaylistId) || null;
  }, [selectedPlaylistId, likedSongsPlaylist, playlists]);

  // Filtered playlists list for root grid
  const filteredPlaylists = useMemo(() => {
    if (!playlistSearch.trim()) return playlists;
    const q = playlistSearch.toLowerCase();
    return playlists.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }, [playlists, playlistSearch]);

  // Filtered tracks when viewing inside a specific playlist
  const filteredActiveTracks = useMemo(() => {
    if (!activePlaylist) return [];
    if (!trackSearch.trim()) return activePlaylist.tracks;
    const q = trackSearch.toLowerCase();
    return activePlaylist.tracks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.artist && t.artist.toLowerCase().includes(q))
    );
  }, [activePlaylist, trackSearch]);

  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newId = onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreateModalOpen(false);
    if (newId) {
      setSelectedPlaylistId(newId);
    }
  };

  const handleOpenEdit = (p: Playlist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (p.isPermanent) return;
    setEditingPlaylistId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylistId || !editName.trim()) return;
    onRenamePlaylist(editingPlaylistId, editName.trim(), editDesc.trim());
    setIsEditModalOpen(false);
    setEditingPlaylistId(null);
  };

  const handleDeletePrompt = (p: Playlist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (p.isPermanent) return;
    setPlaylistToDelete(p);
  };

  const confirmDeletePlaylist = () => {
    if (!playlistToDelete) return;
    const id = playlistToDelete.id;
    onDeletePlaylist(id);
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(null);
    }
    setPlaylistToDelete(null);
  };

  const isFavorite = (trackId: string) => favorites.some(f => f.id === trackId);

  const renderModals = () => (
    <>
      {/* ========================================================= */}
      {/* MODAL: CREATE PLAYLIST */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#161726] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Create New Playlist</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chill Workout, Night Vibes..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] text-sm font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Give your playlist a personal vibe..."
                  className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] text-sm font-medium resize-none text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT PLAYLIST */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#161726] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Playlist Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] text-sm font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] text-sm font-medium resize-none text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#161726] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-white/10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2">Delete Playlist?</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{playlistToDelete.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPlaylistToDelete(null)}
                className="flex-1 py-3 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlaylist}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // =========================================================================
  // VIEW: INSIDE A SPECIFIC PLAYLIST
  // =========================================================================
  if (activePlaylist) {
    const isLikedSongs = activePlaylist.isPermanent || activePlaylist.id === 'permanent-liked-songs';

    return (
      <div className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-12">
          {/* Header Navigation */}
        <header className="flex items-center justify-between pt-4 sm:pt-6 md:pt-6 pb-4">
          <button
            id="btn-back-to-playlists"
            onClick={() => {
              setSelectedPlaylistId(null);
              setTrackSearch('');
            }}
            className="flex items-center gap-2 py-2 px-3.5 -ml-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>All Playlists</span>
          </button>

          <div className="flex items-center gap-2">
            {!isLikedSongs && (
              <>
                <button
                  onClick={() => handleOpenEdit(activePlaylist)}
                  className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors text-gray-700 dark:text-gray-200"
                  title="Edit Playlist Details"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDeletePrompt(activePlaylist)}
                  className="p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                  title="Delete Playlist"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors text-gray-700 dark:text-gray-200"
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        {/* Playlist Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 py-6 border-b border-black/10 dark:border-white/10 mb-6">
          {/* Cover Art */}
          <div className="shrink-0 relative group">
            {isLikedSongs ? (
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl flex flex-col items-center justify-center text-white relative overflow-hidden">
                <Heart size={64} fill="currentColor" className="drop-shadow-lg animate-pulse" />
                <span className="absolute bottom-3 text-[10px] font-black uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                  Permanent
                </span>
              </div>
            ) : activePlaylist.tracks.length > 0 && activePlaylist.tracks[0].coverUrl ? (
              <img 
                src={optimizeImage(activePlaylist.tracks[0].coverUrl, { width: 320, quality: 85 })} 
                alt={activePlaylist.name}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl object-cover shadow-2xl border border-white/10"
                onError={(e) => applyAppLogoFallback(e, activePlaylist.tracks[0])}
                onLoad={(e) => applyAppLogoFallback(e, activePlaylist.tracks[0])}
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-gray-400">
                <Music size={54} />
                <span className="text-[11px] font-semibold mt-2">Custom Playlist</span>
              </div>
            )}
          </div>

          {/* Info Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-color)] px-2.5 py-1 rounded-full bg-[var(--theme-color)]/10 inline-block mb-2">
              {isLikedSongs ? 'Permanent Playlist' : 'Personal Playlist'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2 truncate">
              {activePlaylist.name}
            </h1>
            {activePlaylist.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-xl">
                {activePlaylist.description}
              </p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span>Created by You</span>
              <span>•</span>
              <span>{activePlaylist.tracks.length} {activePlaylist.tracks.length === 1 ? 'song' : 'songs'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {calculateTotalDuration(activePlaylist.tracks)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar (Big Play, Shuffle, Filter) */}
        {activePlaylist.tracks.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  id="btn-playlist-play-all"
                  onClick={() => onPlayTrack(activePlaylist.tracks[0], 0, activePlaylist.tracks)}
                  className="px-6 py-3 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] font-black text-sm shadow-xl flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Play All</span>
                </button>
                <button
                  id="btn-playlist-shuffle-all"
                  onClick={() => {
                    const rnd = Math.floor(Math.random() * activePlaylist.tracks.length);
                    onPlayTrack(activePlaylist.tracks[rnd], rnd, activePlaylist.tracks);
                  }}
                  className="px-5 py-3 rounded-full bg-neutral-200/90 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/15 font-bold text-sm shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                  title="Shuffle Playlist"
                >
                  <Shuffle size={16} className="text-neutral-900 dark:text-white shrink-0" />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* Search Inside Playlist */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Filter songs..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] border border-black/5 dark:border-white/10"
                />
                {trackSearch && (
                  <button 
                    onClick={() => setTrackSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Tracks List */}
            <div className="space-y-2">
              {filteredActiveTracks.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track, idx, activePlaylist.tracks)}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-black/5 dark:hover:border-white/10 cursor-pointer"
                >
                  {/* Left: Track Number & Artwork */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-bold text-gray-400 group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button className="w-5 hidden group-hover:flex items-center justify-center text-[var(--theme-color)]">
                      <Play size={14} fill="currentColor" />
                    </button>

                    <img
                      src={optimizeImage(track.coverUrl, { width: 80, quality: 75 })}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0 border border-black/5 dark:border-white/5"
                      onError={(e) => applyAppLogoFallback(e, track)}
                      onLoad={(e) => applyAppLogoFallback(e, track)}
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                        {track.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate block text-left">
                        {track.artist || 'Unknown Artist'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions & Duration */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                    {/* Favorite Button (Keeps like feature completely intact!) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isFavorite(track.id)
                          ? 'text-red-500 hover:bg-red-500/10'
                          : 'text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      title={isFavorite(track.id) ? 'Unlike' : 'Like'}
                    >
                      <Heart size={16} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      disabled={isDownloading === track.id}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Download song offline"
                    >
                      <Download size={16} className={isDownloading === track.id ? 'animate-bounce text-[var(--theme-color)]' : ''} />
                    </button>

                    {/* Remove from custom playlist button */}
                    {!isLikedSongs && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrackFromPlaylist(activePlaylist.id, track.id);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove from this playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <span className="hidden sm:inline text-xs font-semibold text-gray-400 w-10 text-right ml-1">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty Playlist State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-400 mb-4">
              <Music size={28} />
            </div>
            <h3 className="text-lg font-bold mb-1">This playlist is empty</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              {isLikedSongs
                ? 'Tap the heart icon on any song across Sonic Boomz to save it to your permanent Liked Songs collection.'
                : 'Add songs to this playlist from the music player three-dot options menu or explore new tracks.'}
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-bold shadow-lg hover:opacity-95 transition-all"
            >
              Explore Songs
            </button>
          </div>
        )}

        {renderModals()}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: PLAYLISTS ROOT DIRECTORY & GRID
  // =========================================================================
  return (
    <div className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-12">
        {/* Top Header */}
      <header className="flex items-center justify-between pt-4 sm:pt-6 md:pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-playlists-sidebar-open"
            onClick={onOpenSidebar}
            className="md:hidden p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-color)]">Your Library</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">Playlists</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Playlist Button */}
          <button
            id="btn-header-add-playlist"
            onClick={handleRequestNewPlaylist}
            className="px-3.5 py-2 rounded-2xl bg-[var(--theme-color)] hover:opacity-95 text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Playlist</span>
          </button>

          <button
            id="btn-playlists-settings"
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Settings Studio"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Search Bar for Playlists */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={playlistSearch}
          onChange={(e) => setPlaylistSearch(e.target.value)}
          placeholder="Search your playlists..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] transition-all"
        />
      </div>

      {/* Main Playlists Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* ========================================================= */}
        {/* 1. SPOTIFY-STYLE PERMANENT LIKED SONGS CARD */}
        {/* ========================================================= */}
        <div
          id="card-liked-songs-permanent"
          onClick={() => setSelectedPlaylistId('permanent-liked-songs')}
          className="col-span-2 sm:col-span-1 group relative p-4 rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 shadow-xl text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden flex flex-col justify-between min-h-[190px]"
        >
          {/* Subtle Ambient Pattern */}
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
            <Sparkles size={80} />
          </div>

          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <Heart size={26} fill="currentColor" className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md">
              Permanent
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black tracking-tight leading-snug">Liked Songs</h3>
            <p className="text-xs text-white/80 font-semibold mt-0.5">
              {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          {/* Quick Play Button on Hover */}
          {favorites.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrack(favorites[0], 0, favorites);
              }}
              className="absolute right-3.5 bottom-3.5 p-3 rounded-full bg-white text-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              title="Play Liked Songs"
            >
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. USER CREATED CUSTOM PLAYLISTS */}
        {/* ========================================================= */}
        {filteredPlaylists.map((playlist) => {
          const firstCover = playlist.tracks.length > 0 ? playlist.tracks[0].coverUrl : null;

          return (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className="group relative p-3.5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--theme-color)] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Cover Art */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-black/20">
                {firstCover ? (
                  <img
                    src={optimizeImage(firstCover, { width: 240, quality: 80 })}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => applyAppLogoFallback(e, playlist.tracks[0])}
                    onLoad={(e) => applyAppLogoFallback(e, playlist.tracks[0])}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
                    <Music size={36} />
                  </div>
                )}

                {/* Quick Play Button */}
                {playlist.tracks.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(playlist.tracks[0], 0, playlist.tracks);
                    }}
                    className="absolute right-2.5 bottom-2.5 p-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                    title="Play Playlist"
                  >
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </button>
                )}
              </div>

              {/* Title and Track Count */}
              <div>
                <h3 className="font-bold text-sm truncate leading-snug group-hover:text-[var(--theme-color)] transition-colors">
                  {playlist.name}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEdit(playlist, e)}
                      className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title="Edit playlist"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDeletePrompt(playlist, e)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete playlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ========================================================= */}
        {/* 3. QUICK "CREATE NEW PLAYLIST" DOTTED CARD */}
        {/* ========================================================= */}
        <button
          onClick={handleRequestNewPlaylist}
          className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[var(--theme-color)] hover:bg-[var(--theme-color)]/5 transition-all text-gray-500 dark:text-gray-400 hover:text-[var(--theme-color)] min-h-[190px] cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 group-hover:bg-[var(--theme-color)] group-hover:text-[var(--theme-text-color,#ffffff)] transition-all flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold">Create Playlist</span>
          <span className="text-[10px] text-gray-400 mt-1">Temporary or Permanent</span>
        </button>
      </div>

      {renderModals()}
      </div>
    </div>
  );
}
