// Test en temps réel de KTimer : vraie horloge, vrais appels, logs console.
// Lancement : pnpm tsx KTimer.live.ts
import KTimer from './ktimer';

// --- Polyfill requestAnimationFrame pour Node (inutile dans un navigateur) ---
const g = globalThis as any;
if (typeof g.requestAnimationFrame === 'undefined') {
  g.requestAnimationFrame = (cb: (t: number) => void) =>
    setTimeout(() => cb(performance.now()), 16);
  g.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// --- Utilitaires ---
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
let failures = 0;

function check(label: string, ok: boolean, detail = ''): void {
  console.log(`${ok ? '✅' : '❌'} ${label} ${detail}`);
  if (!ok) failures++;
}

// Log limité à 1 ligne / 250 ms par tween pour ne pas inonder la console
const lastLog: Record<string, number> = {};
function log(label: string, progress: number, timer: KTimer): void {
  const now = performance.now();
  if (progress !== 1 && now - (lastLog[label] ?? 0) < 250) return;
  lastLog[label] = now;
  const bar = '█'.repeat(Math.round(progress * 20)).padEnd(20, '░');
  console.log(
    `  [${label}] ${bar} ${(progress * 100).toFixed(0).padStart(3)}%  (t=${timer.progress.toFixed(2)}s)`
  );
}

// --- Scénario ---
async function main(): Promise<void> {
  const timer = new KTimer();
  let aCompleted = 0;

  timer
    .at(0, 2, (p) => {
      log('A 0-2s', p, timer);
      if (p === 1) aCompleted++;
    })
    .at(1, 3, (p) => log('B 1-3s', p, timer))
    .at(2.5, 2.5, (p, d) => console.log(`  [C 2.5s] durée nulle -> p=${p}, data=${String(d)}`), 'hello');

  console.log('\n▶ play() pendant 1 seconde');
  timer.play();
  await sleep(1000);

  console.log('\n⏸ pause()');
  timer.pause();
  const t1 = timer.progress;
  check('progress ≈ 1s après 1s de lecture', Math.abs(t1 - 1) < 0.15, `(obtenu ${t1.toFixed(3)})`);

  console.log('\n… 1 seconde en pause (le temps ne doit pas bouger)');
  await sleep(1000);
  const t2 = timer.progress;
  check('temps figé pendant la pause', Math.abs(t2 - t1) < 0.001, `(${t1.toFixed(3)} -> ${t2.toFixed(3)})`);

  console.log('\n▶ play() pendant 2.2 secondes');
  timer.play();
  await sleep(2200);
  timer.pause();
  const t3 = timer.progress;
  check('progress ≈ 3.2s après reprise', Math.abs(t3 - 3.2) < 0.25, `(obtenu ${t3.toFixed(3)})`);
  check('tween A terminé exactement 1 fois', aCompleted === 1, `(${aCompleted})`);

  console.log('\n⏪ seek(0) puis seek(5) : le tween A doit être réarmé puis terminé à nouveau');
  timer.seek(0);
  timer.seek(5);
  check('tween A terminé une 2e fois après réarmement', aCompleted === 2, `(${aCompleted})`);
  check('seek(5) -> progress = 5s', Math.abs(timer.progress - 5) < 0.001);

  console.log(failures === 0 ? '\n🎉 Tout est OK' : `\n💥 ${failures} vérification(s) en échec`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();