import { formatDate, removeContent, getTaskProject, projectSelected } from "./manageDOM";
import { modalManager } from "./modalDOM";
import { pageRef } from "./index";
import { loadProject } from './project';
import { getGeneralProject, getCustomProjects, findElemIndexByTitle } from "./manageStorage";

const renderListItems = (element, appendTo) => {

    const _renderTaskContainers = () => {
        const listItem = document.createElement('div');
        listItem.className = "list-item";
        const Left = document.createElement('div');
        const Right = document.createElement('div');
        listItem.append(Left, Right);
        appendTo.appendChild(listItem);
        return {
            Left,
            Right
        }
    }

    const _updateTaskCompletion = (element) => {
        const generalList = getGeneralProject();
        const customProjects = getCustomProjects();
        if (projectSelected(document.querySelector(".selected").id)) {
            const project = getTaskProject();
            project.tasks.splice(findElemIndexByTitle(project.tasks, element.title), 1, element);
            customProjects.splice(findElemIndexByTitle(customProjects, project.title), 1, project);
            localStorage.setItem("customProjects", JSON.stringify(customProjects));
        }
        else {
            generalList.tasks.splice(findElemIndexByTitle(generalList.tasks, element.title), 1, element);
            localStorage.setItem("General", JSON.stringify(generalList));
        }
    }

    const _toggleCompleted = (element, checkBox, title) => {
        if (element.completed === true) {
            element.completed = false;
            checkBox.textContent = 'check_box_outline_blank';
            title.style.textDecoration = "none";
        }
        else if (element.completed === false) {
            element.completed = true;
            checkBox.textContent = 'select_check_box';
            title.style.textDecoration = "line-through";
        }
        if (element.title !== "Sample Task") {
            _updateTaskCompletion(element);
        }
        else {
            console.log("clicked sample task");
        }
    }

    const _renderTasksLeftContent = (appendTo) => {
        console.log(element);
        const checkBox = document.createElement('p');
        checkBox.className = "material-symbols-outlined check-box";
        checkBox.addEventListener('click', () => { _toggleCompleted(element, checkBox, title); });
        const title = document.createElement('p');
        title.textContent = element.title;
        const priorityIndicator = document.createElement('div');
        priorityIndicator.className = "priority-status";
        if (!element.completed) {
            checkBox.textContent = "check_box_outline_blank";
        }
        else if (element.completed) {
            checkBox.textContent = "select_check_box";
            title.style.textDecoration = "line-through";
        }

        console.log(element.priority);

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
    }

    const _renderRightContent = (appendTo) => {
        const itemBtns = ['info', 'edit', 'delete'];
        const btnTitles = ['Details', 'Edit', 'Delete'];
        const btnFunctions = [modalManager().renderInfo, modalManager().renderForm, modalManager().renderDelete] //modal
        const date = document.createElement('p');
        date.className = "date";
        date.textContent = formatDate(element.dueDate);
        appendTo.appendChild(date);
        for (let i = 0; i < itemBtns.length; i++) {
            const button = document.createElement('button');
            button.className = "material-symbols-outlined";
            if (i === 1) {
                if (element.priority !== undefined) {
                    if (element.title === "Sample Task") {
                        button.disabled = true;
                        button.id = "disabled-btn";
                    } 
                    else {
                        button.addEventListener('click', () => { btnFunctions[i](element, "edit-task"); });
                    }
                }
                else if (element.priority == undefined) {
                    console.log("attached edit-project");
                    button.addEventListener('click', () => { btnFunctions[i](element, "edit-project"); });
                }
            }
            else if (i === 2) {
                if(element.title === "Sample Task") {
                    button.disabled = true;
                    button.id = "disabled-btn";
                }
                else {
                    button.addEventListener('click', () => { btnFunctions[i](element); });
                }
            }
            else {
                button.addEventListener('click', () => { btnFunctions[i](element); });
            }
            button.textContent = itemBtns[i];
            button.title = btnTitles[i];
            appendTo.appendChild(button);
        }
    }

    const _renderProjectLeftContent = (appendTo) => {
        const projBadge = document.createElement('p');
        projBadge.className = "material-symbols-outlined";
        projBadge.textContent = "construction";
        const listprojBtn = document.createElement('button');
        listprojBtn.className = "list-project-btn";
        listprojBtn.textContent = element.title;
        listprojBtn.addEventListener('click', () => { removeContent(pageRef.content); loadProject(element, pageRef.content) });
        appendTo.append(projBadge, listprojBtn);
        console.log(element.completed);
        if (element.completed) {
            const completedBadge = document.createElement('p');
            completedBadge.className = "material-symbols-outlined completed-badge";
            completedBadge.textContent = "check_circle";
            completedBadge.title = "Project completed";
            appendTo.appendChild(completedBadge);
        }
    }

    const renderTasks = () => {
        const container = _renderTaskContainers();
        _renderTasksLeftContent(container.Left);
        _renderRightContent(container.Right);
    }

    const renderProjectstoList = () => {
        const container = _renderTaskContainers();
        _renderProjectLeftContent(container.Left);
        _renderRightContent(container.Right);
    }

    return {
        Tasks: renderTasks,
        Projects: renderProjectstoList
    }
}

export {
    renderListItems
}