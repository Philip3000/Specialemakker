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
  Col, 
  Row, 
  Card, 
  Modal, 
  Form 
} from 'react-bootstrap';
import { 
  Search, 
  Binoculars, 
  BuildingFill, 
  Calendar, 
  PeopleFill 
} from 'react-bootstrap-icons';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './Pages/ProfilePage';
import PostsPage from './Pages/PostsPage';
import FrontPage from './Pages/FrontPage';
import NoPage from './Pages/NoPage';
import { getFunctions, httpsCallable } from "firebase/functions";

const App = () => {
  const postAuthorEmail = "email@example.com"; // Placeholder for post author email

  // State declarations
  const [userData, setUserData] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signIn');
  
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
    fieldOfStudy: '',
    startMonth: '',
    endMonth: '',
    amountOfPeople: '',
    email: '',
    phone: '',
    gradeImportance: ''
  });

  // Filter settings

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, universitiesRes] = await Promise.all([
          axios.get('http://localhost:5000/posts'),
          axios.get('http://localhost:5000/institutioner')
        ]);
        setPosts(postsRes.data);
        setUniversities(universitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
    
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

    return () => unsubscribe();
  }, []);

  // Send email using Firebase functions
  const sendEmail = async (recipientEmail, message, includePhone, userInfo) => {
    const functions = getFunctions();
    const sendEmailFunc = httpsCallable(functions, "sendEmail");
    
    try {
      const result = await sendEmailFunc({ recipientEmail, message, includePhone, userInfo });
      console.log(result.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

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

  // Handle user contact actions
  const handleContactUser = () => {
    if (!user) {
      handleShowAuthModal("signIn");
    } else {
      setContactModal(true);
    }
  };

  // Send email after user submits the contact form
  const handleSendEmail = () => {
    const message = "Your message here...";
    const includePhone = true; // based on user checkbox
    const userInfo = {
      email: user.email,
      phone: "123-456-7890", // fetch from user's profile
      fieldOfStudy: "Computer Science",
      universityName: "Harvard University",
    };

    sendEmail(postAuthorEmail, message, includePhone, userInfo);
    setContactModal(false); // Close modal after sending
  };

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const time = `${formData.startMonth} to ${formData.endMonth}`;
    try {
      const response = await axios.post('http://localhost:5000/posts', { 
        ...formData, 
        time, 
        maker: user.uid 
      });
      setPosts(prevPosts => [...prevPosts, response.data]);
      setFormData({
        title: '',
        description: '',
        subject: '',
        universityName: '',
        fieldOfStudy: '',
        startMonth: '',
        endMonth: '',
        amountOfPeople: '',
        email: '',
        phone: '',
        gradeImportance: '',
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Handle authentication form changes
  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Handle authentication submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'signIn') {
        await signInWithEmailAndPassword(auth, authFormData.email, authFormData.password);
      } else {
        if (authFormData.password !== authFormData.confirmPassword) {
          alert("Passwords don't match");
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, authFormData.email, authFormData.password);
        const newUser = userCredential.user;

        const userData = {
          email: newUser.email,
          phone: '',
          universityName: '',
          fieldOfStudy: '',
          role: 'admin'
        };
        await setDoc(doc(firestore, 'users', newUser.uid), userData);
      }
  
      setShowAuthModal(false);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  // Show and hide modals
  const handleShowPostModal = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleClosePostModal = () => setShowPostModal(false);
  const handleShowCreateModal = () => setShowCreateModal(true);
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
        <Navbar.Brand href="/">Specialemakker</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="#posts">Posts</Nav.Link>
        </Nav>
        {user ? (
          <>
            {role === 'admin' && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create New Post
              </Button>
            )}
            <Button variant="outline-light" onClick={() => signOut(auth)}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="outline-light" onClick={() => handleShowAuthModal('signIn')}>
            Sign In
          </Button>
        )}
      </Navbar>

      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/posts" element={<PostsPage posts={posts} user={user} />} /> {/* Add the new route for posts */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>

   
      <Modal show={showPostModal} onHide={handleClosePostModal}>
  <Modal.Header closeButton>
    <Modal.Title>{selectedPost?.title}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>{selectedPost?.description}</p>
    <p><strong>Field of Study:</strong> {selectedPost?.fieldOfStudy}</p>
    <p><strong>University:</strong> {selectedPost?.universityName}</p>
    <p><strong>Time:</strong> {selectedPost?.time}</p>
    {/* Add other post details as needed */}
  </Modal.Body>
  <Modal.Footer>
  <Button onClick={() => handleContactUser(selectedPost.email)}>Contact User</Button>
  <Modal show={contactModal} onHide={() => setContactModal(false)}>
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
        <Button variant="primary" onClick={handleSendEmail}>
          Send Email
        </Button>
      </Modal.Footer>
    </Modal>
    <Button variant="secondary" onClick={handleClosePostModal}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                required
              />
            </Form.Group>
            <Form.Group controlId="formSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                required
              />
            </Form.Group>
            <Form.Group controlId="formUniversityName">
  <Form.Label>University Name</Form.Label>
  <Form.Control
    as="select"
    name="universityName"
    value={formData.universityName}
    onChange={handleChange}
    required
  >
    <option value="">Select a university</option>
    {universities.map((university) => (
      <option key={university._id} value={university.name}>
        {university.name}
      </option>
    ))}
    <option value="custom">Enter a custom university name</option>
  </Form.Control>
  {formData.universityName === 'custom' && (
    <Form.Control
      type="text"
      name="universityName"
      value={formData.customUniversityName || ''}
      onChange={(e) => setFormData({ ...formData, customUniversityName: e.target.value })}
      placeholder="Enter custom university name"
    />
  )}
</Form.Group>
            <Form.Group controlId="formFieldOfStudy">
              <Form.Label>Field of Study</Form.Label>
              <Form.Control
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="Enter field of study"
                required
              />
            </Form.Group>
            <Form.Group controlId="formStartMonth">
              <Form.Label>Start Month</Form.Label>
              <Form.Control
                as="select"
                name="startMonth"
                value={formData.startMonth}
                onChange={handleChange}
                required
              >
                <option value="">Select start month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                {/* Add other months as options */}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formEndMonth">
              <Form.Label>End Month</Form.Label>
              <Form.Control
                as="select"
                name="endMonth"
                value={formData.endMonth}
                onChange={handleChange}
                required
              >
                <option value="">Select end month</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                {/* Add other months as options */}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAmountOfPeople">
              <Form.Label>Amount of People Needed</Form.Label>
              <Form.Control
                type="number"
                name="amountOfPeople"
                value={formData.amountOfPeople}
                onChange={handleChange}
                min="1"
                max="4"
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>
            <Form.Group controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </Form.Group>
            <Form.Group controlId="formGradeImportance">
              <Form.Label>Grade Importance (1-10)</Form.Label>
              <Form.Control
                type="number"
                name="gradeImportance"
                value={formData.gradeImportance}
                onChange={handleChange}
                min="1"
                max="10"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Create Post
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAuthModal} onHide={handleCloseAuthModal}>
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
            <Button variant="link" onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}>
              {authMode === 'signIn' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
    </div>
    </BrowserRouter>
  );
  
};

export default App;
