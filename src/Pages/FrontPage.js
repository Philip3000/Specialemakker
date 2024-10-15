import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { auth, firestore } from '../firebase'; // Adjust the import according to your firebase setup
import AuthModal from '../Components/AuthModal'; // Import your AuthModal component
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
} from 'firebase/auth';
import { 
  doc, 
  setDoc 
} from 'firebase/firestore';
import ResponseMessage from '../Components/ResponseMessage';
import '../Components/ResponseMessage.css'

const FrontPage = () => {
  const [navbarHeight, setNavbarHeight] = useState(56); // Default height
  const [user, setUser] = useState(null); // State to hold user information
  const [showAuthModal, setShowAuthModal] = useState(false); // State to control modal visibility
  const [authMode, setAuthMode] = useState('signIn'); // State to track if modal is for signIn or signUp
  const [authFormData, setAuthFormData] = useState({ email: '', password: '', confirmPassword: '' }); // State for form data
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  useEffect(() => {
    const navbar = document.querySelector('.navbar'); // Adjust the selector based on your navbar class
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }

    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  // Handle opening the modal
  const handleShowAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Handle closing the modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Handle form input changes
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
        // Check if passwords match
        if (authFormData.password !== authFormData.confirmPassword) {
          setMessage("Passwords don't match");
          setMessageType('danger');
          setShowMessage(true);
          return;
        }
  
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, authFormData.email, authFormData.password);
        const newUser = userCredential.user;
  
        // Set user data in Firestore
        const userData = {
          email: newUser.email,
          phone: '',
          universityName: '',
          fieldOfStudy: '',
          role: 'admin',
        };
        await setDoc(doc(firestore, 'users', newUser.uid), userData);
  
        setMessage('Signed up successfully');
        setShowMessage(true);
      }
  
      setShowAuthModal(false);
    } catch (error) {
      // Extracting error message
      const errorMessage = error.message; // This will give you a user-friendly message
      setMessage(`Authentication error: ${errorMessage}`);
      setMessageType('danger');
      setShowMessage(true);
    }
  };
  


  return (
    <Container fluid className="p-0" style={{ height: '100vh', backgroundColor: '#343a40' }}>
      <div
        style={{
          color: '#fff',
          padding: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center horizontally
          justifyContent: 'center', // Center vertically
          height: `calc(100vh - ${navbarHeight}px)`, // Dynamic height based on navbar
          textAlign: 'center',
        }}
      >
        <h1>Welcome to Specialemakker</h1>
        <p style={{ maxWidth: '600px' }}>
          Find the perfect study partner based on your field of study and interests.
        </p>
        <div className="d-flex justify-content-center mt-4">
          <Button variant="primary" as={Link} to="/posts">
            Browse Posts
          </Button>
          {/* Render buttons only if user is not signed in */}
          {!user && (
            <>
              <Button variant="light" onClick={() => handleShowAuthModal('signUp')} className="ms-3">
                Sign Up
              </Button>
              <Button variant="light" onClick={() => handleShowAuthModal('signIn')} className="ms-3">
                Login
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
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
          duration={3000} // Auto-dismiss after 3 seconds
          onClose={() => setShowMessage(false)}
        />
      )}
    </Container>
  );
};

export default FrontPage;
