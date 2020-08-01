const axios = require("axios");

exports.getUserData = async (senderID) => {
  try {
    let userData = (
      await axios.get("https://graph.facebook.com/v6.0/" + senderID, {
        params: {
          access_token: process.env.FB_PAGE_TOKEN,
        },
      })
    ).data;
    return userData;
  } catch (error) {
    throw error;
  }
};
