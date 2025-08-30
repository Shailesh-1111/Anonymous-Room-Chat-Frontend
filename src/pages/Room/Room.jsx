/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Text, Input, VStack, HStack, Flex } from '@chakra-ui/react';
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { setName } from "../../redux/userSlice";
import "./Room.css";  

const ChatRoom = () => {
  const { roomId } = useParams();
  const userName = useSelector((state) => state?.user?.name);
  const [inputName, setInputName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const dispatch = useDispatch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userName) {
      if (!socket.connected) socket.connect();

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join room', { userName, roomId });
      });

      socket.on('joined room', (result) => {
        setIsJoined(true);
        setOnlineUsers(result?.data?.onlineUsers);
      });

      socket.on('left room', (result) => {
        console.log(result);
        setOnlineUsers(result?.data?.onlineUsers);
      });

      socket.on('room message', (msgObj) => {
        receiveMessage(msgObj);
      });

      const handleBeforeUnload = () => socket.disconnect();
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        socket.off('connect');
        socket.off('joined room');
        socket.off('room message');
        window.removeEventListener("beforeunload", handleBeforeUnload);
        socket.disconnect();
      };
    }
  }, [userName, roomId]);

  const sendMessage = () => {
    if (input.trim() && socket.connected) {
      const msgObject = { roomId, message: input };
      socket.emit("room message", msgObject);
      setMessages((prev) => [...prev, { userName, message: input }]);
      setInput("");
    }
  };

  const receiveMessage = (msgObj) => {
    setMessages((prev) => [...prev, msgObj]);
  };

  const handleNewUser = (name) => {
    if (name) dispatch(setName(name));
  };

  if (!userName) {
    return (
      <Box className="chatroom-container">
        <VStack spacing={6} className="chatroom-card">
          <Box textAlign="center">
            <Text className="chatroom-title">💬 Welcome to Chat Room</Text>
            <Text className="chatroom-subtitle">Enter your name to start chatting</Text>
          </Box>
          <Input
            placeholder="Type your name..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            size="lg"
            className="chatroom-input"
          />
          <Button
            colorScheme="teal"
            onClick={() => handleNewUser(inputName)}
            size="lg"
            borderRadius="full"
            w="full"
            isDisabled={!inputName.trim()}
            className="chatroom-btn"
          >
            🚀 Join Chat
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="chatroom-wrapper">
      <Box className="chatroom-box">
        {/* Header */}
        <Box className="chatroom-header">
          <Flex align="center" justify="space-between">
            <HStack>
              <Box className="chatroom-avatar">🏠</Box>
              <Box>
                <Text className="chatroom-room">Room: {roomId}</Text>
                <Text className="chatroom-status">
                  {isConnected ? `🟢 Online: ${onlineUsers}` : "🔄 Connecting..."}
                </Text>
              </Box>
            </HStack>
            <Box className="chatroom-msgcount">{messages.length} messages</Box>
          </Flex>
        </Box>

        {/* Messages */}
        <Box
          flex="1"
          p={4}
          ref={messagesContainerRef}
          className="chatroom-messages"
          onScroll={handleScroll}
        >
            <VStack spacing={3} align="stretch">
            {messages?.map((msg, i) => {
                const isMine = msg.userName === userName;
                const showUser =
                i === 0 || messages[i - 1].userName !== msg.userName;

                return (
                <Box
                    key={i}
                    alignSelf={isMine ? "flex-end" : "flex-start"}
                    maxW="70%"
                >
                    {!isMine && showUser && (
                    <Text className="chatroom-username">👤 {msg.userName}</Text>
                    )}
                    <Box
                    className={`chatroom-bubble ${isMine ? "mine" : "theirs"}`}
                    >
                    <Text>{msg.message}</Text>
                    </Box>
                </Box>
                );
            })}
            <div ref={messagesEndRef} />
            </VStack>

        </Box>

        {/* Scroll Down Button */}
        {showScrollButton && (
          <Box className="chatroom-scrollbtn">
            <Button
              onClick={scrollToBottom}
              colorScheme="teal"
              borderRadius="full"
              size="md"
              boxShadow="lg"
            >
              ↓
            </Button>
          </Box>
        )}

        {/* Input Box */}
        <Box className="chatroom-inputbox">
          <HStack spacing={3} className="send-wrapper">
            <Input
              value={input}
              placeholder="Type your message here..."
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="chatroom-input"
            />
            <Button
              colorScheme="teal"
              onClick={sendMessage}
              isDisabled={!input.trim()}
              className="chatroom-sendbtn"
            >
              ➤
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatRoom;
