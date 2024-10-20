import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { auth, firestore } from '../firebase'; 
import AuthModal from '../Components/AuthModal'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import ResponseMessage from '../Components/ResponseMessage';
import '../Components/ResponseMessage.css';

const FrontPage = () => {
  const [user, setUser] = useState(null); 
  const [loadingUser, setLoadingUser] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [authMode, setAuthMode] = useState('signIn'); 
  const [authFormData, setAuthFormData] = useState({ email: '', password: '', confirmPassword: '' }); 
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
 
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleShowAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessageType('success');
      if (authMode === 'signIn') {
        await signInWithEmailAndPassword(auth, authFormData.email, authFormData.password);
        setMessage('Signed in successfully');
        setShowMessage(true);
      } else {
        if (authFormData.password !== authFormData.confirmPassword) {
          setMessage("Passwords don't match");
          setMessageType('danger');
          setShowMessage(true);
          return;
        }
  
        const userCredential = await createUserWithEmailAndPassword(auth, authFormData.email, authFormData.password);
        const newUser = userCredential.user;
  
        const userData = {
          email: newUser.email,
          phone: '',
          universityName: '',
          fieldOfStudy: '',
          role: 'user',
        };
        await setDoc(doc(firestore, 'users', newUser.uid), userData);
  
        setMessage('Signed up successfully');
        setShowMessage(true);
      }
  
      setShowAuthModal(false);
    } catch (error) {
      const errorMessage = error.message;
      setMessage(`Authentication error: ${errorMessage}`);
      setMessageType('danger');
      setShowMessage(true);
    }
  };

  return (
    <Container fluid style={{ height: '100vh', backgroundColor: '#343a40' }}>
      <Row style={{ height: '100%' }}>
        
        {/* Right Side with Logo */}
        <Col 
          md={6} 
          className="d-flex align-items-center justify-content-center" 
        >
          <img
            src="https://specialemakker.dk/forsideHvid.png"
            alt="Specialemakker Logo"
            style={{ maxWidth: '90%', maxHeight: '90%' }}
          />
        </Col>
        {/* Left Side */}
        <Col 
          md={6} 
          style={{ 
            color: '#fff', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center' 
          }}
        >
          {loadingUser ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <h1>Welcome to <span style={{ color: '#87CEFA' }}>Specialemakker</span></h1>
              <p style={{ maxWidth: '600px' }}>
                Find the perfect study partner based on your field of study and interests.
              </p>
              <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" as={Link} to="/posts" className="btn-lg">
                  Browse Posts
                </Button>
              </div>
            </>
          )}
        </Col>

      </Row>

      {/* Auth Modal and Response Message */}
      <AuthModal 
        show={showAuthModal} 
        handleClose={handleCloseAuthModal} 
        authMode={authMode} 
        handleAuthChange={handleAuthChange} 
        handleAuthSubmit={handleAuthSubmit} 
        authFormData={authFormData} 
      />
      {showMessage && (
        <ResponseMessage
          message={message}
          type={messageType}
          duration={3000} 
          onClose={() => setShowMessage(false)}
        />
      )}
    </Container>
  );
};

export default FrontPage;