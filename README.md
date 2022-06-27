# Twilio Flex Telegram Integration

[comment]: <> (associated blogpost)


This repository contains a proof of concept Express application for integrating Telegram into Twilio Flex with Conversations. The associated blog post can be found here:
https://www.twilio.com/blog/integrate-telegram-flex-conversations



![diagram](/public/images/diagram.png?raw=true)

## Requirements
For building and running this application you need:

- [Twilio Flex (Conversations) Account](https://www.twilio.com/docs/flex/conversations)
- [A Telegram bot](https://core.telegram.org)
- [Node.js](https://nodejs.org/en/download/)

## How To Use

1. Clone the repo
   `git clone https://github.com/igityanalla/twilio-flex-telegram-integration.git`
2. `cp .env.example .env`
3. Add your Twilio Account SID, Auth Token in, Studio Flow SID and Telegram bot API token in the `.env` file
4. `npm install`
5. `npm start`
6. Launch Flex, make yourself available and give it a try!

![Telegram](/public/images/screenshots.png?raw=true)
