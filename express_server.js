const express = require("express"); // require express framework (routing / server)
const cookieParser = require("cookie-parser"); // rquire cookie 
const bodyParser = require("body-parser");
const app = express();
const randomString = require("randomstring");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

const getUserByID = function (userID) {
  if (users[userID]) {
    console.log(users[userID]);
    return users[userID];
  } return false;
}

const getUserByEmail = function (newEmail, users) {
  for (let user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  }
  return false;
}

const userIdFromEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};
app.use(express.urlencoded({ extended: true })); // parse incoming body (POST/PUT)
app.use(cookieParser()); //Parser cookie values, always triggered
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  const templateVars = {
    user: user
  };
  // const currentUser = req.cookies.email;
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  const templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
})

app.post("/urls/:id/edit", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // console.log(req.body.username);
  // res.cookie("username", req.body.username);
  console.log(users);
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  const userID = userIdFromEmail(email, users);
  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return res.status(403).send("There is no account with this email address");
  }
  if (foundUser.password === password) {
    res.cookie("user_id", foundUser.id);
    res.redirect("/urls");
  } else {
    return res.status(403).send("the password does not match")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (!newEmail || !newPassword) {
    res.status(400).send("Please enter both a valid email and password")
  } else if (getUserByEmail(newEmail, users)) {
    res.status(400).send("An account already existes for the same email address")
  } else {
  const newUserID = randomString.generate(5);
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: newPassword
  };
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});