module.exports = {
    getMessageArgumentContent: function(message) {
        // Filter out the prefix and command name (can be of different length because of the command aliases)
        const regex = /^~\w+ /g;
        return message.content.split(regex).filter(Boolean)[0];
    },

    getRandomEntry: function(collection) {
        const index = Math.floor(Math.random() * collection.length);
        return collection[index];
    },
    getGuildMemberFromArg: function(message, args) {
        // If there is no argument, take the author of the message, otherwise take the first mention
        var member = (args.length < 1) ? message.member : message.mentions.members.first();

        // No mention
        if (!member) {
            guildMemberMatch = message.guild.members
                    .filter(m => m.nickname)
                    .find(m => m.nickname.toLowerCase().includes(args[0].toLowerCase()));
            member = guildMemberMatch;
            if (!guildMemberMatch) {
                // Find the corresponding user Discord username
                discordUsernameMatch = message.guild.members.find(m => m.user.username.toLowerCase().includes(args[0].toLowerCase()));
                member = discordUsernameMatch;
            }
        }

        return member;
    },
    getRedditUsernameFromArg: async function(message, args) {
        let prefixRegex = /\/?u\//;
        // Filters out the possible /u/ or u/ prefix, as well as an empty string after the split
        // Simply put, this extracts the username from the input
        return args[0].split(prefixRegex).filter(Boolean)[0];
    }
};