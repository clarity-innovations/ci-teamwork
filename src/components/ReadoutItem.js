import React from 'react';

function TimeReadout(props) {
  let combinedClass = ['a-readout-item'];
  if (props.className) {
    // @todo Test if string.
    // Custom classes should precede defaults.
    combinedClass = props.className + ' ' + combinedClass;
  }
  return <div className={combinedClass} title={props.title}><span>{props.content}</span></div>
}
export default TimeReadout;
