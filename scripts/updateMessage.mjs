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
const TEXT_TO_APPEND_TO_MESSAGE = 'New text';

const main = async () => {
  try {
    if (!MESSAGE_ID_TO_UPDATE) {
      throw new Error(
        `You need to add a message ID to MESSAGE_ID_TO_UPDATE\n\nThis should be added in ${
          process.argv0 === 'node' ? process.argv[1] : process.argv0
        }\n`,
      );
    }

    const response = await chatClient.getMessage(MESSAGE_ID_TO_UPDATE);
    const messageToUpdate = response.message;

    const newMessageText = `${messageToUpdate.text} - ${TEXT_TO_APPEND_TO_MESSAGE}`;

    const updatedResponse = await chatClient.partialUpdateMessage(
      MESSAGE_ID_TO_UPDATE,
      {
        set: {
          text: newMessageText,
        },
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
