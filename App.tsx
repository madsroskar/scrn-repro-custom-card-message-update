import React, {useContext, useEffect, useMemo, useState} from 'react';

import {
  LogBox,
  Platform,
  SafeAreaView,
  View,
  useColorScheme,
  StyleSheet,
  Text,
} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  RouteProp,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import {useHeaderHeight} from '@react-navigation/elements';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {ChannelSort, Channel as ChannelType, StreamChat} from 'stream-chat';
import {
  CardProps,
  Channel,
  ChannelList,
  Chat,
  goToURL,
  makeImageCompatibleUrl,
  MessageInput,
  MessageList,
  OverlayProvider,
  Streami18n,
  Thread,
  ThreadContextValue,
  useAttachmentPickerContext,
  useOverlayContext,
  useTheme,
} from 'stream-chat-react-native';
import Config from 'react-native-config';

import {useStreamChatTheme} from './useStreamChatTheme';

LogBox.ignoreAllLogs(true);

type LocalAttachmentType = Record<string, unknown>;
type LocalChannelType = Record<string, unknown>;
type LocalCommandType = string;
type LocalEventType = Record<string, unknown>;
type LocalMessageType = Record<string, unknown>;
type LocalReactionType = Record<string, unknown>;
type LocalUserType = Record<string, unknown>;

const chatClient = StreamChat.getInstance<
  LocalAttachmentType,
  LocalChannelType,
  LocalCommandType,
  LocalEventType,
  LocalMessageType,
  LocalReactionType,
  LocalUserType
>(Config.STREAM_API_KEY);

const userToken = Config.STREAM_USER_TOKEN;
const user = {
  id: Config.STREAM_USER_ID,
};

const filters = {
  members: {$in: [Config.STREAM_USER_ID]},
  type: 'messaging',
};
const sort: ChannelSort<LocalChannelType> = {last_message_at: -1};
const options = {
  presence: true,
  state: true,
  watch: true,
};

/**
 * Start playing with streami18n instance here:
 * Please refer to description of this PR for details: https://github.com/GetStream/stream-chat-react-native/pull/150
 */
const streami18n = new Streami18n({
  language: 'en',
});

type ChannelListScreenProps = {
  navigation: StackNavigationProp<NavigationParamsList, 'ChannelList'>;
};

const ChannelListScreen: React.FC<ChannelListScreenProps> = ({navigation}) => {
  const {setChannel} = useContext(AppContext);

  const memoizedFilters = useMemo(() => filters, []);

  return (
    <Chat client={chatClient} i18nInstance={streami18n}>
      <View style={{height: '100%'}}>
        <ChannelList<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalReactionType,
          LocalUserType
        >
          filters={memoizedFilters}
          onSelect={(channel: any) => {
            setChannel(channel);
            navigation.navigate('Channel');
          }}
          options={options}
          sort={sort}
        />
      </View>
    </Chat>
  );
};

type ChannelScreenProps = {
  navigation: StackNavigationProp<NavigationParamsList, 'Channel'>;
};

/**
 * A custom card component, currently set up to be used for a
 * UrlPreview since I don't have any custom attachment types,
 * so the generic Card component wouldn't be used.
 *
 * Not a very useful example in practice, only meant for the
 * example of having a custom attachment card component in
 * use.
 * */
