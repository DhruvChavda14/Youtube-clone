import React, { useEffect, useState } from "react";
import "./PopupNotification.css";

const PopupNotification = ({ onClose }) => {
    const [location, setLocation] = useState("");
    const [temperature, setTemperature] = useState("");

    useEffect(() => {
        
        async function fetchData() {
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bangalore&appid=e1acfcafb629935925849a320b11611d&units=metric`);
                const data = await response.json();
                if (data) {
                    const locationName = data.name; 
                    const temperature = data.main.temp; 

                    console.log("Location:", locationName);
                    console.log("Temperature:", temperature);
                    setLocation(locationName); 
                    setTemperature(temperature);
                } 
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="popup-notification">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}>X</button>
                <h3>Current Location and Temperature</h3>
                <p>Location: {location}</p>
                <p>Temperature: {temperature} °C</p>
            </div>
        </div>
    );
};

export default PopupNotification;