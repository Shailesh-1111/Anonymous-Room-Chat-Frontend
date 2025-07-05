import { useDispatch, useSelector } from "react-redux";
import styles from './Room.css';
import { Box, Button, Text, Input, VStack, HStack, Flex } from '@chakra-ui/react';
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { setName } from "../../redux/userSlice";

const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);


const ChatRoom = ()=>{
    const {roomId} = useParams();
    const userName =  useSelector((state)=>state?.user?.name);
    const [inputName, setInputName] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
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
            if (!socket.connected) {
                socket.connect();
            }

            socket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
                socket.emit('join room', { userName: userName, roomId: roomId });
            });

            socket.on('joined room', () => {
                console.log('Successfully joined room');
                setIsJoined(true);
            });

            socket.on('room message', (msgObj) => {
              console.log(msgObj);
                receiveMessage(msgObj);
            });

            return () => {
                console.log('Cleaning up socket listeners');
                socket.off('connect');
                socket.off('joined room');
                socket.off('room message');
            };
        }
    }, [userName, roomId]);

    const sendMessage = ()=>{
        if (input.trim() && socket.connected) {
            const msgObject =  {roomId: roomId, message: input};
            socket.emit("room message", msgObject);
            setMessages(prev=>[...prev, {userName: userName, message: input}])
            setInput("");
        }
    }

    const receiveMessage = (msgObj) => {
        console.log(msgObj);
        setMessages(prev => [...prev, msgObj]);
    }

    const handleNewUser = (userName)=>{
        if(userName){
            dispatch(setName(userName));
        }
    }

    if (!userName) {
        return (
            <Box 
                maxW="md" 
                mx="auto" 
                py={10} 
                px={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="100vh"
                fontFamily="Inter, sans-serif"
            >
                <VStack spacing={6} bg="white" p={8} borderRadius="lg" boxShadow="lg" w="full">
                    <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.500" mb={2} fontFamily="Inter, sans-serif">
                            💬 Welcome to Chat Room
                        </Text>
                        <Text color="gray.600" fontFamily="Inter, sans-serif">Enter your name to start chatting</Text>
                    </Box>
                    <Input
                        placeholder="Type your name..."
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                        size="lg"
                        borderRadius="full"
                        bg="gray.50"
                        _focus={{ bg: "white", borderColor: "green.400" }}
                        fontFamily="Inter, sans-serif"
                    />
                    <Button 
                        colorScheme="green" 
                        onClick={() => handleNewUser(inputName)}
                        size="lg"
                        borderRadius="full"
                        w="full"
                        isDisabled={!inputName.trim()}
                        fontFamily="Inter, sans-serif"
                        fontWeight="600"
                    >
                        🚀 Join Chat
                    </Button>
                </VStack>
            </Box>
        );
    }

    if (!isConnected) {
        return (
            <Box 
                maxW="md" 
                mx="auto" 
                py={10} 
                px={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="100vh"
                fontFamily="Inter, sans-serif"
            >
                <VStack spacing={4} bg="white" p={8} borderRadius="lg" boxShadow="lg">
                    <Text fontSize="lg" fontWeight="bold" color="gray.600" fontFamily="Inter, sans-serif">
                        🔄 Connecting to server...
                    </Text>
                </VStack>
            </Box>
        );
    }

    if (!isJoined) {
        return (
            <Box 
                maxW="md" 
                mx="auto" 
                py={10} 
                px={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="100vh"
                fontFamily="Inter, sans-serif"
            >
                <VStack spacing={4} bg="white" p={8} borderRadius="lg" boxShadow="lg">
                    <Text fontSize="lg" fontWeight="bold" color="gray.600" fontFamily="Inter, sans-serif">
                        🏠 Joining room...
                    </Text>
                </VStack>
            </Box>
        );
    }

    return(
        <Box 
            h="100vh" 
            bg="gray.100" 
            fontFamily="Inter, sans-serif"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
        >
            <Box 
                h={{ base: "100vh", md: "70vh" }}
                w={{ base: "100%", md: "75%" }}
                bg="white" 
                borderRadius={{ base: "0", md: "xl" }}
                boxShadow={{ base: "none", md: "2xl" }}
                overflow="hidden"
                display="flex"
                flexDirection="column"
            >
                <Box bg="green.500" color="white" p={4} boxShadow="md">
                    <Flex align="center" justify="space-between">
                        <HStack>
                            <Box 
                                w="40px" 
                                h="40px" 
                                bg="green.600" 
                                borderRadius="full" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                                fontWeight="bold"
                                fontSize="lg"
                            >
                                🏠
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="lg" fontFamily="Inter, sans-serif">Room: {roomId}</Text>
                                <Text fontSize="sm" opacity={0.8} fontFamily="Inter, sans-serif">
                                    {isConnected ? "🟢 Connected" : "🔄 Connecting..."}
                                </Text>
                            </Box>
                        </HStack>
                        <Box 
                            bg="green.600" 
                            color="white" 
                            px={3} 
                            py={1} 
                            borderRadius="full" 
                            fontSize="sm"
                            fontFamily="Inter, sans-serif"
                            fontWeight="500"
                        >
                            {messages.length} messages
                        </Box>
                    </Flex>
                </Box>

                <Box 
                    flex="1"
                    overflowY="auto" 
                    p={4}
                    bg="gray.50"
                    onScroll={handleScroll}
                    ref={messagesContainerRef}
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '0px',
                        },
                        '&::-webkit-scrollbar-track': {
                            width: '0px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            width: '0px',
                        },
                    }}
                >
                    <VStack spacing={3} align="stretch">
                        {messages?.map((msg, i) => (
                            <Box 
                                key={i} 
                                alignSelf={msg.userName === userName ? "flex-end" : "flex-start"}
                                maxW="70%"
                            >
                                {msg.userName !== userName && (
                                    <Text fontSize="xs" color="gray.500" mb={1} fontWeight="bold" textAlign="left" ml={2} fontFamily="Inter, sans-serif">
                                        👤 {msg.userName}
                                    </Text>
                                )}
                                <Box
                                    bg={msg.userName === userName ? "green.500" : "white"}
                                    color={msg.userName === userName ? "white" : "black"}
                                    px={3}
                                    py={2}
                                    borderRadius="3xl"
                                    boxShadow="md"
                                    position="relative"
                                    fontFamily="Inter, sans-serif"
                                >
                                    <Text>{msg.message}</Text>
                                </Box>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>

                {showScrollButton && (
                    <Box position="absolute" bottom="80px" right="20px" zIndex={10}>
                        <Button
                            onClick={scrollToBottom}
                            colorScheme="green"
                            borderRadius="full"
                            size="md"
                            boxShadow="lg"
                            _hover={{ transform: "scale(1.1)" }}
                            transition="all 0.2s"
                        >
                            ↓
                        </Button>
                    </Box>
                )}

                <Box bg="white" p={4} borderTop="1px" borderColor="gray.200">
                    <HStack spacing={3}>
                        <Input
                            value={input}
                            placeholder="Type your message here..."
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            borderRadius="full"
                            bg="gray.50"
                            _focus={{ bg: "white", borderColor: "green.400" }}
                            size="lg"
                            fontFamily="Inter, sans-serif"
                        />
                        <Button 
                            colorScheme="green"
                            onClick={sendMessage}
                            isDisabled={!input.trim()}
                            borderRadius="full"
                            size="lg"
                            fontFamily="Inter, sans-serif"
                            fontWeight="600"
                        >
                            ➤
                        </Button>
                    </HStack>
                </Box>
            </Box>
        </Box>
    )
}

export default ChatRoom;

