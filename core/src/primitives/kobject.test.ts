import { describe, it, expect } from 'vitest';
import KObject from './kobjet';

describe('KObject', () => {
  it('initializes properties from constructor args', () => {
    const obj = new KObject({ id: 'hero', x: 10, y: 20, scale: 2, rotation: 90 });

    expect(obj.id).toBe('hero');
    expect(obj.x).toBe(10);
    expect(obj.y).toBe(20);
    expect(obj.scale).toBe(2);
    expect(obj.rotation).toBe(90);
  });

  it('uses default values when optional args are omitted', () => {
    const obj = new KObject({ id: 'hero', x: 10, y: 20 });

    expect(obj.scale).toBe(1);
    expect(obj.rotation).toBe(0);
  });

  it('updates values through setters', () => {
    const obj = new KObject({ id: 'hero', x: 10, y: 20 });

    obj.id = 'enemy';
    obj.x = 15;
    obj.y = 25;
    obj.scale = 3;
    obj.rotation = 45;

    expect(obj.id).toBe('enemy');
    expect(obj.x).toBe(15);
    expect(obj.y).toBe(25);
    expect(obj.scale).toBe(3);
    expect(obj.rotation).toBe(45);
  });
});
