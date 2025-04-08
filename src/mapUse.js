// Map.js
import React, { useState, useEffect } from 'react';
import { Marker, Map, InfoWindow, APIProvider } from '@vis.gl/react-google-maps';

export default function MapAccess() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mPosition, setMPosition] = useState(null);
  const [selectedM, setSelectedM] = useState(null);

  const mapOptions = {
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    gestureHandling: 'greedy'
  };

  useEffect(() => {
    const requestLocation = () => {
      if (navigator.geolocation) { // LOOK INTO NAVIGATOR GEOPOSITION
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log("User location retrieved:", location);
            setCurrentLocation(location);
            setMPosition(location);
            setSelectedM(location);
          },
        //  Error handling guide
        //  https://www.w3schools.com/html/html5_geolocation.asp
          (error) => {
            console.error("Error retrieving geolocation:", error.message);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                break;
              default:
                console.error("An unknown error occurred.");
            }
            // Fallback location - Knoxville
            setCurrentLocation({ lat: 35.9653, lng: -83.9233 });
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        // Fallback location
        setCurrentLocation({ lat: 35.9653, lng: -83.9233 });
      }
    };

    requestLocation(); // Request location on component mount
  }, []);

  const handleMapClick = (event) => {
    console.log("Map clicked event:", event);
    // Doesnt currently work in the Map component
    if (event.latLng && typeof event.latLng.lat === "function") {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      console.log(`Placing marker at: lat=${lat}, lng=${lng}`);

      const newMarker = { lat, lng };
      setMPosition(newMarker); // Update marker position
      setSelectedM(newMarker); // Select the marker
    } else {
      console.error("Unable to extract coordinates from event:", event);
    }
  };
  // location if geolocation fails or the current location.
  const defaultCenter = currentLocation || { lat: 35.9653, lng: -83.9233 };

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API loaded')}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map 
            defaultZoom={9} 
            defaultCenter={defaultCenter} 
            options={mapOptions} 
            onClick={handleMapClick}
        >
          {mPosition && (
            <Marker 
            position={mPosition} 
            onClick={() => setSelectedM(mPosition)}
            />
          )}
          {selectedM && (
            <InfoWindow 
            position={selectedM} 
            onCloseClick={() => setSelectedM(null)}
            >
              <p>
                {selectedM === currentLocation
                    ? "Your current location"
                    : `Marker at lat: ${selectedM.lat.toFixed(4)}, lng: ${selectedM.lng.toFixed(4)}`
                }
                </p>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
