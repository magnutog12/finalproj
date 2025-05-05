//https://stackoverflow.com/questions/15175783/how-can-i-filter-json-when-searching-for-a-sub-part-of-a-string
//https://react-bootstrap.netlify.app/docs/components/modal/
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Data from './data.json'
import './App.css';
import React, { useState } from "react";
import TrackUser from './Pages/trackUser';

// this ended up being navbar and searching funtionallity
function NavBar() {
  // use states are react hooks (https://react.dev/reference/react/hooks) used to update a state 
  // (first parameter) and set state (second parameter) to add states to functional components.
    const [name, searchName] = useState(""); 
    const [results, setResults] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showModal, setModal] = useState(false);

    function search(name) {
        name = name.toLowerCase();
        return Data.filter(function(obj) {
            return obj.name.toLowerCase().includes(name);
        });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const result = search(name);
        setResults(result);
    };

    const handleShow = (person) => {
      setSelectedPerson(person);
      setModal(true);
    }
    const handleClose = () => {
      setModal(false);
      setSelectedPerson(null);
    } 

  return (
    <div>
    {/*these are react-bootstrap components. They are just prebuilt components that make it easier
       and they have their own styling*/}

    {/*this is the actual navbar part*/}
    <Navbar className="bg-body-tertiary justify-content-between navbar-fixed-top">
    <div className="d-flex align-items-center">
      <Button className="navbar-brand me-2" variant="light" href="index.html">Home</Button>
      <Button className="navbar-brand" variant="light" href="/track">Track</Button>
    </div>
      <Form className="d-flex">
      
      </Form>
      
      {/*Search functionality // displays filtered group of offenders*/}
      <Form className="d-flex" onSubmit={handleSubmit}> 
            
            <Form.Control
              type="text"
              placeholder="Type something..."
              className=" mr-sm-2"

              value={name}
              onChange={(e) => searchName(e.target.value)}
            />
          
          <Button type="submit" variant="outline-dark" className="rounded px-4">Search</Button>
          
      </Form>
    </Navbar>

    {/*This is how you inject JS into html // Fixes listing showing up as // &nbsp; for spaces""*/}
    {name !== "" && <p>&nbsp;&nbsp;&nbsp;Listings for "{name}":</p>}
   
    {/*what is displayed on handleSubmit*/}
    <ul>
      
      {results.map((item) => (
        <li className="gap-2" key={item.name}>
          {/*handles modal popups*/}
          <Button className="m-1" variant="outline-dark" size='sm' onClick={() => handleShow(item)}>
          {item.name}</Button>
        </li>
      ))}
      
    </ul>

    {/*a modal is a overlay/popup, in this case when a button is clicked*/}

    {/*this prevents an error saying selectedPerson is null*/}
    {/*modal popup when clicked on offenders name in search*/}


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
 
  );
}

export default NavBar;