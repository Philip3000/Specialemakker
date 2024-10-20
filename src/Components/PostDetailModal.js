import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ContactUserModal from './ContactUserModal'; 
import { auth, firestore } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

const PostDetailModal = ({ show, handleClose, post }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [user, setUser] = useState(null); 

  const handleShowContactModal = () => {
    handleClose(); // Close PostDetailModal
    setShowContactModal(true); // Show ContactUserModal
  };  const handleCloseContactModal = () => setShowContactModal(false);

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
      console.log(currentUser.uid)
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

  


  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{post?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Description:</strong> {post?.description}</p>
          <p><strong>Field of Study:</strong> {post?.fieldOfStudy}</p>
          <p><strong>Subject:</strong> {post?.subject}</p>
          <p><strong>University:</strong> {post?.universityName}</p>
          <p><strong>Grade importance from 1-10:</strong> {post?.gradeImportance}</p>
          <p><strong>Timeframe:</strong> {post?.time}</p>
          {post?.name && (
          <p><strong>Name:</strong> {post?.name}</p>
          )}
          {post?.email && (
          <p><strong>Email:</strong> {post?.email}</p>
          )}
          {post?.phone && (
          <p><strong>Phone:</strong> {post?.phone}</p>
          )}

          
        </Modal.Body>
        <Modal.Footer>
          {user &&
          <Button onClick={handleShowContactModal}>Contact User</Button>
}
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {user && post?.maker && (
        <ContactUserModal
          show={showContactModal}
          handleClose={handleCloseContactModal}
          user={user} 
          receiverUid={post.maker} 
          name={post.name}
        />
      )}
    </>
  );
};

export default PostDetailModal;
