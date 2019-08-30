const { google } = require("googleapis");

module.exports = function(authToken) {
  const auth = authToken;

  function getEmail(timeout, search) {
    return getMessages(timeout, search)
      .then(getMessageDataById)
      .then(data => {
        let decodedMessage = "";
        let body = data.response.payload.body;        
        if (body.size !== 0) {
          decodedMessage = new Buffer.from(body.data, "base64").toString();
        } else {
          if (data.response.payload.parts) {
            if (data.response.payload.parts[0].body){
              let partBody = data.response.payload.parts[0].body;
              if (partBody.size != 0) {
                decodedMessage = new Buffer.from(partBody.data, "base64").toString();
              }
            }
          }
        }
        let headers = data.response.payload.headers;
        let from = headers.find(h => h.name === "From");
        let to = headers.find(h => h.name === "To");
        let subject = headers.find(h => h.name === "Subject");
        return {From: from.value, To: to.value, Subject: subject.value, Content: decodedMessage};
      });
  }

  function getMessages(timeout, search, incrementer = 0) {
    return new Promise((resolve, reject) => {
      const gmail = google.gmail({ version: "v1", auth: auth });
      // Retrieve mail list by query
      gmail.users.messages.list(
        {
          userId: "me",
          labelIds: ["INBOX"],
          q: search
        },
        function(err, response) {
          if (err) {
            return reject(err);
          } else {
            if (response && response.data && response.data.resultSizeEstimate) {              
              resolve(response.data);
            } else if (incrementer < timeout) {
              setTimeout(() => {
                return getMessages(timeout, search, incrementer + 1).then(resolve, reject);
              }, 1000);
            } else {
              reject(`Retrieving Gmail failed after ${timeout} retries.`);
            }
          }
        }
      );
    });
  }

  /**
   * Get the recent email from your Gmail account
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   * @return {auth: authorised client, response: response of gmail.users.messages.list}
   */
  function getMessageDataById(data) {
    return new Promise((resolve, reject) => {
      const gmail = google.gmail({ version: "v1", auth });
      gmail.users.messages.get(
        {
          userId: "me",
          id: data.messages[0].id
        },
        function(err, response) {
          if (err) {
            reject("Error: " + err);
          } else {
            resolve({ response: response.data });
          }
        }
      );
    });
  }

  return Object.freeze({getEmail});
};