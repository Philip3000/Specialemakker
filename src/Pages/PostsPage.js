import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Search, Binoculars, BuildingFill, Calendar, PeopleFill } from 'react-bootstrap-icons';

const PostsPage = ({ user }) => {
    const [universities, setUniversities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    university: '',
    fieldOfStudy: '',
    timespan: '',
  });

  // Fetch posts on component mount
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
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Filtered posts based on selected filters
  const filteredPosts = posts.filter((post) => {
    const universityFilter = filters.university ? post.universityName === filters.university : true;
    const fieldOfStudyFilter = filters.fieldOfStudy ?
      post.fieldOfStudy.toLowerCase().includes(filters.fieldOfStudy.toLowerCase()) : true;
    const timespanFilter = filters.timespan ? post.time === filters.timespan : true;

    return universityFilter && fieldOfStudyFilter && timespanFilter;
  });

  return (
    <Container className="my-4" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <Row>
        <h2>Filter Options</h2>
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
                      <option key={university._id} value={university.name}>
                        {university.name}
                      </option>
                    ))}
                  </Form.Control>
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
                  placeholder="e.g., January to March"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Row>
      <Row>
        <h1>Posts</h1>
        {filteredPosts.map((post) => (
          <Col md={2} key={post._id} className="mb-4">
            <Card style={{ height: '300px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Card.Body className="d-flex flex-column p-3">
                <Card.Title style={{ fontSize: '20px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {post.title}
                </Card.Title>
                <Card.Text style={{ fontSize: '16px', margin: '0', lineHeight: '1' }}>
                  <BuildingFill className="me-1 align-middle" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                    {post.universityName}
                  </span>
                </Card.Text>
                <Card.Text style={{ fontSize: '16px', margin: '0', lineHeight: '1' }}>
                  <Binoculars className="me-1 align-middle" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                    {post.fieldOfStudy}
                  </span>
                </Card.Text>
                <Card.Text style={{ fontSize: '16px', margin: '0', lineHeight: '1' }}>
                  <Search className="me-1 align-middle" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                    {post.subject}
                  </span>
                </Card.Text>
                <Card.Text style={{ fontSize: '16px', margin: '0', lineHeight: '1' }}>
                  <Calendar className="me-1 align-middle" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '75%' }}>
                    {post.time}
                  </span>
                </Card.Text>
                <Card.Text style={{ fontSize: '16px', margin: '0', lineHeight: '1' }}>
                  <PeopleFill className="me-1 align-middle" /> {post.amountOfPeople} needed
                </Card.Text>
                <Button variant="primary" size="sm" className="mt-auto">
                  Learn more
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PostsPage;
