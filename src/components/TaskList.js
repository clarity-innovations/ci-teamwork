import React from 'react';
import '../styles/TaskList.css';
import Task from './Task.js';
import ReadoutItem from './ReadoutItem.js';
import 'tailwindcss/tailwind.css';

const HEADER_OPTIONS = [['Total', 'Task', 'Estimate']];

let lastHeaderIndex = -1;
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.renderTask = this.renderTask.bind(this);
  }

  render() {
    lastHeaderIndex = (lastHeaderIndex + 1) % HEADER_OPTIONS.length;
    const localeOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    const roundTime = this.props.data.taskTime.toLocaleString(undefined, localeOptions);
    return (
      <li className='task-list p-6  rounded-lg '>
        {/* this style rounds the whole container */}
        {/* this padding places everything inside the box */}
        <div className='readout-block'>
          <div className='tasklist-title'>
            <h3  className='tasklist-name text-xl font-bold'><u>{this.props.data.name}</u></h3>
            <span className='tasklist-description'>{this.props.data.description}</span>
          </div>
          <div className='tasklist-data a-readout-item m-5'><u>{roundTime}</u></div>
          <div className='task-data-icons m-readout-group'>
            <ReadoutItem
              className='total-time'
              title='Total time (including subtasks)'
              content={HEADER_OPTIONS[lastHeaderIndex][0]}
            />
            <ReadoutItem className='total-time' title='Task time' content={HEADER_OPTIONS[lastHeaderIndex][1]} />
          </div>
        </div>
        <ul>{this.props.data.tasks.map(this.renderTask)}</ul>
      </li>
    );
  }

  updateTaskTree = (taskData, parentIsMatch) => {
    // Protection against scenario where this function runs twice on the same
    // data when StrictMode is enabled, resulting in incorrect results.
    if (taskData.processed) {
      return;
    }

    // Check if the current task matches the keyword or if its parent is
    // already marked as matching.
    let ancestorMatch = taskData.isMatch || parentIsMatch;
    let childMatch = false;
    // If the current task has child tasks, recursively update the matching status.
    taskData.tasks.forEach((subTask) => {
      const subTaskMatch = this.updateTaskTree(subTask, ancestorMatch);
      // If any of the child tasks are marked as matching,
      // update the isMatch flag for the current task.
      if (subTaskMatch) {
        childMatch = true;
      }
    });
    // Update the matching status of the current task.
    taskData.isMatch = ancestorMatch || childMatch;
    return taskData.isMatch;
  };

  renderTask(taskData) {
    // If the subtaskTime of the taskData is greater than the time threshold
    // provided in props, proceed with the rendering process.
    if (taskData.subtaskTime > this.props.timeThreshold) {

      // Update the matching status of tasks within the taskData.
      this.updateTaskTree(taskData, false);
      // Mark processed, so isMatch evaluation doesn't run twice.
      taskData.processed = true;

      // If there are matching tasks, render a Task component with the matching
      // tasks and necessary props.
      if (taskData.isMatch) {
        return (
          <Task
            key={taskData.taskId}
            data={{ ...taskData, tasks: taskData.tasks }}
            timeThreshold={this.props.timeThreshold}
            keyword={this.props.keyword}
          />
        );
      }
    }
  }
}

export default TaskList;
