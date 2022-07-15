const express = require("express"); // require express framework (routing / server)
// const cookieParser = require("cookie-parser"); // rquire cookie 
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const bcrypt = require("bcryptjs");
const randomString = require("randomstring");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
}


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

const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

app.use(cookieSession({
  name: 'session',
  keys: ['DAVID'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.use(express.urlencoded({ extended: true })); // parse incoming body (POST/PUT)
// app.use(cookieParser()); //Parser cookie values, always triggered
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const user = getUserByID(req.session.user_id);
  const templateVars = {
    // urls: urlDatabase,
    urls: urlsForUser(user.id, urlDatabase),
    user: user
  };
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const {user_id} = req.cookies;
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = getUserByID(req.session.user_id);
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUserByID(req.session.user_id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID,
    user: user
  };
 
  if (!user) {
   return res.redirect("/login");
  }
  res.render("urls_show", templateVars);
});

// app.post("/urls/:id", (req, res) => {
//   const {user_id} = req.cookies;
//   if (!user_id) {
//     return res.status(400).send("Please create new account or login");
//   }
//   urlDatabase[req.params.id].longUrl = req.body.longURL;
//   res.redirect("/urls");
// });

app.post("/urls/:shortURL", (req, res) => {
  // const {user_id} = req.cookies;
  // const userUrls = urlsForUser(user_id, urlDatabase);
  if (!req.session.user_id) {
    return res.status(400).send("Please create new account or login");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});



app.post("/urls", (req, res) => {
  // const {user_id} = req.cookies;
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

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/u/:shortURL", (req, res) => {
// const {user_id} = req.cookies;
if (!req.session.user_id) {
  res.status(400).send("Please create new account or login")
}
});

app.get("/register", (req, res) => {
  const user = getUserByID(req.session.user_id);
  const templateVars = {
    user: user
  };
  // const currentUser = req.cookies.email;
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  const user = getUserByID(req.session.user_id);
  const templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
})


app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // const {user_id} = req.cookies;
  if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
    console.log("inside");
    return res.status(401).send("You are not authorized to delete this short URL.");
  } else {
    console.log("outside");
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  // console.log(req.body.username);
  // res.cookie("username", req.body.username);
  // console.log(users);
  const email = req.body.email;
  // console.log(email);
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
    password: bcrypt.hashSync(newPassword, 10)
  };
  // res.cookie("user_id", newUserID);
  req.session.user_id = newUserID;
  res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});