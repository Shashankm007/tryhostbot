const {
    Client,
    Collection
} = require("discord.js");

const {
    prefix,
    token
} = require('./config.json');

const fs = require("fs");

// CUSTOM
var {
    unbannedP,
    announceP,
    watchP,
    tempannounceP
} = require('./commands/banchecker/db/path.json');

const client = new Client({
    disableEveryone: true
});

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.once('ready', () => {
    console.log(`${client.user.tag} is now online.`);
    client.user.setActivity(`cheaters getting banned`, {
        type: 'WATCHING'
    });
    //muser();
});

//fs.writeFile(tempannounceP,"",function() {});

function muser() {
    fs.readFile(watchP, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        const ban = jsonString.split('\n');
        var i = 0;
        while (ban[i]) {
            let report = JSON.parse(ban[i]);
            var mention = report.user;
            let id = mention.replace(/[<@!>]/g, '');
            client.users.fetch(id).then(user => {
                user.send(`[ ${mention} ] reported user has been banned.`)
            })
            i++;
        }
    });
    fs.writeFile(watchP, '', function() {
        console.log('All the Users have been notified.')
    })
    setTimeout(muser, 30000);
}

client.on('message', async message => {

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).split(' ');
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) {
        command.run(client, message, args);
    }
});

client.login(token);