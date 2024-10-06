// ContactUserModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ContactUserModal = ({ show, handleClose, handleSendEmail }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Contact User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Message</Form.Label>
        <Form.Control as="textarea" rows={3} />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={handleSendEmail}>Send Email</Button>
      <Button variant="secondary" onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal>
);

export default ContactUserModal;
