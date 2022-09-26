import { renderContentHeader, renderSubHeading, emptyListMessage} from "./manageDOM";
import { getGeneralProject, getCustomProjects } from "./manageStorage";
import isToday from 'date-fns/isToday';
import { selectTab } from "./sideBarDOM";
import { renderListItems } from "./listDOM";

function loadToday(content) {
    const generalTasks = getGeneralProject();
    const customProjects = getCustomProjects();
    renderContentHeader("today", "Today", content, false);
    loadTodayContent("Task", generalTasks.tasks, content);
    loadTodayContent("Project", customProjects, content);
    selectTab(document.getElementById("Today"));
}

function loadTodayContent(type, renderFrom, content) {
    const container = document.createElement('div');
    container.className = "list-item-container";
    let todayCount = 0;
    renderFrom.forEach(element => {
        if(element.title !== "General") {
            if (isToday(new Date(element.dueDate.replace(/-/g, '\/')))) {
                todayCount++;
            }
        }
    });
    if (todayCount >= 1) {
        renderSubHeading(`${type}s Due Today`, todayCount, content);
        content.appendChild(container);
        renderFrom.forEach(element => {
            if(element.title !== "General") {
                if (isToday(new Date(element.dueDate.replace(/-/g, '\/')))) {
                    if (type == "Task") {
                        renderListItems(element, container).Tasks();
                    }
                    else if (type == "Project") {
                        renderListItems(element, container).Projects();
                    }
                }
            }
        });
    }
    else {
        renderSubHeading(`${type}s Due Today`, todayCount, content);
        emptyListMessage(type.toLowerCase(), content);
    }
}

export { loadToday };