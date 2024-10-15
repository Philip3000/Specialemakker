import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
const ResponseMessage = ({ message, type, duration, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [duration, onClose]);

  return (
    <div className="response-message">
    <Alert variant={type} onClose={onClose} dismissible>
      {message}
    </Alert>
  </div>
  );
  
};

// Define prop types for better validation
ResponseMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'danger']).isRequired,
  duration: PropTypes.number, // Duration in milliseconds for auto-dismiss
  onClose: PropTypes.func,
};

// Default props
ResponseMessage.defaultProps = {
  duration: 5000, // Default to 5 seconds
  onClose: null,
};

export default ResponseMessage;
