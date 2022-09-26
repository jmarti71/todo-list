import { formatDate, removeContent, processDeletion, updateDOM, projectSelected, getTaskProject } from "./manageDOM";
import { saveSubmitted, getCustomProjects, getGeneralProject } from "./manageStorage";
import { pageRef } from "./index";

const modalManager = () => {

    function generateHiddenModal() {
        const modal = document.createElement('div');
        const modalContent = document.createElement('div');
        modal.className = "modal hide";
        modal.id = "modal";
        const closeBtn = document.createElement('button');
        closeBtn.className = "material-symbols-outlined";
        closeBtn.textContent = "close";
        closeBtn.addEventListener('click', () => { _closeModal(modal, modalContent); });
        modalContent.className = "modal-content";
        modal.append(closeBtn, modalContent);
        pageRef.body.appendChild(modal);

        // Close modal if clicked beyond
        document.addEventListener('mousedown', function (e) {
            if (!modal.contains(e.target)) {
                _closeModal(modal, modalContent);
            }
        });
    }

    function _displayModal(modal, contentContainer) {
        if (contentContainer.hasChildNodes() || modal.className == "modal show") {
            removeContent(contentContainer);
        }
        if (modal.className == "modal hide") {
            modal.className = "modal show";
        }
    }

    function _closeModal(toClose, toRemove = "none") {
        if (toClose.className == "modal show") {
            if (toRemove !== "none") {
                removeContent(toRemove);
            }
            toClose.className = "modal hide";
        }
    }

    const _getModalComponent = () => {
        const modal = document.getElementById("modal");
        const contentContainer = document.querySelector(".modal-content");
        return {
            modal,
            contentContainer
        };
    }

    function renderInfo(element) {
        _displayModal(_getModalComponent().modal, _getModalComponent().contentContainer);
        const title = document.createElement('h2');
        title.className = "modal-title";
        title.textContent = element.title;
        const descripion = document.createElement('p');
        descripion.textContent = element.description;
        const priorityOrTasksDiv = document.createElement('div');
        priorityOrTasksDiv.className = "info-priority-div";
        const text = document.createElement('p');
        const priorityBullet = document.createElement('div');
        priorityBullet.className = "priority-status";
        priorityOrTasksDiv.append(text, priorityBullet);
        const due = document.createElement('p');
        due.textContent = `Due: ${formatDate(element.dueDate)}`;
        switch (element.priority) {
            case 'Low':
                text.textContent = "Priority: Low";
                priorityBullet.style.backgroundColor = "rgb(35, 165, 80)";
                break;
            case 'Medium':
                text.textContent = "Priority: Medium";
                priorityBullet.style.backgroundColor = "orange";
                break;
            case 'High':
                text.textContent = "Priority: High";
                priorityBullet.style.backgroundColor = "red";
                break;
            // If project
            case undefined: 
                priorityOrTasksDiv.removeChild(priorityBullet);
                text.textContent = `Number of tasks: ${element.tasks.length}`;
                break;
        }
        _getModalComponent().contentContainer.append(title, descripion, priorityOrTasksDiv, due);
    }

    function renderDelete(element) {
        _displayModal(_getModalComponent().modal, _getModalComponent().contentContainer);
        const title = document.createElement('h2');
        title.className = "modal-title";
        title.textContent = "Confirm";
        const descripion = document.createElement('p');
        descripion.textContent = `Are you sure you want to delete this item: "${element.title}"?`;
        const buttonsDiv = document.createElement('div');
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Delete";
        confirmBtn.addEventListener('click', () => {
            processDeletion(element); _closeModal(_getModalComponent().modal,
                _getModalComponent().contentContainer);
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener('click', () => {
            _closeModal(_getModalComponent().modal,
                _getModalComponent().contentContainer);
        });
        buttonsDiv.className = "modal-confirm";
        buttonsDiv.append(confirmBtn, cancelBtn);
        _getModalComponent().contentContainer.append(title, descripion, buttonsDiv);
    }

    function renderForm(element, purpose) {
        _displayModal(_getModalComponent().modal, _getModalComponent().contentContainer);
        const priorityValues = ['', 'Low', 'Medium', 'High'];
        const form = document.createElement('form');
        form.className = "modal-form";
        form.addEventListener('submit', preventRefresh);
        const formTitle = document.createElement('h2');

        const inputTitleDiv = document.createElement('div');
        inputTitleDiv.className = "input-container";
        const titleInput = document.createElement('input');
        titleInput.type = "text";
        titleInput.id = "input-title";
        titleInput.maxLength = "40";
        titleInput.setAttribute('required', '');
        const titleLabel = document.createElement("label");
        titleLabel.textContent = "Title";
        titleLabel.htmlFor = "input-title";
        inputTitleDiv.append(titleLabel, titleInput);

        const inputDescriptionDiv = document.createElement('div');
        inputDescriptionDiv.className = "input-container";
        const descriptionInput = document.createElement('input');
        descriptionInput.type = "text";
        descriptionInput.id = "input-description";
        descriptionInput.maxLength = "500";
        descriptionInput.setAttribute('required', '');
        const descriptionLabel = document.createElement("label");
        descriptionLabel.textContent = "Description";
        descriptionLabel.htmlFor = "input-description";
        inputDescriptionDiv.append(descriptionLabel, descriptionInput);

        const inputDateDiv = document.createElement('div');
        inputDateDiv.className = "input-container";
        const dueDateInput = document.createElement('input');
        dueDateInput.type = "date";
        dueDateInput.name = "due-date";
        dueDateInput.id = "due-date";
        dueDateInput.setAttribute('required', '');
        const dueDateLabel = document.createElement("label");
        dueDateLabel.textContent = "Due date";
        dueDateLabel.htmlFor = "due-date";
        inputDateDiv.append(dueDateLabel, dueDateInput);

        const submitBtn = document.createElement('button');
        submitBtn.className = "submit-task";
        submitBtn.type = "submit";
        form.append(inputTitleDiv, inputDescriptionDiv, inputDateDiv);

        const inputPriorityDiv = document.createElement('div');
        inputPriorityDiv.className = "input-container";
        const selectPriority = document.createElement('select');
        selectPriority.name = "priority";
        selectPriority.id = "priority-select";
        selectPriority.setAttribute('required', '');
        const selectPriorityLabel = document.createElement("label");
        selectPriorityLabel.textContent = "Priority";
        selectPriorityLabel.htmlFor = "priority-select";
        inputPriorityDiv.append(selectPriorityLabel, selectPriority);
        const errorMessage = document.createElement('p');
        errorMessage.id = "error-message";
        errorMessage.className = "error hide";

        for (const val of priorityValues) {
            const priorityOption = document.createElement('option');
            priorityOption.value = val;
            if (val === '') {
                priorityOption.textContent = "Select priority";
                priorityOption.selected = true;
                priorityOption.disabled = true;
            }
            else {
                priorityOption.textContent = val;
            }
            selectPriority.appendChild(priorityOption);
        }

        switch (purpose) {
            case "new-task":
                console.log(purpose);
                formTitle.textContent = "Create new task";
                titleInput.placeholder = "Enter title";
                descriptionInput.placeholder = "Enter description";
                submitBtn.textContent = "Submit";
                submitBtn.addEventListener('click', () => {
                    processSubmit(element, purpose, titleInput.value, descriptionInput.value,
                        dueDateInput.value, selectPriority.value, false);
                });
                form.append(inputPriorityDiv, errorMessage);
                break;
            case "edit-task":
                console.log(purpose);
                console.log(element);
                formTitle.textContent = "Edit task";
                titleInput.value = element.title;
                descriptionInput.value = element.description;
                dueDateInput.value = element.dueDate;
                selectPriority.value = element.priority;
                submitBtn.textContent = "Update";
                submitBtn.addEventListener('click', () => {
                    processSubmit(element, purpose, titleInput.value, descriptionInput.value,
                        dueDateInput.value, selectPriority.value, false);
                });
                form.append(inputPriorityDiv, errorMessage);
                break;
            case "new-project":
                console.log(purpose);
                formTitle.textContent = "Create new project";
                titleInput.placeholder = "Enter title";
                descriptionInput.placeholder = "Enter description";
                submitBtn.textContent = "Submit";
                submitBtn.addEventListener('click', () => {
                    processSubmit(element, purpose, titleInput.value, descriptionInput.value,
                        dueDateInput.value, "none", false);
                });
                form.appendChild(errorMessage);
                break;
            case "add-task-to-project":
                formTitle.textContent = `Add new task to ${element.title}`;
                titleInput.placeholder = "Enter title";
                descriptionInput.placeholder = "Enter description";
                submitBtn.textContent = "Submit";
                submitBtn.addEventListener('click', () => {
                    processSubmit(element, purpose, titleInput.value, descriptionInput.value,
                        dueDateInput.value, selectPriority.value, false);
                });
                form.append(inputPriorityDiv, errorMessage);
                break;
            case "edit-project":
                console.log(purpose);
                formTitle.textContent = "Edit project";
                titleInput.value = element.title;
                descriptionInput.value = element.description;
                dueDateInput.value = element.dueDate;
                submitBtn.textContent = "Update";
                submitBtn.addEventListener('click', () => {
                    processSubmit(element, purpose, titleInput.value, descriptionInput.value,
                        dueDateInput.value, "none", false);
                });
                form.appendChild(errorMessage);
                break;
        }
        form.appendChild(submitBtn);
        _getModalComponent().contentContainer.append(formTitle, form);
    }

    // Validate form submission, if valid, proceed to save
    function processSubmit(element, purpose, title, description, dueDate, priority, completed) {
        if (validateEntry(title, description, dueDate, priority)) {
            console.log("here");
            if (purpose === "edit-task" || purpose === "edit-project") {
                if (checkForDifference(element, title, description, dueDate, priority)) {
                    if (validateName(title, priority, element)) {
                        saveSubmitted(element, purpose, title, description, dueDate, priority, completed);
                        _closeModal(_getModalComponent().modal);
                        updateDOM(element, purpose);
                    }
                }
            }
            else {
                if (validateName(title, priority)) {
                    saveSubmitted(element, purpose, title, description, dueDate, priority, completed);
                    _closeModal(_getModalComponent().modal);
                    updateDOM(element, purpose);
                }
            }
        }
    }

    return {
        generateHiddenModal,
        renderInfo,
        renderDelete,
        renderForm
    }
}

function preventRefresh(event) {
    event.preventDefault();
}

function displayErrorMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.className = "error show";
}

// Validate changes when editing task or project
function checkForDifference(element, title, description, dueDate, priority) {
    if (priority === "none") {
        if (element.title === title && element.description === description && element.dueDate === dueDate) {
            displayErrorMessage("* No changes made");
            return false;
        }
        else {
            return true;
        }
    }
    else if (priority !== "none") {
        if (element.title === title && element.description === description && element.dueDate === dueDate && element.priority === priority) {
            displayErrorMessage("* No changes made");
            return false;
        }
        else {
            return true;
        }
    }
}

function isNameTaken(toCheck, title) {
    const length = toCheck.length;
    for (let i = 0; i < length; i++) {
        if (toCheck[i].title == title) {
            return true;
        }
    }
}

// Checks if project/task name are already taken (within respective section) and if name belongs to edited element. 
function validateName(title, priority, element = "default") {
    if (priority === "none") {
        // If name is taken
        if (isNameTaken(getCustomProjects(), title)) {
            // And adding a new element
            if (element === "default") {
                displayErrorMessage(`* Project name "${title}" is already taken`);
                return false;
            }
            // And name belongs to element being edited
            else if (element.title == title) {
                return true;
            }
            // And not new element + title doesn't belong to edited element
            else {
                displayErrorMessage(`* Project name "${title}" is already taken`);
                return false;
            }
        }
        else {
            return true;
        }
    }
    else if (priority !== "none") {
        // If not editing task within a project
        if (!projectSelected(document.querySelector(".selected").id)) {
            if (isNameTaken(getGeneralProject().tasks, title)) {
                if (element === "default") {
                    displayErrorMessage(`* Task name "${title}" is already taken on this list`);
                    return false;
                }
                else if (element.title == title) {
                    return true;
                }
                else {
                    displayErrorMessage(`* Task name "${title}" is already taken on this list`);
                    return false;
                }
            }
            else {
                return true;
            }
        }
        // If editing task within a project
        else if (projectSelected(document.querySelector(".selected").id)) {
            if (isNameTaken(getTaskProject().tasks, title)) {
                if (element === "default") {
                    displayErrorMessage(`* Task name "${title}" is already taken in this project`);
                    return false;
                }
                else if (element.title == title) {
                    console.log("update");
                    return true;
                }
                else {
                    displayErrorMessage(`* Task name "${title}" is already taken in this project`);
                    return false;
                }
            }
            else {
                return true;
            }
        }
    }
}

// Validate for blank boxes and for restricted names
function validateEntry(title, description, dueDate, priority) {
    if (priority === "none") {
        if (title !== '' && description !== '' && dueDate !== '') {
            if (title === "General") {
                displayErrorMessage("* Title name 'General' is restricted");
                return false;
            }
            else {
                return true;
            }
        }
        else {
            displayErrorMessage("* Please fill all boxes");
            return false;
        }
    }
    else if (priority !== "none") {
        if (title !== '' && description !== '' && dueDate !== '' && priority !== '') {
            if (title === "Sample Task") {
                displayErrorMessage("* Title name 'Sample Task' is restricted");
                return false;
            }
            else {
                return true;
            }
        }
        else {
            displayErrorMessage("* Please fill all boxes");
            return false;
        }
    }
}

export { modalManager }