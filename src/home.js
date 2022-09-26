import { renderContentHeader, renderSubHeading, loadContent } from "./manageDOM";
import { getGeneralProject, getCustomProjects, sampleTask} from "./manageStorage";
import { selectTab } from "./sideBarDOM";

function loadHomePage(content) {
    const generalTasks = getGeneralProject();
    const projects = getCustomProjects();

    renderContentHeader("home", "Home", content, false);
    if(generalTasks.tasks.length === 0) {
        renderSubHeading("Tasks", sampleTask().tasks.length, content);
        loadContent("task-list", sampleTask().tasks, content);

    }
    else {
        renderSubHeading("Tasks", generalTasks.tasks.length, content);
        loadContent("task-list", generalTasks.tasks, content);
    }
    renderSubHeading("Projects", projects.length, content);
    loadContent("project-list", projects, content);
    selectTab(document.getElementById("Home"));
}

export { loadHomePage };