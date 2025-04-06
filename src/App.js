import NavBar from "./navBar";
import React from 'react';
import './App.css';
import data from './data.json';
import "bootstrap/dist/css/bootstrap.min.css";

function App() {

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
        
   
      
    </div>
    </div>
  );
}

export default App;
