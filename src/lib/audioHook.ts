/**
 * HackerTube 10-Second Instant Audio Hook & Acoustic Preview Engine
 * Designed to solve the 55.6% mobile traffic autoplay blockage.
 * Zero heavy dependencies (pure Web Audio API + Web Speech API).
 */

import { VideoItem } from "@/data/videos";
import { trackAudioHookPlay } from "./tracker";

type AudioStateCallback = (isPlaying: boolean, progressPercent: number) => void;

class AudioHookManager {
  private activeVideoId: string | null = null;
  private isSpeaking: boolean = false;
  private listeners: Set<AudioStateCallback> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private expectedDurationMs: number = 10000;

  /**
   * Play futuristic acoustic activation chime via Web Audio API
   */
  private playIntroChime(): void {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12); // D6

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext policy restriction fallback
    }
  }

  public getActiveVideoId(): string | null {
    return this.activeVideoId;
  }

  public isPlaying(videoId?: string): boolean {
    if (!this.isSpeaking) return false;
    return videoId ? this.activeVideoId === videoId : this.isSpeaking;
  }

  public subscribe(cb: AudioStateCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(isPlaying: boolean, progress: number = 0): void {
    this.listeners.forEach((cb) => cb(isPlaying, progress));
  }

  public stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (this.timer) clearTimeout(this.timer);
    if (this.progressInterval) clearInterval(this.progressInterval);

    this.isSpeaking = false;
    this.activeVideoId = null;
    this.notify(false, 0);
  }

  public play(video: VideoItem, source: string = "card"): void {
    // If currently playing the same video, toggle stop
    if (this.activeVideoId === video.id && this.isSpeaking) {
      this.stop();
      return;
    }

    this.stop();
    this.activeVideoId = video.id;
    this.isSpeaking = true;

    // Track analytics event
    trackAudioHookPlay(video.id, video.title, source);

    // 1. Play high-tech soft chime
    this.playIntroChime();

    // 2. Build concise 10-second speech text
    const primaryTakeaway = video.aiKeyTakeaways?.[0] || video.hnExcerpt || "";
    // Clean text to avoid markdown or latex artifacts
    const cleanTakeaway = primaryTakeaway
      .replace(/\$[^$]+\$/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[#*`_]/g, "")
      .trim();

    const script = `${video.channelTitle}'s core takeaway on ${video.title}: ${cleanTakeaway}`;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Browser does not support speech synthesis
      this.isSpeaking = false;
      this.notify(false, 0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.08; // Crisp pacing
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    // Select natural English voice if possible
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel") ||
          v.name.includes("Aaron") ||
          v.name.includes("Arthur"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.startTime = Date.now();
    // Rough estimate: ~18 words per 5 seconds -> ~10000ms for normal takeaway
    const wordCount = script.split(/\s+/).length;
    this.expectedDurationMs = Math.max(7000, Math.min(14000, (wordCount / 2.8) * 1000));

    this.progressInterval = setInterval(() => {
      if (!this.isSpeaking) return;
      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(100, (elapsed / this.expectedDurationMs) * 100);
      this.notify(true, progress);
    }, 100);

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify(true, 0);
    };

    utterance.onend = () => {
      this.stop();
    };

    utterance.onerror = () => {
      this.stop();
    };

    // Auto-stop safety timeout in case onend is dropped by browser
    this.timer = setTimeout(() => {
      this.stop();
    }, this.expectedDurationMs + 2000);

    window.speechSynthesis.speak(utterance);
  }
}

export const audioHookManager = new AudioHookManager();
