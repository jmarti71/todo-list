/* eslint-disable no-useless-escape */
/* eslint-disable no-case-declarations */
import { getTaskProject, projectSelected } from "./manageDOM";

class Task {
  constructor(title, description, dueDate, priority, completed) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = completed;
  }
}

class Project {
  constructor(title, description, dueDate, tasks, completed) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.tasks = tasks;
    this.completed = completed;
  }
}

// Returns index for element of given title.
const findElemIndexByTitle = (array, title) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].title == title) {
      return i;
    }
  }
};

// Save submission from modal form
function saveSubmitted(
  element,
  purpose,
  title,
  description,
  dueDate,
  priority,
  completed
) {
  const generalList = getGeneralProject();
  const customProjects = getCustomProjects();
  let elementOrigTitle;
  if (purpose === "edit-task" || purpose === "edit-project") {
    elementOrigTitle = element.title;
  }

  switch (purpose) {
    case "new-task":
      const task = new Task(title, description, dueDate, priority, completed);
      generalList.tasks.push(task);
      localStorage.setItem("General", JSON.stringify(generalList));
      break;
    case "edit-task":
      element.title = title;
      element.description = description;
      element.dueDate = dueDate;
      element.priority = priority;
      // General Task List
      if (!projectSelected(document.querySelector(".selected").id)) {
        generalList.tasks.splice(
          findElemIndexByTitle(generalList.tasks, elementOrigTitle),
          1,
          element
        );
        localStorage.setItem("General", JSON.stringify(generalList));
      }
      // Custom Project Task List
      else if (projectSelected(document.querySelector(".selected").id)) {
        const taskProject = getTaskProject();
        customProjects[
          findElemIndexByTitle(customProjects, taskProject.title)
        ].tasks.splice(
          findElemIndexByTitle(
            customProjects[
              findElemIndexByTitle(customProjects, taskProject.title)
            ].tasks,
            elementOrigTitle
          ),
          1,
          element
        );
        localStorage.setItem("customProjects", JSON.stringify(customProjects));
      }
      break;
    case "new-project":
      const project = new Project(title, description, dueDate, [], completed);
      customProjects.push(project);
      localStorage.setItem("customProjects", JSON.stringify(customProjects));
      break;
    case "add-task-to-project":
      const projectTask = new Task(
        title,
        description,
        dueDate,
        priority,
        completed
      );
      element.tasks.push(projectTask);
      customProjects.splice(
        findElemIndexByTitle(customProjects, element.title),
        1,
        element
      );
      localStorage.setItem("customProjects", JSON.stringify(customProjects));
      break;
    case "edit-project":
      element.title = title;
      element.description = description;
      element.dueDate = dueDate;
      customProjects.splice(
        findElemIndexByTitle(customProjects, elementOrigTitle),
        1,
        element
      );
      localStorage.setItem("customProjects", JSON.stringify(customProjects));
      break;
  }
}

function deleteElement(element, type, parent) {
  const generalList = getGeneralProject();
  const customProjects = getCustomProjects();
  if (type === "general-task") {
    generalList.tasks.splice(
      findElemIndexByTitle(generalList.tasks, element.title),
      1
    );
    localStorage.setItem("General", JSON.stringify(generalList));
  } else if (type === "project") {
    customProjects.splice(
      findElemIndexByTitle(customProjects, element.title),
      1
    );
    localStorage.setItem("customProjects", JSON.stringify(customProjects));
  } else if (type === "project-task") {
    parent.tasks.splice(findElemIndexByTitle(parent.tasks, element.title), 1);
    customProjects.splice(
      findElemIndexByTitle(customProjects, parent.title),
      1,
      parent
    );
    localStorage.setItem("customProjects", JSON.stringify(customProjects));
  }
}

// Checks storage and creates arrays for general tasks and custom projects
function checkLocalStorage() {
  const storageLength = window.localStorage.length;
  if (storageLength < 1) {
    const projectsArr = [];
    const generalTasks = new Project(
      "General",
      "General list of tasks",
      "2022-09-16",
      [],
      false
    );
    window.localStorage.setItem("General", JSON.stringify(generalTasks));
    window.localStorage.setItem("customProjects", JSON.stringify(projectsArr));
  }
}

const getGeneralProject = () => {
  const general = JSON.parse(window.localStorage.getItem("General"));
  ascendingSort(general.tasks);
  return general;
};

const getCustomProjects = () => {
  assessProjectCompletion(
    JSON.parse(window.localStorage.getItem("customProjects"))
  );
  const custom = JSON.parse(window.localStorage.getItem("customProjects"));
  ascendingSort(custom);
  return custom;
};

// Assess tasks within a project, if all are complete update project completion status
function assessProjectCompletion(projects) {
  if (projects.length >= 1) {
    for (let i = 0; i < projects.length; i++) {
      const tasks = projects[i].tasks.length;
      let completedTasks = 0;
      for (let j = 0; j < tasks; j++) {
        if (projects[i].tasks[j].completed == true) {
          completedTasks++;
        }
      }
      if (projects[i].tasks.length >= 1) {
        completedTasks == projects[i].tasks.length
          ? (projects[i].completed = true)
          : (projects[i].completed = false);
        projects.splice(
          findElemIndexByTitle(projects, projects[i].title),
          1,
          projects[i]
        );
        localStorage.setItem("customProjects", JSON.stringify(projects));
      }
    }
  }
}

// Check that storage is available
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

// Get date for sample task
const getTodaysDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const currentDate = `${year}-${month}-${day}`;
  currentDate.replace(/-/g, "/");
  return currentDate;
};

const sampleTask = () => {
  const task = new Task(
    "Sample Task",
    "I am a sample task. I will disappear once you start adding tasks of your own",
    getTodaysDate(),
    "Low",
    false
  );
  const sampleTasks = new Project(
    "General",
    "General list of tasks",
    "2022-09-16",
    [task],
    false
  );
  return sampleTasks;
};

function initStorage() {
  if (storageAvailable("localStorage")) {
    checkLocalStorage();
  } else if (!storageAvailable("localStorage")) {
    alert("Storage not available for this app");
  }
}

// Sorts arrays by date
const ascendingSort = (toSort) => {
  toSort.sort(function (a, b) {
    const valA = new Date(a.dueDate);
    const valB = new Date(b.dueDate);
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });
};

export {
  initStorage,
  deleteElement,
  saveSubmitted,
  getGeneralProject,
  getCustomProjects,
  findElemIndexByTitle,
  sampleTask,
};
