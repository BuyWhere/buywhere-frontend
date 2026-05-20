# MCP Authenticated Endpoint Health Check

This comprehensive health check system monitors the Machine Control Plane (MCP) authenticated endpoints to ensure they are functioning properly and responding within acceptable time limits.

## Features

- **Basic Server Health**: Checks if the MCP server is running and responding
- **Authentication Testing**: Validates session-based authentication mechanisms
- **Endpoint Monitoring**: Tests all critical MCP endpoints including:
  - `/api/companies/{company_id}/live-runs`
  - `/api/companies/{company_id}/heartbeat-runs`
  - `/api/companies/{company_id}/agents`
  - `/api/companies/{company_id}/dashboard`
- **Response Time Monitoring**: Tracks response times and flags slow endpoints
- **Error Detection**: Captures and reports errors for all endpoints
- **JSON Report Generation**: Creates detailed health check reports

## Installation

```bash
# Install dependencies
npm install

# Run health check
npm start

# Run with testing mode
npm test
```

## Configuration

Edit `mcp-health-check.js` to modify the following settings:

```javascript
const HEALTH_CHECK_CONFIG = {
  serverUrl: 'http://localhost:8080',        // MCP server URL
  timeout: 5000,                             // Request timeout in ms
  retryCount: 2,                            // Number of retry attempts
  retryDelay: 1000,                         // Delay between retries in ms
  testCompanies: ['default'],               // Company IDs to test
  expectedResponseTime: 1000,               // Max acceptable response time
  sessionCookie: '__Secure-paperclip-default.session_token'
};
```

## Usage

### Basic Health Check

```bash
node mcp-health-check.js
```

### Testing Mode

```bash
node test-health-check.js
```

## Output

### Console Output
The script provides real-time feedback during execution:

```
🚀 Starting MCP Authenticated Endpoint Health Check

✅ Server health check passed
✅ Authentication successful
✅ live-runs_default (/api/companies/default/live-runs) - 45ms
✅ heartbeat-runs_default (/api/companies/default/heartbeat-runs) - 67ms
✅ agents_default (/api/companies/default/agents) - 123ms
✅ dashboard_default (/api/companies/default/dashboard) - 89ms

📊 Health Check Report: /path/to/health-check-report.json
📈 Overall Status: HEALTHY
🔵 Server Status: HEALTHY
⚪ Endpoints Tested: 4
❌ Errors: 0
⚠️ Warnings: 0

🎯 Health Check Complete: PASSED
```

### JSON Report

A detailed JSON report is generated at `health-check-report.json`:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "serverStatus": "healthy",
  "endpoints": {
    "mcp_live-runs_default": {
      "status": "healthy",
      "responseTime": 45,
      "statusCode": 200,
      "error": null
    },
    "mcp_heartbeat-runs_default": {
      "status": "healthy",
      "responseTime": 67,
      "statusCode": 200,
      "error": null
    }
  },
  "overallStatus": "healthy",
  "errors": [],
  "warnings": []
}
```

## Status Indicators

- **✅ Healthy**: Endpoint responding within expected time limits
- **⚠️ Slow**: Endpoint responding but slower than expected
- **❌ Unhealthy**: Endpoint not responding or returning errors
- **🔥 Critical**: Server-level issues affecting all endpoints

## Authentication

The health check automatically handles session-based authentication:

1. Attempts to authenticate using configured session cookie
2. Falls back to unauthenticated checks if authentication fails
3. Includes session token in requests when available

## Integration

### Cron Jobs
```bash
# Run health check every 5 minutes
*/5 * * * * /usr/bin/node /path/to/mcp-health-check.js >> /var/log/mcp-health.log 2>&1
```

### Monitoring Systems
The JSON output can be easily parsed by monitoring systems like:
- Prometheus
- Grafana
- Datadog
- New Relic
- custom monitoring scripts

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure MCP server is running on configured port
2. **Authentication Failed**: Verify session cookie configuration and validity
3. **Timeout Issues**: Increase timeout values for slow networks
4. **401 Errors**: Check authentication setup and session management

### Debug Mode
Add debug logging by modifying the script:

```javascript
console.log('DEBUG:', { serverUrl, sessionData, testCompanies });
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test changes thoroughly
4. Submit a pull request

## License

MIT - see LICENSE file for details