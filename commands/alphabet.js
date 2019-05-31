const util = require('../functions/util.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    // No arguments passed
    if (args.length === 0) {
        await message.channel.send(fullAbc());
        return;
    }

    const text = util.getMessageArgumentContent(message);

    // It will be a spamfest, but it doesn't need to be *that* large spamfest
    if (text.length > 20) {
        await message.channel.send("Please shorten the message to 20 characters");
        return;
    }

    var newMessage = "";

    for (var i = 0; i < text.length; i++) {
        newMessage = newMessage + getLetter(text.charAt(i)) + '\n';
    }

    await message.channel.send(newMessage);
    await message.delete();
};

function getLetter(letter) {
    switch(letter.toLowerCase()) {
        case 'a': return `**A** is for Apple the yellow type`;
        case 'b': return `**B** is for Bee the bug`;
        case 'c': return `**C** is for crayons but only yellow crayons`;
        case 'd': return `**D** is for dogs but golden retrievers only`;
        case 'e': return `**E** is for elephants but the type of elephant's that are yellow`;
        case 'f': return `**F** is for fire but not the red or orange parts of fire only the yellow parts of fire`;
        case 'g': return `**G** is for golf but instead of golf it's yellow`;
        case 'h': return `**H** is for house but a yellow house`;
        case 'i': return `**I** is for igloo but the one made with yellow snow`;
        case 'j': return `**J** is for jumping jacks but only when they're yellow`;
        case 'k': return `**K** is for kangaroos but only the yellow type of kangaroos`;
        case 'l': return `**L** is for lions because they're yellow`;
        case 'm': return `**M** is for uummmmmm mansion but only the yellow type of mansions`;
        case 'n': return `**N** is for nocturnal creatures that are yellow`;
        case 'o': return `**O** is for ummm yellow oranges`;
        case 'p': return `**P** is for pineapples`;
        case 'q': return `**Q** is for quacks coming from yellow ducks`;
        case 'r': return `**R** is for raccoons but yellow raccoons`;
        case 's': return `**S** is for Superman but yellow`;
        case 't': return `**T** is for Tyrannosaurus Rex umm with yellow scales instead of brown or whatever they are`;
        case 'u': return `**U** is for underwater vehicle like a submarine which is yellow`;
        case 'v': return `**V** is for vape but the yellow type`;
        case 'w': return `**W** is for washing machine but yellow`;
        case 'x': return `**X** is for xylophone but with only the yellow keys on it so none of the other ones`;
        case 'y': return `**Y** is for .... uhhhhh Yahoo but yellow. **Oh, Y is for yellow!**`;
        case 'z': return `**Z** is for the .... zzzzzzzzaboomafoo which i think is something but have it be yellow`;
        default: return letter;
    }
};

function fullAbc() {
    return `    ${getLetter('a')}
    ${getLetter('b')}
    ${getLetter('c')}
    ${getLetter('d')}
    ${getLetter('e')}
**A B C D E....**
    ${getLetter('f')}
    ${getLetter('g')}
    ${getLetter('h')}
**A B C D E F G H...**
    ${getLetter('i')}
    ${getLetter('j')}
**A B C D E F G H I J...**
    ${getLetter('k')}
    ${getLetter('l')}
**Errr.. what comes after L...**
    ${getLetter('m')}
    ${getLetter('n')}
    ${getLetter('o')}
    ${getLetter('p')}
    ${getLetter('q')}
**A B C D E F G H I J K L M N O P Q**
    ${getLetter('r')}
**A B C D E F G H I J K L M N O P Q R S**
    ${getLetter('s')}
    ${getLetter('t')}
    ${getLetter('u')}
    ${getLetter('v')}
**.........**
**TUV...**
    ${getLetter('w')}
    ${getLetter('x')}
    ${getLetter('y')}
    ${getLetter('z')}

<https://www.youtube.com/watch?v=TWO9g-mPM6k>`;
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["abc", "ye", "yetehk"],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "alphabet",
  category: "Fun",
  description: "Substitutes the letters for the Yellow alphabet. Max 20 letters at once.",
  usage: "alphabet <text>"
};