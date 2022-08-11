const axios = require('axios');

exports.handler = async (context, event, callback) => {

    console.log("Setting up telegram webhook...");
    await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/setWebhook?url=https://telegram-integration-5573-dev.twil.io/receive-message&allowed_updates=["message"]`)

    return callback();
};

