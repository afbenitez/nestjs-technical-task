# Setup Guide

## What You Need

- Node.js >= 22.13.1
- Docker Desktop
- npm

## 1. Install Dependencies

```powershell
npm install
cd apps/event-tracker
npm install
cd ../..
```

## 2. Start Everything

```powershell
docker-compose up -d
```

This starts:
- Kafka (port 9092)
- MongoDB (port 27017)
- Event Tracker (the app)
- Kafka UI (port 8080)
- Mongo Express (port 8081)

## 3. Test It

Open PowerShell in the project root and run:

```powershell
# Set the env variable
$env:KAFKA_BROKERS="localhost:9092"

# Generate test events
npm run test-producer
```

You'll see something like:
```
Publishing message: { userId: 83, scope: 'top-secret.read', date: '2025-10-16...' }
Publishing message: { userId: 45, scope: 'user.delete', date: '2025-10-16...' }
🚨 Limit exceeded: TOP_SECRET_READ for user 83
```

Press `Ctrl+C` to stop.

## 4. Check the Results

### Option A: Mongo Express (Web UI) 🌐

1. Open your browser: http://localhost:8081
2. Login with:
   - **User:** `admin`
   - **Password:** `admin`
3. Click on **`event-tracker`** database
4. Click on **`notifications`** collection
5. You'll see the notifications:
   ```json
   {
     "_id": "...",
     "userId": 83,
     "limitType": "TOP_SECRET_READ",
     "date": "2025-10-16T..."
   }
   ```

### Option B: Check the Logs 📋

In PowerShell:
```powershell
docker-compose logs -f event-tracker
```

You'll see:
```
event-tracker  | 🚨 Limit exceeded: TOP_SECRET_READ for user 83
event-tracker  | 🚨 Limit exceeded: THREE_USER_DELETIONS for user 45
```

Press `Ctrl+C` to exit.

### Option C: See Kafka Events 📡

1. Open: http://localhost:8080
2. Click **Topics**
3. Click **`test.events.system`**
4. Click **Messages**
5. You'll see all incoming events in real-time

## Development Mode (Without Docker)

```powershell
# Start only infrastructure
docker-compose up -d kafka mongodb

# Run the app in watch mode
cd apps/event-tracker
npm run dev
```

## Useful Commands

### Watch Logs in Real-Time

```powershell
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f event-tracker

# Just Kafka
docker-compose logs -f kafka

# Just MongoDB
docker-compose logs -f mongodb
```

### Check Container Status

```powershell
docker-compose ps
```

You should see:
```
NAME            STATUS          PORTS
event-tracker   Up 2 minutes    3000/tcp
kafka           Up 3 minutes    0.0.0.0:9092->9092/tcp
mongodb         Up 3 minutes    0.0.0.0:27017->27017/tcp
...
```

### Restart a Service

```powershell
docker-compose restart event-tracker
```

### Stop Everything

```powershell
docker-compose down
```

### Clean Slate (Delete All Data)

```powershell
docker-compose down -v
docker-compose up -d
```

## URLs

- Kafka UI: http://localhost:8080
- Mongo Express: http://localhost:8081
- Kafka: localhost:9092
- MongoDB: localhost:27017

## Common Issues

### Kafka won't connect
```powershell
# Wait 30-60 seconds, Kafka takes time to start
docker-compose logs kafka
docker-compose restart kafka
```

### Start from scratch
```powershell
docker-compose down -v
docker-compose up -d
```
