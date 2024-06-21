import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Task.css';
import { PiFolderOpenThin } from 'react-icons/pi';
import { CiCalendar } from 'react-icons/ci';
import { AiOutlineTeam } from 'react-icons/ai';
import { BiSolidRightArrow, BiSolidDownArrow } from 'react-icons/bi';
import { VscBlank } from 'react-icons/vsc';
import ReadoutItem from './ReadoutItem';
import 'tailwindcss/tailwind.css';
import TeamTable from './TeamTable';
import WeeklyTimeList from './WeeklyTimeList';
import { taskShape } from '../customPropTypes';

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtaskVisible: false,
      dateDisclosureVisible: false,
      teamDisclosureVisible: false,
    };
    this.handleDateClick = this.handleDateClick.bind(this);
    this.handleTeamClick = this.handleTeamClick.bind(this);
    this.toggleSubtaskView = this.toggleSubtaskView.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleDateClick(e) {
    e.stopPropagation();
    this.setState((prevState) => ({
      dateDisclosureVisible: !prevState.dateDisclosureVisible,
    }));
    e.currentTarget.classList.toggle('on');
  }

  handleTeamClick(e) {
    e.stopPropagation();
    this.setState((prevState) => ({
      teamDisclosureVisible: !prevState.teamDisclosureVisible,
    }));
    e.currentTarget.classList.toggle('on');
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleSubtaskView(e);
    }
  };

  toggleSubtaskView(event) {
    // Only toggle visibility for the first level task clicked.
    event.stopPropagation();
    if (event.target.tagName !== 'A' && event.target.tagName !== 'UL') {
      this.setState((prevState) => ({
        subtaskVisible: !prevState.subtaskVisible,
      }));
    }
  }

  renderTasks() {
    const { data: { tasks, isMatch }, timeThreshold, keyword } = this.props;
    // If tasks in the current TaskList component, proceed with rendering.
    if (tasks.length > 0) {
      return (
        // Render an unordered list to contain the task element.
        <ul className="pl-7">
          {/* this for the indent for the columns   */}
          {tasks.map((subtask) => {
            // If the parent task is marked as matching but the subtask is not,
            // skip rendering the subtask.
            if (isMatch && !subtask.isMatch) return null;
            // If the subtaskTime of the subtask is greater than the time
            // threshold provided in props, render a Task component with the
            // subtask and necessary props.
            if (subtask.subtaskTime > timeThreshold) {
              return (
                <Task
                  key={subtask.taskId}
                  data={subtask}
                  timeThreshold={timeThreshold}
                  keyword={keyword}
                  hoursByDate={subtask.hoursByDate}
                />
              );
            }
            return null;
          })}
        </ul>
      );
    }
    return null;
  }

  render() {
    const {
      timeThreshold,
      data: {
        tasks, taskTime, subtaskTime, name, taskId, totalPeopleTime, hoursByDate,
      },
    } = this.props;

    const { subtaskVisible } = this.state;
    const companyName = document.querySelector('#teamworkCompanyNameField').value;
    const TASK_URL_TEMPLATE = `https://${companyName}.teamwork.com/#/tasks/`;

    const className = [
      'task-item-wrapper',
      tasks.length ? 'has-subtasks' : '',
      subtaskVisible ? '' : 'hide-subtasks',
    ];
    const localeOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    };
    const roundTime = taskTime.toLocaleString(undefined, localeOptions);
    const roundSubtaskTime = subtaskTime.toLocaleString(undefined, localeOptions);

    const { dateDisclosureVisible, teamDisclosureVisible } = this.state;

    const isDisabled = taskTime === 0 && subtaskTime === 0;
    const hasSubtasks = tasks.length > 0;

    return (
      <li className={className.join(' ')}>
        <div
          className={`task-item pl-2 pb-0 mt-1 mb-1 rounded-sm ${!hasSubtasks && 'cursor-auto'}`}
          onClick={this.toggleSubtaskView}
          onKeyDown={this.handleKeyDown}
          role="button"
          aria-labelledby="Task"
          tabIndex="0"
        >
          {getOutlineIcon(hasSubtasks, subtaskVisible)}
          {/* added this to round the edges of the columns */}
          <span className="task-name">{name}</span>

          {/* changed the color of the text here for each column */}
          <div className="flex-shrink-0 flex items-center">
            <span className="task-link px-2 flex">
              <a href={TASK_URL_TEMPLATE + taskId} target="_blank" rel="noreferrer">
                <PiFolderOpenThin
                  className="w-6 object-contain mix-blend-color-burn text-2xl"
                  id="tooltip-no-arrow"
                  role="tooltip"
                  alt="Teamwork"
                />
              </a>
            </span>

            <button
              onClick={(e) => this.handleDateClick(e)}
              type="button"
              className={`task-disclosure-button py-1 px-1 mr-2 ${isDisabled ? 'disabled-button' : ''}`}
              disabled={isDisabled}
            >
              <CiCalendar
                alt="Calendar Icon for date disclosure"
                className="w-7 h-7 opacity-70"
              />
            </button>
            <button
              type="button"
              onClick={(e) => this.handleTeamClick(e)}
              className={`task-disclosure-button py-1 px-1 mr-2 ${isDisabled ? 'disabled-button' : ''}`}
              disabled={isDisabled}
            >
              <AiOutlineTeam
                alt="Team Icon for team disclosure"
                className="w-7 h-7 opacity-70"
              />
            </button>
            <div className="task-data m-readout-group">
              <ReadoutItem className="total-time" content={roundSubtaskTime} />
              <ReadoutItem className="task-time" content={roundTime} />
            </div>
          </div>
        </div>
        {dateDisclosureVisible && (
          <div
            className="disclosure-border flex p-3
            overflow-x-scroll overflow-y-hidden white-space-nowrap -mt-1"
          >
            <WeeklyTimeList hoursByDate={hoursByDate} />
          </div>
        )}
        {teamDisclosureVisible && (
          <div className="flex justify-center disclosure-border p-2 -mt-1">
            <TeamTable peopleTime={totalPeopleTime} />
          </div>
        )}
        {this.renderTasks(timeThreshold)}
      </li>
    );
  }
}
Task.propTypes = {
  keyword: PropTypes.string.isRequired,
  timeThreshold: PropTypes.number.isRequired,
  data: PropTypes.shape({
    tasks: PropTypes.arrayOf(taskShape).isRequired,
    taskTime: PropTypes.number.isRequired,
    subtaskTime: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    taskId: PropTypes.number.isRequired,
    totalPeopleTime: PropTypes.objectOf(PropTypes.number).isRequired,
    isMatch: PropTypes.bool,
    hoursByDate: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

function getOutlineIcon(hasSubtasks, subtasksVisible) {
  if (!hasSubtasks) {
    return <VscBlank className="task-outline-icon" />;
  }
  if (subtasksVisible) {
    return <BiSolidDownArrow className="task-outline-icon" />;
  }
  return <BiSolidRightArrow className="task-outline-icon" />;
}

export default Task;
