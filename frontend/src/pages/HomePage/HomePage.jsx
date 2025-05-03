import React, { useEffect, useState } from "react";
import "./HomePage.css";
import HomeHeader from "../../components/HomePage/HomeHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
import HomeVideo from "../../components/HomeVideo/HomeVideo";

const HomePage = () => {
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [videoTextIndex, setVideoTextIndex] = useState(0);

  const images = ["/image1.jpg", "/image2.jpg", "/image3.jpg", "/image4.jpg", "/image5.jpg", "/image6.jpg"];
  const slideshowTexts = [
    <>
      Welcome to the Future <br /> With Limitless Opportunities and Endless Possibilities
    </>,
    <>
      Innovative Solutions <br /> That Drive Unprecedented Success and Growth
    </>,
    <>
      Empowering Businesses <br /> Through Advanced Technology and Smart Systems
    </>,
    <>
      Technology at Your Fingertips <br /> Transforming Ideas into Reality
    </>,
    <>
      Building Smart Cities <br /> For a Sustainable and Better Tomorrow
    </>,
    <>
      Connecting the World <br /> Seamlessly with Innovation and Excellence
    </>,
  ];

  const videoTexts = [
    "Experience the Next-Generation Vision",
    "Crafting Digital Pathways to Innovation",
    "Transforming Businesses into Digital Pioneers",
  ];

  
  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setSlideshowIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(slideshowInterval);
  }, [images.length]);

  
  useEffect(() => {
    const videoTextInterval = setInterval(() => {
      setVideoTextIndex((prevIndex) => (prevIndex + 1) % videoTexts.length);
    }, 3000);
    return () => clearInterval(videoTextInterval);
  }, [videoTexts.length]);

  return (
    <div className="homepage">
      <HomeHeader />
      <div className="home-body">
        <div className="slideshow-container">
          <div className="text-container">
            {slideshowTexts.map((text, index) => (
              <div
                key={index}
                className={`slide-text ${index === slideshowIndex ? "active" : ""}`}
              >
                {text}
              </div>
            ))}
          </div>
          <div className="slideshow">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className={`slide ${index === slideshowIndex ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="home-video-section">
        <HomeVideo />
        <div className="video-text-container">
          {videoTexts.map((text, index) => (
            <div
              key={index}
              className={`video-text ${index === videoTextIndex ? "active" : ""}`}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};

export default HomePage;
