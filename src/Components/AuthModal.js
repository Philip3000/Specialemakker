// AuthModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AuthModal = ({ show, handleClose, authMode, authFormData, handleAuthChange, handleAuthSubmit }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>{authMode === 'signIn' ? 'Sign In' : 'Sign Up'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleAuthSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" name="email" value={authFormData.email} onChange={handleAuthChange} required />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={authFormData.password} onChange={handleAuthChange} required />
        </Form.Group>
        {authMode === 'signUp' && (
          <Form.Group controlId="formConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" name="confirmPassword" value={authFormData.confirmPassword} onChange={handleAuthChange} required />
          </Form.Group>
        )}
        <Button variant="primary" type="submit">
          {authMode === 'signIn' ? 'Sign In' : 'Sign Up'}
        </Button>
        <Button variant="link" onClick={() => handleAuthChange(authMode === 'signIn' ? 'signUp' : 'signIn')}>
          {authMode === 'signIn' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default AuthModal;
