import { api, Query } from "encore.dev/api";
import { admsDB } from "./db";

interface DeviceCmdParams {
  SN: Query<string>;
  INFO: Query<string>;
}

interface DeviceCmdResponse {
  status: string;
}

// Receives command execution status from devices
export const devicecmd = api<DeviceCmdParams, DeviceCmdResponse>(
  { expose: true, method: "POST", path: "/iclock/devicecmd" },
  async (params, { body }) => {
    const deviceSN = params.SN;
    
    // Update device last_seen timestamp
    await admsDB.exec`
      INSERT INTO devices (sn, last_seen) 
      VALUES (${deviceSN}, NOW()) 
      ON CONFLICT (sn) 
      DO UPDATE SET last_seen = NOW()
    `;

    // Process command response from device
    const bodyText = body ? body.toString() : "";
    
    // Mark latest sent command as completed
    await admsDB.exec`
      UPDATE device_commands 
      SET status = 'completed'
      WHERE device_sn = ${deviceSN} AND status = 'sent'
    `;

    return { status: "OK" };
  }
);
