# MCP Health Check Deployment Configuration

## Environment Variables

Create a `.env` file with the following configuration:

```env
# Server Configuration
MCP_SERVER_URL=http://localhost:8080
MCP_SERVER_TIMEOUT=5000
MCP_EXPECTED_RESPONSE_TIME=1000

# Companies to Monitor
MCP_COMPANIES=default,test,production

# Authentication
MCP_SESSION_COOKIE=__Secure-paperclip-default.session_token

# Alerting
HEALTH_CHECK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
HEALTH_CHECK_EMAIL=admin@company.com

# Schedule
HEALTH_CHECK_INTERVAL=300
HEALTH_CHECK_RETRIES=2
HEALTH_CHECK_RETRY_DELAY=1000
```

## Deployment Options

### 1. Systemd Service (Recommended)

Create `/etc/systemd/system/mcp-health-check.service`:

```ini
[Unit]
Description=MCP Health Check Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=healthcheck
Group=healthcheck
WorkingDirectory=/opt/mcp-health-check
ExecStart=/usr/bin/node mcp-health-check.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/mcp-health-check/.env

[Install]
WantedBy=multi-user.target
```

### 2. Docker Container

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["node", "mcp-health-check.js"]
```

### 3. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-health-check
  labels:
    app: mcp-health-check
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-health-check
  template:
    metadata:
      labels:
        app: mcp-health-check
    spec:
      containers:
      - name: health-check
        image: your-registry/mcp-health-check:latest
        env:
        - name: MCP_SERVER_URL
          valueFrom:
            secretKeyRef:
              name: mcp-config
              key: server-url
        - name: MCP_COMPANIES
          valueFrom:
            secretKeyRef:
              name: mcp-config
              key: companies
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

## Monitoring Integration

### Slack Webhook Example

Add to `mcp-health-check.js`:

```javascript
async function sendSlackAlert(results) {
  if (!process.env.HEALTH_CHECK_WEBHOOK_URL) return;
  
  const payload = {
    text: `MCP Health Check ${results.overallStatus.toUpperCase()}`,
    attachments: [{
      color: results.overallStatus === 'healthy' ? 'good' : 'danger',
      fields: [
        { title: 'Timestamp', value: results.timestamp, short: true },
        { title: 'Status', value: results.overallStatus, short: true },
        { title: 'Errors', value: results.errors.length, short: true },
        { title: 'Warnings', value: results.warnings.length, short: true }
      ]
    }]
  };
  
  if (results.errors.length > 0) {
    payload.attachments[0].fields.push({
      title: 'Recent Errors',
      value: results.errors.slice(0, 3).join('\n'),
      short: false
    });
  }
  
  await axios.post(process.env.HEALTH_CHECK_WEBHOOK_URL, payload);
}
```

### Prometheus Metrics

Add metrics collection:

```javascript
const client = require('prom-client');

const register = new client.Registry();
const healthCheckGauge = new client.Gauge({
  name: 'mcp_health_check_status',
  help: 'MCP health check status (1=healthy, 0=unhealthy)',
  labelNames: ['endpoint', 'status']
});

function updateMetrics(results) {
  Object.entries(results.endpoints).forEach(([endpoint, data]) => {
    healthCheckGauge.set(
      { endpoint, status: data.status },
      data.status === 'healthy' ? 1 : 0
    );
  });
  
  register.metrics().then(metrics => {
    console.log('Prometheus Metrics:', metrics);
  });
}
```