import React from 'react';
import './App.css';
import Project from './components/Project';
import CalendarRange from './components/CalendarRange';
import FilterByKeyword from './components/FilterByKeyword';
import 'tailwindcss/tailwind.css';
import {
  fetchAllTeamworkTasks,
  fetchAllTeamworkTime,
  generateDataTree,
  setStoredValues,
  getStoredValues,
} from './api-utils';

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
      keyword: '',
      timeThreshold: -1,
      projects: [],
      loadResponseKey: 'loaded',
      filterZero: false,
      validationError: '',
    };
    this.updateData = this.updateData.bind(this);
    this.renderProject = this.renderProject.bind(this);
    this.updateTimeThreshold = this.updateTimeThreshold.bind(this);
    this.handleFilterZeroChange = this.handleFilterZeroChange.bind(this);
  }

  componentDidMount() {
    const storedValues = getStoredValues();
    const search = new URLSearchParams(document.location.search);

    // URL search overrides stored values.
    const companyName = search.get('companyName') ?? storedValues.companyName;
    const projectId = search.get('projectId') ?? storedValues.projectId;
    const { authToken } = storedValues;

    document.getElementById('projectIdField').value = projectId;
    document.getElementById('teamworkCompanyNameField').value = companyName;
    document.getElementById('teamworkAuthField').value = authToken;

    // A URL search for projectId automatically loads if the rest of the request
    // data is also available.
    if (search.get('projectId')?.length && companyName.length && authToken.length) {
      this.updateData();
    }
  }

  handleFilterZeroChange(event) {
    this.setState({ filterZero: event.target.checked });
  }

  getValidTimeThreshold() {
    const { timeThreshold, filterZero } = this.state;
    if (filterZero && timeThreshold === -1) {
      return 0;
    }
    return timeThreshold;
  }

  updateTimeThreshold() {
    const timeThreshold = parseInt(document.querySelector('#timeFilterField').value, 10);
    if (!Number.isNaN(timeThreshold)) {
      this.setState({ timeThreshold });
    } else {
      this.setState({ timeThreshold: -1 });
    }
  }

  updateData() {
    this.setState({ validationError: '' });

    const keyword = document.querySelector('#keywordFilterField').value;
    let startDate = document.querySelector('#fromDateFilterField').value;
    let endDate = document.querySelector('#toDateFilterField').value;

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
    this.setState({ keyword });

    const companyName = document.querySelector('#teamworkCompanyNameField').value;
    const projectId = document.querySelector('#projectIdField').value;
    if (!/^\d+$/.test(projectId)) {
      this.setState({ validationError: 'ProjectId is invalid. Please only use numbers' });
      return null;
    }

    const authToken = document.querySelector('#teamworkAuthField').value;
    const authorization = `Basic ${btoa(authToken)}`;
    if (companyName && projectId && authToken) {
      this.setState({ loadResponseKey: 'loading' });
      setStoredValues({
        projectId,
        authToken,
        companyName,
      });

      const newUrl = new URL(document.URL);
      newUrl.searchParams.set('companyName', companyName);
      newUrl.searchParams.set('projectId', projectId);
      window.history.pushState(null, '', newUrl);

      const tasksPromise = fetchAllTeamworkTasks(projectId, authorization);
      const timeEntriesPromise = fetchAllTeamworkTime(projectId, authorization, startDate, endDate);
      const updatePromise = Promise.all([tasksPromise, timeEntriesPromise]).then(
        (response) => {
          const [tasks, timeEntries] = response;
          const tree = generateDataTree(tasks, timeEntries, keyword);
          return this.setState({ projects: tree, loadResponseKey: 'loaded' });
        },
        (error) => {
          console.log(error);
          this.setState({ loadResponseKey: 'failed' });
        },
      );
      return updatePromise;
    }
    this.setState({ loadResponseKey: 'missingInput' });
    return null;
  }

  renderProject(projectData) {
    const { keyword } = this.state;
    const validTimeThreshold = this.getValidTimeThreshold();
    return (
      <Project
        key={projectData.projectId}
        data={projectData}
        timeThreshold={validTimeThreshold}
        keyword={keyword}
      />
    );
  }

  render() {
    const {
      loadResponseKey, projects, filterZero, validationError,
    } = this.state;
    const loadIndicatorContent = LOAD_RESPONSE_STRINGS[loadResponseKey];
    return (
      <div className="App flex flex-col items-center justify-center pt-2">

        <header className="text-black text-center text-4xl font-open-sans font-semibold pb-7 pt-7">
          Teamwork Time Report
        </header>

        {/* We use <form> only to submit when enter is pressed while in a field,
        and prevent default behavior of reloading with field values in URL. */}
        <form
          className="horizontal-container boxes rounded-md rounded-md h-30 space-around flex flex-wrap p-3"
          onSubmit={(event) => { event.preventDefault(); }}
        >
          <div className="child border border-t-0 border-l-0 border-r-0 flex-grow rounded-md">
            <label htmlFor="teamworkCompanyNameField" className="pr-2 text-md">
              Company Name
            </label>
            <input
              name="companyName"
              className="text-center outline-none text-darkGrey bg-offWhite border-b-0 mt-1 mr-2"
              id="teamworkCompanyNameField"
              placeholder="Company Name"
            />
          </div>
          <div className="child border border-t-0 border-l-0 border-r-0 border-b-0 flex-grow">
            <label htmlFor="projectIdField" className="pr-2 text-md">
              Project Id
            </label>
            <input
              name="projectId"
              className="text-center outline-none text-darkGrey bg-offWhite border-b-0 mt-1 mr-2"
              id="projectIdField"
              placeholder="Project Id"
            />
          </div>
          <div className="child border border-t-0 border-l-0 border-r-0 border-b-0 flex-grow">
            <label htmlFor="teamworkAuthField" className="pr-1 text-md">
              API Key
            </label>
            <input
              name="authToken"
              className="text-center outline-none text-darkGrey bg-offWhite border-b-0 mt-1 mr-2"
              type="password"
              id="teamworkAuthField"
              placeholder="API Key"
            />
          </div>
          <button
            type="submit"
            className="rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine text-offWhite text-xl p-3 ml-3
              mt-4 mb-3 mr-1 items-center"
            onClick={() => this.updateData()}
          >
            Search
          </button>
        </form>

        <div style={{ color: 'red' }}>{validationError}</div>
        <div className="a-load-indicator">{loadIndicatorContent}</div>
        <div className="filter-box flex flex-wrap justify-center px-0 sm:px-20 pt-6 pb-6">
          <div className="boxes rounded-md h-24 w-full sm:w-auto flex-grow sm:mt-0">
            <CalendarRange onDateRangeChange={() => this.updateData()} />
          </div>
          <div className="boxes rounded-md h-24 w-full sm:w-auto flex-grow sm:mt-0">
            <FilterByKeyword onKeywordChange={() => this.updateData()} />
          </div>
          <div className="boxes rounded-md h-24 w-full sm:w-auto flex-grow sm:mt-0">
            <div className="pl-3 pt-1 text-sm">
              <label htmlFor="timeFilterField">Filter by hours:</label>
            </div>
            <div className="text-center">
              <input id="timeFilterField" className="w-1/2 text-darkGrey pl-1" placeholder="hours" />
              <button
                type="button"
                onClick={this.updateTimeThreshold}
                className="rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine text-offWhite p-2 mt-2 ml-6"
              >
                Filter
              </button>
            </div>
          </div>
          <div
            className="boxes rounded-md h-24
            p-2 w-full sm:w-auto sm:mt-0 flex items-center"
          >
            <label htmlFor="filterZero" className="pl-4 pr-3 pt-1 text-sm flex">
              <input
                type="checkbox"
                id="filterZero"
                onChange={this.handleFilterZeroChange}
                checked={filterZero}
                className="mr-2 h-4 w-4 text-pine focus:ring-pine border-gray-300 rounded"
              />
              Hide 0 hour tasks
            </label>
          </div>
        </div>

        <div className="projects px-2 sm:px-12">{projects.map(this.renderProject)}</div>
      </div>
    );
  }
}

export default App;
