import React from "react";
import "./HomeVideo.css";

const HomeVideo = () => {
  return (
    <div className="video-container">
      <iframe
        src="https://www.youtube.com/embed/tUP5S4YdEJo?autoplay=1&mute=1&loop=1&playlist=tUP5S4YdEJo"
        title="YouTube video player"
        allow="autoplay; fullscreen"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default HomeVideo;
