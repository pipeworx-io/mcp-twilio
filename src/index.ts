interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Twilio MCP Pack — send SMS, list messages, make calls via Twilio REST API.
 *
 * BYO key: pass _accountSid and _authToken as parameters.
 * Auth: HTTP Basic with accountSid:authToken.
 * Note: Twilio uses form-encoded POST bodies, not JSON.
 */


function twilioHeaders(accountSid: string, authToken: string) {
  const encoded = btoa(`${accountSid}:${authToken}`);
  return { Authorization: `Basic ${encoded}` };
}

function baseUrl(accountSid: string) {
  return `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
}

async function twilioGet(accountSid: string, authToken: string, path: string) {
  const res = await fetch(`${baseUrl(accountSid)}${path}`, {
    headers: twilioHeaders(accountSid, authToken),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function twilioPost(accountSid: string, authToken: string, path: string, body: URLSearchParams) {
  const res = await fetch(`${baseUrl(accountSid)}${path}`, {
    method: 'POST',
    headers: {
      ...twilioHeaders(accountSid, authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'twilio_send_sms',
    description: 'Send an SMS message via Twilio. Returns the message SID and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _accountSid: { type: 'string', description: 'Twilio Account SID (starts with AC...)' },
        _authToken: { type: 'string', description: 'Twilio Auth Token' },
        to: { type: 'string', description: 'Destination phone number in E.164 format (e.g., +15551234567)' },
        from: { type: 'string', description: 'Twilio phone number to send from in E.164 format' },
        body: { type: 'string', description: 'Message body text (max 1600 characters)' },
      },
      required: ['_accountSid', '_authToken', 'to', 'from', 'body'],
    },
  },
  {
    name: 'twilio_list_messages',
    description: 'List recent SMS/MMS messages from your Twilio account. Supports filtering by to/from number and pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _accountSid: { type: 'string', description: 'Twilio Account SID' },
        _authToken: { type: 'string', description: 'Twilio Auth Token' },
        limit: { type: 'number', description: 'Max messages to return (default 20, max 100)' },
        to: { type: 'string', description: 'Filter by destination phone number' },
        from: { type: 'string', description: 'Filter by sender phone number' },
      },
      required: ['_accountSid', '_authToken'],
    },
  },
  {
    name: 'twilio_get_message',
    description: 'Get details of a specific Twilio message by its SID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _accountSid: { type: 'string', description: 'Twilio Account SID' },
        _authToken: { type: 'string', description: 'Twilio Auth Token' },
        sid: { type: 'string', description: 'Message SID (starts with SM...)' },
      },
      required: ['_accountSid', '_authToken', 'sid'],
    },
  },
  {
    name: 'twilio_list_calls',
    description: 'List recent phone calls from your Twilio account. Returns call SID, status, duration, and direction.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _accountSid: { type: 'string', description: 'Twilio Account SID' },
        _authToken: { type: 'string', description: 'Twilio Auth Token' },
        limit: { type: 'number', description: 'Max calls to return (default 20, max 100)' },
      },
      required: ['_accountSid', '_authToken'],
    },
  },
  {
    name: 'twilio_make_call',
    description: 'Initiate a phone call via Twilio. Requires a TwiML URL or application SID to control call behavior.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _accountSid: { type: 'string', description: 'Twilio Account SID' },
        _authToken: { type: 'string', description: 'Twilio Auth Token' },
        to: { type: 'string', description: 'Destination phone number in E.164 format' },
        from: { type: 'string', description: 'Twilio phone number to call from in E.164 format' },
        url: { type: 'string', description: 'TwiML URL that controls what happens when the call connects' },
      },
      required: ['_accountSid', '_authToken', 'to', 'from', 'url'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const accountSid = args._accountSid as string | undefined;
  const authToken = args._authToken as string | undefined;
  delete args._context;
  delete args._apiKey;
  delete args._accountSid;
  delete args._authToken;

  if (!accountSid || !authToken) {
    throw new Error('Both _accountSid and _authToken are required for Twilio API access');
  }

  switch (name) {
    case 'twilio_send_sms': {
      const body = new URLSearchParams();
      body.set('To', args.to as string);
      body.set('From', args.from as string);
      body.set('Body', args.body as string);
      return twilioPost(accountSid, authToken, '/Messages.json', body);
    }
    case 'twilio_list_messages': {
      const params = new URLSearchParams();
      params.set('PageSize', String(Math.min(100, (args.limit as number) ?? 20)));
      if (args.to) params.set('To', args.to as string);
      if (args.from) params.set('From', args.from as string);
      return twilioGet(accountSid, authToken, `/Messages.json?${params}`);
    }
    case 'twilio_get_message':
      return twilioGet(accountSid, authToken, `/Messages/${args.sid}.json`);
    case 'twilio_list_calls': {
      const params = new URLSearchParams();
      params.set('PageSize', String(Math.min(100, (args.limit as number) ?? 20)));
      return twilioGet(accountSid, authToken, `/Calls.json?${params}`);
    }
    case 'twilio_make_call': {
      const body = new URLSearchParams();
      body.set('To', args.to as string);
      body.set('From', args.from as string);
      body.set('Url', args.url as string);
      return twilioPost(accountSid, authToken, '/Calls.json', body);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 } } satisfies McpToolExport;
