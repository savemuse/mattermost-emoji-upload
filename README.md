# mattermost-emoji-upload
CLI utility to bulk import custom emojis for Mattermost v4.

## Install
```bash
$ npm install
```

## Usage
```
$ node server.js --teamId yzt9ki71epr37mpnocwusdhqbh --loginId andersonchen@gmail.com --password passwrod --url http://localhost:8065 --path /Users/andersonchen/Desktop/upload
```

## Parameters
**--teamId** - Team ID, not to be confused with the team name. The easiest way I've found to get this is to pop open the Network in the Developer tab and grab it from the URL

**--loginId** - The username or e-mail linked to the Mattermost account.

**--password** - Password for the Mattermost account.

**--url** - Mattermost Server URL. Example: https://mattermost.mymattermostdomain.com

**--path** - Local file path or remote URL to use to import emojis.
