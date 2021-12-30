import {StreamChat} from 'stream-chat';
import {config} from 'dotenv';
config();

const chatClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET,
);

/**
 * Add the ID of the channel to find messages in
 * */
const CHANNEL_ID_TO_GET_MESSAGES_FROM = '';

/**
 * The number of messages to print. The output will be info from
 * the most recent `NUMBER_OF_MESSAGES_TO_PRINT` messages in the
 * channel.
 * */
const NUMBER_OF_MESSAGES_TO_PRINT = 3;

const main = async () => {
  try {
    const channel = chatClient.getChannelById(
      'messaging',
      CHANNEL_ID_TO_GET_MESSAGES_FROM,
    );
    await channel.watch();

    const messages = channel.state.messages.slice(-NUMBER_OF_MESSAGES_TO_PRINT);

    process.stdout.write(
      `Messages for the channel ${CHANNEL_ID_TO_GET_MESSAGES_FROM}:\n\n`,
    );

    process.stdout.write('======\n');
    for (const message of messages) {
      process.stdout.write(`Message ID:      ${message.id}\n`);
      process.stdout.write(`Message text:    ${message.text}\n`);
      process.stdout.write(`Message sent by: ${message.user.id}\n`);
      process.stdout.write('======\n');
    }
  } catch (error) {
    throw new Error(
      `Error getting messages for a channel ID: ${error.message}`,
    );
  }
};

main();
