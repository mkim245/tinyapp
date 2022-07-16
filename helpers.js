const getUserByID = function(userID, users) {
  if (users[userID]) {
    console.log(users[userID]);
    return users[userID];
  } return false;
};

const getUserByEmail = function(newEmail, users) {
  for (let user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  }
  return false;
};

const userIdFromEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = {
  getUserByID,
  getUserByEmail,
  userIdFromEmail,
  urlsForUser,
};