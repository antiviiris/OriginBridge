// Replace the following with the URL of your OriginChat server
const wss = 'wss://chats.mistium.com';

// Replace the following with a Rotur account's token and bot name. The bot name is case-sensitive.
const botToken = 'rotur-token';
const botName = 'rotur-acc';

// Replace the following a Discord bot token.
const discordBotToken = 'discord-bot-token';

// Change the following to coorelate OriginChat channels with Discord channels.
// Use Discord channel IDs for the Discord channels and channel names for OriginChat channels.
// Channels not listed here will not be bridged.
const bridges = [
//  {
//      originchats: 'channel-name',
//      discord: 'channel-id'
//  },
]

////////////////////////////////////////////////////////////////////////////////////
// Utilities                                                                      //
////////////////////////////////////////////////////////////////////////////////////

function prepareMsg(message, author) {
    return `${author}: ${message}`;
}

////////////////////////////////////////////////////////////////////////////////////
// OriginChat's Side                                                              //
////////////////////////////////////////////////////////////////////////////////////

const WebSocket = require('ws');

function startWebSocket() {
  global._ws = new WebSocket(wss);
  _ws.onmessage = manageHandshake;
}

async function manageHandshake(event) {
  let message = event.data;
  message = JSON.parse(message);
  if (message.cmd != "handshake") return;
  let validator = await fetch(`https://social.rotur.dev/generate_validator?key=${message.val.validator_key}&auth=${botToken}`)
    .then (function(response) { return response.json() })
    .then(function(data) { return data.validator });
  _ws.send(`{
    "cmd": "auth",
    "validator": "${validator}"
  }`);
  _ws.onmessage = newMessage;
  console.log(`OriginChat side initialized! (${botName})`);
}

function newMessage(event) {
    let msg = event.data;
    msg = JSON.parse(msg);
    if (msg.cmd != "message_new") return;
    if (msg.message.user == botName) return;
    sendToDiscord(msg);
}

function sendToOriginChat(msg) {
    if (msg.author.bot) return; // Ignore messages from other bots
    let channel = bridges.find(b => b.discord === msg.channel.id);
    if (!channel) return;
    global._ws.send(JSON.stringify({
        cmd: "message_new",
        channel: channel.originchats,
        content: prepareMsg(msg.content, msg.author.displayName)
    }));
    console.log(`Sent message to OriginChat: '${msg.content}'`);
}

////////////////////////////////////////////////////////////////////////////////////
// Discord's Side                                                                 //
////////////////////////////////////////////////////////////////////////////////////

const { Client, IntentsBitField, channelLink } = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
})

client.on('ready', () => {
    console.log(`Discord side initialized! (${client.user.tag})`);
});

client.on('messageCreate', sendToOriginChat);

function sendToDiscord(msg) {
    let channel = bridges.find(b => b.originchats === msg.channel);
    if (!channel) return;
    let bridge = client.channels.cache.get(channel.discord);
    bridge.send(prepareMsg(msg.message.content, msg.message.user));
    console.log(`Sent message to Discord: '${msg.message.content}'`);
}

startWebSocket();
client.login(discordBotToken);