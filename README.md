# OriginBridge

OriginBridge is a Node.js script that bridges messages between a Discord and OriginChat.

## What does it do?
- Listens for new messages in a specified Discord channel using a Discord bot.
- Forwards those messages to an external chat service via a WebSocket connection.
- Receives messages from the WebSocket and posts them into the Discord channel.

## How does it work?
- The script connects to Discord using the `discord.js` library and logs in as a bot.
- It establishes a WebSocket connection to the OriginChat server using the `ws` library.
- When a message is posted in the Discord channel (and not by a bot), the script sends the message content to the WebSocket server in JSON format.
- When a new message is received from the WebSocket server, the script posts it to the Discord channel.
- The script handles authentication with the WebSocket server using a handshake and validator key process.

## How to run locally

### Prerequisites
- Node.js and npm installed on your system.
- Discord bot token and channel ID.

### Installation
1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Install dependencies:
   ```sh
   npm install discord.js ws
   ```

### Running the script
1. Update the bot tokens and channel IDs in `index.js` with your own credentials for security and proper operation.
2. Make sure your Discord bot is invited to your server and has permission to read and send messages in the target channel.
3. Start the script:
   ```sh
   node index.js
   ```
4. The script will log in to Discord and connect to the WebSocket server. Messages will be bridged automatically.