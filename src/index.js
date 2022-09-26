import { initHome } from './manageDOM';
import { initStorage } from './manageStorage';
import './style.css';

const pageRef = (() => {
    const sideBar = document.getElementById("side-bar");
    const content = document.getElementById("content");
    const body = document.getElementById("under-head");
    return { 
        sideBar,
        content,
        body
    }
})();

initStorage();
initHome();

export { pageRef};