import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskList.css';
import Task from './Task';
import ReadoutItem from './ReadoutItem';
import 'tailwindcss/tailwind.css';
import { taskShape } from '../customPropTypes';

const HEADER_OPTIONS = [['Total', 'Task', 'Estimate']];

let lastHeaderIndex = -1;
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.renderTask = this.renderTask.bind(this);
  }

  updateTaskTree = (taskData, parentIsMatch) => {
    // Protection against scenario where this function runs twice on the same
    // data when StrictMode is enabled, resulting in incorrect results.
    if (taskData.processed) {
      return null;
    }
    // Check if the current task matches the keyword or if its parent is
    // already marked as matching.
    const ancestorMatch = taskData.isMatch || parentIsMatch;
    let childMatch = false;
    // If current task has child tasks, recursively update the matching status.
    taskData.tasks.forEach((subTask) => {
      const subTaskMatch = this.updateTaskTree(subTask, ancestorMatch);
      // If any of the child tasks are marked as matching,
      // update the isMatch flag for the current task.
      if (subTaskMatch) {
        childMatch = true;
      }
    });
    // Update the matching status of the current task.
    // Linting rule temporarily disabled until we can investigate if changing
    // the argument's property is causing correct functionality and needs
    // rewriting, or if we can just avoid changing it within this function.
    // eslint-disable-next-line no-param-reassign
    taskData.isMatch = ancestorMatch || childMatch;
    return taskData.isMatch;
  };

  renderTask = (taskData) => {
    const { timeThreshold, keyword } = this.props;
    // If the subtaskTime of the taskData is greater than the time threshold
    // provided in props, proceed with the rendering process.
    if (taskData.subtaskTime > timeThreshold) {
      // Update the matching status of tasks within the taskData.
      this.updateTaskTree(taskData, false);
      // Mark processed, so isMatch evaluation doesn't run twice.
      // Linting rule temporarily disabled until we can investigate if changing
      // the argument's property is causing correct functionality and needs
      // rewriting, or if we can just avoid changing it within this function.
      // eslint-disable-next-line no-param-reassign
      taskData.processed = true;

      // If there are matching tasks, render a Task component with the matching
      // tasks and necessary props.
      if (taskData.isMatch) {
        return (
          <Task
            key={taskData.taskId}
            data={{ ...taskData, tasks: taskData.tasks }}
            timeThreshold={timeThreshold}
            keyword={keyword}
          />
        );
      }
    }
    return null;
  };

  render() {
    const {
      data: {
        taskTime, name, tasks,
      },
    } = this.props;
    lastHeaderIndex = (lastHeaderIndex + 1) % HEADER_OPTIONS.length;
    const localeOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    };
    const roundTime = taskTime.toLocaleString(undefined, localeOptions);
    return (
      <li className="task-list p-5 rounded-md ">
        {/* this style rounds the whole container */}
        {/* this padding places everything inside the box */}
        <div className="readout-block">
          <div className="tasklist-title">
            <h3 className="tasklist-name text-xl font-bold">{name}</h3>
          </div>
          <div className="tasklist-data ml-3">{`Total: ${roundTime}h`}</div>
          <div className="task-data-icons m-readout-group">
            <ReadoutItem
              className="total-time"
              title="Total time (including subtasks)"
              content={HEADER_OPTIONS[lastHeaderIndex][0]}
            />
            <ReadoutItem className="total-time" title="Task time" content={HEADER_OPTIONS[lastHeaderIndex][1]} />
          </div>
        </div>
        <ul className="task-list-ul">{tasks.map(this.renderTask)}</ul>
      </li>
    );
  }
}

TaskList.propTypes = {
  timeThreshold: PropTypes.number.isRequired,
  keyword: PropTypes.string.isRequired,
  data: PropTypes.shape({
    taskTime: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(taskShape).isRequired,
  }).isRequired,
};

export default TaskList;
