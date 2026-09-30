# KTimer (`core/src/timer/`)

`KTimer` is a lightweight, zero-dependency timeline and time management engine designed as a clean, performant alternative to GSAP for time-based animation loops, progress tracking, and tween scheduling.

---

## 🌟 Key Features

1. **Second-based Precision**: All timeline values (progress, start time, end time, seek position) are measured in **seconds**.
2. **Tween-like Intervals (`KTween`)**: Register continuous callbacks between any `startTime` and `endTime`. The callback is invoked on every render tick with a normalized progress value between `0` and `1`.
3. **Arbitrary Data Payload**: Pass any custom data of type `unknown` along with a tween, which gets handed back to the callback function.
4. **Playback Control**: Supports `play()`, `pause()`, and `seek(time)` with automatic delta-time advancement via `requestAnimationFrame`.
5. **Auto-Reset on Seek / Rewind**: Tweens automatically reset their completion status when the timeline is scrubbed or sought backwards.

---

## 📖 API Usage Example

```ts
import KTimer from "./ktimer";

const timer = new KTimer();

// 1. Register a continuous tween from t = 0s to t = 2s
timer.at(0, 2, (progress, data) => {
  // progress goes from 0.0 to 1.0
  // data contains optional payload
  console.log(`Animation progress: ${(progress * 100).toFixed(0)}%`, data);
}, { id: "hero-fade" });

// 2. Register another tween overlapping from t = 1s to t = 3s
timer.at(1, 3, (progress) => {
  // ...
});

// Start the timer loop
timer.play();

// Pause the timer
timer.pause();

// Seek directly to 1.5 seconds
timer.seek(1.5);
```

---

## 📁 Files in Module

- **`ktimer.ts`**: Core `KTimer` engine and `KTween` type definition.
- **`ktimer.test.ts`**: Comprehensive unit tests covering progress, pauses, delays, seeks, and tween callbacks.
- **`ktimer.live.ts`**: Real-time Node CLI script demonstrating live clock progress, pauses, and seeks.
