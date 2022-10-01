/* eslint-disable no-useless-escape */
import {
  renderContentHeader,
  renderSubHeading,
  emptyListMessage,
} from "./manageDOM";
import { getGeneralProject, getCustomProjects } from "./manageStorage";
import { selectTab } from "./sideBarDOM";
import getDay from "date-fns/getDay";
import isThisWeek from "date-fns/isThisWeek";
import { renderListItems } from "./listDOM";

function loadWeek(content) {
  renderContentHeader("date_range", "This Week", content, false);
  renderDays(content);
  selectTab(document.getElementById("This Week"));
}

function renderDays(content) {
  const generalTasks = getGeneralProject();
  const customProjects = getCustomProjects();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let weekTasks = [];
  let weekProjects = [];

  generalTasks.tasks.forEach((element) => {
    if (
      isThisWeek(new Date(element.dueDate.replace(/-/g, "/")), {
        weekStartsOn: 0,
      })
    ) {
      weekTasks.push(element);
    }
  });
  customProjects.forEach((element) => {
    if (element.title !== "General") {
      if (
        isThisWeek(new Date(element.dueDate.replace(/-/g, "/")), {
          weekStartsOn: 0,
        })
      ) {
        weekProjects.push(element);
      }
    }
  });

  const weekTotal = weekTasks.length + weekProjects.length;
  renderSubHeading("Due This Week", weekTotal, content);

  // If nothing this week
  if (weekTotal == 0) {
    emptyListMessage("task", content);
  } else {
    const daysContainer = document.createElement("div");
    daysContainer.className = "days-container";
    content.appendChild(daysContainer);

    // Individual day containers
    for (let i = 0; i < days.length; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = `${days[i]} hide`;
      renderSubHeading(`${days[i]}`, "ignore", dayDiv);
      daysContainer.appendChild(dayDiv);
    }

    // Select day containers
    const sun = document.querySelector(".Sunday");
    const mon = document.querySelector(".Monday");
    const tues = document.querySelector(".Tuesday");
    const weds = document.querySelector(".Wednesday");
    const thurs = document.querySelector(".Thursday");
    const fri = document.querySelector(".Friday");
    const sat = document.querySelector(".Saturday");

    weekTasks.forEach((element) => {
      switch (getDay(new Date(element.dueDate.replace(/-/g, "/")))) {
        case 0:
          sun.className = "Sunday show";
          renderListItems(element, sun).Tasks();
          break;
        case 1:
          mon.className = "Monday show";
          renderListItems(element, mon).Tasks();
          break;
        case 2:
          tues.className = "Tuesday show";
          renderListItems(element, tues).Tasks();
          break;
        case 3:
          weds.className = "Wednesday show";
          renderListItems(element, weds).Tasks();
          break;
        case 4:
          thurs.className = "Thursday show";
          renderListItems(element, thurs).Tasks();
          break;
        case 5:
          fri.className = "Friday show";
          renderListItems(element, fri).Tasks();
          break;
        case 6:
          sat.className = "Saturday show";
          renderListItems(element, sat).Tasks();
          break;
      }
    });
    weekProjects.forEach((element) => {
      switch (getDay(new Date(element.dueDate.replace(/-/g, "/")))) {
        case 0:
          sun.className = "Sunday show";
          renderListItems(element, sun).Projects();
          break;
        case 1:
          mon.className = "Monday show";
          renderListItems(element, mon).Projects();
          break;
        case 2:
          tues.className = "Tuesday show";
          renderListItems(element, tues).Projects();
          break;
        case 3:
          weds.className = "Wednesday show";
          renderListItems(element, weds).Projects();
          break;
        case 4:
          thurs.className = "Thursday show";
          renderListItems(element, thurs).Projects();
          break;
        case 5:
          fri.className = "Friday show";
          renderListItems(element, fri).Projects();
          break;
        case 6:
          sat.className = "Saturday show";
          renderListItems(element, sat).Projects();
          break;
      }
    });
  }
}

export { loadWeek };
