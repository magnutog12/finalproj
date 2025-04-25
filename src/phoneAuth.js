// https://firebase.google.com/docs/auth/web/phone-auth
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


export default function PhoneLogin() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setconfirmationResult] = useState(null);

  useEffect(() => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': function(response) {
            console.log('Recaptcha verified');
            }
        });
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
        // Handle errors here
        console.error('Error during sign-in:', error.message);
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
        console.log('User:', user);
      })
      .catch((error) => {
        console.error('Error during verification:', error.message);
      });
  };
  return (
    <div>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1234567890"
      />
      <button onClick={sendVerificationCode}>Send Code</button>

      {
        confirmationResult && (
          <div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
            />
            <button onClick={verifyCode}>Verify Code</button>
          </div>
        )
      }
      <div id="recaptcha-container"></div>
    </div>
  )

}