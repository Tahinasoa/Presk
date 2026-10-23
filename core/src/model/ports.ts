export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
}

export interface TextMeasurer {
  measure(text: string, style: TextStyle): { width: number; height: number };
}

export interface ImageInfoProvider {
  sizeOf(url: string): { width: number; height: number } | undefined;
}

export interface ObjectEnv {
  measurer: TextMeasurer;
  images: ImageInfoProvider;
}

export class FakeTextMeasurer implements TextMeasurer {
  measure(text: string, style: TextStyle): { width: number; height: number } {
    return { width: 0.6 * style.fontSize * text.length, height: 1.2 * style.fontSize };
  }
}

export class FakeImageInfo implements ImageInfoProvider {
  private readonly sizes: Record<string, { width: number; height: number }>;

  constructor(sizes: Record<string, { width: number; height: number }> = {}) {
    this.sizes = { ...sizes };
  }

  sizeOf(url: string): { width: number; height: number } | undefined {
    const size = this.sizes[url];
    return size ? { ...size } : undefined;
  }
}

export function createTestEnv(): ObjectEnv {
  return { measurer: new FakeTextMeasurer(), images: new FakeImageInfo() };
}
