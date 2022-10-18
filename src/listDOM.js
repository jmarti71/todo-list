import {
  formatDate,
  removeContent,
  getTaskProject,
  projectSelected,
  updateSideBar
} from "./manageDOM";
import { modalManager } from "./modalDOM";
import { pageRef } from "./index";
import { loadProject } from "./project";
import {
  getGeneralProject,
  getCustomProjects,
  findElemIndexByTitle,
} from "./manageStorage";

const renderListItems = (element, appendTo) => {
  const _renderTaskContainers = () => {
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    const left = document.createElement("div");
    const right = document.createElement("div");
    listItem.append(left, right);
    appendTo.appendChild(listItem);
    return {
      Left: left,
      Right: right,
    };
  };

  function _updateTaskCompletion (element) {
    const generalList = getGeneralProject();
    const customProjects = getCustomProjects();
    if (projectSelected(document.querySelector(".selected").id)) {
      const project = getTaskProject();
      project.tasks.splice(
        findElemIndexByTitle(project.tasks, element.title),
        1,
        element
      );
      customProjects.splice(
        findElemIndexByTitle(customProjects, project.title),
        1,
        project
      );
      localStorage.setItem("customProjects", JSON.stringify(customProjects));
      // Below keeps sidebar up-to-date if task completion within a project is modified and the project was not accessed from the sidebar.
      updateSideBar();  
    } else {
      generalList.tasks.splice(
        findElemIndexByTitle(generalList.tasks, element.title),
        1,
        element
      );
      localStorage.setItem("General", JSON.stringify(generalList));
    }
  };

  function _toggleCompleted (element, checkBox, title) {
    if (element.completed === true) {
      element.completed = false;
      checkBox.textContent = "check_box_outline_blank";
      title.style.textDecoration = "none";
    } else if (element.completed === false) {
      element.completed = true;
      checkBox.textContent = "select_check_box";
      title.style.textDecoration = "line-through";
    }
    if (element.title !== "Sample Task") {
      _updateTaskCompletion(element);
    } else {
      console.log("clicked sample task");
    }
  };

  function _renderTasksLeftContent (appendTo) {
    appendTo.className = "task__left-content";
    const checkBox = document.createElement("p");
    checkBox.className = "material-symbols-outlined check-box";
    checkBox.addEventListener("click", () => {
      _toggleCompleted(element, checkBox, title);
    });
    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = element.title;
    const priorityIndicator = document.createElement("div");
    priorityIndicator.className = "priority-status";
    if (!element.completed) {
      checkBox.textContent = "check_box_outline_blank";
    } else if (element.completed) {
      checkBox.textContent = "select_check_box";
      title.style.textDecoration = "line-through";
    }

    switch (element.priority) {
      case "High":
        priorityIndicator.style.backgroundColor = "red";
        break;
      case "Medium":
        priorityIndicator.style.backgroundColor = "orange";
        break;
      case "Low":
        priorityIndicator.style.backgroundColor = "rgb(35, 165, 80)";
        break;
    }
    appendTo.append(checkBox, title, priorityIndicator);
  };

  function _renderRightContent (appendTo) {
    appendTo.className = "list-item-content__right";
    const itemBtns = ["info", "edit", "delete"];
    const btnTitles = ["Details", "Edit", "Delete"];
    const btnFunctions = [
      modalManager().renderInfo,
      modalManager().renderForm,
      modalManager().renderDelete,
    ];
    const date = document.createElement("p");
    date.className = "date";
    date.textContent = formatDate(element.dueDate);
    appendTo.appendChild(date);
    for (let i = 0; i < itemBtns.length; i++) {
      const button = document.createElement("button");
      button.className = "material-symbols-outlined";
      if (i === 1) {
        if (element.priority !== undefined) {
          if (element.title === "Sample Task") {
            button.disabled = true;
            button.id = "disabled-btn";
          } else {
            button.addEventListener("click", () => {
              btnFunctions[i](element, "edit-task");
            });
          }
        } else if (element.priority == undefined) {
          button.addEventListener("click", () => {
            btnFunctions[i](element, "edit-project");
          });
        }
      } else if (i === 2) {
        if (element.title === "Sample Task") {
          button.disabled = true;
          button.id = "disabled-btn";
        } else {
          button.addEventListener("click", () => {
            btnFunctions[i](element);
          });
        }
      } else {
        button.addEventListener("click", () => {
          btnFunctions[i](element);
        });
      }
      button.textContent = itemBtns[i];
      button.title = btnTitles[i];
      appendTo.appendChild(button);
    }
  };

  function _renderProjectLeftContent (appendTo) {
    appendTo.className = "project__left-content";
    const projBadge = document.createElement("p");
    projBadge.className = "material-symbols-outlined";
    projBadge.textContent = "construction";
    const listprojBtn = document.createElement("button");
    listprojBtn.className = "list-project-btn";
    listprojBtn.textContent = element.title;
    listprojBtn.addEventListener("click", () => {
      removeContent(pageRef.content);
      loadProject(element, pageRef.content);
    });
    appendTo.append(projBadge, listprojBtn);
    if (element.completed) {
      const completedBadge = document.createElement("p");
      completedBadge.className = "material-symbols-outlined completed-badge";
      completedBadge.textContent = "check_circle";
      completedBadge.title = "Project completed";
      appendTo.appendChild(completedBadge);
    }
  };

  function renderTasks () {
    const container = _renderTaskContainers();
    _renderTasksLeftContent(container.Left);
    _renderRightContent(container.Right);
  };

  function renderProjectstoList () {
    const container = _renderTaskContainers();
    _renderProjectLeftContent(container.Left);
    _renderRightContent(container.Right);
  };

  return {
    Tasks: renderTasks,
    Projects: renderProjectstoList,
  };
};

export { renderListItems };