async function fetchParticipantConversations(client, chatId) {
    return client.conversations.participantConversations
        .list({identity: chatId});
}

async function findExistingConversation(client, identity) {
    const conversations = await fetchParticipantConversations(client, identity);
    let existing = conversations.find(conversation => conversation.conversationState !== 'closed');
    console.log("Existing: ", existing);
    return existing !== undefined ? existing.conversationSid : undefined;
}

async function createConversation(client, chatId) {
    return client.conversations.conversations
        .create({
            friendlyName: `Telegram_conversation_${chatId}`
        });
}

async function createParticipant(client, conversationSid, identity) {
    return client.conversations.conversations(conversationSid)
        .participants
        .create({identity: identity});
}

async function createScopedWebhooks(client, conversationSid, chatId, domainName) {
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
            'configuration.url': `https://${domainName}/send-message?chat_id=${chatId}`,
        })
}

async function createMessage(client, conversationSid, author, body) {
    return client.conversations.conversations(conversationSid)
        .messages
        .create({
            author: author,
            body: body,
            xTwilioWebhookEnabled: true
        });
}

async function sendMessageToFlex(client, domainName, chatId, body) {
    let identity = `telegram_user_${chatId}`;
    let existingConversationSid = await findExistingConversation(client, identity);
    if (existingConversationSid === undefined) {
        const {sid: conversationSid} = await createConversation(client, chatId);
        console.log("Conversation SID: ", conversationSid);
        await createParticipant(client, conversationSid, identity);
        await createScopedWebhooks(client, conversationSid, chatId, domainName);
        existingConversationSid = conversationSid;
    }

    console.log("existing sid: ", existingConversationSid);

    const {sid: messageSid} = await createMessage(client, existingConversationSid, identity, body);
    console.log("Message SID: ", messageSid);
}

module.exports = {sendMessageToFlex};
