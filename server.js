require('babel-polyfill');
require('isomorphic-fetch');

const fs = require('fs');
const path = require('path');
const prompt = require('prompt');
const yargs = require('yargs');

// Import Mattermost JavaScript Driver
const Client4 = require('mattermost-redux/client/client4.js').default;
const client = new Client4;

// Validate the parameters
const userProvideToken = yargs.argv.token;
const schema = {
  properties: {
    url: {
      message: 'Mattermost Server URL',
      required: true
    },
    teamId: {
      message: 'Team ID (not team name)',
      required: true
    },
    path: {
      message: 'Stickers path',
      required: true
    },
    token: {
      message: 'MMAUTHTOKEN',
      required: true,
      ask: () => {
        return userProvideToken;
      }
    },
    loginId: {
      message: 'Username or e-mail',
      required: true,
      ask: () => {
        return !userProvideToken;
      }
    },
    password: {
      message: 'Password',
      hidden: true,
      required: true,
      ask: () => {
        return !userProvideToken;
      }
    },
  }
};

// Get the file recursively
function getFiles(client, filePath, creator) {
  fs.readdir(filePath, function(err, files) {
      if (err) {
        console.warn(err);
      } else {
        files.forEach(function(filename) {
          const filedir = path.join(filePath, filename);
          fs.stat(filedir,function(eror, stats) {
            if (eror) {
              console.warn('Fail to get the status of file.', filename);
            } else {
              const isFile = stats.isFile();
              const isDir = stats.isDirectory();
              if (isFile) {
                if (path.basename(filedir).toLowerCase().startsWith("sticker") && filedir.indexOf('@') === -1) {
                  const emoji = {
                    name: path.basename(filedir, path.extname(filedir)),
                    creator_id: creator
                  };
                  importStickers(client, filedir, emoji);
                }
              }
              if (isDir && path.basename(filedir) !== 'o_file') {
                getFiles(client, filedir, creator);
              }
            }
          })
        });
      }
  });
}

// Import the sticker
function importStickers(client, filePath, emoji) {
  client
    .createCustomEmoji(emoji, fs.createReadStream(filePath))
    .then(function(res) {
      console.log('Import ' + res.name + ' successfully at '+ new Date(res.create_at));
    })
    .catch(function(err){
      console.error(err, filePath);
    });
}

// Delete all stickers
function deleteStickers(client, page, perPage) {
  client
    .getCustomEmojis(page, perPage)
    .then(function(res) {
      for(let i = 0; i < res.length; i ++) {
        client
          .deleteCustomEmoji(res[i].id)
          .then(function(deleteRes) {
            console.log('Delete ' + res[i].name + ' ' + deleteRes.status);
          })
          .catch(function(err){
            console.error(err, res[i].name);
          });
      }
    })
    .catch(function(err){
      console.error(err);
    });
}

prompt.override = yargs.argv;
prompt.message = '';
prompt.start();
prompt.get(schema, (err, params) => {
  // Team info
  const url = params.url;
  const teamId = params.teamId;
  const files = params.path;

  // Login with auth.
  let token = params.token;
  const id = params.id;

  // Login with ldap/user info
  const username = params.loginId;
  const password = params.password;

  // Import the stickers
  client.setUrl(url);
  client
    .login(username, password)
    .then(function(me) {
      token = client.getToken();
      var filePath = path.resolve(files);
      getFiles(client, filePath, me.id);
  });
});
