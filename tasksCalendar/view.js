// Get Input
let {pages, view, firstDayOfWeek, globalTaskFilter, dailyNoteFolder, options} = input;

// Get Tasks From Pages
if (pages=="") {
	var tasks = dv.pages().file.tasks;
} else {
	var tasks = dv.pages(pages).file.tasks;
};

// Collect Metadata From Tasks
getMeta(tasks);

// Variables
var tToday = moment().format("YYYY-MM-DD");
var tMonth = moment().format("M");
var tDay = moment().format("d");
var tYear = moment().format("YYYY");
var dateformat = "ddd, D. MMM";
var transparency = "33";
var done, doneWithoutCompletionDate, due, recurrence, overdue, start, scheduled, process, cancelled;
var tid = (new Date()).getTime();
var selectedDate = null;

// Lucide Icons
var arrowLeftIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
var arrowRightIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
var filterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';
var monthIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>';
var agendaIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M17 14h-6"></path><path d="M13 18H7"></path><path d="M7 14h.01"></path><path d="M17 18h.01"></path></svg>';
var widgetIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

// Set Root Node
const rootNode = dv.el("div", "", {cls: "tasksCalendar "+options, attr: {id: "tasksCalendar"+tid, view: view}});

// Templates
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><a class='internal-link cellName' href='{{dailyNote}}'>{{cellName}}</a><div class='cellContent'>{{cellContent}}</div></div>";
var taskTemplate = "<a class='internal-link' href='{{taskPath}}'><div class='task {{class}}' style='{{style}}' title='{{title}}'>{{taskContent}}</div></a>";

// Switch
switch(view) {
	case "month":
		setButtons();
		selectedDate = moment().startOf("month");
		getMonth(tasks, selectedDate);
	break;
	case "widget":
		setButtons();
		selectedDate = moment().startOf("week");
		getWidget(tasks, selectedDate);
	break;
	case "agenda":
		setButtons();
		selectedDate = moment().startOf("week");
		getAgenda(tasks, selectedDate);
	break;
};

// Get Meta
function getMeta(tasks) {
	for (i=0;i<tasks.length;i++) {
		var taskText = tasks[i].text;
		var dueMatch = taskText.match(/\📅\W(\d{4}\-\d{2}\-\d{2})/);
		if (dueMatch) {
			tasks[i].due = dueMatch[1];
			tasks[i].text = tasks[i].text.replace(dueMatch[0], "");
		};
		var startMatch = taskText.match(/\🛫\W(\d{4}\-\d{2}\-\d{2})/);
		if (startMatch) {
			tasks[i].start = startMatch[1];
			tasks[i].text = tasks[i].text.replace(startMatch[0], "");
		};
		var scheduledMatch = taskText.match(/\⏳\W(\d{4}\-\d{2}\-\d{2})/);
		if (scheduledMatch) {
			tasks[i].scheduled = scheduledMatch[1];
			tasks[i].text = tasks[i].text.replace(scheduledMatch[0], "");
		};
		var completionMatch = taskText.match(/\✅\W(\d{4}\-\d{2}\-\d{2})/);
		if (completionMatch) {
			tasks[i].completion = completionMatch[1];
			tasks[i].text = tasks[i].text.replace(completionMatch[0], "");
		};
		var repeatMatch = taskText.indexOf("🔁");
		if (repeatMatch>-1) {
			tasks[i].recurrence = true;
			tasks[i].text = tasks[i].text.substring(0, repeatMatch)
		};
		var lowMatch = taskText.indexOf("🔽");
		if (lowMatch>-1) {
			tasks[i].priority = "D";
		};
		var mediumMatch = taskText.indexOf("🔼");
		if (mediumMatch>-1) {
			tasks[i].priority = "B";
		};
		var highMatch = taskText.indexOf("⏫");
		if (highMatch>-1) {
			tasks[i].priority = "A";
		};
		if (lowMatch<0 && mediumMatch<0 && highMatch<0) {
			tasks[i].priority = "C";
		}
		if (globalTaskFilter) {
			tasks[i].text = tasks[i].text.replaceAll(globalTaskFilter,"");
		} else {
			tasks[i].text = tasks[i].text.replaceAll("#task","");
		};
		tasks[i].text = tasks[i].text.replace(/(\[).*(\:\:).*(\])/gm,"");
		tasks[i].text = tasks[i].text.replaceAll("[","");
		tasks[i].text = tasks[i].text.replaceAll("]","");
	};
};

