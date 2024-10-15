import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { auth, firestore } from '../firebase';
import { addDoc, collection } from 'firebase/firestore'; // Correct import for collection
import ResponseMessage from './ResponseMessage';
import './ResponseMessage.css'

const ContactUserModal = ({ show, handleClose, user, receiverUid }) => {
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [includeEmail, setIncludeEmail] = useState(false);
  const [includePhone, setIncludePhone] = useState(false);
  const maxLength = 1000;
  const remainingCharacters = maxLength - message.length;

  // Handle form submission
  const handleCreateMessage = async (messageContent, includeEmail, includePhone) => {
    const authorUid = auth.currentUser.uid; // Get the current user's UID
    let fullMessage = messageContent;

    if (includeEmail || includePhone) {
      fullMessage += "\n\nContact info:";
      if (includeEmail && user?.email) fullMessage += `\nEmail: ${user.email}`;
      if (includePhone && user?.phone) fullMessage += `\nPhone: ${user.phone}`;
    }

    try {
      const docRef = await addDoc(collection(firestore, 'messages'), {
        message: fullMessage,
        authorUid: authorUid,
        receiverUid: receiverUid, // Use the receiver UID from props
        timestamp: new Date(),
      });

      setResponseMessage('Message sent successfully'); // Update success message
      setMessageType('success'); // Set message type to success
      setShowMessage(true); // Show the message

      setMessage('');
      setIncludeEmail(false);
      setIncludePhone(false);
      handleClose(); // Close the modal after sending
    } catch (error) {
      setResponseMessage('Error adding document: ', error); // Update success message
      setMessageType('danger'); // Set message type to success
      setShowMessage(true); // Show the message
    }
  };

  const handleFormSubmit = () => {
    handleCreateMessage(message, includeEmail, includePhone); // Call the function to create message
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Contact User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label id='formMessage'>Message</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={message} 
            onChange={(e) => {
              // Limit message length to 1000 characters
              if (e.target.value.length <= maxLength) {
                setMessage(e.target.value);
              }
            }} 
          />
          <Form.Text className="text-muted">
            {remainingCharacters} characters remaining
          </Form.Text>
        </Form.Group>

        {/* Checkboxes for email and phone */}
        <Form.Group id='formChecks' className="mt-3">
          <Form.Check 
            type="checkbox" 
            label="Include email" 
            checked={includeEmail} 
            onChange={(e) => setIncludeEmail(e.target.checked)} 
          />
          <Form.Check 
            type="checkbox" 
            label="Include phone" 
            checked={includePhone} 
            onChange={(e) => setIncludePhone(e.target.checked)} 
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleFormSubmit}>Send Message</Button>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    
  );
};

export default ContactUserModal;
