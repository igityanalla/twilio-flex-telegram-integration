const axios = require('axios');

exports.handler = async (context, event, callback) => {
    console.log('Twilio new message webhook fired');

    if (event.Source === 'SDK') {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`, {
            chat_id: event.chat_id,
            text: event.Body
        })
    }

    return callback();
};