const CustomCardComponent = (props: CardProps) => {
  const {text, title} = props;

  const {
    theme: {
      messageSimple: {
        card: {
          container,
          footer: {description, title: titleStyle, ...footerStyle},
        },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.container, container]}>
      <View style={[styles.cardFooter, footerStyle]}>
        <Text style={{color: 'green'}}>{`${title}`}</Text>
      </View>
      <View style={[styles.cardFooter, footerStyle]}>
        <Text style={{color: 'blue'}}>{`${text}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    overflow: 'hidden',
    width: 256,
  },
});

const ChannelScreen: React.FC<ChannelScreenProps> = ({navigation}) => {
  const {channel, setThread, thread} = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const {setTopInset} = useAttachmentPickerContext();
  const {overlay} = useOverlayContext();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
    });
  }, [overlay]);

  useEffect(() => {
    setTopInset(headerHeight);
  }, [headerHeight]);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel
          channel={channel}
          UrlPreview={CustomCardComponent}
          keyboardVerticalOffset={headerHeight}
          thread={thread}>
          <View style={{flex: 1}}>
            <MessageList<
              LocalAttachmentType,
              LocalChannelType,
              LocalCommandType,
              LocalEventType,
              LocalMessageType,
              LocalReactionType,
              LocalUserType
            >
              onThreadSelect={(thread: any) => {
                setThread(thread);
                if (channel?.id) {
                  navigation.navigate('Thread');
                }
              }}
            />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

type ThreadScreenProps = {
  navigation: StackNavigationProp<ThreadRoute, 'Thread'>;
  route: RouteProp<ThreadRoute, 'Thread'>;
};

const ThreadScreen: React.FC<ThreadScreenProps> = ({navigation}) => {
  const {channel, setThread, thread} = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const {overlay} = useOverlayContext();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
    });
  }, [overlay]);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel
          channel={channel}
          keyboardVerticalOffset={headerHeight}
          thread={thread}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
            }}>
            <Thread<
              LocalAttachmentType,
              LocalChannelType,
              LocalCommandType,
              LocalEventType,
              LocalMessageType,
              LocalReactionType,
              LocalUserType
            >
              onThreadDismount={() => setThread(null)}
            />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

type ChannelRoute = {Channel: undefined};
type ChannelListRoute = {ChannelList: undefined};
type ThreadRoute = {Thread: undefined};
type NavigationParamsList = ChannelRoute & ChannelListRoute & ThreadRoute;

const Stack = createStackNavigator<NavigationParamsList>();

type AppContextType = {
  channel:
    | ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalReactionType,
        LocalUserType
      >
    | undefined;
  setChannel: React.Dispatch<
    React.SetStateAction<
      | ChannelType<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalReactionType,
          LocalUserType
        >
      | undefined
    >
  >;
  setThread: React.Dispatch<
    React.SetStateAction<
      | ThreadContextValue<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalReactionType,
          LocalUserType
        >['thread']
      | undefined
    >
  >;
  thread:
    | ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalReactionType,
        LocalUserType
      >['thread']
    | undefined;
};

const AppContext = React.createContext({} as AppContextType);

const App = () => {
  const colorScheme = useColorScheme();
  const {bottom} = useSafeAreaInsets();
  const theme = useStreamChatTheme();

  const [channel, setChannel] =
    useState<
      ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalReactionType,
        LocalUserType
      >
    >();
  const [clientReady, setClientReady] = useState(false);
  const [thread, setThread] =
    useState<
      ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalReactionType,
        LocalUserType
      >['thread']
    >();

  useEffect(() => {
    const setupClient = async () => {
      await chatClient.connectUser(user, userToken);

      return setClientReady(true);
    };

    setupClient();
  }, []);

  return (
    <NavigationContainer
      theme={{
        colors: {
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
          background: theme.colors?.white_snow || '#FCFCFC',
        },
        dark: colorScheme === 'dark',
      }}>
      <AppContext.Provider value={{channel, setChannel, setThread, thread}}>
        <OverlayProvider<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalReactionType,
          LocalUserType
        >
          bottomInset={bottom}
          i18nInstance={streami18n}
          value={{style: theme}}>
          {clientReady && (
            <Stack.Navigator
              initialRouteName="ChannelList"
              screenOptions={{
                headerTitleStyle: {alignSelf: 'center', fontWeight: 'bold'},
              }}>
              <Stack.Screen
                component={ChannelScreen}
                name="Channel"
                options={() => ({
                  headerBackTitle: 'Back',
                  headerRight: () => <></>,
                  headerTitle: channel?.data?.name,
                })}
              />
              <Stack.Screen
                component={ChannelListScreen}
                name="ChannelList"
                options={{headerTitle: 'Channel List'}}
              />
              <Stack.Screen
                component={ThreadScreen}
                name="Thread"
                options={() => ({headerLeft: () => <></>})}
              />
            </Stack.Navigator>
          )}
        </OverlayProvider>
      </AppContext.Provider>
    </NavigationContainer>
  );
};

export default () => {
  const theme = useStreamChatTheme();

  return (
    <SafeAreaProvider
      style={{backgroundColor: theme.colors?.white_snow || '#FCFCFC'}}>
      <App />
    </SafeAreaProvider>
  );
};
