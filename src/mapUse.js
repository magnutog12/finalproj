// Map.js
import React, { useState, useEffect } from 'react';
import { Marker, Map, InfoWindow, APIProvider, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Data from './data.json';

export default function MapAccess() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mPosition, setMPosition] = useState(null);
  const [selectedM, setSelectedM] = useState(null);

  const [geocodingService, setgeocodingService] = useState(null);
  const [offenderMarker, setOffenderMarker] = useState([]);

  // geocoding addresses!!! ref: https://www.youtube.com/watch?v=cOSw0Vmi3uQ and https://stackoverflow.com/questions/15108316/google-typeerror-google-maps-geocoder-is-not-a-constructor
  useEffect(() => {
    // found this .then statement on stack overflow that fixed an issue 
    window.google.maps.importLibrary("geocoding").then(() => { 
    if (window.google && window.google.maps) {
      setgeocodingService(new window.google.maps.Geocoder());
    }
  });
  }, []);

  useEffect(() => {
    if(!geocodingService) return;
    const geocodeAddress = async () => {

      const results = []; 
      for(const offender of Data){
        // concatenate full address
        const address = `${offender.address}, ${offender.locality}, TN`;;
        
        const res = await geocodingService.geocode({ address });
        if (res.results && res.results.length > 0) {
          const location = res.results[0].geometry.location;
          
          results.push({
            name: offender.name,
            img: offender.img,
            address: offender.address,
            locality: offender.locality,
            lat: location.lat(),
            lng: location.lng()
          });

        }
      }
      setOffenderMarker(results);
    };
    geocodeAddress();
  
     //dependencies array
  }, [geocodingService]);




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



  /*const handleMapClick = (event) => {
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
  };*/
  // location if geolocation fails or the current location.
  const defaultCenter = currentLocation || { lat: 35.9653, lng: -83.9233 };

  // modal stuff when a marker is clicked!
  const [showModal, setModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleShow = (person) => {
    setSelectedPerson(person);
    setModal(true);
  }
  const handleClose = () => {
    setModal(false);
    setSelectedPerson(null);
  } 

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API loaded')}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map 
            defaultZoom={15} 
            defaultCenter={defaultCenter} 
            options={mapOptions} 
            //onClick={handleMapClick}
        >
          {mPosition && (
            <Marker 
            position={mPosition} 
            onClick={() => setSelectedM(mPosition)}
            />
          )}
          {
            offenderMarker.map((offender, index) => (
              <Marker key={index}
              position={{lat: offender.lat, lng: offender.lng}}
              icon={{path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: 'gray',
                fillOpacity: 0.7,
                strokeWeight: 0,
                strokeColor: 'black',}}
                onClick={() => handleShow(offender)}
              />
    
            ))
          
          }
        </Map>

        {selectedPerson && (
        <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedPerson.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>  
          <div key={selectedPerson.name}>
            <h1>{selectedPerson.address}, {selectedPerson.locality} TN</h1>
            <img src={selectedPerson.img} alt="offender" width={200} height = {200}></img>
            <p></p>
            <Button size='sm' variant='outline-dark' href={`https://www.truthfinder.com/search/?firstName=${selectedPerson.name.split(' ')[1]}&lastName=${selectedPerson.name.split(' ')[2]}&state=TN&traffic%5Bsource%5D=GOOGSRCH&_gl=1*1cx8y1u*_up*MQ..*_gs*MQ..&gclid=CjwKCAjw47i_BhBTEiwAaJfPpvHnkO14PUegPvUu38lVsr70KfbJAv85JQUJCajUJ5hQtO9a_KGa4BoCAsEQAvD_BwE`}>View Criminal Records</Button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-dark" onClick={handleClose}>
            Close
          </Button>
  
        </Modal.Footer>
      </Modal>
      )} 

      </div>
    </APIProvider>
  );
}
