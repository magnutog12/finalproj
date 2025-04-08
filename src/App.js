import NavBar from "./navBar";
import React from 'react';
import './App.css';
import data from './data.json';
import "bootstrap/dist/css/bootstrap.min.css";
import {createRoot} from "react-dom/client";
import MapAccess from "./mapUse";
//import {APIProvider, Map} from '@vis.gl/react-google-maps';

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
