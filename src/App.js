import NavBar from "./navBar";
import React from 'react';
import './App.css';
import data from './data.json';
import "bootstrap/dist/css/bootstrap.min.css";
import {createRoot} from "react-dom/client";
import MapAccess from "./mapUse";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

//import {APIProvider, Map} from '@vis.gl/react-google-maps';

if (!firebase.apps.length) {
firebase.initializeApp({
  apiKey: "AIzaSyBCwjalynLRr1J2C9gqf33aOuPUuN2xgaw",
  authDomain: "knoxville-watchdog.firebaseapp.com",
  projectId: "knoxville-watchdog",
  storageBucket: "knoxville-watchdog.firebasestorage.app",
  messagingSenderId: "970872123649",
  appId: "1:970872123649:web:46cb9ba37ee6228f646b00",
  measurementId: "G-CDLJ0PH3XE"
});
}


function App() {

  //const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <div>
    <NavBar />
    <div className="App">
      
      {  
      <div className="leftside">
        {data.map(data => (
          <div className="boink">
            <a href={data.img}>
            <img src = {data.img} alt='offender' className="leftside-image"></img>
            </a>
            <p className="frontpage-name">{data.name}</p>
            <p>{data.address}</p>
            <p>{data.locality}</p>
          </div>
          
        ))}
      </div>
    }
{
  <MapAccess />
    //</div><APIProvider apiKey={apiKey} onLoad={() => console.log('Maps API has loaded.')}>
    //  <Map
    //      defaultZoom={13}
    //      defaultCenter={ { lat: 35.964668, lng: -83.926453 } }
    //      >
    //  </Map>
    //</APIProvider>
    }
      
    </div>
    </div>
  );
}
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;
