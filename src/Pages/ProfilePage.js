import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { auth, firestore } from '../firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { Container, Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import ResponseMessage from '../Components/ResponseMessage';
import '../Components/ResponseMessage.css'; 

const ProfilePage = () => {
  const [universities, setUniversities] = useState([]);
  const [messages, setMessages] = useState([]); 
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingPost, setLoadingPost] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fieldOfStudy: '',
    universityName: ''
  });

  const [post, setPost] = useState(null); 
  const [postEditMode, setPostEditMode] = useState(false); 
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    subject: '',
    universityName: '',
    fieldOfStudy: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '', 
    time: '',
    noContact: false,
    isAnonymous: false,    
    maker: '',
    amountOfPeople: 0,
    email: '',
    phone: '',
    gradeImportance: 0,
    date: '',
  });
  const formatMessage = (message) => {
    let mainMessage = message;
    let name = '';
    let email = '';
    let phone = '';

    // Check if contact info exists
    if (message.includes('Contact info:')) {
      const parts = message.split('Contact info:');
      mainMessage = parts[0].trim(); 
      const contactInfo = parts[1].trim();

      // Use regex to extract email and phone if present
      const nameMatch = contactInfo.match(/Name:\s*([^\n]+)/);
      const emailMatch = contactInfo.match(/Email:\s*([^\n]+)/);
      const phoneMatch = contactInfo.match(/Phone:\s*([^\n]+)/);
      if (nameMatch) name = nameMatch[1].trim();
      if (emailMatch) email = emailMatch[1].trim();
      if (phoneMatch) phone = phoneMatch[1].trim();
    }

    return { mainMessage, name, email, phone };
  };
  const handleShowSuccess = () => {
    setMessage('Operation was successful!');
    setMessageType('success');
    setShowMessage(true);
  };

  const handleShowError = () => {
    setMessage('There was an error processing your request.');
    setMessageType('danger');
    setShowMessage(true);
  };

  // Fetch profile data and user post when the component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userId = currentUser.uid;
  
          // Fetch messages where the receiverUid matches the current user's UID
          const q = query(
            collection(firestore, 'messages'),
            where('receiverUid', '==', userId) 
          );
          
          const querySnapshot = await getDocs(q);
  
          const fetchedMessages = [];
          querySnapshot.forEach((doc) => {
            fetchedMessages.push({ id: doc.id, ...doc.data() });
          });
          
          if (fetchedMessages.length > 0) {
            setMessages(fetchedMessages); 
          } else {
            console.log('No messages found.');
            setMessages([]);
          }
          setLoadingMessages(false)
          
          // Fetch profile data for the current user
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfileData(data);
            setFormData(data); 
          } else {
            console.error('User document does not exist!');
          }
  
          // Fetch the user's post
          const existingPost = await axios.get(`https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts?maker=${userId}`);
          if (existingPost.data.length > 0) {
            setPost(existingPost.data[0]); 
            setPostData(existingPost.data[0]);
            const [universitiesRes] = await Promise.all([axios.get('https://us-central1-specialemakker-dk.cloudfunctions.net/api/institutioner')]);
            setUniversities(universitiesRes.data);
          }
          setLoadingPost(false);
        } catch (error) {
          console.error('Error fetching user data or messages:', error);
          handleShowError();
        }
      } else {
        console.error('No user is currently signed in.');
        setProfileData(null); 
      }
    });
  
    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);
  
  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete all posts and their related messages?")) {
      try {
        const response = await axios.delete('https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts', {
          data: {
            maker: auth.currentUser.uid, // The ID of the user who is deleting the post
          },
        });
        console.log(response.status)
        if (response.status === 200) {
          const q = query(
            collection(firestore, 'messages'),
            where('receiverUid', '==', auth.currentUser.uid) 
          );
          // Fetch the messages matching the query
          const querySnapshot = await getDocs(q);
          console.log(querySnapshot)
          // Create a batch to delete the messages
          const batch = writeBatch(firestore); // Initialize a batch operation
  
          // Loop through the documents and add delete operations to the batch
          querySnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Prepare each message for deletion
          });
  
          // Commit the batch delete
          await batch.commit();
          setPost([]); // Clear posts from state
          setMessages([]); // Clear messages from state          
          setMessage("All posts and related messages deleted successfully.")
          setMessageType("success")
          setShowMessage(true);
        }
      } catch (error) {
        setMessage("Error deleting the posts and messages. ", error)
        setMessageType("danger")
        setShowMessage(true);      }
    }
  };
  
  // Handle input changes for profile form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
        const updatedState = { ...prevState, [name]: value };
        return updatedState;
    });
};

  // Handle input changes for post form
  const handlePostInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPostData((prevState) => {
        const updatedState = { ...prevState, 
          [name]: type === 'checkbox' ? checked : value
          
         };
        return updatedState;
    });
};

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handlePostEditToggle = () => {
    setPostEditMode(!postEditMode);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser; // Get current user again to ensure we have the latest state
    if (currentUser) {
      const userId = currentUser.uid; // Get user ID
      const userDocRef = doc(firestore, 'users', userId);
      try {
        await updateDoc(userDocRef, formData); // Update the Firestore document
        setProfileData(formData); // Update local state
        setEditMode(false); // Exit edit mode
        handleShowSuccess();
      } catch (error) {
        console.error('Error updating user data:', error);
        handleShowError();
      }
    }
  };

  // Handle post update
  const handlePostSubmit = async (e) => {
    e.preventDefault();
const startYear = String(postData.startYear);
const endYear = String(postData.endYear);
    const time = `${postData.startMonth.slice(0, 3)} ${startYear.slice(-2)}' to ${postData.endMonth.slice(0, 3)} ${endYear.slice(-2)}'`;

    if (post) {
      try {
        if (!postData.isAnonymous) {
          postData.name = profileData.name
         }
         if (!postData.noContact) {
          if (profileData?.email) {
            postData.email = profileData.email; // Only set email if userData.email is not null/undefined
          }
          if (profileData?.phone) {
            postData.phone = profileData.phone; // Only set phone if userData.phone is not null/undefined
          }
         }
        // Send PUT request to update the post
        const response = await axios.put('https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts', {
          maker: auth.currentUser.uid, // Add maker to the body
          ...postData, // This should be the updated post data
          time, // Include the formatted time
        });
        // Assuming the response contains the updated post data
        setPost(response.data); 
        setPostEditMode(false); 
        setMessage('Post updated successfully'); 
        setMessageType('success'); 
        setShowMessage(true); 

        handleShowSuccess(); 
      } catch (error) {
        setMessage('Error updating post: ' + error.message);
        setMessageType('danger'); 
        setShowMessage(true); 
      }
    }
  };

  return (
    <Container className="mt-5">
      {showMessage && (
        <ResponseMessage
          message={message}
          type={messageType}
          duration={3000} // Auto-dismiss after 3 seconds
          onClose={() => setShowMessage(false)}
        />
      )}
      <Row className="justify-content-center">
        <Col md={6}>
          {/* Left Column: Profile Info */}
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                {editMode ? "Edit Profile" : `Profile info`}
              </Card.Title>

              {editMode ? (
                <Form onSubmit={handleProfileSubmit}>
                  {/* Profile Form Fields */}
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label><strong>Name</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label><strong>Email</strong></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label><strong>Phone</strong></Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formFieldOfStudy">
                    <Form.Label><strong>Field of Study</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formUniversityName">
                    <Form.Label><strong>University Name</strong></Form.Label>
                    <Form.Control
                      as="select"
                      name="universityName"
                      value={formData.universityName}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a university</option>
                      {universities.map((university) => (
                        <option key={university._id} value={university.institution}>
                          {university.institution}
                        </option>
                      ))}
                      <option value="custom">Enter a custom university name</option>
                    </Form.Control>
                    {formData.universityName === 'custom' && (
                      <Form.Control
                        type="text"
                        name="customUniversityName"
                        value={formData.customUniversityName || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter custom university name"
                      />
                    )}
                  </Form.Group>
                  <div className="text-center mt-5">
                    <Button type="submit" variant="success" className="me-2">Save Changes</Button>
                    <Button onClick={handleEditToggle} variant="secondary">Cancel</Button>
                  </div>
                </Form>
              ) : (
                <>
                  {profileData ? (
                    <>
                      <p><strong>Name:</strong> {profileData.name}</p>
                      <p><strong>Email:</strong> {profileData.email}</p>
                      <p><strong>Phone:</strong> {profileData.phone}</p>
                      <p><strong>Field of Study:</strong> {profileData.fieldOfStudy}</p>
                      <p><strong>University Name:</strong> {profileData.universityName}</p>
                      <div className="text-center">
                        <Button onClick={handleEditToggle} variant="primary">Edit Profile</Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Loading profile data...</p>
                  </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
          <Card className="p-4 mt-4 shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="text-center mb-4">Messages</Card.Title>
          
          {loadingMessages ? (
             <div className="text-center">
             <Spinner animation="border" role="status">
               <span className="visually-hidden">Loading...</span>
             </Spinner>
             <p>Loading messages...</p>
           </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const { mainMessage, name, email, phone } = formatMessage(message.message); // Format the message

              return (
                <div key={message.id} className="mb-3">
                
                  <Card>
                  <Card.Body>
                    <Card.Text><strong>Message:</strong> {mainMessage}</Card.Text>
                    <Card.Text> {name && <p><strong>Name:</strong> {name}</p>}</Card.Text>
                    <Card.Text> {email && <p><strong>Email:</strong> {email}</p>}</Card.Text>
                    <Card.Text> {phone && <p><strong>Phone:</strong> {phone}</p>}</Card.Text>
                  </Card.Body>
                </Card>
                </div>
              );
            })
          ) : (
            <p>No messages found.</p>
          )}
        </Card.Body>
      </Card>
        </Col>
        
        <Col md={6}>
          {/* Right Column: Post Info */}
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <Card.Title className="text-center mb-4">Your Post</Card.Title>

              {loadingPost ? (
             <div className="text-center">
             <Spinner animation="border" role="status">
               <span className="visually-hidden">Loading...</span>
             </Spinner>
             <p>Loading post...</p>
           </div>
          ) : post ? (
                postEditMode ? (
                  <Form onSubmit={handlePostSubmit}>
                    <Form.Group className="mb-3" controlId="formPostTitle">
                      <Form.Label><strong>Title</strong></Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={postData.title}
                        onChange={handlePostInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPostDescription">
                      <Form.Label><strong>Description</strong></Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={postData.description}
                        onChange={handlePostInputChange}
                        rows={3}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPostSubject">
                      <Form.Label><strong>Subject</strong></Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={postData.subject}
                        onChange={handlePostInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId="formUniversityName">
                      <Form.Label><strong>University Name</strong></Form.Label>
                      <Form.Control
                        as="select"
                        name="universityName"
                        value={postData.universityName}
                        onChange={handlePostInputChange}
                        required
                      >
                        <option value="">Select a university</option>
                        {universities.map((university) => (
                          <option key={university._id} value={university.institution}>
                            {university.institution}
                          </option>
                        ))}
                        <option value="custom">Enter a custom university name</option>
                      </Form.Control>
                      {postData.universityName === 'custom' && (
                        <Form.Control
                          type="text"
                          name="customUniversityName"
                          value={postData.customUniversityName || ''}
                          onChange={(e) => handlePostInputChange(e)}
                          placeholder="Enter custom university name"
                        />
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPostFieldOfStudy">
                      <Form.Label><strong>Field of Study</strong></Form.Label>
                      <Form.Control
                        type="text"
                        name="fieldOfStudy"
                        value={postData.fieldOfStudy}
                        onChange={handlePostInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId="formStart">
                      <Col md={6}>
                        <Form.Label><strong>Start Month</strong></Form.Label>
                        <Form.Control
                          as="select"
                          name="startMonth"
                          value={postData.startMonth}
                          onChange={handlePostInputChange}
                          required
                        >
                          <option value="">Select start month</option>
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </Form.Control>
                      </Col>
                      <Col md={6}>
                        <Form.Label><strong>Start Year</strong></Form.Label>
                        <Form.Control
                          as="select"
                          name="startYear"
                          value={postData.startYear}
                          onChange={handlePostInputChange}
                          required
                        >
                          <option value="">Select start year</option>
                          {[...Array(10)].map((_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>{year}</option>
                            );
                          })}
                        </Form.Control>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='mb-3' controlId="formEnd">
                      <Col md={6}>
                        <Form.Label><strong>End Month</strong></Form.Label>
                        <Form.Control
                          as="select"
                          name="endMonth"
                          value={postData.endMonth}
                          onChange={handlePostInputChange}
                          required
                        >
                          <option value="">Select end month</option>
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </Form.Control>
                      </Col>
                      <Col md={6}>
                        <Form.Label><strong>End Year</strong></Form.Label>
                        <Form.Control
                          as="select"
                          name="endYear"
                          value={postData.endYear}
                          onChange={handlePostInputChange}
                          required
                        >
                          <option value="">Select end year</option>
                          {[...Array(10)].map((_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>{year}</option>
                            );
                          })}
                        </Form.Control>
                      </Col>
                    </Form.Group>


                    <Form.Group className="mb-3" controlId="formPostAmountOfPeople">
                      <Form.Label><strong>People wanted</strong></Form.Label>
                      <Form.Control
                        type="number"
                        name="amountOfPeople"
                        value={postData.amountOfPeople}
                        onChange={handlePostInputChange}
                        min="1"
                  max="4"
                  required
                      />
                    </Form.Group>
                   
                    <Form.Group className="mb-3" controlId="formPostGradeImportance">
                      <Form.Label><strong>Grade Importance</strong></Form.Label>
                      <Form.Control
                        type="number"
                        name="gradeImportance"
                        value={postData.gradeImportance}
                        onChange={handlePostInputChange}
                        min="1"
                  max="10"
                  required
                      />
                    </Form.Group>
                <Form.Group controlId="anonymousCheckbox" className=''>
                  <Form.Check
                    type="checkbox"
                    label="Hide my name"
                    name="isAnonymous"
                    checked={postData.isAnonymous}
                    onChange={handlePostInputChange}
                  />
                </Form.Group>
              
                <Form.Group controlId="contactDetailsCheckbox" className=''>
                  <Form.Check
                    type="checkbox"
                    label="Hide my contact details"
                    name="noContact"
                    checked={postData.noContact}
                    onChange={handlePostInputChange}
                  />
                </Form.Group>
              <hr className='mt-2'/>
                    <div className="text-center">
                      <Button type="submit" variant="success" className="me-2">Save Changes</Button>
                      <Button onClick={handlePostEditToggle} variant="secondary">Cancel</Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <p><strong>Title:</strong> {post.title}</p>
                    <p><strong>Description:</strong> {post.description}</p>
                    <p><strong>Subject:</strong> {post.subject}</p>
                    <p><strong>University Name:</strong> {post.universityName}</p>
                    <p><strong>Field of Study:</strong> {post.fieldOfStudy}</p>
                    <p><strong>Time:</strong> {post.time}</p>
                    <p><strong>People wanted</strong> {post.amountOfPeople}</p>
                    <p><strong>High Grade Importance:</strong> {post.gradeImportance}</p>
                    <div className="text-center">
                      <Button onClick={handlePostEditToggle} variant="primary">Edit Post</Button>
                      <Button onClick={handleDeletePost} variant="danger" className="ms-2 ml-3">
        Delete Post
      </Button>
                    </div>
                    
                  </>
                )
              ) : (
                <p>You have not created a post yet.</p>
              )}

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default ProfilePage;
