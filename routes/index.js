const express = require('express');
const router = express.Router();
const getFullName = require('../utils/utils');
const sendMessageToFlex = require('../service/flex-telegram-integration');
const axios = require('axios');


router.post('/receive-message', async function (request, response) {
    console.log('Received a new message from telegram');

    const chatId = request.body.message.chat.id;
    const body = request.body.message.text;

    await sendMessageToFlex(chatId, body);
    response.sendStatus(200);
});

router.post('/new-message', async function (request, response) {
    console.log('Twilio new message webhook fired');

    if (request.body.Source === 'SDK') {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`, {
            chat_id: request.query.chat_id,
            text: request.body.Body
        })
    }
    response.sendStatus(200);
});


module.exports = router;
