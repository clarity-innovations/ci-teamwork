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
    requestUrl += `?${parameterString}`;
  }

  const settings = {
    headers: {
      Authorization: authorization,
    },
  };
  return fetch(requestUrl, settings);
}

export function fetchAllTeamworkTasks(projectId, authorization, currentPage = 1) {
  const PAGE_SIZE = 250;

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
    authorization,
  )
    .then((currentPageResponse) => currentPageResponse.json())
    .then((currentData) => {
      const items = currentData['todo-items'];
      if (items.length < PAGE_SIZE) {
        return items;
      }
      return fetchAllTeamworkTasks(projectId, authorization, currentPage + 1)
        .then((futureData) => items.concat(futureData));
    });
}

export function fetchAllTeamworkTime(
  projectId,
  authorization,
  startDate,
  endDate,
  currentPage = 1,
) {
  // @TODO Make sure times actually go to 500.
  const PAGE_SIZE = 500;

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
    authorization,
  )
    .then((currentPageResponse) => currentPageResponse.json())
    .then((currentData) => {
      const items = currentData['time-entries'];
      if (items.length < PAGE_SIZE) {
        return items;
      }
      return fetchAllTeamworkTime(projectId, authorization, startDate, endDate, currentPage + 1)
        .then((futureData) => items.concat(futureData));
    });
}

export function generateDataTree(tasks, timeEntries, keyword = '') {
  const projectDictionary = {};
  const taskListDictionary = {};
  const taskDictionary = {};
  const nameDictionary = {};

  // Assign initial task list, and task entries.
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
        hoursByDate: new Map(),
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
        hoursByDate: new Map(),
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
      // Optional chaining used here because of (rare?) case where task can be
      // parented to a removed/glitched(?) task.
      taskDictionary[item.parentTaskId]?.tasks.push(taskDictionary[item.id]);
    }
  });

  // Aggregate task and project time for each task.
  timeEntries.forEach((item) => {
    const [
      projectId,
      taskListId,
      taskId,
      personId,
      firstName,
      lastName,
      dateString,
    ] = [
      item['project-id'],
      item['todo-list-id'],
      item['todo-item-id'],
      item['person-id'],
      item['person-first-name'],
      item['person-last-name'],
      item.date,
    ];
    nameDictionary[personId] = `${firstName} ${lastName}`;
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
      // create personTime field in dataTree
      if (!targetTask.personTime) {
        targetTask.personTime = {};
      }
      // accumulate hours of person on task
      if (targetTask.personTime[nameDictionary[personId]]) {
        targetTask.personTime[nameDictionary[personId]] += floatTime;
      } else {
        targetTask.personTime[nameDictionary[personId]] = floatTime;
      }

      // Add the time entry's time to the target task's map of hours keyed to
      // Date.
      targetTask.hoursByDate ??= new Map();
      const date = new Date(dateString);
      // Create the week's entry if it doesn't exist, then add the time from the
      // time entry.
      const time = targetTask.hoursByDate.has(date)
        ? targetTask.hoursByDate.get(date) + floatTime
        : floatTime;
      targetTask.hoursByDate.set(date, time);
    }
  });

  // Aggregate subtask time for each task..
  Object.values(projectDictionary).forEach((project) => {
    project.taskLists.forEach((taskList) => {
      accumulateSubtaskTime(taskList);
      accumulateSubtaskPersonTime(taskList);
      accumulateHoursByDate(taskList);
    });
  });

  return Object.values(projectDictionary);
}

function accumulateSubtaskPersonTime(task) {
  const totalPeopleTime = task.personTime ? { ...task.personTime } : {};

  if (task.tasks.length > 0) {
    task.tasks.forEach((subtask) => {
      const subtaskPersonTime = accumulateSubtaskPersonTime(subtask);
      Object.entries(subtaskPersonTime).forEach(([person, time]) => {
        if (totalPeopleTime[person]) {
          totalPeopleTime[person] += time;
        } else {
          totalPeopleTime[person] = time;
        }
      });
    });
  }
  // The app currently appears to rely on mutating object references that are
  // part of state; this should be refactored.
  // eslint-disable-next-line no-param-reassign
  task.totalPeopleTime = totalPeopleTime;
  return totalPeopleTime;
}

function getWeekLabel(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();
  const diff = date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date.setUTCDate(diff));

  const day = monday.getUTCDate().toString().padStart(2, '0'); // Ensure two-digit day
  const month = monday.toLocaleDateString(undefined, { month: 'short' });
  const formattedYear = monday.getUTCFullYear().toString().slice(2);

  return `${day} ${month} '${formattedYear}`;
}

function accumulateHoursByDate(task) {
  // Start with the hours-by-date for the task.
  const hoursByDate = task.hoursByDate ? new Map(task.hoursByDate) : new Map();

  // Recursively combine each subtask's hours-by-date with the task's.
  task.tasks.forEach((subtask) => {
    accumulateHoursByDate(subtask).forEach((hours, date) => {
      hoursByDate.set(date, hours);
    });
  });

  // The app currently appears to rely on mutating object references that are
  // part of state; this should be refactored.
  // eslint-disable-next-line no-param-reassign
  task.hoursByDate = hoursByDate;

  // The task's hours-by-date gets returned so it can flow back up the recursion
  // tree.
  return hoursByDate;
}

function accumulateSubtaskTime(task) {
  // Start with this task's time.
  let subtaskTime = task.taskTime;

  // Add each subtask's subtaskTime.
  if (task.tasks.length > 0) {
    task.tasks.forEach((subtask) => { subtaskTime += accumulateSubtaskTime(subtask); });
  }

  // The app currently appears to rely on mutating object references that are
  // part of state; this should be refactored.
  // eslint-disable-next-line no-param-reassign
  task.subtaskTime = subtaskTime;

  // Return this task's subtaskTime.
  return subtaskTime;
}

export function setStoredValues(storeObject) {
  if (storeObject) {
    if (storeObject['ci-teamwork--project']) {
      window.localStorage.setItem('ci-teamwork--project', storeObject['ci-teamwork--project']);
    }
    if (storeObject['ci-teamwork--auth-token']) {
      window.localStorage.setItem('ci-teamwork--auth-token', storeObject['ci-teamwork--auth-token']);
    }
  }
}

export function getStoredValues() {
  const projectId = window.localStorage.getItem('ci-teamwork--project');
  const authToken = window.localStorage.getItem('ci-teamwork--auth-token');

  // Cast to string if falsey.
  return [projectId || '', authToken || ''];
}

// Gets an array of weekly time totals from a map of hours keyed by Date.
export function getWeeklyTime(hoursByDate) {
  const weeklyTime = {};

  // Get a sorted list of all dates.
  const allDates = [...(hoursByDate.keys())].sort((a, b) => (a - b));

  if (allDates.length) {
    // Starting from the earliest date, create a weeklyTime property for every
    // week until the last week.
    const targetDate = new Date(allDates[0]);
    const lastDate = allDates[allDates.length - 1];
    while (targetDate < lastDate) {
      const weekLabel = getWeekLabel(targetDate.toString());
      weeklyTime[weekLabel] = 0;
      targetDate.setUTCDate(targetDate.getUTCDate() + 7);
    }

    // Add all hours to the appropriate week.
    hoursByDate.forEach((hours, date) => {
      const weekLabel = getWeekLabel(date);
      // Create the property if it doesn't exist; this could be the case with
      // the last week.
      weeklyTime[weekLabel] ??= 0;
      weeklyTime[weekLabel] += hours;
    });
  }

  return weeklyTime;
}
