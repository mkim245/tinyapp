const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const randomString = require("randomstring");
const app = express();
const PORT = 8080;
const { getUserByID, getUserByEmail, userIdFromEmail, urlsForUser } = require("./helpers");
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

app.use(cookieSession({
  name: 'session',
  keys: ['DAVID'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// GET routes below
app.get("/", (req, res) => {
  if (getUserByID(req.session.user_id, users)) {
    return res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  const templateVars = {
    urls: urlsForUser(user.id, urlDatabase),
    user: user
  };
  if (!user) {
    return res.status(401).send("You are not authorized to view the URL."); 
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = getUserByID(req.session.user_id, users);
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
    if (!user || urlDatabase[req.params.shortURL].userID !== user.id) {
      return res.status(401).send("You are not authorized to view the URL."); 
    }
    if (!urlDatabase[req.params.shortURL]) {
      return res.status(404).send("The URL can't be found.")
    }
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: user
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("The URL can't be found.");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/login", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  const templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  const templateVars = {
    user: user
  };
  res.render("urls_register", templateVars);
});

// POST routes below
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Please create new account or login");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please create new account or login");
  }
  const shortURL = randomString.generate(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/u/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please create new account or login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
    return res.status(401).send("You are not authorized to delete this short URL.");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = userIdFromEmail(email, users);
  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return res.status(403).send("There is no account with this email address");
  }
  if (bcrypt.compareSync(password, foundUser.password)) {
    req.session.user_id = foundUser.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("the password does not match");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (!newEmail || !newPassword) {
    res.status(400).send("Please enter both a valid email and password");
  } else if (getUserByEmail(newEmail, users)) {
    res.status(400).send("An account already exists for the same email address");
  } else {
    const newUserID = randomString.generate(5);
    users[newUserID] = {
      id: newUserID,
      email: newEmail,
      password: bcrypt.hashSync(newPassword, 10)
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});