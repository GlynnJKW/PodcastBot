const logger = require('winston');
const Discord = require('discord.js');
const auth = require('./auth.json');
const aliases = require('./aliases.json');
const fs = require('fs');
// const opus = require('node-opus');
const { VolumeFromData } = require('./pcmutil');
const WebSocketServer = require('websocket').server;
const http = require('http');


let connections = [];

const server = http.createServer(function(request, response) {

});
server.listen(1337, function(){});

wsServer = new WebSocketServer({
  httpServer: server
});
wsServer.on('request', function(request) {
  let connection = request.accept(null, request.origin);
  let index = connections.push(connection) - 1;
  logger.info("connected");

  connection.on('close', function(){
    logger.info("disconnected");
    connections.splice(index, 1);
  })

});





// const decoder = new opus.Decoder(48000, 2, 48000 / 100);


// Configure logger settings
let console = new logger.transports.Console();
logger.remove(console);
logger.add(console, {
    colorize: true
});
logger.level = 'debug';


// Initialize Discord Bot
var bot = new Discord.Client();

var bot_connection;
var bot_voicechannel;
var bot_receiver;
var currentlyPlaying;
var playQueue = [];

const readyNextPlay = function(conn){
  currentlyPlaying.on('end', end => {
    if(playQueue[0]){
      currentlyPlaying = conn.playFile('./audio/' + playQueue[0]);
      playQueue.splice(0, 1);
      console.log(playQueue);
      readyNextPlay(conn);
    }
    else{
      currentlyPlaying = null;
    }
  });
};

function broadcast(message){
  let msg = JSON.stringify(message);
  for(let client of connections){
    client.sendUTF(msg);
  }
}

