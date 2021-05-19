import React from "react";

import "./Room.css";
const Rooms = ({ room, dispatch }) => {
  const handleClick = () => {
    window.sessionStorage.setItem("room", room.roomName);
    dispatch({ type: "JOIN_ROOM", payload: room.roomName });
  };
  return (
    <div className="room" onClick={handleClick}>
      <img src="http://localhost:3000/images/room.jpg" alt="" />
      <div>
        <span className="name">{room.roomName}</span>
        <span className="desc">
          {room.desc.length > 43 ? `${room.desc.substr(0, 43)}...` : room.desc}
        </span>
      </div>
    </div>
  );
};

export default Rooms;
