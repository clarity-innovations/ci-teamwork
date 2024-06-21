import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ReadoutItem.css';

function TimeReadout({ className, content, title = '' }) {
  let combinedClass = ['a-readout-item'];
  if (className) {
    // @todo Test if string.
    // Custom classes should precede defaults.
    combinedClass = `${className} ${combinedClass}`;
  }
  return <div className={combinedClass} title={title}><span>{content}</span></div>;
}
TimeReadout.propTypes = {
  className: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  title: PropTypes.string,
};
TimeReadout.defaultProps = {
  title: '',
};

export default TimeReadout;
