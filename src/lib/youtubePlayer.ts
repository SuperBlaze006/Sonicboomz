// YouTube IFrame API Singleton Controller for Blaze Music

type YTPlayerCallback = {
  onReady?: () => void;
  onStateChange?: (state: number, duration: number) => void;
  onError?: (err: any) => void;
  onEnded?: () => void;
};

class YouTubeController {
  private player: any = null;
  private isReady: boolean = false;
  private callbacks: YTPlayerCallback = {};
  private pendingVideoId: string | null = null;
  private pendingAutoplay: boolean = false;
  private checkInterval: any = null;

  public init(containerId: string, callbacks: YTPlayerCallback) {
    this.callbacks = callbacks;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;

      let host = document.getElementById('blaze-yt-host');
      if (!host) {
        host = document.createElement('div');
        host.id = 'blaze-yt-host';
        host.style.position = 'fixed';
        host.style.bottom = '0px';
        host.style.right = '0px';
        host.style.width = '240px';
        host.style.height = '240px';
        host.style.opacity = '0.001';
        host.style.pointerEvents = 'none';
        host.style.zIndex = '-10';
        host.style.overflow = 'hidden';
        document.body.appendChild(host);
      }

      let target = document.getElementById(containerId);
      if (!target) {
        target = document.createElement('div');
        target.id = containerId;
        host.appendChild(target);
      }

      try {
        this.player = new window.YT.Player(containerId, {
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              this.isReady = true;
              console.log('YouTube IFrame Engine initialized successfully');
              try {
                if (this.player && typeof this.player.unMute === 'function') this.player.unMute();
                if (this.player && typeof this.player.setVolume === 'function') this.player.setVolume(100);
              } catch (_) {}
              if (this.callbacks.onReady) this.callbacks.onReady();
              
              if (this.pendingVideoId) {
                if (this.pendingAutoplay) {
                  this.player.loadVideoById(this.pendingVideoId);
                  this.player.playVideo();
                } else {
                  this.player.cueVideoById(this.pendingVideoId);
                }
                this.pendingVideoId = null;
              }
            },
            onStateChange: (event: any) => {
              // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
              const dur = this.getDuration();
              if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange(event.data, dur);
              }
              if (event.data === 0 && this.callbacks.onEnded) {
                this.callbacks.onEnded();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player engine event error:', err);
              if (this.callbacks.onError) this.callbacks.onError(err);
            }
          }
        });
        return true;
      } catch (e) {
        console.warn('Error initializing YouTube Player instance:', e);
        return false;
      }
    };

    if (!setupPlayer()) {
      // Poll until window.YT is ready
      let attempts = 0;
      this.checkInterval = setInterval(() => {
        attempts++;
        if (setupPlayer() || attempts > 30) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }, 200);

      // Also listen to the official API hook
      const prevHook = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevHook) prevHook();
        setupPlayer();
      };
    }
  }

  public loadAndPlay(videoId: string) {
    if (!videoId || typeof videoId !== 'string') return;
    if (this.isReady && this.player && typeof this.player.loadVideoById === 'function') {
      try {
        if (typeof this.player.unMute === 'function') this.player.unMute();
        if (typeof this.player.setVolume === 'function') this.player.setVolume(100);
        // Force stop previous audio to prevent playing the last listened song
        if (typeof this.player.stopVideo === 'function') {
          this.player.stopVideo();
        }
        this.player.loadVideoById(videoId);
        this.player.playVideo();
      } catch (e) {
        console.warn('loadVideoById call failed, fallback queueing:', e);
        this.pendingVideoId = videoId;
        this.pendingAutoplay = true;
      }
    } else {
      this.pendingVideoId = videoId;
      this.pendingAutoplay = true;
    }
  }

  public play() {
    if (this.isReady && this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {}
    }
  }

  public pause() {
    if (this.isReady && this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }
  }

  public seekTo(seconds: number) {
    if (this.isReady && this.player && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {}
    }
  }

  public setVolume(volume: number) {
    // volume is 0 to 100
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    if (this.isReady && this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(clamped);
        if (clamped === 0) {
          if (typeof this.player.mute === 'function') this.player.mute();
        } else {
          if (typeof this.player.unMute === 'function') this.player.unMute();
        }
      } catch (e) {}
    }
  }

  public getVolume(): number {
    if (this.isReady && this.player && typeof this.player.getVolume === 'function') {
      try {
        return this.player.getVolume() ?? 100;
      } catch (e) {
        return 100;
      }
    }
    return 100;
  }

  public getCurrentTime(): number {
    if (this.isReady && this.player && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime() || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }

  public getDuration(): number {
    if (this.isReady && this.player && typeof this.player.getDuration === 'function') {
      try {
        return this.player.getDuration() || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }

  public destroy() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {}
    }
    this.player = null;
    this.isReady = false;
  }
}

export const ytController = new YouTubeController();
