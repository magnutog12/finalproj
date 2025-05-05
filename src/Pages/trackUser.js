import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Map, Marker, APIProvider } from '@vis.gl/react-google-maps';
import coords from './coords.json';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


const TrackUser = () => {
    const [userPhone, setUserPhone] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if(!userPhone) return;

        // Populate usestate with user location from firestore
        const unsubscribe = firebase.firestore()
        .collection('locations')
        .doc(userPhone)
        .onSnapshot(doc => {
            const data = doc.data();
            if (doc.exists) {
            setUserLocation(data);
            } else {
            setUserLocation(null);
            }
        });

    return () => unsubscribe();
  }, [userPhone]);
  
  const mapOptions = {
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    gestureHandling: 'greedy'
  };

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
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
    <div className="track-user ms-3">
      
      <h2>Track User</h2>
      <p></p>
      <input
        type="text"
        placeholder="+1234567890"
        value={userPhone}
        onChange={(e) => setUserPhone(e.target.value)}
      />
    {userLocation && (
    <div style={{ height: '80vh' }}>
      <Map
        center={userLocation || { lat: 35.9653, lng: -83.9233 }} 
        defaultZoom={14}
        options ={mapOptions}
      >
      {userLocation && (
        <Marker
          position={{
            lat: userLocation.lat,
            lng: userLocation.lng
          }}
          title={`User Location: ${userPhone}`}
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
      </div>
      )}
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
  
};

export default TrackUser;