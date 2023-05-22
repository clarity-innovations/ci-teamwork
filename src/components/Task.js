import React from 'react';
import '../styles/Task.css';
import DOMPurify from 'dompurify';
import ReadoutItem from './ReadoutItem.js';
import 'tailwindcss/tailwind.css';
import Imagess from '../assets/Imagess.png';

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtaskVisible: false,
    };
    this.toggleSubtaskView = this.toggleSubtaskView.bind(this);
  }
  render() {
    const companyName = document.querySelector('#teamworkCompanyNameField').value;
    const TASK_URL_TEMPLATE = 'https://' + companyName + '.teamwork.com/#/tasks/';

    const className = [
      'task-item-wrapper',
      this.props.data.tasks.length ? 'has-subtasks' : '',
      this.state.subtaskVisible ? '' : 'hide-subtasks',
    ];
    const localeOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    };
    const roundTime = this.props.data.taskTime.toLocaleString(undefined, localeOptions);
    const roundSubtaskTime = this.props.data.subtaskTime.toLocaleString(undefined, localeOptions);

    const dirty = this.props.data.description; 
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['script', 'img', 'png'],
      ALLOWED_ATTR:  ['src', 'alt', 'title', 'width', 'height'],
    });
    return (
      <li className={className.join(' ')} onClick={this.toggleSubtaskView}>
        <div className='task-item pl-3 mt-3 mb-3 rounded-lg '>
          {/* added this to round the edges of the columns */}
          <span className='task-name  '>{this.props.data.name}</span>
          {/* changed the color of the text here for each column */}
          
          <span className='task-link '>
            <a href={TASK_URL_TEMPLATE + this.props.data.taskId} target='_blank'>
              <img className="w-6 mb-5 mt-5  object-contain mix-blend-color-burn "  id="tooltip-no-arrow" role="tooltip" src={Imagess} alt='Teamwork Image'/>
            </a>
          </span>
     
          <pre className='task-description' dangerouslySetInnerHTML={{__html: clean}}/> 
      
          <div className='task-data m-readout-group'>
            <ReadoutItem className='total-time' content={roundSubtaskTime} />
            <ReadoutItem className='task-time' content={roundTime} />
          
          </div>
        </div>
        {this.renderTasks(this.props.timeThreshold)}
      </li>
    );
  }
  renderTasks() {
    // If there are tasks in the current TaskList component, proceed with rendering.
    if (this.props.data.tasks.length > 0) {
      return (
        // Render an unordered list to contain the task element.
        <ul className='pl-7'>
          {/* this for the indent for the columns   */}
          {this.props.data.tasks.map((subtask) => {
            // If the parent task is marked as matching but the subtask is not,
            // skip rendering the subtask.
            if (this.props.data.isMatch && !subtask.isMatch) return;
            // If the subtaskTime of the subtask is greater than the time
            // threshold provided in props, render a Task component with the
            // subtask and necessary props.
            if (subtask.subtaskTime > this.props.timeThreshold) {
              return (
                <Task
                  key={subtask.taskId}
                  data={subtask}
                  timeThreshold={this.props.timeThreshold}
                  keyword={this.props.keyword}
                />
              );
            }
          })}
        </ul>
      );
    }
  }
  toggleSubtaskView(event) {
    // Only toggle visibility for the first level task clicked.
    event.stopPropagation();
    if (event.target.tagName !== 'A' && event.target.tagName !== 'UL') {
      this.setState({ subtaskVisible: !this.state.subtaskVisible });
    }
  }
}
export default Task;
