import React from 'react';
import './App.css';
import Project from './components/Project.js';
import CalendarRange from './components/CalendarRange.js';
import FilterByKeyword from './components/FilterByKeyword.js';
import 'tailwindcss/tailwind.css';

const LOAD_RESPONSE_STRINGS = {
  loading: 'Loading...',
  loaded: '',
  missingInput: 'Fill In Project ID and API Key',
  failed: 'Project failed to load',
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      keyword: '',
      timeThreshold: -1,
      projects: [],
      loadResponseKey: 'loaded',
    };
    this.updateData = this.updateData.bind(this);
    this.renderProject = this.renderProject.bind(this);
    this.updateTimeThreshold = this.updateTimeThreshold.bind(this);
  }

  componentDidMount() {
    const [projectId, authorizationToken] = getStoredValues();
    if (projectId) {
      document.querySelector('#projectIdField').value = projectId;
    }
    if (authorizationToken) {
      document.querySelector('#teamworkAuthField').value = authorizationToken;
    }
  }

  render() {
    const loadIndicatorContent = LOAD_RESPONSE_STRINGS[this.state.loadResponseKey];
    return (
      <div className='flex flex-col items-center justify-center pt-2'>

        <header className='text-center text-xl sm:text-3xl font-raleway font-semibold pb-7'>
          Teamwork Time Report
        </header>

        <div className='grid border rounded-t-xl rounded-b-xl h-48 space-around'>
          <div className='border border-t-0 border-l-0 border-r-0'>
            <label htmlFor='teamworkCompanyNameField' className='pl-2 text-xs'>
              Company Name
            </label>
            <br />
             <input
              name='companyName'
              className='text-center outline-none'
              id='teamworkCompanyNameField'
              placeholder='Company Name'
            />
          </div>
          
          <div className='border border-t-0 border-l-0 border-r-0'>
            <label htmlFor='projectIdField' className='pl-2 text-xs'>
              Project Id
            </label>
            <br />
            <input name='projectId' className='text-center outline-none' id='projectIdField' placeholder='Project Id' />
          </div>
          <div>
            <label htmlFor='teamworkAuthField' className='pl-2 text-xs'>
              API Key
            </label>
            <br />
            <input
              name='authToken'
              className='text-center outline-none'
              type='password'
              id='teamworkAuthField'
              placeholder='API Key'
            />
          </div>
        </div>
        <button
          className='rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine font-raleway text-offWhite p-2 mt-2'
          onClick={() => this.updateData()}
        >
          Search
        </button>
        <div className='a-load-indicator'>{loadIndicatorContent}</div>
        <div className='flex flex-wrap justify-between px-2 sm:px-20 pt-6 pb-6'>
          <div className='border rounded-t-xl rounded-b-xl h-24 w-full sm:w-auto flex-grow mx-4'>
            <CalendarRange onDateRangeChange={() => this.updateData()} />
          </div>
          <div className='border rounded-t-xl rounded-b-xl h-24 w-full sm:w-auto flex-grow mx-4 mt-4 sm:mt-0'>
            <FilterByKeyword onKeywordChange={() => this.updateData()} />
          </div>
          <div className='border rounded-t-xl rounded-b-xl h-24 w-full sm:w-auto flex-grow mx-4 mt-4 sm:mt-0'>
            <div className='pl-2 pt-1 text-sm'>
              <label>Filter by hours:</label>
            </div>
            <div className='text-center'>
              <input id='timeFilterField' className='w-1/2' placeholder='hours' />
              <button
                onClick={this.updateTimeThreshold}
                className='rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine font-raleway text-offWhite p-2 mt-2'
              >
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className='projects px-2 sm:px-12'>{this.state.projects.map(this.renderProject)}</div>
      </div>
    );
  }

  renderProject(projectData) {
    return (
      <Project
        key={projectData.projectId}
        data={projectData}
        timeThreshold={this.state.timeThreshold}
        keyword={this.state.keyword}
      />
    );
  }


  updateTimeThreshold() {
    const timeThreshold = parseInt(document.querySelector('#timeFilterField').value, 10);
    if (!isNaN(timeThreshold)) {
      this.setState({ timeThreshold });
    } else {
      // If the input field isn't a number, reset.
      this.setState({ timeThreshold: -1 });
    }
  }

  updateData() {
    let keyword = document.querySelector('#keywordFilterField').value;
    let startDate = document.querySelector('#fromDateFilterField').value;
    let endDate = document.querySelector('#toDateFilterField').value;;

    // Clear the project data so project doesn't render until promises return.
    this.setState({ projects: [], loadResponseKey: 'loading' });

    if (!startDate) {
      startDate = '1900-01-01';
    }
    if (!endDate) {
      // If there is no date, then the end date is the current date.
      const date = new Date();
      endDate = date.toLocaleDateString('en-ca');
    }
    this.setState({ startDate: startDate, endDate: endDate, keyword: keyword });
    const projectId = document.querySelector('#projectIdField').value;
    const teamworkAuthorization = document.querySelector('#teamworkAuthField').value;
    const authorization = 'Basic ' + btoa(teamworkAuthorization);
    if (projectId && teamworkAuthorization) {
      this.setState({ loadResponseKey: 'loading' });
      setStoredValues({
        'ci-teamwork--project': projectId,
        'ci-teamwork--auth-token': teamworkAuthorization,
      });

      const tasksPromise = fetchAllTeamworkTasks(projectId, authorization);
      const timeEntriesPromise = fetchAllTeamworkTime(projectId, authorization, 0, startDate, endDate);
      const updatePromise = Promise.all([tasksPromise, timeEntriesPromise]).then(
        (response) => {
          const [tasks, timeEntries] = response;
          const tree = generateDataTree(tasks, timeEntries, keyword);
          return this.setState({ projects: tree, loadResponseKey: 'loaded' });
        },
        (error) => {
          console.log(error);
          this.setState({ loadResponseKey: 'failed' });
        }
      );
      return updatePromise;
    } else {
      this.setState({ loadResponseKey: 'missingInput' });
    }
  }
}
export default App;

