import { api } from "encore.dev/api";
import { apiDB } from "./db";

interface CreateUserRequest {
  pin: string;
  name: string;
  device_sn?: string;
}

interface User {
  id: number;
  pin: string;
  name: string;
  created_at: string;
}

interface CreateUserResponse {
  user: User;
  command_sent: boolean;
}

interface ListUsersResponse {
  users: User[];
}

// Create a new user and optionally send command to device
export const createUser = api<CreateUserRequest, CreateUserResponse>(
  { expose: true, method: "POST", path: "/api/users" },
  async (req) => {
    // Insert user into database
    const userRow = await apiDB.queryRow<{
      id: number;
      pin: string;
      name: string;
      created_at: Date;
    }>`
      INSERT INTO users (pin, name)
      VALUES (${req.pin}, ${req.name})
      RETURNING id, pin, name, created_at
    `;

    if (!userRow) {
      throw new Error("Failed to create user");
    }

    let commandSent = false;

    // If device_sn is provided, send command to device
    if (req.device_sn) {
      const command = `DATA QUERY USERINFO PIN=${req.pin}\tName=${req.name}\tPri=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000`;
      
      await apiDB.exec`
        INSERT INTO device_commands (device_sn, command)
        VALUES (${req.device_sn}, ${command})
      `;
      
      commandSent = true;
    }

    return {
      user: {
        id: userRow.id,
        pin: userRow.pin,
        name: userRow.name,
        created_at: userRow.created_at.toISOString()
      },
      command_sent: commandSent
    };
  }
);

// List all users
export const listUsers = api<void, ListUsersResponse>(
  { expose: true, method: "GET", path: "/api/users" },
  async () => {
    const users = await apiDB.queryAll<{
      id: number;
      pin: string;
      name: string;
      created_at: Date;
    }>`
      SELECT id, pin, name, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    return {
      users: users.map(user => ({
        id: user.id,
        pin: user.pin,
        name: user.name,
        created_at: user.created_at.toISOString()
      }))
    };
  }
);
