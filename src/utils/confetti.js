import confetti from 'canvas-confetti';

// Standard celebration burst for completing an assignment
export function triggerTaskConfetti() {
  confetti({
    particleCount: 65,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
    disableForReducedMotion: true,
  });
}

// Intense gold & violet fireworks for leveling up or clearing all tasks
export function triggerLevelUpConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // two bursts from left and right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#6366f1', '#ffffff'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#6366f1', '#ffffff'],
    });
  }, 250);
}

// Quick micro-burst for answering a quiz correctly or claiming a daily quest
export function triggerMiniConfetti(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { x, y },
    colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
    disableForReducedMotion: true,
  });
}
