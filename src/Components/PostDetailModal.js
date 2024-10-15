import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ContactUserModal from './ContactUserModal'; 
import { auth, firestore } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

const PostDetailModal = ({ show, handleClose, post }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [user, setUser] = useState(null); 

  const handleShowContactModal = () => setShowContactModal(true);
  const handleCloseContactModal = () => setShowContactModal(false);

  // Fetch current user's data when component loads
  useEffect(() => {
    const fetchUserData = async (uid) => {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        console.error('No such user document!');
      }
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchUserData(currentUser.uid);
    } else {
      console.log('No user logged in.');
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []); 

  const handleSendEmail = (message, includeEmail, includePhone) => {
    let fullMessage = message;

    if (includeEmail || includePhone) {
      fullMessage += "\n\nContact info:";
      if (includeEmail && user?.email) fullMessage += `\nEmail: ${user.email}`;
      if (includePhone && user?.phone) fullMessage += `\nPhone: ${user.phone}`;
    }

    console.log("Email sent with message:", fullMessage);
    setShowContactModal(false);
  };


  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{post?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{post?.description}</p>
          <p><strong>Field of Study:</strong> {post?.fieldOfStudy}</p>
          <p><strong>University:</strong> {post?.universityName}</p>
          <p><strong>Time:</strong> {post?.time}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleShowContactModal}>Contact User</Button>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {user && post?.maker && (
        <ContactUserModal
          show={showContactModal}
          handleClose={handleCloseContactModal}
          handleSendEmail={handleSendEmail}
          user={user} 
          receiverUid={post.maker} 
        />
      )}
    </>
  );
};

export default PostDetailModal;
