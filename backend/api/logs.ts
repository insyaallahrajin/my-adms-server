import { api, Query } from "encore.dev/api";
import { apiDB } from "./db";

interface ListLogsParams {
  limit?: Query<number>;
  offset?: Query<number>;
  pin?: Query<string>;
  date?: Query<string>;
}

interface Log {
  id: number;
  pin: string;
  timestamp: string;
  workcode: number;
  device_sn: string | null;
  created_at: string;
}

interface ListLogsResponse {
  logs: Log[];
  total: number;
}

// List attendance logs with pagination and filtering
export const listLogs = api<ListLogsParams, ListLogsResponse>(
  { expose: true, method: "GET", path: "/api/logs" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.pin) {
      whereClause += ` AND pin = $${paramIndex}`;
      queryParams.push(params.pin);
      paramIndex++;
    }

    if (params.date) {
      whereClause += ` AND DATE(timestamp) = $${paramIndex}`;
      queryParams.push(params.date);
      paramIndex++;
    }

    // Get total count
    const countResult = await apiDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM logs ${whereClause}`,
      ...queryParams
    );
    const total = countResult?.count || 0;

    // Get logs with pagination
    const logs = await apiDB.rawQueryAll<Log>(
      `SELECT id, pin, timestamp, workcode, device_sn, created_at 
       FROM logs ${whereClause} 
       ORDER BY timestamp DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...queryParams, limit, offset
    );

    return {
      logs: logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toString(),
        created_at: log.created_at.toString()
      })),
      total
    };
  }
);
