import { api, Query } from "encore.dev/api";
import { admsDB } from "./db";

interface CDataParams {
  SN: Query<string>;
  table: Query<string>;
  Stamp: Query<string>;
  OpStamp: Query<string>;
  ErrorDelay: Query<string>;
  Delay: Query<string>;
  TransTimes: Query<string>;
  SessionID: Query<string>;
  TimeZone: Query<string>;
  Realtime: Query<string>;
}

interface CDataResponse {
  status: string;
}

// Receives attendance log data from ZKTeco devices
export const cdata = api<CDataParams, CDataResponse>(
  { expose: true, method: "POST", path: "/iclock/cdata" },
  async (params, { body }) => {
    const deviceSN = params.SN;
    
    // Update device last_seen timestamp
    await admsDB.exec`
      INSERT INTO devices (sn, last_seen) 
      VALUES (${deviceSN}, NOW()) 
      ON CONFLICT (sn) 
      DO UPDATE SET last_seen = NOW()
    `;

    // Parse attendance data from body
    const bodyText = body ? body.toString() : "";
    const lines = bodyText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.trim()) {
        // Expected format: PIN\tDateTime\tVerified\tWorkCode
        // Example: 1\t2023-12-01 08:00:00\t1\t0
        const parts = line.split('\t');
        if (parts.length >= 4) {
          const pin = parts[0];
          const dateTimeStr = parts[1];
          const workcode = parseInt(parts[3]) || 0;
          
          // Parse datetime
          const timestamp = new Date(dateTimeStr);
          
          if (!isNaN(timestamp.getTime())) {
            await admsDB.exec`
              INSERT INTO logs (pin, timestamp, workcode, device_sn)
              VALUES (${pin}, ${timestamp}, ${workcode}, ${deviceSN})
            `;
          }
        }
      }
    }

    return { status: "OK" };
  }
);
