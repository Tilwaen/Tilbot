module.exports = {
    getMessageArgumentContent: function(message) {
        // Filter out the prefix and command name (can be of different length because of the command aliases)
        const regex = /^~\w+ /g;
        return message.content.split(regex).filter(Boolean)[0];
    },

    getRandomEntry: function(collection) {
        const index = Math.floor(Math.random() * collection.length);
        return collection[index];
    }
};