import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { Search, Binoculars, BuildingFill, Calendar, PeopleFill, ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import PostDetailModal from "../Components/PostDetailModal";

const PostsPage = ({ user }) => {
  const [universities, setUniversities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    university: '',
    fieldOfStudy: '',
    timespan: '',
  });
  const [loading, setLoading] = useState(true);  // Add loading state

  const handleShowPostModal = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleClosePostModal = () => setShowPostModal(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  // Set loading to true before fetching
        const [postsRes, universitiesRes] = await Promise.all([
          axios.get('https://us-central1-specialemakker-dk.cloudfunctions.net/api/posts'),
          axios.get('https://us-central1-specialemakker-dk.cloudfunctions.net/api/institutioner')
        ]);
        setPosts(postsRes.data);
        setUniversities(universitiesRes.data);
        console.log(universities);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);  // Set loading to false after data fetch
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredPosts = posts.filter((post) => {
    const universityFilter = filters.university ? post.universityName === filters.university : true;
  
    const fieldOfStudyFilter = filters.fieldOfStudy ? 
      (post.fieldOfStudy.toLowerCase().includes(filters.fieldOfStudy.toLowerCase()) || 
       post.subject.toLowerCase().includes(filters.fieldOfStudy.toLowerCase())) 
      : true;
  
    const timespanFilter = filters.timespan ? 
      post.time.toLowerCase().includes(filters.timespan.toLowerCase()) : true;
  
    return universityFilter && fieldOfStudyFilter && timespanFilter;
  });
  

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Container className="my-4" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="d-inline">Filters</h2>
          <Button variant="link" className="p-0 ms-2" onClick={toggleFilters}>
            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </Col>
      </Row>

      {showFilters && (
        <Row className="mb-4">
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group controlId="filterUniversity">
                  <Form.Label>University</Form.Label>
                  <Form.Control
                    as="select"
                    name="university"
                    value={filters.university}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Universities</option>
                    {universities.map((university) => (
                      <option key={university._id} value={university.institution}>
                        {university.institution}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Text className="text-muted">Find the university you want to filter by.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filterFieldOfStudy">
                  <Form.Label>Field of Study</Form.Label>
                  <Form.Control
                    type="text"
                    name="fieldOfStudy"
                    value={filters.fieldOfStudy}
                    onChange={handleFilterChange}
                    placeholder="Enter field of study"
                  />
                  <Form.Text className="text-muted">Search for the study area you're interested in</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filterTimespan">
                  <Form.Label>Timespan</Form.Label>
                  <Form.Control
                    type="text"
                    name="timespan"
                    value={filters.timespan}
                    onChange={handleFilterChange}
                    placeholder="Specify your desired dates"
                  />
                  <Form.Text className="text-muted">Please enter dates in the format: " Mar 24' to Apr 25' "</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Row>
      )}

      <Row>
        <h1>Posts</h1>

        {loading ? (  // Show loading indicator when loading
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading posts...</p>
          </div>
        ) : filteredPosts.length > 0 ? (  // If posts are available, show them
          filteredPosts.map((post) => (
            <Col md={2} key={post._id} className="mb-4">
              <Card style={{ height: '300px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Card.Body className="d-flex flex-column p-3 justify-content-between">
                  <Card.Title
                    style={{
                      fontSize: '20px',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      WebkitLineClamp: 2,
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2',
                      maxHeight: '2.4em',
                    }}
                  >
                    {post.title}
                  </Card.Title>

                  <Card.Text className="mb-2" style={{ fontSize: '16px', margin: '0', display: 'flex', alignItems: 'center' }}>
                    <BuildingFill className="me-1 align-middle" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                      {post.universityName}
                    </span>
                  </Card.Text>

                  <Card.Text className="mb-2" style={{ fontSize: '16px', margin: '0', display: 'flex', alignItems: 'center' }}>
                    <Binoculars className="me-1 align-middle" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                      {post.fieldOfStudy}
                    </span>
                  </Card.Text>

                  <Card.Text className="mb-2" style={{ fontSize: '16px', margin: '0', display: 'flex', alignItems: 'center' }}>
                    <Search className="me-1 align-middle" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                      {post.subject}
                    </span>
                  </Card.Text>

                  <Card.Text className="mb-2" style={{ fontSize: '16px', margin: '0', display: 'flex', alignItems: 'center' }}>
                    <Calendar className="me-1 align-middle" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                      {post.time}
                    </span>
                  </Card.Text>

                  <Card.Text className="mb-2" style={{ fontSize: '16px', margin: '0', display: 'flex', alignItems: 'center' }}>
                    <PeopleFill className="me-1 align-middle" /> {post.amountOfPeople} needed
                  </Card.Text>

                  <Button onClick={() => handleShowPostModal(post)} variant="primary" size="sm" className="mt-auto">
                    Learn more
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (  // If no posts available, show "No posts" message
          <div className="text-center">
            <p>No posts available. Try creating one.</p>
          </div>
        )}
      </Row>

      <PostDetailModal show={showPostModal} handleClose={handleClosePostModal} post={selectedPost} />
    </Container>
  );
};

export default PostsPage;