// Get Filename From Task
function getFilename(path) {
	var filename = path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)[1];
	return filename;
};

// Get Note Color
function getColor(task) {
	var color = dv.pages('"'+task.link.path+'"').color[0];
	if (color) { return color } else { return "" };
};

// Get Note Icon
function getIcon(task) {
	var icon = dv.pages('"'+task.link.path+'"').icon[0];
	if (icon) { return icon } else { return "" };
};

// Filter Tasks
function getTasks(date) {
	done = tasks.filter(t=>t.completed && t.checked && t.completion && moment(t.completion.toString()).isSame(date)).sort(t=>t.priority && t.completion);
	doneWithoutCompletionDate = tasks.filter(t=>t.completed && t.checked && !t.completion && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
	done = done.concat(doneWithoutCompletionDate);
	due = tasks.filter(t=>!t.completed && !t.checked && !t.recurrence && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.priority && t.due);
	recurrence = tasks.filter(t=>!t.completed && !t.checked && t.recurrence && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.priority && t.due);
	overdue = tasks.filter(t=>!t.completed && !t.checked && t.due && moment(t.due.toString()).isBefore(date)).sort(t=>t.priority && t.due);
	start = tasks.filter(t=>!t.completed && !t.checked && t.start && moment(t.start.toString()).isSame(date)).sort(t=>t.priority && t.start);
	scheduled = tasks.filter(t=>!t.completed && !t.checked && t.scheduled && moment(t.scheduled.toString()).isSame(date)).sort(t=>t.priority && t.scheduled);
	process = tasks.filter(t=>!t.completed && !t.checked && t.due && t.start && moment(t.due.toString()).isAfter(date) && moment(t.start.toString()).isBefore(date) );
	cancelled = tasks.filter(t=>!t.completed && t.checked && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.priority && t.due);
}

// Set Task
function setTask(obj, type) {
	var noteColor = getColor(obj);
	var noteIcon = getIcon(obj);
	var taskText = obj.text.replace("'", "&apos;");
	var taskPath = obj.link.path.replace("'", "&apos;");
	var taskSubpath = obj.header.subpath;
	var taskLine = taskSubpath ? taskPath+"#"+taskSubpath : taskPath;
	var style = "";
	if (noteColor) { style = "color:" + noteColor + ";background:" + noteColor + transparency };
	if (noteIcon) { taskText =  noteIcon + taskText };
	var newTask = taskTemplate.replace("{{taskContent}}", taskText).replace("{{class}}", type).replace("{{taskPath}}", taskLine).replace("{{due}}","done").replaceAll("{{style}}",style).replace("{{title}}", getFilename(taskPath) + ": " + taskText);
	return newTask;
};

// Set Task And Append To Content Container
function setTaskContentContainer(currentDate) {
	var cellContent = "";
	
	function compareFn(a, b) {
		if (a.priority.toUpperCase() < b.priority.toUpperCase()) {
			return -1;
		};
		if (a.priority.toUpperCase() > b.priority.toUpperCase()) {
			return 1;
		};
		if (a.priority == b.priority) {
			if (a.text.toUpperCase() < b.text.toUpperCase()) {
				return -1;
			};
			if (a.text.toUpperCase() > b.text.toUpperCase()) {
				return 1;
			};
			return 0;
		};
	};

	function showTasks(tasksToShow, type) {
		const sorted = [...tasksToShow].sort(compareFn);
		for (var t = 0; t < sorted.length; t++) {
			cellContent += setTask(sorted[t], type)
		};
	};

	if (tToday == currentDate) {
		showTasks(overdue, "overdue");
	};
	showTasks(due, "due");
	showTasks(recurrence, "recurrence");
	showTasks(start, "start");
	showTasks(scheduled, "scheduled");
	showTasks(process, "process");
	showTasks(done, "done");
	showTasks(cancelled, "cancelled");
	return cellContent;
};

// Set Buttons
function setButtons() {
	var buttons = "<div class='switch'><button class='monthView' title='Month'>"+monthIcon+"</button><button class='agendaView' title='Agenda'>"+agendaIcon+"</button><button class='widgetView' title='Widget'>"+widgetIcon+"</button></div><button class='current'></button><div class='switch'><button class='previous'>"+arrowLeftIcon+"</button><button class='next'>"+arrowRightIcon+"</button></div><button class='filter'>"+filterIcon+"</button>";
	rootNode.querySelector("span").appendChild(dv.el("div", buttons, {cls: "buttons", attr: {}}));
	rootNode.querySelector("button."+view+"View").classList.add("active");
	rootNode.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (() => {
		var activeView = rootNode.querySelector(".grid").getAttribute("data-view");
		if ( btn.className == "previous" ) {
			if (activeView == "month") {
				selectedDate = moment(selectedDate).subtract(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "agenda") {
				selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			} else if (activeView == "widget") {
				selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWidget(tasks, selectedDate);
			}
		} else if ( btn.className == "current") {
			if (activeView == "month") {
				selectedDate = moment().date(1);
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "agenda") {
				selectedDate = moment().startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			} else if (activeView == "widget") {
				selectedDate = moment().startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWidget(tasks, selectedDate);
			}
		} else if ( btn.className == "next" ) {
			if (activeView == "month") {
				selectedDate = moment(selectedDate).add(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "agenda") {
				selectedDate = moment(selectedDate).add(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			} else if (activeView == "widget") {
				selectedDate = moment(selectedDate).add(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWidget(tasks, selectedDate);
			}
		} else if ( btn.className == "filter" ) {
			rootNode.classList.toggle("noDone");
		} else if ( btn.className == "filter" ) {
			rootNode.classList.toggle("noDone");
		} else if ( btn.className == "monthView" ) {
			rootNode.querySelector("button.active").classList.remove("active");
			btn.classList.add("active");
			selectedDate = moment(selectedDate).date(1);
			rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
			getMonth(tasks, selectedDate);
		} else if ( btn.className == "agendaView" ) {
			rootNode.querySelector("button.active").classList.remove("active");
			btn.classList.add("active");
			if (activeView == "month" && moment().format("MM-YYYY") != moment(selectedDate).format("MM-YYYY")) {
				selectedDate = moment(selectedDate).add(14, "days").startOf("week");
			} else if (activeView == "widget") {
				selectedDate = moment(selectedDate).startOf("week");
			} else {
				selectedDate = moment().startOf("week");
			};
			rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
			getAgenda(tasks, selectedDate);
		} else if ( btn.className == "widgetView" ) {
			rootNode.querySelector("button.active").classList.remove("active");
			btn.classList.add("active");
			if (activeView == "month" && moment().format("MM-YYYY") != moment(selectedDate).format("MM-YYYY")) {
				selectedDate = moment(selectedDate).add(14, "days").startOf("week");
			} else if (activeView == "agenda") {
				selectedDate = moment(selectedDate).startOf("week");
			} else {
				selectedDate = moment().startOf("week");
			};
			rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
			getWidget(tasks, selectedDate);
		};
	})));
};

// tasksCalendar: monthView
function getMonth(tasks, month) {
	
	// Set Month Title
	rootNode.querySelector('button.current').innerText = moment(month).format("MMM YYYY");

	// Build Grid
	var gridContent = "";
	
	var firstDayOfMonth = moment(month).format("d");
	var lastDayOfMonth = moment(month).endOf("month").format("D");
	
	// Move First Week Of Month To Second Week In Month View
	if (firstDayOfMonth == 0) { firstDayOfMonth = 7};
	
	// Set Grid Heads
	for (h=0-firstDayOfMonth+firstDayOfWeek;h<7-firstDayOfMonth+firstDayOfWeek;h++) {
		var weekDayNr = moment(month).add(h, "days").format("d");
		var weekDayName = moment(month).add(h, "days").format("ddd");
		if ( tDay == weekDayNr && tMonth == moment(month).format("M") && tYear == moment(month).format("YYYY") ) {
			gridContent += "<div class='gridHead today' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
		} else {
			gridContent += "<div class='gridHead' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
		};
	};
	
	for (i=0-firstDayOfMonth+firstDayOfWeek;i<42-firstDayOfMonth+firstDayOfWeek;i++) {
		var currentDate = moment(month).add(i, "days").format("YYYY-MM-DD");
		var dailyNote = dailyNoteFolder ? dailyNoteFolder+"/"+currentDate : currentDate;
		var weekDay = moment(month).add(i, "days").format("d");
		var weekNr = moment(month).add(i, "days").format("[W]w");
		var weekNrSpan = "<span class='weekNr'>"+weekNr+"</span>";
		var shortDayName = moment(currentDate).format("D");
		var longDayName = moment(currentDate).format("D. MMM");
		var shortWeekday = moment(currentDate).format("ddd");
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = setTaskContentContainer(currentDate);
	
		// Set Cell Name And Weekday
		if ( moment(month).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
			cell = cell.replace("{{class}}", "{{class}} newMonth");
		} else {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+shortDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
		};
	
		// Set prevMonth, currentMonth, nextMonth
		if (i < 0) {
			cell = cell.replace("{{class}}", "prevMonth");
		} else if (i >= 0 && i < lastDayOfMonth && tToday !== currentDate) {
			cell = cell.replace("{{class}}", "currentMonth");
		} else if ( i >= 0 && i< lastDayOfMonth && tToday == currentDate) {
			cell = cell.replace("{{class}}", "currentMonth today");
		} else if (i >= lastDayOfMonth) {
			cell = cell.replace("{{class}}", "nextMonth");
		};
	
		gridContent += cell;
	};

	// Set Grid Content
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': "month"}}));
};
	
// tasksCalendar: agendaView
function getAgenda(tasks, week) {
	
	// Set Week Title
	rootNode.querySelector('button.current').innerText = moment(week).format("MMM YYYY");

	// Build Grid
	var gridContent = "";
	
	var currentWeekday = moment(week).format("d");
	
	for (i=0-currentWeekday+firstDayOfWeek;i<7-currentWeekday+firstDayOfWeek;i++) {
		var currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
		var dailyNote = dailyNoteFolder ? dailyNoteFolder+"/"+currentDate : currentDate;
		var weekDay = moment(week).add(i, "days").format("d");
		var dayName = moment(currentDate).format("ddd D.");
		var longDayName = moment(currentDate).format("ddd, D. MMM");
		var weekNr = moment(currentDate).add(i, "days").format("[W]w");
		var weekNrSpan = "<span class='weekNr'>"+weekNr+"</span>";
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = setTaskContentContainer(currentDate);
		
		// Set Cell Name And Weekday
		if ( moment(week).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
			cell = cell.replace("{{class}}", "{{class}} newMonth");
		} else {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+dayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
		};
		
		// Set Today, Before Today, After Today
		if (currentDate < tToday) {
			cell = cell.replace("{{class}}", "beforeToday");
		} else if (currentDate == tToday) {
			cell = cell.replace("{{class}}", "today");
		} else if (currentDate > tToday) {
			cell = cell.replace("{{class}}", "afterToday");
		};
	
		gridContent += cell;
	};

	// Set Grid Content
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': "agenda"}}));
};


// tasksCalendar: widgetView
function getWidget(tasks, week) {
	
	// Set Week Title
	rootNode.querySelector('button.current').innerText = moment(week).format("MMM YYYY");

	// Build Grid
	var gridContent = "";
	
	var currentWeekday = moment(week).format("d");
	
	for (i=0-currentWeekday+firstDayOfWeek;i<7-currentWeekday+firstDayOfWeek;i++) {
		var currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
		var dailyNote = dailyNoteFolder ? dailyNoteFolder+"/"+currentDate : currentDate;
		var weekDay = moment(week).add(i, "days").format("d");
		var dayName = moment(currentDate).format("ddd D.");
		var longDayName = moment(currentDate).format("ddd, D. MMM");
		var weekNr = moment(currentDate).add(i, "days").format("[W]w");
		var weekNrSpan = "<span class='weekNr'>"+weekNr+"</span>";
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = setTaskContentContainer(currentDate);
	
		// Set Cell Name And Weekday
		if ( moment(week).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
			cell = cell.replace("{{class}}", "{{class}} newMonth");
		} else {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", weekNrSpan+dayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
		};
		
		// Set Today, Before Today, After Today
		if (currentDate < tToday) {
			cell = cell.replace("{{class}}", "beforeToday");
		} else if (currentDate == tToday) {
			cell = cell.replace("{{class}}", "today");
		} else if (currentDate > tToday) {
			cell = cell.replace("{{class}}", "afterToday");
		};
		
		gridContent += cell;
	};
	
	// SetGrid Content
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': "widget"}}));
	};
