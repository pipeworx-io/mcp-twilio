# mcp-twilio

Twilio MCP Pack — send SMS, list messages, make calls via Twilio REST API.

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `twilio_send_sms` | Send an SMS message via Twilio. Returns the message SID and status. |
| `twilio_list_messages` | List recent SMS/MMS messages from your Twilio account. Supports filtering by to/from number and pagination. |
| `twilio_get_message` | Get details of a specific Twilio message by its SID. |
| `twilio_list_calls` | List recent phone calls from your Twilio account. Returns call SID, status, duration, and direction. |
| `twilio_make_call` | Initiate a phone call via Twilio. Requires a TwiML URL or application SID to control call behavior. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "twilio": {
      "url": "https://gateway.pipeworx.io/twilio/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use twilio
```

## License

MIT
