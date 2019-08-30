const fs = require("fs");
const { google } = require("googleapis");

module.exports = function() {

  const CREDENTIALS_PATH = "credentials.json";
  const TOKEN_PATH = "token.json";

  function getAuth()
  {
    try {
      const oAuth2Client = getOAuth2Client();
      let content = fs.readFileSync(TOKEN_PATH, "utf8");
      let data = JSON.parse(content);
      oAuth2Client.setCredentials(data);
      return oAuth2Client;
    } catch (error) {
      console.log(error);      
      return null;
    }
  }

  function getTokenCode(scopes)
  {
    try {
      const oAuth2Client = getOAuth2Client();
      return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });
    } catch (error) {
      console.log(`Failed to get token code due to ${error}`);
      return null;
    }
  }

  function setToken(code)
  {
    try {
      const oAuth2Client = getOAuth2Client();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          throw new Error('Retrieving access token', err);
        }
        // Store the token to disk for later program executions
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
      });
    } catch (error) {
      console.log(`Failed to set token due to ${error}`);
      return null;
    }
  }
  
  function getOAuth2Client()
  {
    let content = fs.readFileSync(CREDENTIALS_PATH, "utf8");
    let data = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = data.installed || {};
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  }

  return Object.freeze({
    getAuth,
    getTokenCode,
    setToken
  });
};