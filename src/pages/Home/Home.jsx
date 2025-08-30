/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import shadowChatLogo from "../../assets/shadowchat-logo.png";
import {
  Box,
  Button,
  Text,
  Input,
  VStack,
  HStack,
  Flex,
  Image,
  ButtonGroup,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { setName, clearName } from "../../redux/userSlice";
import "./Home.css";

const Home = () => {
  const [inputName, setInputName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [createRoomId, setCreateRoomId] = useState("");
  const [activeTab, setActiveTab] = useState("public");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storedName = useSelector((state) => state.user.name);

  const handleJoin = (room, type = "private") => {
    const finalName = storedName || inputName;
    if (!finalName) {
      alert("username required");
      return;
    }
    if (type === "private") {
      alert("private room can be accessed only by link shared");
      return;
    }
    if (finalName.trim() && room.trim()) {
      if (!storedName) {
        dispatch(setName(finalName));
      }
      navigate(`/room/${room}`);
    }
  };

  const handleCreateRoom = () => {
    const finalName = storedName || inputName;
    if (!finalName) {
      alert("username required");
      return;
    }
    if (!createRoomId.trim()) {
      alert("room name required");
      return;
    }
    if (!storedName) {
      dispatch(setName(finalName));
    }

    alert(`If room doesn't already exist. It will create new room.`)
    navigate(`/room/${createRoomId}`);
  };

  return (
    <Box className="home-container">
      <VStack spacing={4} mb={10}>
        <Image
          src={shadowChatLogo}
          alt="Chat illustration"
          className="landing-image"
        />
        <Text className="landing-title">CONNECT CHAT SHARE</Text>
        <Text className="landing-subtitle">
          Join public discussions or create private rooms with your friends.
        </Text>
      </VStack>

      <Flex w="100%" justify="center" align="flex-start" mb={10} gap={10}>
        <Box className="room-switcher">
          <ButtonGroup isAttached w="full" mb={4}>
            <Button
              flex="1"
              colorScheme={activeTab === "public" ? "teal" : "gray"}
              onClick={() => setActiveTab("public")}
              borderRadius="12px"
              variant={activeTab === "public" ? "solid" : "outline"}
            >
              🌍 Public Rooms
            </Button>
            <Button
              flex="1"
              colorScheme={activeTab === "private" ? "teal" : "gray"}
              onClick={() => setActiveTab("private")}
              borderRadius="12px"
              variant={activeTab === "private" ? "solid" : "outline"}
            >
              🔑 Private Rooms
            </Button>
          </ButtonGroup>

          {activeTab === "public" && (
            <VStack spacing={3} w="full">
              {[
                { name: "General", users: "xx" },
                { name: "Tech-talk", users: "x" },
                { name: "Random", users: "xxx" },
              ].map((room) => (
                <Button
                  key={room.name}
                  className="room-btn"
                  onClick={() => handleJoin(room.name, "public")}
                >
                  <Text>{room.name}</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {room.users} online
                  </Text>
                </Button>
              ))}
            </VStack>
          )}

          {activeTab === "private" && (
            <VStack spacing={3} w="full">
              {[
                { name: "Private-1", users: "204" },
                { name: "Private-2", users: "181" },
                { name: "Private-3", users: "97" },
              ].map((room) => (
                <Button
                  key={room.name}
                  className="room-btn"
                  onClick={() => handleJoin(room.name, "private")}
                >
                  <Text>{room.name}</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {room.users} online
                  </Text>
                </Button>
              ))}
            </VStack>
          )}
        </Box>

        <Box w="30%">
          <VStack className="username-box">
            {storedName ? (
              <>
                <Text className="welcome-text">
                  Welcome, <b>{storedName}</b>
                </Text>
                <Button
                  size="sm"
                  colorScheme="orange"
                  variant="outline"
                  className="rename-btn"
                  onClick={() => {
                    dispatch(clearName());
                    setInputName("");
                  }}
                >
                  Rename
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Enter your username..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="username-input"
                />
                <Button
                  className="save-btn"
                  colorScheme="teal"
                  isDisabled={!inputName.trim()}
                  onClick={() => dispatch(setName(inputName))}
                >
                  Save Username
                </Button>
              </>
            )}
          </VStack>

          <VStack className="create-room-box" mt={6}>
            <Input
              placeholder="Enter room name..."
              value={createRoomId}
              onChange={(e) => setCreateRoomId(e.target.value)}
              className="room-input"
            />
            <Button
              className="create-btn"
              colorScheme="teal"
              isDisabled={!createRoomId.trim()}
              onClick={handleCreateRoom}
            >
              Create/Join Public Room
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
