// Require Node 8.0.0 or higher
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

const Discord = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const snoowrap = require('snoowrap');
const { Client } = require('unb-api');

const client = new Discord.Client();

// Here we load the config file that contains our token and our prefix values.
client.config = require("./config.js");
// client.config.token contains the bot's token
// client.config.prefix contains the message prefix

client.logger = require("./modules/Logger");

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./modules/functions.js")(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Enmap();
client.aliases = new Enmap();

const userCooldowns = new Discord.Collection();
const globalCooldowns = new Discord.Collection();

// Now we integrate the use of Evie's awesome Enhanced Map module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
client.settings = new Enmap({name: "settings"});

// We need a server because of the OAuth2 stuff
const express = require('express');
// Stores the requests for authentication
const authReq = new Discord.Collection();

const init = async () => {

    // Login with Reddit
    const r = new snoowrap({
        userAgent: client.config.redditAuth.userAgent,
        clientId: client.config.redditAuth.clientID,
        clientSecret: client.config.redditAuth.clientSecret,
        username: client.config.redditAuth.username,
        password: client.config.redditAuth.password
    });

    const unbClient = new Client(client.config.unbApiToken);

    // Here we load **commands** into memory, as a collection, so they're accessible
    // here and everywhere else.
    const cmdFiles = await readdir("./commands/");
    client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
    cmdFiles.forEach(f => {
        if (!f.endsWith(".js")) return;
        const response = client.loadCommand(f);
        if (response) console.log(response);
    });

    // Then we load events, which will include our message and ready event.
    const evtFiles = await readdir("./events/");
    client.logger.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        client.logger.log(`Loading Event: ${eventName}`);
        const event = require(`./events/${file}`);
        // Bind the client to any event, before the existing arguments
        // provided by the discord.js event.
        // This line is awesome by the way. Just sayin'.
        client.on(eventName, event.bind(null, client, r, unbClient, userCooldowns, globalCooldowns, authReq));
    });

    // Generate a cache of client permissions for pretty perm names in commands.
    client.levelCache = {};
    for (let i = 0; i < client.config.permLevels.length; i++) {
        const thisLevel = client.config.permLevels[i];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }

    client.channelPermLevelCache = {};
    for (let i = 0; i < client.config.channelPerms.length; i++) {
        const thisLevel = client.config.channelPerms[i];
        client.channelPermLevelCache[thisLevel.name] = thisLevel.level;
    }

    // Here we login the client.
    client.login(client.config.token);

    // Run the server for authentication
    const app = express();
    app.use(express.static(__dirname + "/oauth"));

    // process.env.PORT lets the port be set by Heroku
    const port = process.env.PORT || 8080;
    app.listen(port, function() {
        console.log('Our app is running on http://localhost:' + port);
    });

    // Listen to the get requests for authentication, send post requests for tokens and authenticate users
    require('./oauth/server.js')(app, client, r, authReq);
};

init();