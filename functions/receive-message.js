exports.handler = async (context, event, callback) => {
    console.log('Received a new message from telegram');

    const chatId = event.message.chat.id;
    const body = event.message.text;

    const client = context.getTwilioClient();
    const domainName = context.DOMAIN_NAME;
    const {sendMessageToFlex} = require(Runtime.getFunctions().telegram.path);
    await sendMessageToFlex(client, domainName, chatId, body);

    return callback();
};


