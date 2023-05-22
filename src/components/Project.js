import React from 'react';
import '../styles/Project.css';
import TaskList from './TaskList.js';
import ReadoutItem from './ReadoutItem.js';
import 'tailwindcss/tailwind.css';

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.renderTaskList = this.renderTaskList.bind(this);
  }

  render() {
    const localeOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    const roundTime = this.props.data.projectTime.toLocaleString(undefined, localeOptions);

    return (
      <div className='project'>
        <div className='readout-block'>
          <div className='tasklist-title'>
            <h2 className='project-name text-xl font-bold ml-10 '>{this.props.data.name}</h2>
            <span className='project-client text-xl font-bold ml-10  '>{this.props.data.client}</span>
            {/*  added styling here for the to bold the project your searching */}
          </div>
          <ReadoutItem className='project-data underline mr-20 mt-8 ' title='Total project time' content={roundTime} />
        </div>
        <ul className='project-tasklist'>{this.props.data.taskLists.map(this.renderTaskList)}</ul>
      </div>
    );
  }
  renderTaskList(taskListData) {
    return (
      <TaskList
        key={taskListData.taskListId}
        data={taskListData}
        timeThreshold={this.props.timeThreshold}
        keyword={this.props.keyword}
      />
    );
  }
}
export default Project;
