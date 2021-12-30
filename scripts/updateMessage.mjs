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
    const response = await chatClient.getMessage(MESSAGE_ID_TO_UPDATE);
    const messageToUpdate = response.message;

    const newMessageText = `${messageToUpdate.text} - ${TEXT_TO_APPEND_TO_MESSAGE}`;

    const updated = await chatClient.partialUpdateMessage(
      MESSAGE_ID_TO_UPDATE,
      {
        set: {
          text: newMessageText,
        },
      },
      process.env.STREAM_USER_ID,
    );

    process.stdout.write(
      `\nThe message has been updated - new text: ${updated.text}\n`,
    );
  } catch (error) {
    throw new Error(
      `Error encountered while tring to update a message: ${error.message}`,
    );
  }
};

main();
