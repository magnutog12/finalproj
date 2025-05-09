// Map.js
import React, { useState, useEffect, useRef } from 'react';
import { Marker, Map, InfoWindow, APIProvider, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import coords from './Pages/coords.json';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';


export default function MapAccess() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mPosition, setMPosition] = useState(null);
  const [selectedM, setSelectedM] = useState(null);
 
 
 const alertedRef = useRef(new Set());
  //const [geocodingService, setgeocodingService] = useState(null);
  //const [offenderMarker, setOffenderMarker] = useState([]);

  /* || COMMENETED THIS OUT BC IT ONLY NEEDED TO RUN ONCE TO REDUCE WAITTIME FOR MARKERS!!! ||
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
      console.log("Processed results:", JSON.stringify(results, null, 2));
    };
    geocodeAddress();
  
     //dependencies array
  }, [geocodingService]);

  */


  const mapOptions = {
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    gestureHandling: 'greedy'
  };

  function getDistance(lat1, lng1, lat2, lng2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }


  useEffect(() => {
    const requestLocation = () => {
      if (navigator.geolocation) { // LOOK INTO NAVIGATOR GEOPOSITION
        
        // changed to watchPosition beacuse its allegedly more accurate
        navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            // Save location to Firestore
            const user = firebase.auth().currentUser;
            if(!user) return;
            firebase.firestore().collection('locations').doc(user.phoneNumber).set({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log("User location retrieved:", location);
            setCurrentLocation(location);
            setMPosition(location);
            setSelectedM(location);
            /* testing alert code*/
            coords.forEach((offender) => {
              const dist = getDistance(
                location.lat,
                location.lng,
                offender.lat,
                offender.lng
              );
              if (dist <= 1000 && !alertedRef.current.has(offender.name)) {
                alert(`Warning! Sexual Offender Spotted! You are within ${Math.round(dist)}m of ${offender.name}`);
                alertedRef.current.add(offender.name);
              }
            });
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
          {window.google && window.google.maps && window.google.maps.SymbolPath && (
            coords.map((offender, index) => (
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
          )
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
