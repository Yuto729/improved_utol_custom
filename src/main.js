// This script run in https://utol.ecc.u-tokyo.ac.jp/lms/timetable at `document_idle` timing

const timetableHeader = document.querySelector("#selectTimetable");

// Insert loader DOM
const loader = document.createElement("div");
loader.classList.add("ilms-tasklist-loader");
timetableHeader?.parentNode.insertBefore(loader, timetableHeader);

// Create a button to toggle the visibility of the selector

// Fetch the task list
fetch("/lms/task")
  .then((response) => {
    if (!response.ok) {
      throw new Error("課題リストの読み込みに失敗しました");
    }
    return response.text();
  })
  .then((html) => {
    // Insert the task list block into the timetable page
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const block = doc.querySelector(".block.clearfix");

    // Create a selector to remove unwanted tasks
    const selector = document.createElement("div");
    selector.classList.add("task-selector");
    selector.style.display = "none"; // Initially hide the selector
    selector.style.flexDirection = "column"; // Ensure the tasks are listed vertically
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "課題を非表示にする";
    toggleButton.onclick = function() {
      const currentMaxHeight = selector.style.maxHeight;
      selector.style.maxHeight = (currentMaxHeight === "0px" || currentMaxHeight === "") ? "500px" : "0px";
      selector.style.display = (selector.style.display === "none" ? "flex" : "none");
    };
    const tasks = block.querySelectorAll(".contents-display-flex.contents-display-flex-exchange-sp.sortBlock.result_list_line");
    tasks.forEach((task, index) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `task-${index}`;
      checkbox.dataset.taskId = index;
      
      const taskStatus = localStorage.getItem(`task-${index}`);
      if (taskStatus === 'hidden') {
        task.style.display = "none";
        checkbox.checked = true;
      }
      checkbox.onchange = function() {
        const taskElement = tasks[this.dataset.taskId];
        if (this.checked) {
          taskElement.style.display = "none";
          localStorage.setItem(`task-${this.dataset.taskId}`, 'hidden');
        } else {
          taskElement.style.display = "";
          localStorage.removeItem(`task-${this.dataset.taskId}`);
        }
      };
      const courseName = task.querySelector(".tasklist-course.break.course span")?.textContent || "Unknown Course";
      const taskName = task.querySelector(".tasklist-title.answer-test.break span")?.textContent || "Unknown Task";
      const label = document.createElement("label");
      label.htmlFor = `task-${index}`;
      label.textContent = `${courseName}: ${taskName}`;
      label.insertBefore(checkbox, label.firstChild);
      selector.appendChild(label);
      // selector.appendChild(checkbox);
    });

    // Insert the toggle button and the selector
    if (block !== null) {
      timetableHeader?.parentNode.insertBefore(toggleButton, timetableHeader);
      timetableHeader?.parentNode.insertBefore(selector, timetableHeader);
      timetableHeader?.parentNode.insertBefore(block, timetableHeader);
    }
  })
  .catch((error) => {
    alert(error.message);
  })
  .finally(() => {
    // Remove the loader
    loader.remove();
  });

