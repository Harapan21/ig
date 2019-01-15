//config express
const express = require("express");
const app = express();
const port = 3000;
const request = require("request");
//config client_id and client_secret
const config = require("./config");
const callback_link = `http://localhost:${port}/callback`;
const fs = require("fs");
if (fs.existsSync("code.json")) {
  const codeJson = JSON.parse(fs.readFileSync("./code.json").toString());
  const formData = {
    client_id: config.clientId,
    client_secret: config.client_secret,
    grant_type: "authorization_code",
    redirect_uri: callback_link,
    code: codeJson.code
  };
  if (!fs.existsSync("token.json")) {
    request.post(
      {
        url: "https://api.instagram.com/oauth/access_token",
        formData
      },
      (err, res, body) => {
        let body_data = JSON.parse(body);
        if (!body_data.error_type) {
          fs.writeFile("./token.json", JSON.stringify(body_data), err => {
            if (err) {
              console.error(err);
              os.exit(1);
            }
            console.log("token was generate :", body_data);
          });
        } else {
          console.log("go to http://localhost:3000/auth");
        }
      }
    );
  }
} else {
  console.log("go to http://localhost:3000/auth");
}
app.get("/", (req, res) => res.send("/"));
app.get("/callback", (req, res) => {
  // write file token
  if (req.query.code) {
    fs.writeFile("./code.json", JSON.stringify(req.query), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File has been created");
    });
    return res.send("code:" + req.query.code);
  }
});
app.get("/auth", (req, res) =>
  res.redirect(
    `https://api.instagram.com/oauth/authorize/?client_id=${
      config.clientId
    }&redirect_uri=${callback_link}&response_type=code`
  )
);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
