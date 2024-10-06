// CreatePostModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CreatePostModal = ({ show, handleClose, formData, handleChange, handleSubmit, universities }) => (
  <Modal show={show} onHide={handleClose}>
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
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default CreatePostModal;
