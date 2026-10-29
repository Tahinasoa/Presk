import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import type { SimEnv } from "@/engine/sim/simulation";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { Catalog } from "@/model/catalog";
import type { ObjectEnv } from "@/model/ports";
import { PixiHost } from "@/view/pixiHost";
import { PixiImageInfo } from "@/view/pixiImageInfo";
import { PixiTextMeasurer } from "@/view/pixiTextMeasurer";
import { createDefaultViewRegistry } from "@/view";
import { ViewSync } from "@/view/viewSync";
import type { ViewRegistry } from "@/view/viewRegistry";

function collectImageUrls(raw: unknown): string[] {
  if (typeof raw !== "object" || raw === null) return [];
  const steps = (raw as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) return [];
  const urls: string[] = [];
  for (const step of steps) {
    if (typeof step !== "object" || step === null) continue;
    const { action, type, properties } = step as { action?: unknown; type?: unknown; properties?: unknown };
    if (action !== "create" || type !== "image") continue;
    if (typeof properties !== "object" || properties === null) continue;
    const url = (properties as { url?: unknown }).url;
    if (typeof url === "string") urls.push(url);
  }
  return urls;
}

interface PreskOptions {
  root: string|HTMLElement;
  fps?: number;
}

export class Presk {
  private readonly host: PixiHost;
  private readonly catalog: Catalog;
  private readonly registry: ViewRegistry;
  private readonly objectEnv: ObjectEnv;
  private readonly imageInfo: PixiImageInfo;
  private readonly fps: number | undefined;
  private initialized = false;
  private simulation: Simulation | null = null;
  private viewSync: ViewSync | null = null;
  private frameHandle: number | null = null;
  private readonly callbacks = new Set<(time: number) => void>();

  private constructor(options: PreskOptions) {
    this.host = new PixiHost(options.root);
    this.catalog = createDefaultCatalog();
    this.imageInfo = new PixiImageInfo();
    this.objectEnv = { measurer: new PixiTextMeasurer(), images: this.imageInfo };
    this.registry = createDefaultViewRegistry();
    this.fps = options.fps;
  }

  static async create(options: PreskOptions): Promise<Presk> {
    return new Presk(options);
  }
  async destroy(){
    console.log("You really have to implement 'destroy', to avoid memory leak") ;
  }

  async load(raw: unknown): Promise<void> {
    this.pause();
    this.viewSync?.destroy();
    this.viewSync = null;
    this.simulation = null;

    await this.imageInfo.preload(collectImageUrls(raw));
    const program = compileProgram(raw, { catalog: this.catalog, objectEnv: this.objectEnv });
    if (!this.initialized) {
      await this.host.init(program.scene.width, program.scene.height, program.scene.background);
      this.initialized = true;
    } else {
      this.host.resize(program.scene.width, program.scene.height, program.scene.background);
    }

    const env: SimEnv = {
      catalog: this.catalog,
      objectEnv: this.objectEnv,
      ...(this.fps === undefined ? {} : { fps: this.fps }),
    };
    this.simulation = new Simulation(program, env);
    this.viewSync = new ViewSync(this.simulation.world, this.registry, this.host);
    this.renderAt(0);
  }

  get duration(): number {
    return this.requireSimulation().duration;
  }

  get time(): number {
    return this.simulation?.time ?? -1;
  }

  renderAt(time: number): void {
    this.requireSimulation().seek(time);
    this.requireViewSync().syncAll();
    const currentTime = this.requireSimulation().time;
    for (const callback of this.callbacks) callback(currentTime);
  }

  play(): void {
    const simulation = this.requireSimulation();
    this.pause();
    const startWall = performance.now() - simulation.time * 1000;

    const frame = (now: number): void => {
      const time = (now - startWall) / 1000;
      if (time >= simulation.duration) {
        this.renderAt(simulation.duration);
        this.pause();
        return;
      }
      this.renderAt(time);
      this.frameHandle = requestAnimationFrame(frame);
    };

    this.frameHandle = requestAnimationFrame(frame);
  }

  pause(): void {
    if (this.frameHandle === null) return;
    cancelAnimationFrame(this.frameHandle);
    this.frameHandle = null;
  }

  onFrame(callback: (time: number) => void): void {
    this.callbacks.add(callback);
  }

  private requireSimulation(): Simulation {
    if (!this.simulation) throw new Error("Presk: no document has been loaded.");
    return this.simulation;
  }

  private requireViewSync(): ViewSync {
    if (!this.viewSync) throw new Error("Presk: no document has been loaded.");
    return this.viewSync;
  }
  get sceneWidth(): number {
    return this.requireSimulation().world.root.getNumber("width");
  }

  get sceneHeight(): number {
    return this.requireSimulation().world.root.getNumber("height");
  }
}
