import {StreamChat} from 'stream-chat';
import {config} from 'dotenv';

config();

const chatClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET,
);

/**
 * Add a message ID to update here
 * */
const MESSAGE_ID_TO_UPDATE = '';

/**
 * Add any text to append to the message
 * */
const MESSAGE_TEXT = 'A new message text with a different URL https://github.com/GetStream/stream-chat-react-native';

const main = async () => {
  try {
    if (!MESSAGE_ID_TO_UPDATE) {
      throw new Error(
        `You need to add a message ID to MESSAGE_ID_TO_UPDATE\n\nThis should be added in ${
          process.argv0 === 'node' ? process.argv[1] : process.argv0
        }\n`,
      );
    }

    const updatedResponse = await chatClient.updateMessage(
      {
        id: MESSAGE_ID_TO_UPDATE,
        text: MESSAGE_TEXT,
      },
      process.env.STREAM_USER_ID,
    );

    process.stdout.write(
      `\nThe message has been updated - new text: ${updatedResponse.message.text}\n`,
    );
  } catch (error) {
    throw new Error(
      `\x1b[31mError encountered while tring to update a message: ${error.message}\x1b[0m`,
    );
  }
};

main().catch(error => {
  process.stderr.write(`${error.message}`);
});
