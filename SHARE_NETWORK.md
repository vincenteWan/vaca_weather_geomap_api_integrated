# 🌐 Share Your VACA App on Network

## Your App is Now Accessible!

**Local Access (Your Computer):**
- http://localhost:5173

**Network Access (Anyone on Same WiFi):**
- http://192.168.1.37:5173

## 📱 How Others Can Access:

1. **Make sure they are on the SAME WiFi network as you**
2. **Share this URL with them:**
   ```
   http://192.168.1.37:5173
   ```
3. They can open it on:
   - Phone browsers (Safari, Chrome, etc.)
   - Tablets
   - Other computers on the same network

## 🔥 QR Code Option:

You can generate a QR code for easy mobile access:
- Go to: https://qr-code-generator.com/
- Enter: `http://192.168.1.37:5173`
- Generate QR code
- Others can scan with their phone camera

## ⚠️ Important Notes:

- ✅ Container must be running (`docker ps` to check)
- ✅ You and others must be on the SAME WiFi network
- ✅ Your Mac firewall might need to allow incoming connections
- ✅ Your IP address (192.168.1.37) may change if you reconnect to WiFi

## 🔧 If Others Can't Access:

### Check if container is running:
```bash
docker ps
```

### Restart container if needed:
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Check your current IP (in case it changed):
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Check Mac Firewall:
1. Open System Settings
2. Go to Network → Firewall
3. Make sure Docker is allowed

## 🚀 Keep Container Running:

Container is running in detached mode. To stop it:
```bash
docker-compose -f docker-compose.dev.yml down
```

To start it again:
```bash
docker-compose -f docker-compose.dev.yml up -d
```
