import { api, Query } from "encore.dev/api";
import { admsDB } from "./db";

interface GetRequestParams {
  SN: Query<string>;
  INFO: Query<string>;
}

interface GetRequestResponse {
  command: string;
}

// Handles device requests and returns pending commands
export const getrequest = api<GetRequestParams, GetRequestResponse>(
  { expose: true, method: "GET", path: "/iclock/getrequest" },
  async (params) => {
    const deviceSN = params.SN;
    
    // Update device last_seen timestamp
    await admsDB.exec`
      INSERT INTO devices (sn, last_seen) 
      VALUES (${deviceSN}, NOW()) 
      ON CONFLICT (sn) 
      DO UPDATE SET last_seen = NOW()
    `;

    // Check for pending commands
    const command = await admsDB.queryRow<{ id: number; command: string }>`
      SELECT id, command 
      FROM device_commands 
      WHERE device_sn = ${deviceSN} AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (command) {
      // Mark command as sent
      await admsDB.exec`
        UPDATE device_commands 
        SET status = 'sent', executed_at = NOW()
        WHERE id = ${command.id}
      `;
      
      return { command: command.command };
    }

    return { command: "OK" };
  }
);
