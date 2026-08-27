// Web Audio API Pure Audio Synthesizer
// Provides 40Hz Gamma Binaural Beats, Ambient Noise (Rain/Lofi), and Futuristic SFX Chimes

let audioCtx = null;
let binauralOscLeft = null;
let binauralOscRight = null;
let binauralGain = null;
let noiseNode = null;
let noiseGain = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play futuristic UI level-up / routine complete chime
export function playLevelUpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.45);
    });
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

// 2. 40Hz Gamma Binaural Beat (Base: 200Hz Left, 240Hz Right -> 40Hz difference for focus)
export function startBinauralBeats(volume = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    stopBinauralBeats();

    // Create Stereo Panner if supported, or dual channel mergers
    const merger = ctx.createChannelMerger(2);
    binauralGain = ctx.createGain();
    binauralGain.gain.setValueAtTime(volume, ctx.currentTime);

    // Left Ear: 200Hz
    binauralOscLeft = ctx.createOscillator();
    binauralOscLeft.type = 'sine';
    binauralOscLeft.frequency.value = 200;

    // Right Ear: 240Hz (produces 40Hz beat in brain)
    binauralOscRight = ctx.createOscillator();
    binauralOscRight.type = 'sine';
    binauralOscRight.frequency.value = 240;

    binauralOscLeft.connect(merger, 0, 0); // Left channel
    binauralOscRight.connect(merger, 0, 1); // Right channel

    merger.connect(binauralGain);
    binauralGain.connect(ctx.destination);

    binauralOscLeft.start();
    binauralOscRight.start();
    return true;
  } catch (e) {
    console.warn("Binaural start error:", e);
    return false;
  }
}

export function setBinauralVolume(volume) {
  if (binauralGain && audioCtx) {
    binauralGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}

export function stopBinauralBeats() {
  try {
    if (binauralOscLeft) {
      binauralOscLeft.stop();
      binauralOscLeft.disconnect();
      binauralOscLeft = null;
    }
    if (binauralOscRight) {
      binauralOscRight.stop();
      binauralOscRight.disconnect();
      binauralOscRight = null;
    }
    if (binauralGain) {
      binauralGain.disconnect();
      binauralGain = null;
    }
  } catch (e) {
    console.warn("Binaural stop error:", e);
  }
}

// 3. Cyber Ambient Rain/Pink Noise Generator
export function startAmbientNoise(volume = 0.2) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    stopAmbientNoise();

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate smooth pink/brown noise (rain effect)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter to give warm rain / soft lofi tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume, ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseNode.start();
    return true;
  } catch (e) {
    console.warn("Ambient noise start error:", e);
    return false;
  }
}

export function setNoiseVolume(volume) {
  if (noiseGain && audioCtx) {
    noiseGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}

export function stopAmbientNoise() {
  try {
    if (noiseNode) {
      noiseNode.stop();
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (noiseGain) {
      noiseGain.disconnect();
      noiseGain = null;
    }
  } catch (e) {
    console.warn("Ambient noise stop error:", e);
  }
}
