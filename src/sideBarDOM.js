import { pageRef } from "./index";
import { loadHomePage } from "./home";
import { loadToday } from "./today";
import { loadWeek } from "./week";
import { loadProject } from "./project";
import { getCustomProjects } from "./manageStorage";
import { removeContent } from "./manageDOM";
import { modalManager } from "./modalDOM";

const sideBar = (sidebar) => {
  function renderExpanded() {
    setGridElement("275px");
    _renderToggleButton();
    _renderSideBarNavButtons();
    renderSideBarProjects(sidebar);
    sidebar.className = "side-bar expanded";
  }

  function _renderToggleButton() {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "material-symbols-outlined";
    toggleBtn.textContent = "close";
    toggleBtn.addEventListener("click", () => {
      _toggleSideBar();
    });
    toggleBtn.id = "toggle-button";
    sidebar.appendChild(toggleBtn);
  }

  function _toggleSideBar() {
    if (sidebar.className == "side-bar expanded") {
      collapseSideBar();
    } else if (sidebar.className == "side-bar collapsed") {
      _expandSideBar();
    }
  }

  // Auto collapse/expand side bar when resizing if not mobile device (detected based on touch input)
  window.addEventListener("resize", () => {
    if (!("ontouchstart" in document.documentElement)) {
      if (window.innerWidth <= 825) {
        collapseSideBar();
      } else if (window.innerWidth >= 825) {
        _expandSideBar();
      }
    }
  });

  function collapseSideBar() {
    const toHide = document.querySelectorAll(".side-content");
    toHide.forEach(function (item) {
      item.className = "side-content hide";
    });
    setGridElement("60px");
    sidebar.className = "side-bar collapsed";
    document.getElementById("toggle-button").textContent = "menu";
    pageRef.content.className = "content expanded";
  }

  function _expandSideBar() {
    const toShow = document.querySelectorAll(".side-content.hide");
    toShow.forEach(function (item) {
      item.className = "side-content show";
    });
    setGridElement("275px");
    sidebar.className = "side-bar expanded";
    document.getElementById("toggle-button").textContent = "close";
    pageRef.content.className = "content narrowed";
  }

  function _renderSideBarNavButtons() {
    const sideBtns = ["Home", "Today", "This Week"];
    const icons = ["home", "today", "date_range"];
    const pages = [loadHomePage, loadToday, loadWeek];
    const btnContainer = document.createElement("div");
    btnContainer.className = "side-content";
    btnContainer.id = "side-content-nav";
    sidebar.appendChild(btnContainer);
    for (let i = 0; i < sideBtns.length; i++) {
      const btnDiv = document.createElement("div");
      btnDiv.addEventListener("click", () => {
        removeContent(pageRef.content);
        pages[i](pageRef.content);
      });
      btnDiv.id = sideBtns[i];
      btnContainer.appendChild(btnDiv);
      const btnIcon = document.createElement("p");
      btnIcon.className = "material-symbols-outlined nav-icon";
      btnIcon.textContent = icons[i];
      const btnName = document.createElement("p");
      btnName.textContent = sideBtns[i];
      btnDiv.append(btnIcon, btnName);
    }
  };

  return {
    renderExpanded,
    collapseSideBar,
  };
};

function renderSideBarProjects(sidebar) {
  const projects = getCustomProjects();
  const projcontainer = document.createElement("div");
  projcontainer.className = "side-content";
  projcontainer.id = "side-content-projects";
  renderSideBarProjHead(projcontainer);
  sidebar.appendChild(projcontainer);
  if (projects.length === 0) {
    const projDiv = document.createElement("div");
    projDiv.id = "add-project-button";
    projcontainer.appendChild(projDiv);
    const projIcon = document.createElement("p");
    projIcon.className = "material-symbols-outlined project-icon";
    projIcon.textContent = "construction";
    const addBtnTitle = document.createElement("p");
    addBtnTitle.textContent = "Add Project";
    projDiv.append(projIcon, addBtnTitle);
    projDiv.addEventListener("click", () => {
      modalManager().renderForm(projects, "new-project");
    });
  } else if (projects.length > 0) {
    for (let i = 0; i < projects.length; i++) {
      const projDiv = document.createElement("div");
      projDiv.dataset.projectTitle = projects[i].title;
      projDiv.id = projects[i].title;
      projcontainer.appendChild(projDiv);
      const projIcon = document.createElement("p");
      projIcon.className = "material-symbols-outlined project-icon";
      projIcon.textContent = "construction";
      const projName = document.createElement("p");
      projName.className = "project-title-text";
      projName.textContent = projects[i].title;
      projDiv.append(projIcon, projName);
      projDiv.addEventListener("click", () => {
        removeContent(pageRef.content);
        loadProject(projects[i], pageRef.content);
      });
    }
  }
}

function renderSideBarProjHead(appendTo) {
  const projects = getCustomProjects();
  const projTitleContainer = document.createElement("div");
  const title = document.createElement("p");
  projTitleContainer.id = "projects-title";
  title.textContent = "Projects";
  const addProjBtn = document.createElement("button");
  addProjBtn.className = "material-symbols-outlined add-project-button";
  addProjBtn.textContent = "add_circle";
  addProjBtn.title = "Add Project";
  addProjBtn.addEventListener("click", () => {
    modalManager().renderForm(projects, "new-project");
  });
  projTitleContainer.append(title, addProjBtn);
  appendTo.appendChild(projTitleContainer);
}

// Helpers
function setGridElement(resizeTo) {
  const bodyGrid = document.getElementById("under-head");
  bodyGrid.style.gridTemplateColumns = `${resizeTo} auto`;
}

function selectTab(toSelect) {
  if (toSelect.className !== "selected") {
    const toClose = document.querySelector(".selected");
    toClose.removeAttribute("class");
    toSelect.className = "selected";
  }
}

export { sideBar, selectTab, renderSideBarProjects };