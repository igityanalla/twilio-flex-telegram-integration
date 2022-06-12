function getFullName(chat) {
    let fullName = "";
    if (chat.first_name !== undefined) {
        fullName += chat.first_name;
    }
    if (chat.last_name !== undefined) {
        fullName += ' ' + chat.last_name;
    }

    return fullName !== "" ? fullName : chat.id;
}

module.exports = getFullName;
