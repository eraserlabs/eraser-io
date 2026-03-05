export const SEQUENCE_DIAGRAM_DESCRIPTION = `Render a sequence diagram. Use Eraser's sequence diagram syntax.

Example syntax:
\`\`\`
title Authentication Flow
autoNumber on

Client [icon: monitor, color: gray]
Server [icon: server, color: blue]
Service [icon: tool, color: green]

Client > Server: Data request
activate Server
Server <> Service: Service request

loop [label: until success, color: green] {
  Service > Service: Check availability
}

Server - Service: Data processing
Server --> Client: Data response
deactivate Server
\`\`\``;