function fetchTeamwork(query, parameters, authorization) {
  const companyName = document.querySelector('#teamworkCompanyNameField').value;
  const domain = `https://${companyName}.teamwork.com/`;
  let requestUrl = domain + query;
  if (parameters) {
    const parameterEntries = Object.entries(parameters);
    const assignedEntries = parameterEntries.reduce((accumulator, currentValue) => {
      accumulator.push(currentValue.join('='));
      return accumulator;
    }, []);
    const parameterString = assignedEntries.join('&');
    requestUrl += '?' + parameterString;
  }

  const settings = {
    headers: {
      Authorization: authorization,
    },
  };
  return fetch(requestUrl, settings);
}

function fetchAllTeamworkTasks(projectId, authorization, currentPage) {
  const PAGE_SIZE = 250;
  if (!currentPage) {
    currentPage = 1;
  }

  console.log('fetching tasks: page %d...', currentPage);

  return fetchTeamwork(
    'tasks.json',
    {
      page: currentPage,
      pageSize: PAGE_SIZE,
      includeTasksWithoutDueDates: true,
      includeCompletedSubtasks: true,
      includeCompletedTasks: true,
      projectIds: projectId,
    },
    authorization
  )
    .then((currentPageResponse) => currentPageResponse.json())
    .then((currentData) => {
      const items = currentData['todo-items'];
      if (items.length < PAGE_SIZE) {
        return items;
      } else {
        return fetchAllTeamworkTasks(projectId, authorization, currentPage + 1).then((futureData) =>
          items.concat(futureData)
        );
      }
    });
}

function fetchAllTeamworkTime(projectId, authorization, currentPage, startDate, endDate) {
  // @TODO Make sure times actually go to 500.
  const PAGE_SIZE = 500;
  if (!currentPage) {
    currentPage = 1;
  }

  console.log('fetching times: page %d...', currentPage);

  return fetchTeamwork(
    'time_entries.json',
    {
      page: currentPage,
      pageSize: PAGE_SIZE,
      projectIds: projectId,
      fromDate: startDate,
      toDate: endDate,
    },
    authorization
  )
    .then((currentPageResponse) => currentPageResponse.json())
    .then((currentData) => {
      const items = currentData['time-entries'];
      if (items.length < PAGE_SIZE) {
        return items;
      } else {
        return fetchAllTeamworkTime(projectId, authorization, currentPage + 1, startDate, endDate).then((futureData) =>
          items.concat(futureData)
        );
      }
    });
}

