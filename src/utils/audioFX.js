// Native Web Audio API Sound Synthesizer & Procedural Focus Soundscapes
// 100% offline, zero audio file downloads, low latency.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbientType = null;
    this.soundEnabled = true;

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
      this.ctx.resume();
    }
    return this.ctx;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('studysync_sound_enabled', String(this.soundEnabled));
    } catch (e) {}
    if (!this.soundEnabled && this.ambientSource) {
      this.stopAmbient();
    }
    return this.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    try {
      localStorage.setItem('studysync_sound_enabled', String(this.soundEnabled));
    } catch (e) {}
    if (!this.soundEnabled && this.ambientSource) {
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

  // Procedural Focus Soundscapes (Rain, Brown Noise, 40Hz Gamma, Campfire, Cafe, Cyber Drone)
  startAmbient(type = 'brown_noise', volume = 0.5) {
    this.stopAmbient();
    if (!this.soundEnabled) return;

    const ctx = this.initContext();
    if (!ctx) return;

    this.currentAmbientType = type;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0.05, Math.min(1.0, volume)) * 0.25, ctx.currentTime);
    gainNode.connect(ctx.destination);
    this.ambientGain = gainNode;

    if (type === 'binaural_40hz') {
      // 40Hz Gamma focus: Carrier 220Hz in left ear, 260Hz in right ear (40Hz offset)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscL.frequency.value = 220; // A3
      oscR.type = 'sine';
      oscR.frequency.value = 260; // 220 + 40Hz beat

      oscL.connect(merger, 0, 0); // Left channel
      oscR.connect(merger, 0, 1); // Right channel
      merger.connect(gainNode);

      oscL.start();
      oscR.start();

      this.ambientSource = {
        stop: () => {
          try {
            oscL.stop();
            oscR.stop();
          } catch (e) {}
        }
      };
    } else if (type === 'cyber_drone') {
      // Hypnotic Sci-Fi Drone: Detuned sub-bass + resonant low-pass filter
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const sub = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc1.frequency.value = 55; // A1
      osc2.type = 'sawtooth';
      osc2.frequency.value = 56.5; // Slight detune for phasing pulse
      sub.type = 'sine';
      sub.frequency.value = 27.5; // A0 sub

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;
      filter.Q.value = 4.0;

      osc1.connect(filter);
      osc2.connect(filter);
      sub.connect(filter);
      filter.connect(gainNode);

      osc1.start();
      osc2.start();
      sub.start();

      this.ambientSource = {
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
            sub.stop();
          } catch (e) {}
        }
      };
    } else {
      // Noise buffer (Rain, White Noise, Brown Noise, Campfire, Cafe)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown_noise') {
          // Brown noise (integrated white noise)
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        } else if (type === 'rain') {
          // Rain simulation: Pink/brown noise + randomized high-freq droplets
          lastOut = (lastOut + 0.04 * white) / 1.04;
          const drop = Math.random() > 0.998 ? (Math.random() * 0.5) : 0;
          output[i] = lastOut * 2.0 + drop;
        } else if (type === 'campfire') {
          // Campfire: Low wood rumble + occasional pop/crackle transients
          lastOut = (lastOut + 0.03 * white) / 1.03;
          const crackle = Math.random() > 0.9985 ? (Math.random() * 1.8 - 0.9) : 0;
          output[i] = lastOut * 2.2 + crackle;
        } else if (type === 'cafe') {
          // Cafe murmur: Pink/brown modulated room noise
          lastOut = (lastOut + 0.035 * white) / 1.035;
          const modulation = 1 + 0.25 * Math.sin((i / ctx.sampleRate) * 1.5 * Math.PI);
          output[i] = lastOut * 2.2 * modulation;
        } else {
          // White noise
          output[i] = white * 0.3;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for soothing curve
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      } else if (type === 'brown_noise') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
      } else if (type === 'campfire') {
        filter.type = 'lowpass';
        filter.frequency.value = 850;
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.value = 550;
        filter.Q.value = 0.8;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
      }

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      this.ambientSource = whiteNoise;
    }
  }

  setAmbientVolume(volume) {
    if (this.ambientGain && this.ctx) {
      const vol = Math.max(0, Math.min(1.0, volume)) * 0.25;
      this.ambientGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch (e) {}
        this.ambientSource = null;
    }
    this.ambientGain = null;
    this.currentAmbientType = null;
  }
}

export const audioFX = new SoundManager();

