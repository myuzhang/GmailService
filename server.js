const express = require("express");
const fs = require("fs");
const Gamil = require("./getMessage");
const Auth = require("./auth");

const gmailAuth = Auth();

// Constants
const HOST = "0.0.0.0";

let port = 8080;
if (process.argv.length === 3) {
  port = process.argv[2];
}

// App
const app = express();
app.use(express.json());    // parse request body as JSON

app.get("/", (_, res) => {
  const usage = `
Hi there,\n
This is Gmail Web Service.\n
Please post your gmail credentail first to setup the token then use it.
Follow this link and enable the gmail api to get your credential:
https://developers.google.com/gmail/api/quickstart/nodejs\n
How to use it, please refer to https://github.com/myuzhang/GmailService\n
Currently it only implments getting first email (earlies email) by query option.\n
Enjoy.`;

  res.send(usage);
});

app.post("/setup/credential", (req, res) => {
  let credentails = JSON.stringify(req.body, null, 2);
  fs.writeFileSync("credentials.json", credentails);
  res.status(202).send("credential is accepted");
});

app.post("/setup/authorize", (req, res) => {
  let scopes = req.body.scopes;
  let message = gmailAuth.getTokenCode(scopes);
  if (message !== null) {
    res.status(200).send(`Authorize this app by visiting this url: ${message}`);
  } else {
    res.status(400).send("Failed to get token code, please set your credentials first");
  }
});

app.post("/setup/generatetoken", (req, res) => {
  let code = req.body.code;
  let message = gmailAuth.setToken(code);
  if (message !== null) {
    res.status(200).send("Set token successfully");
  } else {
    res.status(400).send("Failed to set token successfully");
  }
});

app.post("/setup/token", (req, res) => {
  let token = JSON.stringify(req.body, null, 2);
  fs.writeFileSync("token.json", token);
  res.status(202).send("token is accepted");
});

app.get("/email", (req, res) => {
  let timeout = 30;
  if (req.query.timeout) {
    timeout = parseInt(req.query.timeout, 10);
  }
  let search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  let auth = gmailAuth.getAuth();    
  if (auth === null) {
    res.status(403).send(404, "auth is not found, please set credential and token first");
  }

  let gmail = Gamil(auth);
  gmail
    .getEmail(timeout, search)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(error => {
      res.status(200).send(data);
    });
});

app.post("/email/query", (req, res) => {
  let timeout = 30;
  if (req.body.timeout) {
    timeout = req.body.timeout;
  }
  let search = "";
  if (req.body.search) {
    search = req.body.search;
  }

  let auth = gmailAuth.getAuth();    
  if (auth === null) {
    res.status(403).send("auth is not found, please set credential and token correctly");
  }

  let gmail = Gamil(auth);
  gmail
    .getEmail(timeout, search)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

app.listen(port, HOST);
console.log(`Running on http://${HOST}:${port}`);