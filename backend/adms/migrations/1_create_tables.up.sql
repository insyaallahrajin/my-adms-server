-- Devices table for storing fingerprint device information
CREATE TABLE devices (
  id BIGSERIAL PRIMARY KEY,
  sn VARCHAR(255) UNIQUE NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table for storing user information
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  pin VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table for storing attendance logs
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  pin VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  workcode INTEGER DEFAULT 0,
  device_sn VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device commands table for storing commands to be sent to devices
CREATE TABLE device_commands (
  id BIGSERIAL PRIMARY KEY,
  device_sn VARCHAR(255) NOT NULL,
  command TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_logs_pin ON logs(pin);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_device_sn ON logs(device_sn);
CREATE INDEX idx_device_commands_device_sn ON device_commands(device_sn);
CREATE INDEX idx_device_commands_status ON device_commands(status);
