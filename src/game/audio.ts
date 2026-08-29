/* Крошечный WebAudio-синтезатор для аркадных блипов. Без внешних файлов. */

type OscType = OscillatorType;

export class Sfx {
  muted = false;
  private ctx: AudioContext | null = null;

  /** Вызывать по пользовательскому жесту (клик/касание). */
  ensure(): void {
    if (!this.ctx) {
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  private tone(
    f0: number,
    f1: number,
    dur: number,
    type: OscType = "square",
    gain = 0.045,
    delay = 0
  ): void {
    if (this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(30, f0), t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      /* звук — не повод падать */
    }
  }

  eat(): void {
    this.tone(520, 780, 0.09, "square", 0.05);
    this.tone(1040, 1400, 0.05, "sine", 0.02, 0.02);
  }

  bonus(): void {
    this.tone(660, 660, 0.08, "triangle", 0.055);
    this.tone(880, 880, 0.08, "triangle", 0.055, 0.07);
    this.tone(1320, 1560, 0.12, "triangle", 0.055, 0.14);
  }

  die(): void {
    this.tone(320, 52, 0.5, "sawtooth", 0.06);
    this.tone(160, 40, 0.6, "square", 0.04, 0.06);
  }

  go(): void {
    this.tone(392, 784, 0.14, "triangle", 0.05);
  }

  click(): void {
    this.tone(700, 620, 0.05, "sine", 0.035);
  }

  pause(): void {
    this.tone(520, 340, 0.1, "triangle", 0.04);
  }

  record(): void {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => this.tone(n, n * 1.01, 0.12, "triangle", 0.05, i * 0.085));
  }
}
