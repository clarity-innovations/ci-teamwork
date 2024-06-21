import PropTypes from 'prop-types';

export const taskShape = PropTypes.shape({
  description: PropTypes.string.isRequired,
  isMatch: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  subtaskTime: PropTypes.number.isRequired,
  taskId: PropTypes.number.isRequired,
  taskTime: PropTypes.number.isRequired,
});

export const taskListShape = PropTypes.shape({
  description: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  subtaskTime: PropTypes.number.isRequired,
  taskListId: PropTypes.number.isRequired,
  taskTime: PropTypes.number.isRequired,
  tasks: PropTypes.arrayOf(taskShape).isRequired,
});
