let context: AudioContext | null = null;

// One short sine blip; the pitch follows the step so a sort "sounds" its values.
export function blip(pitch: number, ms = 60) {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.value = 220 + Math.max(0, Math.min(1, pitch)) * 660;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + ms / 1000 + 0.02);
  } catch {
    // No audio device or autoplay blocked: silence is fine.
  }
}
