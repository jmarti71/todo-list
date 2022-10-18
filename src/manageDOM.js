/* eslint-disable no-useless-escape */
/* eslint-disable no-case-declarations */
import { pageRef } from "./index";
import { loadHomePage } from "./home";
import { loadToday } from "./today";
import { loadWeek } from "./week";
import { loadProject } from "./project";
import format from "date-fns/format";
import {
  deleteElement,
  getGeneralProject,
  getCustomProjects,
} from "./manageStorage";
import { sideBar, renderSideBarProjects } from "./sideBarDOM";
import { renderListItems } from "./listDOM";
import { modalManager } from "./modalDOM";

// Display upon initial page load
function initHome() {
  sideBar(pageRef.sideBar).renderExpanded();
  const homeBtn = document.getElementById("Home");
  homeBtn.className = "selected";
  loadHomePage(pageRef.content);
  modalManager().generateHiddenModal();
  if (window.innerWidth <= 825) {
    sideBar(pageRef.sideBar).collapseSideBar();
  }
}

// Headings
function renderContentHeader(icon, title, content, isProject) {
  const generalTasks = getGeneralProject();
  const headingContainer = document.createElement("div");
  headingContainer.className = "heading-container";
  const headingIcon = document.createElement("p");
  headingIcon.className = "material-symbols-outlined heading-icon";
  headingIcon.textContent = icon;
  const headingTitle = document.createElement("p");
  headingTitle.className = "heading-text";
  headingTitle.textContent = title;
  if (isProject !== true) {
    const addBtn = document.createElement("button");
    addBtn.className = "material-symbols-outlined heading-add-button";
    addBtn.textContent = "add";
    addBtn.title = "Add Task";
    addBtn.addEventListener("click", () => {
      modalManager().renderForm(generalTasks, "new-task");
    });
    headingContainer.append(headingIcon, headingTitle, addBtn);
  } else {
    headingContainer.append(headingIcon, headingTitle);
  }
  content.appendChild(headingContainer);
}

function renderSubHeading(text, tasksLength, appendTo) {
  const title = document.createElement("p");
  title.className = "sub-heading";
  if (tasksLength == "ignore") {
    title.textContent = `${text}`;
  } else {
    title.textContent = `${text} (${tasksLength})`;
  }
  appendTo.append(title);
}

// Load main page content of selected tab
function loadContent(type, toLoad, appendTo) {
  const container = document.createElement("div");
  container.className = "list-item-container";
  for (let i = 0; i < toLoad.length; i++) {
    if (type == "task-list") {
      renderListItems(toLoad[i], container).Tasks();
    } else if (type == "project-list" && toLoad[i].title !== "General") {
      renderListItems(toLoad[i], container).Projects();
    }
  }
  appendTo.append(container);
}

// If tab has no content
function emptyListMessage(listType, appendTo) {
  const generalTasks = getGeneralProject();
  const customProjects = getCustomProjects();
  const messageContainer = document.createElement("div");
  messageContainer.className = "empty-message";
  const text = document.createElement("p");
  text.textContent = `Need to add a ${listType}? Click below`;
  const button = document.createElement("button");
  button.textContent = `Add ${listType}`;
  button.className = listType;
  if (listType == "task") {
    button.addEventListener("click", () => {
      modalManager().renderForm(generalTasks, "new-task");
    });
  } else if (listType == "project") {
    button.addEventListener("click", () => {
      modalManager().renderForm(customProjects, "new-project");
    });
  }
  messageContainer.append(text, button);
  appendTo.appendChild(messageContainer);
}

// Update DOM components after something is added or modified.
function updateDOM(element, afterEvent) {
  switch (afterEvent) {
    case "new-task":
      updateCurrentTab();
      break;
    case "edit-task":
      updateSideBar();
      updateCurrentTab(element);
      break;
    case "new-project":
      updateSideBar();
      updateCurrentTab(element);
      break;
    case "add-task-to-project":
      updateSideBar();
      updateCurrentTab(element);
      break;
    case "edit-project":
      updateSideBar(element);
      updateCurrentTab(element);
  }
}

