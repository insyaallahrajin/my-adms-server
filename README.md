# ZKTeco ADMS Server

A complete Attendance Data Management System (ADMS) server for ZKTeco fingerprint devices that support the ADMS (HTTP Push) protocol.

## Features

- **ADMS Protocol Support**: Complete implementation of ZKTeco's ADMS HTTP Push protocol
- **Real-time Data**: Live attendance data collection from fingerprint devices
- **Device Management**: Monitor connected devices and their status
- **User Management**: Add and manage users with device synchronization
- **Web Dashboard**: Modern React-based dashboard for monitoring and management
- **Database Storage**: PostgreSQL database for reliable data persistence

## Architecture

### Backend (Encore.ts)
- **ADMS Service**: Handles communication with ZKTeco devices
  - `/iclock/cdata` - Receives attendance log data
  - `/iclock/getrequest` - Handles device requests and sends commands
  - `/iclock/devicecmd` - Processes command execution responses

- **API Service**: REST API for frontend communication
  - `GET /api/logs` - List attendance logs with filtering and pagination
  - `GET /api/devices` - List connected devices with status
  - `GET /api/users` - List registered users
  - `POST /api/users` - Create new user and sync to device

### Frontend (React + TypeScript)
- **Dashboard**: Overview of system status
- **Attendance Logs**: Real-time log viewing with filters
- **Device Management**: Monitor device connectivity
- **User Management**: Add and manage users

### Database Schema
```sql
-- Devices table
CREATE TABLE devices (
  id BIGSERIAL PRIMARY KEY,
  sn VARCHAR(255) UNIQUE NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  pin VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  pin VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  workcode INTEGER DEFAULT 0,
  device_sn VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device commands table
CREATE TABLE device_commands (
  id BIGSERIAL PRIMARY KEY,
  device_sn VARCHAR(255) NOT NULL,
  command TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);
```

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository
2. Run with Docker Compose:
```bash
docker-compose up -d
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Encore CLI (`npm install -g @encore/cli`)

#### Backend Setup
```bash
cd backend
npm install
encore run
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Device Configuration

Configure your ZKTeco device to use ADMS protocol:

1. Access device web interface or use ZKAccess software
2. Set communication mode to "ADMS" or "HTTP Push"
3. Configure server settings:
   - Server IP: Your server IP address
   - Port: 5000 (or your configured port)
   - Upload Period: 30 seconds (recommended)

## Work Codes

The system supports standard ZKTeco work codes:
- `0`: Check In
- `1`: Check Out
- `2`: Break Out
- `3`: Break In
- `4`: Overtime In
- `5`: Overtime Out

## API Documentation

### ADMS Endpoints (for devices)
- `POST /iclock/cdata?SN=device_sn` - Receive attendance data
- `GET /iclock/getrequest?SN=device_sn` - Get pending commands
- `POST /iclock/devicecmd?SN=device_sn` - Receive command responses

### REST API Endpoints (for frontend)
- `GET /api/logs?limit=50&offset=0&pin=123&date=2023-12-01` - List logs
- `GET /api/devices` - List devices
- `GET /api/users` - List users  
- `POST /api/users` - Create user

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string

### Frontend
- `VITE_API_URL`: Backend API base URL

## Production Deployment

### Using Docker Compose
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy backend with Encore
4. Build and serve frontend with nginx or similar

## Troubleshooting

### Device Not Connecting
1. Check network connectivity
2. Verify server IP and port in device settings
3. Check firewall rules
4. Monitor device logs in the dashboard

### Data Not Appearing
1. Check device time synchronization
2. Verify ADMS protocol is enabled
3. Check server logs for errors
4. Ensure database connection is working

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review ZKTeco device documentation for ADMS protocol specifics
