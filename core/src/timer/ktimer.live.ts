// Test en temps réel de KTimer avec de vrais KObject-generated tweens.
// Lancement : pnpm tsx KTimer.live.ts
import KTimer from './ktimer';
import KObject from "@/primitives/kobject/kobject";

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

// --- Scénario ---
async function main(): Promise<void> {
  const timer = new KTimer();
  const a = new KObject({ id: "A", x: 0, y: 0 });
  const b = new KObject({ id: "B", x: 0, y: 0 });
  const c = new KObject({ id: "C", x: 0, y: 0 });

  timer
    .addTweens(a.getTweens({ x: 100 }, { id: "A", startTime: 0, duration: 2 }))
    .addTweens(b.getTweens({ x: 100 }, { id: "B", startTime: 1, duration: 2 }))
    .addTweens(c.getTweens({ x: 100 }, { id: "C", startTime: 2.5, duration: 0 }));

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
  check('tween A atteint son état final', a.x === 100, `(x=${a.x})`);
  check('tween B atteint son état final', b.x === 100, `(x=${b.x})`);
  check('tween C instantané est appliqué', c.x === 100, `(x=${c.x})`);

  console.log('\n⏪ seek(0) puis seek(5) : les tweens doivent revenir à leur état final');
  timer.seek(0);
  timer.seek(5);
  check('tween A atteint à nouveau son état final', a.x === 100, `(x=${a.x})`);
  check('seek(5) -> progress = 5s', Math.abs(timer.progress - 5) < 0.001);

  console.log(failures === 0 ? '\n🎉 Tout est OK' : `\n💥 ${failures} vérification(s) en échec`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();