function generateDataTree(tasks, timeEntries, keyword) {
  if (!keyword) {
    keyword = '';
  }
  const projectDictionary = {};
  const taskListDictionary = {};
  const taskDictionary = {};

  // Assign initial project, task list, and task entries.
  tasks.forEach((item) => {
    // If no existing entry for a given id, assign its name to that entry.
    // Do this for projects, task lists, and individual tasks.
    if (!projectDictionary[item['project-id']]) {
      projectDictionary[item['project-id']] = {
        projectId: item['project-id'],
        name: item['project-name'],
        taskLists: [],
        projectTime: 0,
        client: item['company-name'],
      };
    }
    if (!taskListDictionary[item['todo-list-id']]) {
      taskListDictionary[item['todo-list-id']] = {
        taskListId: item['todo-list-id'],
        name: item['todo-list-name'],
        tasks: [],
        taskTime: 0,
        description: item.description,
      };
    }
    if (!taskDictionary[item.id]) {
      taskDictionary[item.id] = {
        taskId: item.id,
        name: item.content,
        tasks: [],
        taskTime: 0,
        description: item.description,
        isMatch: item.content.toLowerCase().includes(keyword.toLowerCase()),
      };
    }
  });

  // Create task references for subtasks.
  tasks.forEach((item) => {
    // Tasks with no parent tasks are top-level task list items.
    if (!item.parentTaskId) {
      // Add the task to the project's task lists.
      if (!projectDictionary[item['project-id']].taskLists.includes(taskListDictionary[item['todo-list-id']])) {
        projectDictionary[item['project-id']].taskLists.push(taskListDictionary[item['todo-list-id']]);
      }
      taskListDictionary[item['todo-list-id']].tasks.push(taskDictionary[item.id]);
    } else {
      taskDictionary[item.parentTaskId].tasks.push(taskDictionary[item.id]);
    }
  });

  // Aggregate task and project time for each task.
  timeEntries.forEach((item) => {
    const [projectId, taskListId, taskId] = [item['project-id'], item['todo-list-id'], item['todo-item-id']];
    const targetProject = projectDictionary[projectId];
    const targetList = taskListDictionary[taskListId];
    const targetTask = taskDictionary[taskId];
    // item.hoursDecimal is a string when it's a whole number.
    const floatTime = parseFloat(item.hoursDecimal);

    if (targetProject) {
      targetProject.projectTime += floatTime;
    }
    if (targetList) {
      targetList.taskTime += floatTime;
    }
    if (targetTask) {
      targetTask.taskTime += floatTime;
    }
  });

  // Aggregate subtask time for each task.
  Object.values(projectDictionary).forEach((project) => {
    project.taskLists.forEach((taskList) => {
      accumulateSubtaskTime(taskList);
    });
  });
  return Object.values(projectDictionary);
}

function accumulateSubtaskTime(task) {
  // Start with this task's time.
  let subtaskTime = task.taskTime;

  // Add each subtask's subtaskTime.
  if (task.tasks.length > 0) {
    task.tasks.forEach((subtask) => (subtaskTime += accumulateSubtaskTime(subtask)));
  }
  task.subtaskTime = subtaskTime;

  // Return this task's subtaskTime.
  return subtaskTime;
}

function setStoredValues(storeObject) {
  if (storeObject) {
    if (storeObject['ci-teamwork--project']) {
      window.localStorage.setItem('ci-teamwork--project', storeObject['ci-teamwork--project']);
    }
    if (storeObject['ci-teamwork--auth-token']) {
      window.localStorage.setItem('ci-teamwork--auth-token', storeObject['ci-teamwork--auth-token']);
    }
  }
}

function getStoredValues() {
  const projectId = window.localStorage.getItem('ci-teamwork--project');
  const authToken = window.localStorage.getItem('ci-teamwork--auth-token');

  // Cast to string if falsey.
  return [projectId || '', authToken || ''];
}
