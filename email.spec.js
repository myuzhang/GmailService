const Gamil = require('./getMessage');
const Auth = require("./auth");

const gmailAuth = Auth();

let timeout = 5;
let search = "to:someone@gmail.com";

var auth = null;

if (auth === null) {
  auth = gmailAuth.getAuth();
  if (auth === null) {
    console.log(404, "auth is not found, please set credential and token correctly");
  }
}

let gmail = Gamil(auth);
gmail
  .getEmail(timeout, search)
  .then(data => {
    console.log(200, data);
  });