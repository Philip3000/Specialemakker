import React, { useState, useEffect } from 'react';
import { auth, firestore } from './firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, 
  Navbar, 
  Nav, 
  Button, 
} from 'react-bootstrap';
import { 
 
  HouseFill,
  FileEarmarkPlusFill, 
  Stack
} from 'react-bootstrap-icons';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './Pages/ProfilePage';
import PostsPage from './Pages/PostsPage';
import FrontPage from './Pages/FrontPage';
import NoPage from './Pages/NoPage';
import AuthModal from "./Components/AuthModal";
import CreatePostModal from './Components/CreatePostModal';
import { getFunctions, httpsCallable } from "firebase/functions";
import ResponseMessage from './Components/ResponseMessage'; // Import the ResponseMessage component
import './Components/ResponseMessage.css'

const App = () => {

  // State declarations
  const [userData, setUserData] = useState(false);
  const [posts, setPosts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasPost, setHasPost] = useState(false);
  const [authMode, setAuthMode] = useState('signIn');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  
  // Authentication form data
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Form data for creating posts
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    universityName: '',
    customUniversityName: '',
    fieldOfStudy: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    name: 'anon',
    noContact: false,
    isAnonymous: false,
    amountOfPeople: '',
    email: '',
    phone: '',
    gradeImportance: '',
  });
  // Filter settings

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, universitiesRes] = await Promise.all([
          axios.get('https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts'),
          axios.get('https://us-central1-specialemakker-dk.cloudfunctions.net/api/institutioner')
        ]);
        setPosts(postsRes.data);
      if (user) {
        const userHasPost = postsRes.data.some(post => post.maker === user.uid);
        setHasPost(userHasPost); // Set true if user has a post
      }
        setUniversities(universitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userData = await fetchUserData(user.uid);
        setUserData(userData);
        const userRole = await fetchUserRole(user);
        setRole(userRole);
      } else {
        setUser(null);
        setUserData(null);
        setRole(null);
      }
    });
    fetchData();

    return () => unsubscribe();
  }, []);

  

  // Fetch user role from Firestore
  const fetchUserRole = async (user) => {
    if (user) {
      try {
        const roleDocRef = doc(firestore, 'users', user.uid);
        const roleDoc = await getDoc(roleDocRef);
        return roleDoc.exists() ? roleDoc.data().role : 'user';
      } catch (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }
    }
    return null;
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };


  // Handle form data changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const time = `${formData.startMonth.slice(0, 3)} ${formData.startYear.slice(-2)}' to ${formData.endMonth.slice(0, 3)} ${formData.endYear.slice(-2)}'`;
    const maker = user ? user.uid : null; // Ensure user is available
    
    try {
       // Check if the user has already created a post
       const existingPost = await axios.get(`https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts?maker=${maker}`);

       if (existingPost.data.length > 0) {
         // If the user already has a post, display a warning message
         setMessageType('danger');
         setMessage('You already have a post')
         setShowMessage(true);
         return;
       }
       if (!formData.isAnonymous) {
        formData.name = userData.name
       }
       if (!formData.noContact) {
        if (userData?.email) {
          formData.email = userData.email; // Only set email if userData.email is not null/undefined
        }
        if (userData?.phone) {
          formData.phone = userData.phone; // Only set phone if userData.phone is not null/undefined
        }
       }
      const response = await axios.post('https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts', { 
        ...formData, 
        time, 
        maker
      });
      setPosts(prevPosts => [...prevPosts, response.data]);
      setFormData({
        title: '',
        description: '',
        subject: '',
        universityName: '',
        customUniversityName: '',
        fieldOfStudy: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        name: '',
        isAnonymous: false,
        noContact: false,
        amountOfPeople: '',
        email: '',
        phone: '',
        gradeImportance: '', 
      });
      setShowCreateModal(false);
      setMessageType('success');
      setMessage('Post created succesfully')
      setShowMessage(true);
    } catch (error) {
      setMessage('Error creating post:', error)
      setMessageType('danger');
      setShowMessage(true);
    }
  };

  // Handle authentication form changes
  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prevState => ({ ...prevState, [name]: value }));
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
          role: 'user',
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

 

  const handleCloseCreateModal = () => setShowCreateModal(false);
  const handleShowAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => setShowAuthModal(false);
  


  return (
    <BrowserRouter>
    <div>
      
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/" className='ms-3' style={{ color: '#87CEFA' }}>
        Specialemakker.dk
      </Navbar.Brand>
      {(user && (role === 'admin' || role === 'user')) && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)} style={{ marginLeft: 'auto'}} className="me-2  d-lg-none">
              Create Post <FileEarmarkPlusFill className="me-1" />
            </Button>
          )}
      {/* Navbar toggle for small screens */}
      <Navbar.Toggle 
        aria-controls="basic-navbar-nav" 
        style={{ border: 'none' }} // Remove outline
      />
      
      {/* Collapsible nav items */}
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home <HouseFill className="me-1 align-middle" /></Nav.Link>
          <Nav.Link href="/posts">Posts <Stack className='me-1 align-middle' /></Nav.Link>
        </Nav>
        
        {/* Authentication buttons */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          {(user && (role === 'admin' || role === 'user')) && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="me-2 d-none d-sm-block">
              Create Post <FileEarmarkPlusFill className="me-1" />
            </Button>
          )}
          {user ? (
            <>
              <Button variant="outline-light" href="/profile" className="ms-2">
                Profile
              </Button>
              <Button variant="outline-light" onClick={() => signOut(auth)} className="ms-3 me-2">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline-light" onClick={() => handleShowAuthModal('signUp')} className="me-2">
                Sign Up
              </Button>
              <Button variant="outline-light" onClick={() => handleShowAuthModal('signIn')} className="ms-3 me-2">
                Sign In
              </Button>
            </>
          )}
        </div>
      </Navbar.Collapse>
    </Navbar>

      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/posts" element={<PostsPage posts={posts} user={user} />} /> {/* Add the new route for posts */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>

   
     
      {showMessage && (
        <ResponseMessage
          message={message}
          type={messageType}
          duration={3000} // Auto-dismiss after 3 seconds
          onClose={() => setShowMessage(false)}
        />
      )}
<CreatePostModal
        showCreateModal={showCreateModal}
        handleCloseCreateModal={handleCloseCreateModal}
        handleSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        universities={universities}
      />
     
      <AuthModal 
  show={showAuthModal} 
  handleClose={handleCloseAuthModal} 
  authMode={authMode} 
  handleAuthChange={handleAuthChange} 
  handleAuthSubmit={handleAuthSubmit} 
  authFormData={authFormData} 
/>

    </div>
    </BrowserRouter>
  );
  
};

export default App;
