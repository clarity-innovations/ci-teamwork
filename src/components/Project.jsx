import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Project.css';
import TaskList from './TaskList';
import ReadoutItem from './ReadoutItem';
import 'tailwindcss/tailwind.css';
import { taskListShape } from '../customPropTypes';

function Project({ keyword, timeThreshold, data }) {
  const {
    projectTime, name, client, taskLists,
  } = data;
  const localeOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  const roundTime = projectTime.toLocaleString(undefined, localeOptions);

  return (
    <div className="project">
      <div className="readout-block">
        <div className="tasklist-title">
          <h1 className="project-name font-bold text-2xl text-black">{name}</h1>
          <span className="project-client text-2xl text-black">{client}</span>
          {/* added styling here for the to bold the search project */}
        </div>
        <ReadoutItem className="project-data underline mr-20 mt-8 " title="Total project time" content={roundTime} />
      </div>
      <ul className="project-tasklist">
        {taskLists.map((taskListData) => (
          <TaskList
            key={taskListData.taskListId}
            data={taskListData}
            timeThreshold={timeThreshold}
            keyword={keyword}
          />
        ))}
      </ul>
    </div>
  );
}
Project.propTypes = {
  keyword: PropTypes.string.isRequired,
  timeThreshold: PropTypes.number.isRequired,
  data: PropTypes.shape({
    projectTime: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    client: PropTypes.string.isRequired,
    taskLists: PropTypes.arrayOf(taskListShape).isRequired,
  }).isRequired,

};
export default Project;
