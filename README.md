# mcp-twilio

Twilio MCP Pack — send SMS, list messages, make calls via Twilio REST API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `twilio_send_sms` | Send an SMS message via Twilio. Returns the message SID and status. |
| `twilio_list_messages` | List recent SMS/MMS messages from your Twilio account. Supports filtering by to/from number and pagination. |
| `twilio_get_message` | Get details of a specific Twilio message by its SID. |
| `twilio_list_calls` | List recent phone calls from your Twilio account. Returns call SID, status, duration, and direction. |
| `twilio_make_call` | Initiate a phone call via Twilio. Requires a TwiML URL or application SID to control call behavior. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "twilio": {
      "url": "https://gateway.pipeworx.io/twilio/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Twilio data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
