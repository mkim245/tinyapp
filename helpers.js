// Checks if given ID corresponds to a user in a given database
const getUserByID = function(userID, users) {
  if (users[userID]) {
    console.log(users[userID]);
    return users[userID];
  } return false;
};
// Checks if an email corresponds to a user in a given database
const getUserByEmail = function(newEmail, users) {
  for (let user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  }
  return false;
};
// Takes an email and given database and returns the user ID for the user with the given email address
const userIdFromEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};
// Returns a URL corresponding to a submitted userID 
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