// PostDetailModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PostDetailModal = ({ show, handleClose, post, handleContactUser }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>{post?.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>{post?.description}</p>
      <p><strong>Field of Study:</strong> {post?.fieldOfStudy}</p>
      <p><strong>University:</strong> {post?.universityName}</p>
      <p><strong>Time:</strong> {post?.time}</p>
      {/* Add other post details as needed */}
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={() => handleContactUser(post.email)}>Contact User</Button>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default PostDetailModal;
