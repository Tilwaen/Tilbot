const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level) => {
    if (message.content.indexOf("{") === -1) {
        await message.react("👍");
        await message.react("👎");
        await message.react("🤷");
    } else {
        let firstBracket = message.content.indexOf("{");
        if (message.content.indexOf("}") === -1) {
            sendIncorrectSyntaxMessage(client, message);
            return;
        }
        let secondBracket = message.content.indexOf("}");
        let title = message.content.substring(firstBracket + 1, secondBracket);
        var text = message.content.substr(secondBracket + 1);

        // A - T (20 emojis)
        let emojiList = ["🇦", "🇧", "🇨", "🇩", "🇪",
            "🇫", "🇬", "🇭", "🇮", "🇯",
            "🇰", "🇱", "🇲", "🇳", "🇴",
            "🇵", "🇶", "🇷", "🇸", "🇹"];

        let options = parseOptions(client, message, text);

        if (options.length > 20) {
            await message.channel.send(`Maximum allowed number of options is 20 (due to the emoji reaction limit)`);
            return;
        }

        var optionsText = "";
        for (var i = 0; i < options.length; i++) {
            optionsText += emojiList[i] + " " + options[i] + "\n\n";
        }

        var embed = new RichEmbed()
            .setTitle(title)
            .setDescription(optionsText)
            //.setAuthor(message.author.username, message.author.displayAvatarURL)
            .setColor(0xC9DDFF)
            //.setTimestamp();

        let msg = await message.channel.send({ embed });

        for (var i = 0; i < options.length; i++) {
            await msg.react(emojiList[i]);
        }
    }
};

async function sendIncorrectSyntaxMessage(client, message) {
    await message.channel.send(`The syntax is \`${client.config.defaultSettings.prefix}poll {title} [option1] [option2] ...\``);
}

function parseOptions(client, message, text) {
    let options = []
    do {
        let first = text.indexOf("[");
        let second = text.indexOf("]");
        if (first === -1 || second === -1) {
            let regexNonWhitespace = /\S/;
            // If there is a trailing whitespace, just break from the loop.
            // If there is more, send incorrect syntax message and terminate command execution.
            if (text.match(regexNonWhitespace)) {
                sendIncorrectSyntaxMessage(client, message);
                return;
            }
            break;
        }
        options.push(text.substring(first + 1, second));
        text = text.substr(second + 1);
    } while (text.length > 0);

    return options;
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
  channelPerms: "All"
};

exports.help = {
  name: "poll",
  category: "Miscelaneous",
  description: "Poll time!",
  usage: "poll"
};