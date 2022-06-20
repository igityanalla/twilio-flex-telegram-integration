require('dotenv').config();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function fetchParticipantConversations(chatId) {
    return client.conversations.participantConversations
        .list({identity: chatId});
}

async function findExistingConversation(identity) {
    const conversations = await fetchParticipantConversations(identity);
    let existing = conversations.find(conversation => conversation.conversationState !== 'closed');
    console.log("Existing: ", existing);
    return existing !== undefined ? existing.conversationSid : undefined;
}

async function createConversation(chatId) {
    return client.conversations.conversations
        .create({
            friendlyName: `Telegram_conversation_${chatId}`
        });
}

async function createParticipant(conversationSid, identity) {
    return client.conversations.conversations(conversationSid)
        .participants
        .create({identity: identity});
}

async function createScopedWebhooks(conversationSid, chatId) {
    await client.conversations.conversations(conversationSid)
        .webhooks
        .create({
            'configuration.filters': 'onMessageAdded',
            target: 'studio',
            'configuration.flowSid': process.env.STUDIO_FLOW_SID
        });

    await client.conversations.conversations(conversationSid)
        .webhooks
        .create({
            target: 'webhook',
            'configuration.filters': 'onMessageAdded',
            'configuration.method': 'POST',
            'configuration.url': `${process.env.WEBHOOK_BASE_URL}/new-message?chat_id=${chatId}`,
        })
}

async function createMessage(conversationSid, author, body) {
    return client.conversations.conversations(conversationSid)
        .messages
        .create({
            author: author,
            body: body,
            xTwilioWebhookEnabled: true
        });
}

async function sendMessageToFlex(chatId, body) {
    let identity = `telegram_user_${chatId}`;
    let existingConversationSid = await findExistingConversation(identity);
    if (existingConversationSid === undefined) {
        const {sid: conversationSid} = await createConversation(chatId);
        console.log("Conversation SID: ", conversationSid);
        await createParticipant(conversationSid, identity);
        await createScopedWebhooks(conversationSid, chatId);
        existingConversationSid = conversationSid;
    }

    console.log("existing sid: ", existingConversationSid);

    const {sid: messageSid} = await createMessage(existingConversationSid, identity, body);
    console.log("Message SID: ", messageSid);
}

module.exports = sendMessageToFlex;
