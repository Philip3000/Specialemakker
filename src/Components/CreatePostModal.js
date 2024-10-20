import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const CreatePostModal = ({ showCreateModal, handleCloseCreateModal, handleSubmit, formData, handleChange, universities }) => {
  return (

    <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
      <Modal.Header closeButton>
        <Modal.Title>Create a New Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Left Column */}
            <Col md={6} className="d-flex flex-column justify-content-between">
              <Form.Group controlId="formTitle">
                <Form.Label><strong>Title</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. 'Buddy wanted for examproject'"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formDescription">
                <Form.Label><strong>Description</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project in as many details as you want"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formFieldOfStudy">
                <Form.Label><strong>Field of Study</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g. 'English'"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSubject">
                <Form.Label><strong>Subject</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. 'Literature in the 1800's'"
                  required
                />
              </Form.Group>


            </Col>

            {/* Right Column */}
            <Col md={6} className="d-flex flex-column justify-content-between">
              <Form.Group controlId="formUniversityName">
                <Form.Label><strong>University Name</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
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
                    onChange={(e) => handleChange(e)}
                    placeholder="Enter custom university name"
                  />
                )}
              </Form.Group>
              <Form.Group as={Row} controlId="formStart">
                <Col md={6}>
                  <Form.Label><strong>Start Month</strong></Form.Label>
                  <Form.Control
                    as="select"
                    name="startMonth"
                    value={formData.startMonth}
                    onChange={handleChange}
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
                    value={formData.startYear}
                    onChange={handleChange}
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

              <Form.Group as={Row} controlId="formEnd">
                <Col md={6}>
                  <Form.Label><strong>End Month</strong></Form.Label>
                  <Form.Control
                    as="select"
                    name="endMonth"
                    value={formData.endMonth}
                    onChange={handleChange}
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
                    value={formData.endYear}
                    onChange={handleChange}
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



              <Form.Group controlId="formGradeImportance">
                <Form.Label><strong>High grade effort (1-10)</strong></Form.Label>
                <Form.Control
                  type="number"
                  name="gradeImportance"
                  value={formData.gradeImportance}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  placeholder='Ambitional level to get a high grade'
                  required
                />
              </Form.Group>
              <Form.Group controlId="formAmountOfPeople">
                <Form.Label><strong>People wanted</strong></Form.Label>
                <Form.Control
                  type="number"
                  name="amountOfPeople"
                  value={formData.amountOfPeople}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  placeholder='How many people do you need for this project?'
                  required
                />
              </Form.Group>

            </Col>
            <hr className='mt-4' />
            <Row>
              <Col>
                <Form.Group controlId="anonymousCheckbox" className=''>
                  <Form.Check
                    type="checkbox"
                    label="Hide my name"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="contactDetailsCheckbox" className=''>
                  <Form.Check
                    type="checkbox"
                    label="Hide my contact details"
                    name="noContact"
                    checked={formData.noContact}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

          </Row>

          <Button variant="primary" type="submit" className="w-100 mt-3">
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
  );
};

export default CreatePostModal;
