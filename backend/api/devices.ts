import { api } from "encore.dev/api";
import { apiDB } from "./db";

interface Device {
  id: number;
  sn: string;
  last_seen: string;
  status: "online" | "offline";
}

interface ListDevicesResponse {
  devices: Device[];
}

// List connected devices with online/offline status
export const listDevices = api<void, ListDevicesResponse>(
  { expose: true, method: "GET", path: "/api/devices" },
  async () => {
    const devices = await apiDB.queryAll<{
      id: number;
      sn: string;
      last_seen: Date;
    }>`
      SELECT id, sn, last_seen 
      FROM devices 
      ORDER BY last_seen DESC
    `;

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    return {
      devices: devices.map(device => ({
        id: device.id,
        sn: device.sn,
        last_seen: device.last_seen.toISOString(),
        status: device.last_seen > fiveMinutesAgo ? "online" : "offline"
      }))
    };
  }
);
