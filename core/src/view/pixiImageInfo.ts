import { Assets } from "pixi.js";
import type { Texture } from "pixi.js";
import type { ImageInfoProvider } from "@/model/ports";

export class PixiImageInfo implements ImageInfoProvider {
  private readonly sizes = new Map<string, { width: number; height: number }>();

  async preload(urls: string[]): Promise<void> {
    const unique = [...new Set(urls)].filter((url) => !this.sizes.has(url));
    await Promise.all(unique.map(async (url) => {
      try {
        const texture = await Assets.load<Texture>(url);
        this.sizes.set(url, { width: texture.width, height: texture.height });
      } catch {
        // Taille laissée inconnue : buildWorld lèvera « image size unknown: <url> ».
      }
    }));
  }

  sizeOf(url: string): { width: number; height: number } | undefined {
    const size = this.sizes.get(url);
    return size ? { ...size } : undefined;
  }
}
