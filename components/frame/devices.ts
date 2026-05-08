export type DeviceId = "se" | "iphone17" | "iphone17promax";

export interface DeviceSpec {
  id: DeviceId;
  label: string;
  width: number;
  height: number;
  cornerRadius: number;
  hasDynamicIsland: boolean;
}

export const DEVICES: Record<DeviceId, DeviceSpec> = {
  se: {
    id: "se",
    label: "iPhone SE",
    width: 375,
    height: 667,
    cornerRadius: 0,
    hasDynamicIsland: false,
  },
  iphone17: {
    id: "iphone17",
    label: "iPhone 17",
    width: 390,
    height: 844,
    cornerRadius: 47,
    hasDynamicIsland: true,
  },
  iphone17promax: {
    id: "iphone17promax",
    label: "iPhone 17 Pro Max",
    width: 440,
    height: 956,
    cornerRadius: 55,
    hasDynamicIsland: true,
  },
};

export const DEFAULT_DEVICE: DeviceId = "iphone17";
