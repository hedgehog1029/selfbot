var discordie = require("discordie"),
    chalk = require("chalk"),
    request = require("request"),
    punycode = require("punycode"),
    crypto = require("crypto"),
    fs = require("fs");

var client = new discordie();
var token = fs.readFileSync("token.txt", "utf8").trim();

console.log(chalk.cyan("Starting selfbot v0.1"));

var commands = {
  "ping": {
    run: function(e) {
      var diff = Date.now() - e.createdAt.getTime();

      e.edit(`Pong! Selfbot v0.1 running on ${process.platform}${process.arch}, node ${process.version}\nTime delay: ${diff}ms`)
    }
  },
  "lenny": {
    run: function(e) {
      e.edit("( ͡° ͜ʖ ͡° )");
    }
  },
  "shorten": {
    run: function(e, a) {
      var link = a[0];

      request.get("http://s.witch.gq/put", {qs:{url: link},json:true}, function(err, res, body) {
        if (!err) {
          e.edit(`http://s.witch.gq/${body.id}`)
        }
      })
    }
  },
  "hash": {
    run: function(e, a) {
      var data = a.slice(1).join(" "),
          hash = crypto.createHash(a[0]);

      if (data == "") return;

      hash.update(data);

      e.edit(`Input: \`${data}\`\nAlgorithm: \`${a[0]}\`\nHash: \`${hash.digest('hex')}\``)
    }
  },
  "np": {
    run: function(e, a) {
      var msg = a.join(" ");

      if (!a[0]) {
        client.User.setGame(null);
      } else {
        client.User.setGame(msg);
      }

      e.delete();
    }
  },
  "punycode": {
    run: function(e, a) {
      var input = a.join(" ");

      console.log(input);

      e.edit(`Input: \`${input}\`\nResult: \`${punycode.toASCII(input)}\``);
    }
  }
}

var replaces = {
  "/shrug": "¯\\_(ツ)_/¯"
}

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log(chalk.green(`Connected as ${client.User.username}.`));
})

client.Dispatcher.on("MESSAGE_CREATE", e => {
  if (e.message.author.id != client.User.id) return;

  var cmd = e.message.content.split(" ");

  if (commands.hasOwnProperty(cmd[0])) {
    commands[cmd[0]].run(e.message, cmd.slice(1));
  } else {
    Object.keys(replaces).forEach(function(str) {
      if (e.message.content.indexOf(str) > -1)
          e.message.edit(e.message.content.replace(str, replaces[str]))
    })
  }
});

client.connect({
  token: token
});
