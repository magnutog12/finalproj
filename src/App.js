//https://www.geeksforgeeks.org/firebase-phone-authentication/
// https://firebase.google.com/docs/auth/web/phone-auth
import NavBar from "./navBar";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import React, { useState, useEffect, useRef } from 'react';
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

function SignIn({ setIsLoggedIn }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setconfirmationResult] = useState(null);

  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    if (!recaptchaInitialized.current) {
      recaptchaInitialized.current = true;
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible',
            callback: (response) => {
            console.log('Recaptcha verified');
            },
          
        });
        window.recaptchaVerifier.render().then((widgetId) => {
          window.recaptchaWidgetId = widgetId;
        });
      }
  }, []);

  const sendVerificationCode = () => {
    const appVerifier = window.recaptchaVerifier;

    firebase.auth().signInWithPhoneNumber(phone, appVerifier)
      .then((result) => {
        // prompt user to type the code from the message
        setconfirmationResult(result);
        alert('Code sent!');
      })
      .catch((error) => {
        console.error('Error during sign in:', error.message);
      });
  }

  const verifyCode = () => {
    if (!confirmationResult) {
      return;
    }
    confirmationResult.confirm(code)
      .then((result) => {
        // user signed in successfully
        const user = result.user;
        console.log('User UID:', user.uid); 
        console.log('User Phone Number:', user.phoneNumber); 
        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.error('Error during verification:', error.message);
      });
  };

  return (<div className="sign-in-container">
      <div id="recaptcha-container"></div>

      <Box className='sign-in-box' component="section" sx={{ p: 2, border: '1px  grey' }}>
        <p className="sign-in-header">Sign In</p>
      <TextField
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1234567890"
      />
      <Button sx={{ width: 220 }} variant="contained" color="inherit" onClick={sendVerificationCode}>Send Code</Button>
      
      {
        confirmationResult && (
          <div className="verification-code-container">
            <TextField
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
            />
            
            <Button sx={{ width: 220 }} variant="contained" color="inherit" onClick={verifyCode}>Verify Code</Button>

          </div>
        )
        
      }
      </Box>
    </div> )
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
    {!isLoggedIn ? ( <SignIn setIsLoggedIn={setIsLoggedIn}/>) : ( 
    <>
    <NavBar />
    <div className="App">
      
      <div className="leftside">
        {data.map(data => (
          <div className="boink" key={data.name}>
            <a href={data.img}>
            <img src = {data.img} alt='offender' className="leftside-image"></img>
            </a>
            <p className="frontpage-name">{data.name}</p>
            <p>{data.address}</p>
            <p>{data.locality}</p>
          </div>
          
        ))}
      </div>
    
    <MapAccess />
      
    </div>
    </>
    )}
    </div>
  
  );
}
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;
