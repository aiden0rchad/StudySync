// Native Web Audio API Sound Synthesizer & Procedural Focus Soundscapes
// 100% offline, zero audio file downloads, low latency.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientAudioEl = null;
    this.currentAmbientType = null;
    this.soundEnabled = true;
    this.audioBufferCache = new Map();

    try {
      const saved = localStorage.getItem('studysync_sound_enabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    } catch (e) {}
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ambientAudioEl && this.ambientAudioEl.paused && this.currentAmbientType && this.currentAmbientType !== 'off') {
      this.ambientAudioEl.play().catch(() => {});
    }
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('studysync_sound_enabled', String(this.soundEnabled));
    } catch (e) {}
    if (!this.soundEnabled && (this.ambientSource || this.ambientAudioEl)) {
      this.stopAmbient();
    }
    return this.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    try {
      localStorage.setItem('studysync_sound_enabled', String(this.soundEnabled));
    } catch (e) {}
    if (!this.soundEnabled && (this.ambientSource || this.ambientAudioEl)) {
      this.stopAmbient();
    }
  }

  // Play a pleasant major chord chime for task completion
  playTaskComplete() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.55);
    });
  }

  // Play an energetic chime for a correct quiz answer
  playQuizCorrect() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // G5 (783.99) -> C6 (1046.50)
    [783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }

  // Play a soft low buzz for incorrect answer
  playQuizWrong() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Play a triumphant fanfare when leveling up
  playLevelUp() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5, E5, G5, B5, C6 arpeggio with sustain
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + (i === notes.length - 1 ? 1.0 : 0.4));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.1);
    });
  }

  // Card flip / swipe swoosh
  playCardFlip() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Subtle button click
  playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Realistic Mechanical Keyboard "Thocky" Switch Click
  // Synthesizes tactile keycap transient click + dampened switch housing thud
  playMechanicalClick(customVol = 0.18) {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Slight pitch randomization (+/- 7%) for natural human typing variability
    const jitter = 0.93 + Math.random() * 0.14;

    // 1. High-frequency stem click transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1850 * jitter, now);
    clickOsc.frequency.exponentialRampToValueAtTime(800 * jitter, now + 0.008);

    clickGain.gain.setValueAtTime(customVol * 0.7, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.015);

    // 2. Low-frequency "thock" bottom-out resonance
    const thockOsc = ctx.createOscillator();
    const thockGain = ctx.createGain();
    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(280 * jitter, now);
    thockOsc.frequency.exponentialRampToValueAtTime(110 * jitter, now + 0.035);

    thockGain.gain.setValueAtTime(customVol * 0.9, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    thockOsc.connect(thockGain);
    thockGain.connect(ctx.destination);
    thockOsc.start(now);
    thockOsc.stop(now + 0.05);
  }

  // Exam Raid Boss Battle Impact Sound
  playBossHit() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Low sub-bass drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.28);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.28);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Boss Defeated Victory Chime
  playBossDefeated() {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Dramatic chord sequence: C4, G4, C5, E5, G5, C6
    const freqs = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + (idx === freqs.length - 1 ? 1.4 : 0.6));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 1.5);
    });
  }

  // Ambient Soundscapes (Rain, Campfire, Midnight Cafe, Brown Noise, 40Hz Gamma, Cyber Drone)
  startAmbient(type = 'brown_noise', volume = 0.5) {
    this.stopAmbient();
    if (!this.soundEnabled || type === 'off') return;

    this.currentAmbientType = type;
    const clampedVol = Math.max(0.05, Math.min(1.0, volume));

    const audioFiles = ['rain', 'campfire', 'cafe', 'brown_noise', 'binaural_40hz', 'cyber_drone'];
    if (!audioFiles.includes(type)) {
      this.startProceduralAmbient(type, volume);
      return;
    }

    // 1. If Web Audio is active and buffer is cached, use sample-accurate buffer looper
    const ctx = this.initContext();
    if (ctx && ctx.state === 'running' && this.audioBufferCache.has(type)) {
      try {
        const audioBuffer = this.audioBufferCache.get(type);
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(clampedVol, ctx.currentTime);
        gainNode.connect(ctx.destination);
        this.ambientGain = gainNode;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = audioBuffer.duration;
        source.connect(gainNode);
        source.start(0);

        this.ambientSource = source;
        return;
      } catch (err) {
        console.warn(`Web Audio buffer looper error for ${type}:`, err);
      }
    }

    // 2. Primary / Fast-start: HTML5 Audio (Plays immediately in 0ms, robust across all browsers)
    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.loop = true;
        audio.volume = clampedVol;
        this.ambientAudioEl = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn(`HTML5 audio playback error for ${type}:`, err);
            this.startProceduralAmbient(type, volume);
          });
        }

        this.ambientSource = {
          stop: () => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {}
          }
        };

        // In the background, pre-decode buffer for Web Audio if context is available
        if (ctx && !this.audioBufferCache.has(type)) {
          fetch(`/sounds/${type}.mp3`)
            .then(res => res.arrayBuffer())
            .then(buf => ctx.decodeAudioData(buf))
            .then(decoded => this.audioBufferCache.set(type, decoded))
            .catch(() => {});
        }

        return;
      } catch (e) {
        console.warn('HTML Audio instantiation error:', e);
      }
    }

    // 3. Fallback: Web Audio API procedural synthesis
    this.startProceduralAmbient(type, volume);
  }

  startProceduralAmbient(type = 'brown_noise', volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const gainNode = ctx.createGain();
    const clampedVol = Math.max(0.05, Math.min(1.0, volume));
    gainNode.gain.setValueAtTime(clampedVol * 0.7, ctx.currentTime);
    gainNode.connect(ctx.destination);
    this.ambientGain = gainNode;

    if (type === 'binaural_40hz') {
      // 40Hz Gamma focus: Carrier 216Hz in left ear, 256Hz in right ear (40Hz offset)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const pad = ctx.createOscillator();
      const padGain = ctx.createGain();
      const merger = ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscL.frequency.value = 216;
      oscR.type = 'sine';
      oscR.frequency.value = 256;

      pad.type = 'sine';
      pad.frequency.value = 220;
      padGain.gain.value = 0.2;
      pad.connect(padGain);
      padGain.connect(gainNode);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscL.start();
      oscR.start();
      pad.start();

      this.ambientSource = {
        stop: () => {
          try {
            oscL.stop();
            oscR.stop();
            pad.stop();
          } catch (e) {}
        }
      };
    } else if (type === 'cyber_drone') {
      // Hypnotic Sci-Fi Drone: Detuned analog saw/sub + resonant filter
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const sub = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc1.frequency.value = 110;
      osc2.type = 'sawtooth';
      osc2.frequency.value = 110.8;
      osc3.type = 'triangle';
      osc3.frequency.value = 164.81;
      sub.type = 'sine';
      sub.frequency.value = 55;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      filter.Q.value = 2.5;

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      sub.connect(filter);
      filter.connect(gainNode);

      osc1.start();
      osc2.start();
      osc3.start();
      sub.start();

      this.ambientSource = {
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
            osc3.stop();
            sub.stop();
          } catch (e) {}
        }
      };
    } else {
      // Expanded 6-second realistic procedural noise buffer
      const bufferSize = ctx.sampleRate * 6;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const outputL = noiseBuffer.getChannelData(0);
      const outputR = noiseBuffer.getChannelData(1);

      let lastOutL = 0.0;
      let lastOutR = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        if (type === 'brown_noise') {
          lastOutL = (lastOutL + 0.02 * whiteL) / 1.02;
          lastOutR = (lastOutR + 0.02 * whiteR) / 1.02;
          outputL[i] = lastOutL * 3.5;
          outputR[i] = lastOutR * 3.5;
        } else if (type === 'rain') {
          // Rain: pink wash + water droplet impacts with exponential decays
          lastOutL = (lastOutL + 0.035 * whiteL) / 1.035;
          lastOutR = (lastOutR + 0.035 * whiteR) / 1.035;
          const dropL = Math.random() > 0.997 ? (Math.random() * 0.4) : 0;
          const dropR = Math.random() > 0.997 ? (Math.random() * 0.4) : 0;
          outputL[i] = lastOutL * 2.2 + dropL;
          outputR[i] = lastOutR * 2.2 + dropR;
        } else if (type === 'campfire') {
          // Campfire: low combustion rumble + wood snaps & crackles
          lastOutL = (lastOutL + 0.028 * whiteL) / 1.028;
          lastOutR = (lastOutR + 0.028 * whiteR) / 1.028;
          const crackleL = Math.random() > 0.9975 ? (Math.random() * 1.6 - 0.8) : 0;
          const crackleR = Math.random() > 0.9975 ? (Math.random() * 1.6 - 0.8) : 0;
          outputL[i] = lastOutL * 2.4 + crackleL;
          outputR[i] = lastOutR * 2.4 + crackleR;
        } else if (type === 'cafe') {
          // Cafe murmur: modulated room presence + faint ceramic rings
          lastOutL = (lastOutL + 0.032 * whiteL) / 1.032;
          lastOutR = (lastOutR + 0.032 * whiteR) / 1.032;
          const clink = Math.random() > 0.9992 ? (Math.sin((i / ctx.sampleRate) * 2 * Math.PI * 2400) * 0.25) : 0;
          const mod = 1 + 0.2 * Math.sin((i / ctx.sampleRate) * 1.8 * Math.PI);
          outputL[i] = lastOutL * 2.2 * mod + clink;
          outputR[i] = lastOutR * 2.2 * mod + clink;
        } else {
          outputL[i] = whiteL * 0.3;
          outputR[i] = whiteR * 0.3;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
      } else if (type === 'brown_noise') {
        filter.type = 'lowpass';
        filter.frequency.value = 550;
      } else if (type === 'campfire') {
        filter.type = 'lowpass';
        filter.frequency.value = 850;
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.value = 650;
        filter.Q.value = 0.9;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
      }

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();

      this.ambientSource = noiseSource;
    }
  }

  setAmbientVolume(volume) {
    const clampedVol = Math.max(0.05, Math.min(1.0, volume));
    if (this.ambientAudioEl) {
      try {
        this.ambientAudioEl.volume = clampedVol;
      } catch (e) {}
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(clampedVol, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientAudioEl) {
      try {
        this.ambientAudioEl.pause();
        this.ambientAudioEl.currentTime = 0;
      } catch (e) {}
      this.ambientAudioEl = null;
    }
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch (e) {}
      this.ambientGain = null;
    }
    this.currentAmbientType = null;
  }
}

export const audioFX = new SoundManager();

