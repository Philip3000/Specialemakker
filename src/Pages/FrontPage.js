import React from "react";
import { Link } from "react-router-dom";
import { Button, Container } from "react-bootstrap";

const FrontPage = () => {
  return (
    <Container fluid className="p-0">
      <div style={{ background: '#343a40', color: '#fff', padding: '100px 50px', textAlign: 'center' }}>
        <h1>Welcome to Specialemakker</h1>
        <p>Find the perfect study partner based on your field of study and interests.</p>
        <Button variant="primary" as={Link} to="/posts">Browse Posts</Button>
        <Button variant="light" as={Link} to="/signup" className="ml-3">Sign Up</Button>
       
      </div>
    </Container>
  );
};

export default FrontPage;