function defaultAuth(message){
  return message.member.hasPermission('ADMINISTRATOR');
}
var commands = {
  "alias":{
    "args": ["add/delete", "alias", "command"],
    "desc": "Adds/deletes alias of a command",
    "call": async function(fn_args, fn_message){
      if(fn_args[0] == 'add'){
        let al_alias = fn_args[1];
        fn_args = fn_args.splice(2);
        aliases[al_alias] = fn_args;
      }
      else if(fn_args[0] == 'delete'){
        if(aliases[fn_args[1]]){
          delete aliases[fn_args[1]];
        }
      }
      fs.writeFile('aliases.json', JSON.stringify(aliases), 'utf8', function(){});
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  },
  "ping": {
    "args": [],
    "desc": "Replies 'Pong!' to ping",
    "call": function(fn_args, fn_message){
      fn_message.reply("Pong!");
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  },
  "join": {
    "args": [],
    "desc": "Joins calling user's current voice channel",
    "call": async function(fn_args, fn_message){
      if(fn_message.member.voiceChannel){
        bot_voicechannel = fn_message.member.voiceChannel;
        bot_connection = await bot_voicechannel.join();
        bot_receiver = bot_connection.createReceiver();

        let nonbotmembers = bot_voicechannel.members.filter(m => m.user.id !== bot.user.id);
        logger.info(nonbotmembers.map(m => [m.displayName, m.user.id]));
        
        broadcast({type:"connect", 
          users: nonbotmembers
          .map(function(m){
            return {name: m.user.username, displayName: m.displayName, avatar: m.user.displayAvatarURL, id: m.user.id};
          })
        });

        bot_connection.on('speaking', function(user, speaking){
          logger.debug(user.username + speaking);
          // if(speaking){
          //   bot_receiver.createPCMStream(user);
          // }
          broadcast({type:"speaking", id: user.id, speaking});

        });
        bot_receiver.on('pcm', function(user, data){
          let userVolume = VolumeFromData(data);
          broadcast({type:"volume", id: user.id, volume: userVolume});

        });
      }
      else{
        message.reply('Join a voice channel first!');
      }
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  },
  "leave": {
    "args": [],
    "desc": "Leaves voice channel if in one",
    "call": async function(fn_args, fn_message){
      if(bot_voicechannel){
        let nonbotmembers = bot_voicechannel.members.filter(m => m.user.id !== bot.user.id);
        logger.info(nonbotmembers.map(m => [m.user.username, m.user.id]));
        broadcast({type:"disconnect",
          users: nonbotmembers
          .map(function(m){
            return {name: m.user.username};
          })
        });

        bot_voicechannel.leave();
        bot_voicechannel = null;
        bot_connection = null;
        // bot_receiver.destroy();
        bot_receiver = null;

      }
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  },
  "play": {
    "args": ["filename"],
    "desc": "Adds file to queue if available, also joins calling user's voice channel if not already in a channel",
    "call": async function(fn_args, fn_message){
      if(fn_message.member.voiceChannel && !bot_voicechannel && !currentlyPlaying){
        bot_voicechannel = fn_message.member.voiceChannel;
        bot_connection = await bot_voicechannel.join()
        currentlyPlaying = bot_connection.playFile('./audio/' + fn_args[0]);
        readyNextPlay(bot_connection);
      }
      else if(!currentlyPlaying){
        const broadcast = bot.createVoiceBroadcast();
        currentlyPlaying = broadcast.playFile('./audio/' + fn_args[0]);
        readyNextPlay(broadcast);
        for (const connection of bot.voiceConnections.values()) {
          connection.playBroadcast(broadcast);
        }
      }
      else{
        fn_message.reply('added ' + fn_args[0] + ' to queue');
        playQueue.push(fn_args[0]);
      }
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  },
  "display": {
    "args": ["image url"],
    "desc": "Sends message to clients to display given url",
    "call": async function(fn_args, fn_message){
      const url = fn_args[0];
      let msg = JSON.stringify({type:"image", url});
      for(let client of connections){
        client.sendUTF(msg);
      }
    },
    "authorized": function(fn_message){
      return defaultAuth(fn_message);
    }
  }
};






bot.login(auth.token);

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ' + bot.user.username);
    // logger.info(bot.user.username + ' - (' + bot.user.id + ')');

});

bot.on('message', message => {
  // Our bot needs to know if it needs to execute a command
  // for this script it will listen for messages that will start with `!`
  //console.log(message);
  if (message.content.substring(0, 1) == '!') {
    // let userPermissions = new Discord.Permissions(message.member, message.member.roles.reduce(function(a, c){return a | c.permissions}));
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);

    while(aliases[cmd]){
      args = aliases[cmd].concat(args);
      cmd = args[0];
      args = args.splice(1);
    }

    if(commands[cmd] && commands[cmd].authorized(message)){
      commands[cmd].call(args, message);
      if(message.deletable) message.delete();
    }
    else{
      // if(commands[cmd]){
      //   message.reply("Sorry, you aren't authorized to use that command :/")
      //   .then(sent => setTimeout(() => {sent.delete(); if(message.deletable) message.delete();}, 2000));
      // }
      // else{
      //   message.reply("Sorry, that isn't a valid command :/")
      //     .then(sent => setTimeout(() => {sent.delete(); if(message.deletable) message.delete();}, 2000));
      // }
      if(message.deletable) message.delete();
    }
  }
});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
  if(bot_voicechannel && newMember.user.id != bot.user.id){
    if(newMember.voiceChannel && newMember.voiceChannel.name == bot_voicechannel.name){
      //User joined bot voicechannel
      logger.info(newMember.displayName + " joined voicechannel " + bot_voicechannel.name);
      if(newMember.nickname != ""){
        logger.info(newMember.nickname)
      }
      
      broadcast({type:"connect", 
        users: [{name: newMember.user.username, displayName: newMember.displayName, avatar: newMember.user.displayAvatarURL, id: newMember.user.id}]
      });
    }  
    else if(oldMember.voiceChannel && oldMember.voiceChannel.name == bot_voicechannel.name){
      //User left bot voicechannel
      logger.info(newMember.displayName + " left voicechannel " + bot_voicechannel.name);

      broadcast({
        type:"disconnect", 
        users: [{id: newMember.user.id}]
      });
    }
  }
});
