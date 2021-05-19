import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../context/Context";
import "./Home.css";
import {
  ExpandMore,
  Search,
  Add,
  ExitToApp,
  ArrowBack,
  AttachFile,
  EmojiEmotions,
  HighlightOff,
  Forum,
  Description,
} from "@material-ui/icons";
import axios from "axios";
import Rooms from "../../components/Rooms/Rooms";
import Users from "../../components/Users/Users";
import Message from "../../components/message/Message";
import io from "socket.io-client";
const Home = () => {
  const { user, dispatch, room } = useContext(Context);
  let [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const scroll = useRef();
  const scrollRooms = useRef();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [searchRoom, setSearchRoom] = useState([]);
  const [messages, setMessages] = useState([]);
  const popup = useRef();
  const popupBg = useRef();
  const roomName = useRef("");
  const roomDesc = useRef("");
  const leftMessanger = useRef();
  const rightMessanger = useRef();
  const popupRooms = useRef();
  const popupOnlineClose = useRef();
  let socket = useRef();
  const messageInput = useRef("");
  const resize = () => {
    console.log(window.innerHeight, window.innerWidth);
    if (window.innerWidth > 1220) {
      popupRooms.current?.setAttribute("class", "exit");
      popupOnlineClose.current?.setAttribute("class", "exit");
      rightMessanger.current?.setAttribute("style", "display: block");
    }
  };

  window.onresize = resize;
  useEffect(() => {
    const getRooms = async () => {
      try {
        const res = await axios.get("http://localhost:1337/api/rooms/");
        setRooms(res.data);
        setSearchRoom(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getRooms();
  }, []);
  useEffect(() => {
    socket.current = io("http://localhost:1337");
    socket.current.on("getMessages", (messages) => {
      console.log(messages);
      setMessages(messages);
    });
    socket.current.on("getRooms", (rooms) => {
      setRooms(rooms);
      setSearchRoom(rooms);
    });
  }, []);
  useEffect(() => {
    socket.current.emit("getUser", user.username);
    socket.current.on("getUsers", (users) => {
      console.log(users);
      setUsers(users);
    });
  }, [user]);

  const handlePopUp = () => {
    popup.current.setAttribute("class", "exit");
    popupBg.current.setAttribute("class", "exit");
    setError("");
  };
  const openPopup = () => {
    popup.current.setAttribute("class", "popupInput");
    popupBg.current.setAttribute("class", "popupAddRoom");
  };
  const logoutHandler = () => {
    dispatch({ type: "LOGOUT" });
    window.sessionStorage.clear();
  };

  const searchHandler = async (e) => {
    setSearch(e.target.value);
    const rooma = searchRoom.filter((room) =>
      room.roomName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    console.log(rooma);
    setRooms(rooma);
  };
  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1337/api/message/${room}`
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [room]);
  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:1337/api/rooms/", {
        roomName: roomName.current.value,
        desc: roomDesc.current.value,
      });
      socket.current.emit(
        "addRoom",
        roomName.current.value,
        roomDesc.current.value,
        rooms
      );
      handlePopUp();
    } catch (err) {
      setError("Taki pokój już istnieje");
    }
    scrollRooms.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleSubmitSendMessage = async (e) => {
    e.preventDefault();
    socket.current.emit(
      "sendMessages",
      messageInput.current.value,
      user.username,
      room,
      messages
    );
    try {
      await axios.post("http://localhost:1337/api/message/new", {
        content: messageInput.current.value,
        senderName: user.username,
        room: room,
      });
    } catch (err) {
      console.log(err);
    }
    messageInput.current.value = "";
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  };
  const showRooms = () => {
    rightMessanger.current.setAttribute("style", "display: none");
    popupRooms.current.setAttribute("class", "chatRoomsMobile");
  };
  const closeRoomsMobile = () => {
    popupRooms.current.setAttribute("class", "exit");
    rightMessanger.current.setAttribute("style", "display: block");
  };
  const closeOnlineMobile = () => {
    popupOnlineClose.current.setAttribute("class", "exit");
    rightMessanger.current.setAttribute("style", "display: block");
  };
  const showOnlineMobile = () => {
    popupOnlineClose.current.setAttribute("class", "popupOnlineMobile");
    rightMessanger.current.setAttribute("style", "display: none");
  };
  let roomList;
  if (rooms.length > 0) {
    roomList = rooms.map((room) => (
      <div ref={scrollRooms}>
        <Rooms key={room._id} room={room} dispatch={dispatch} />
      </div>
    ));
  }
  const messagesList = messages.map((mess) => (
    <div>
      <Message key={mess._id} message={mess} />
      <div ref={scroll} />
    </div>
  ));

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <>
      <div className="exit" ref={popupOnlineClose}>
        <div className="headlineWrapper">
          <span className="headline">Online users: </span>
          <ArrowBack className="iconAdd" onClick={closeOnlineMobile} />
        </div>
        {users.map((user) => (
          <Users key={user.socketId} user={user} />
        ))}
        <div className="logout">
          <span>{user.username}</span>
          <ExitToApp className="icon" onClick={logoutHandler} />
        </div>
      </div>
      {/* popupy związane z dodawanie pokoju po kliknięciu w + */}
      <div className="exit" ref={popupBg}></div>
      <div className="exit" ref={popup}>
        <HighlightOff onClick={handlePopUp} className="x" />
        <span>Create new Room</span>
        <p>Let's create new room and have fun with your friend!</p>
        <form onSubmit={handleSubmitRoom}>
          <div className="inputs">
            <Forum className="icon" />
            <input
              type="text"
              placeholder="name..."
              required
              minLength="3"
              ref={roomName}
            />
          </div>
          <div className="inputs">
            <Description className="icon" />
            <input
              type="text"
              placeholder="describe your room..."
              required
              minLength="6"
              ref={roomDesc}
            />
          </div>
          {error !== "" ? <p className="error">{error}</p> : null}
          <button>Dodaj</button>
        </form>
      </div>
      <div className="messanger">
        <div className="messangerWrapper">
          {/* na telefonach popup z pokojami */}
          <div className="exit" ref={popupRooms}>
            <div className="roomHeadline">
              <span className="headline">Rooms: </span>
              <ArrowBack className="iconAdd" onClick={closeRoomsMobile} />
            </div>
            <div className="rooms" onClick={closeRoomsMobile}>
              {roomList}
            </div>
            <div className="logout">
              <span>{user.username}</span>
              <ExitToApp className="icon" onClick={logoutHandler} />
            </div>
          </div>
          {/* leftMessenger na pc */}
          <div className="leftMessanger" ref={leftMessanger}>
            <div className="usernameTop">
              <span>Chat App</span>
              <ExpandMore className="icon" />
            </div>
            <div className="search">
              <Search className="iconSearch" />
              <input
                type="text"
                placeholder="search rooms..."
                value={search}
                onChange={searchHandler}
              />
            </div>
            <div className="roomHeadline">
              <span className="headline">Rooms: </span>
              <Add className="iconAdd" onClick={openPopup} />
            </div>
            <div className="rooms">{roomList}</div>
            <div className="usersOnline">
              <span className="headline">Online users: </span>
              {users.map((user) => (
                <Users key={user.socketId} user={user} />
              ))}
            </div>
            <div className="logout">
              <span>{user.username}</span>
              <ExitToApp className="icon" onClick={logoutHandler} />
            </div>
          </div>
          {/* prawy panel */}
          <div className="rightMessanger" ref={rightMessanger}>
            <div className="descTop">
              <span>{room}</span>
              <div className="icons">
                <Forum className="person" onClick={showRooms} />
                <div className="moreDiv">
                  <div
                    className="more"
                    title="online users"
                    onClick={showOnlineMobile}
                  ></div>
                </div>
              </div>
            </div>
            <div className="chatBox">{messagesList}</div>
            <form className="inputBottom" onSubmit={handleSubmitSendMessage}>
              <input
                type="text"
                placeholder="Type something to send..."
                required
                ref={messageInput}
              />
              <div className="icons">
                <AttachFile className="attach" />
                <EmojiEmotions className="emoji" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
