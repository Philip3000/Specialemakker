import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
const AuthModal = ({ show, handleClose, authMode, handleAuthChange, handleAuthSubmit, authFormData }) => {
  
  // Safely checking if the user exists before accessing email
  const email = authFormData.email || ''; 


  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{authMode === 'signIn' ? 'Sign In' : 'Sign Up'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAuthSubmit}>
          <Form.Group controlId="formEmail">
            <Form.Label><strong>Email Address</strong></Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={email} 
              onChange={handleAuthChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label><strong>Password</strong></Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={authFormData.password || ''} 
              onChange={handleAuthChange}
              required
            />
          </Form.Group>

          {authMode === 'signUp' && (
            <Form.Group controlId="formConfirmPassword">
              <Form.Label><strong>Confirm Password</strong></Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={authFormData.confirmPassword || ''} 
                onChange={handleAuthChange}
                required
              />
            </Form.Group>
          )}

          <Button variant="primary" className='mt-3' type="submit">
            {authMode === 'signIn' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuthModal;
