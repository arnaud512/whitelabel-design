"use client";

import { useEffect, useState } from "react";
import { DEFAULT_DEVICE, DEVICES, type DeviceId } from "./devices";

const DEVICE_KEY = "whitelabel.device";
const FRAME_KEY = "whitelabel.frameOn";

export function useDevicePreference() {
  const [device, setDeviceState] = useState<DeviceId>(DEFAULT_DEVICE);
  const [frameOn, setFrameOnState] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem(DEVICE_KEY) as DeviceId | null;
      const f = localStorage.getItem(FRAME_KEY);
      if (d && d in DEVICES) setDeviceState(d);
      if (f !== null) setFrameOnState(f === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function setDevice(d: DeviceId) {
    setDeviceState(d);
    try {
      localStorage.setItem(DEVICE_KEY, d);
    } catch {
      // ignore
    }
  }

  function setFrameOn(v: boolean) {
    setFrameOnState(v);
    try {
      localStorage.setItem(FRAME_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
  }

  return { device, setDevice, frameOn, setFrameOn, hydrated };
}
