require('dotenv').config();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function fetchParticipantConversations(chatId) {
    return client.conversations.participantConversations
        .list({identity: chatId});
}

async function getExistingConversation(chatId) {
    const conversations = await fetchParticipantConversations(chatId);
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

async function createParticipant(conversationSid, fullName) {
    return client.conversations.conversations(conversationSid)
        .participants
        .create({identity: fullName});
}

async function createScopedWebhooksMessageAdded(conversationSid, chatId) {
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

async function createMessage(conversationSid, username, body) {
    return client.conversations.conversations(conversationSid)
        .messages
        .create({
            author: username,
            body: body,
            xTwilioWebhookEnabled: true
        });
}

async function sendMessageToFlex(chatId, fullName, body) {
    let existingConversationSid = await getExistingConversation(chatId);
    if (existingConversationSid === undefined) {
        const {sid: conversationSid} = await createConversation(chatId);
        console.log("Conversation SID: ", conversationSid);
        const {sid: participantSid} = await createParticipant(conversationSid, fullName);
        console.log("Participant SID: ", participantSid);
        await createScopedWebhooksMessageAdded(conversationSid, chatId);
        existingConversationSid = conversationSid;
    }

    console.log("existing sid: ", existingConversationSid);

    const {sid: messageSid} = await createMessage(existingConversationSid, fullName, body);
    console.log("Message SID: ", messageSid);
}

module.exports = sendMessageToFlex;