// Return current tab selection
function findCurrentTab() {
  const currentTab = document.querySelector(".selected");
  return currentTab;
}
 
// Check if current selected tab is a project
function projectSelected(id) {
  if (id === 'project') {
    return true;
  } else {
    return false;
  }
}

// Check if element is a project or task
function isProject(element) {
  if (element.priority == undefined) {
    return true;
  } else if (element.priority !== undefined) {
    return false;
  }
}
 
// Return the parent project of a task
function getTaskProject() {
  const projects = getCustomProjects();
  const parentTitle = findCurrentTab().dataset.projectTitle;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].title === parentTitle) {
      return projects[i];
    }
  }
}

function processDeletion(element) {
  // If deleting a project
  if (isProject(element)) {
    if (!projectSelected(findCurrentTab().id)) {
      deleteElement(element, "project");
      updateSideBar();
      updateCurrentTab();
    } // Deleting selected project
    else if (projectSelected(findCurrentTab().id)) {
      deleteElement(element, "project");
      removeContent(pageRef.content); //just refresh page?
      removeContent(pageRef.sideBar);
      initHome();
    }
  } // If deleting a task
  else if (!isProject(element)) {
    // If not deleting from selected project
    if (!projectSelected(findCurrentTab().id)) {
      deleteElement(element, "general-task");
      updateCurrentTab();
    }
    // If deleting from selected project
    else if (projectSelected(findCurrentTab().id)) {
      const taskParent = getTaskProject();
      deleteElement(element, "project-task", taskParent);
      updateSideBar();
      updateCurrentTab(taskParent);
    }
  }
}

// Updates content for selected tab
function updateCurrentTab(element = "none") {
  const selectedTab = findCurrentTab();
  switch (true) {
    case selectedTab.id === "Home":
      removeContent(pageRef.content);
      loadHomePage(pageRef.content);
      break;
    case selectedTab.id === "Today":
      removeContent(pageRef.content);
      loadToday(pageRef.content);
      break;
    case selectedTab.id === "This Week":
      removeContent(pageRef.content);
      loadWeek(pageRef.content);
      break;
    // If editing selected project
    case selectedTab.dataset.projectTitle === element.title:
      removeContent(pageRef.content);
      loadProject(element, pageRef.content);
      break;
    // If editing a task in a project
    case projectSelected(selectedTab.id) && !isProject(element):
      const project = getTaskProject();
      removeContent(pageRef.content);
      loadProject(project, pageRef.content);
      break;
  }
}

// Re-renders sidebar projects and tracks if a sidebar project is selected
function updateSideBar(editedElementSelected = "none") {
  // Get selected tab
  const currentTab = findCurrentTab();

  // Remove list of projects from sidebar
  pageRef.sideBar.removeChild(pageRef.sideBar.lastChild);

  // Re-render selected projects
  renderSideBarProjects(pageRef.sideBar);

  // If sidebar is collapsed, hide selection (maintains selection status)
  if(pageRef.sideBar.className == "side-bar collapsed") {
    sideBar(pageRef.sideBar).collapseSideBar();
  }

  // If current tab is a project, set class name back to selected after removing and re-adding elements.
  if (projectSelected(currentTab.id)) {
    editedElementSelected === "none"
      ? // If sidebar was updated and the modified/added element was not selected, i.e. adding new project, while another was selected
        (document.querySelector(`[data-project-title= '${currentTab.dataset.projectTitle}']`).className = "selected")
      : // If sidebar was updated and the modified element was selected, i.e. editing the name of a currently selected project
        (document.querySelector(`[data-project-title= '${editedElementSelected.title}']`).className = "selected");
  }
}

// The RegEx in this function helps with date accuracy
function formatDate(toFormat) {
  const date = format(new Date(toFormat.replace(/-/g, "/")), "MMM do, yyyy");
  return date;
}

function removeContent(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export {
  renderContentHeader,
  renderSubHeading,
  loadContent,
  emptyListMessage,
  formatDate,
  initHome,
  processDeletion,
  updateCurrentTab,
  updateSideBar,
  removeContent,
  updateDOM,
  getTaskProject,
  projectSelected,
};