import {
  renderContentHeader,
  renderSubHeading,
  loadContent,
} from "./manageDOM";
import { selectTab } from "./sideBarDOM";
import { modalManager } from "./modalDOM";

function renderprojectButtons(element, content) {
  const projBtns = ["playlist_add", "edit", "delete", "info"];
  const btnTitle = [
    "Add Task",
    "Edit Project",
    "Delete Project",
    "About Project",
  ];
  const btnFunctions = [
    modalManager().renderForm,
    modalManager().renderForm,
    modalManager().renderDelete,
    modalManager().renderInfo,
  ];
  const btnDiv = document.createElement("div");
  btnDiv.className = "proj-btn-container";
  for (let i = 0; i < projBtns.length; i++) {
    const button = document.createElement("button");
    button.className = "material-symbols-outlined";
    button.textContent = projBtns[i];
    if (i === 0) {
      button.addEventListener("click", () => {
        btnFunctions[i](element, "add-task-to-project");
      });
    } else if (i === 1) {
      button.addEventListener("click", () => {
        btnFunctions[i](element, "edit-project");
      });
    } else {
      button.addEventListener("click", () => {
        btnFunctions[i](element);
      });
    }
    button.title = btnTitle[i];
    btnDiv.appendChild(button);
  }
  content.appendChild(btnDiv);
}

function loadProject(selectedProject, content) {
  renderContentHeader("construction", selectedProject.title, content, true);
  renderprojectButtons(selectedProject, content);
  renderSubHeading("Tasks", selectedProject.tasks.length, content);
  loadContent("task-list", selectedProject.tasks, content);
  //selectTab(document.getElementById(selectedProject.title));
  selectTab(document.querySelector(`[data-project-title= '${selectedProject.title}']`));
}

export { loadProject };