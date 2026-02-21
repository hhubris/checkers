// Synthesized sound effects via Web Audio API.
// AudioContext is created lazily on first call (satisfies browser
// autoplay policy — a user gesture always precedes the first sound).

let _ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  // Resume in case the browser suspended it (autoplay policy).
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// Schedule a single oscillator tone with a fast attack + exponential decay.
function tone(
  freq: number,
  duration: number,
  gain = 0.15,
  type: OscillatorType = 'triangle',
  when = 0,
) {
  const c = ac()
  const t = c.currentTime + when
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

// Soft click when a piece slides to an empty square.
export function playMove() {
  tone(210, 0.07, 0.12)
}

// Sharper descending thwack when a piece is captured.
export function playCapture() {
  const c = ac()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(380, t)
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.06)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  osc.start(t)
  osc.stop(t + 0.16)
}

// Three-note ascending chime when a piece reaches the king row.
export function playKing() {
  tone(523, 0.14, 0.14, 'sine', 0)
  tone(659, 0.14, 0.14, 'sine', 0.1)
  tone(784, 0.22, 0.16, 'sine', 0.2)
}

// Short four-note fanfare when a player wins.
export function playWin() {
  tone(523, 0.14, 0.18, 'sine', 0)
  tone(659, 0.14, 0.18, 'sine', 0.14)
  tone(784, 0.14, 0.18, 'sine', 0.28)
  tone(1046, 0.45, 0.2, 'sine', 0.42)
}

// Descending neutral resolution for a draw.
export function playDraw() {
  tone(440, 0.14, 0.15, 'sine', 0)
  tone(392, 0.14, 0.15, 'sine', 0.14)
  tone(349, 0.32, 0.15, 'sine', 0.28)
}
