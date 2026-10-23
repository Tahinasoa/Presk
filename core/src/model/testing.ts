import type { ObjectEnv } from "@/model/ports";
import { createTestEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, StateValue } from "@/model/values";

export class TestObject extends SceneObject {
  localBounds() {
    return null;
  }
}

const testDef: ClassDef = {
  type: "test",
  family: "rectangle",
  creatable: true,
  props: {},
  indexed: {},
  effects: {},
  paths: {},
  create: (id: string, env: ObjectEnv) => new TestObject(id, testDef, env, {}),
};

export function makeTestObject(id: string, initial: Record<string, StateValue> = {}): TestObject {
  return new TestObject(id, testDef, createTestEnv(), initial);
}
