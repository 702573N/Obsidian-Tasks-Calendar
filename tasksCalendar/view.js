// Get Input
let {pages, view, firstDayOfWeek, options} = input;

// Get Tasks From Pages
if (pages=="") {
	var tasks = dv.pages().file.tasks;
} else {
	var tasks = dv.pages('"'+pages+'"').file.tasks;
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

// Templates
var gridTemplate = "<div class='grid {{class}}' data-view='{{view}}'>{{gridContent}}</div>";
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><div class='cellName'>{{cellName}}</div><div class='cellContent'>{{cellContent}}</div></div>";
var taskTemplate = "<a class='internal-link' href='{{taskPath}}'><div class='task {{class}}' style='{{style}}' title='{{title}}'>{{taskContent}}</div></a>";

// Switch
switch(view) {
	case "week":
		weekView(tasks);
	break;
	case "month":
		monthView(tasks);
	break;
	case "widget":
		widgetView(tasks);
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
		if (repeatMatch>0) {
			tasks[i].recurrence = true;
			tasks[i].text = tasks[i].text.substring(0, repeatMatch)
		};
		tasks[i].text = tasks[i].text.replaceAll("[","");
		tasks[i].text = tasks[i].text.replaceAll("]","");
	};
};

// Get Filename From Task
function getFilename(path) {
	return path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "");
};

// Get Note Color
function getColor(task) {
	var color = dv.pages('"'+task.link.path+'"').color[0];
	if (color) {
		return color;
	} else {
		return "";
	};
};

// Get Note Icon
function getIcon(task) {
	var icon = dv.pages('"'+task.link.path+'"').icon[0];
	if (icon) {
		return icon
	} else {
		return ""
	};
};

// Filter Tasks
function getTasks(date) {
	done = tasks.filter(t=>t.completed && t.checked && t.completion && moment(t.completion.toString()).isSame(date)).sort(t=>t.completion);
	doneWithoutCompletionDate = tasks.filter(t=>t.completed && t.checked && !t.completion && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
	done = done.concat(doneWithoutCompletionDate);
	due = tasks.filter(t=>!t.completed && !t.checked && !t.recurrence && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
	recurrence = tasks.filter(t=>!t.completed && !t.checked && t.recurrence && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
	overdue = tasks.filter(t=>!t.completed && !t.checked && t.due && moment(t.due.toString()).isBefore(date)).sort(t=>t.due);
	start = tasks.filter(t=>!t.completed && !t.checked && t.start && moment(t.start.toString()).isSame(date)).sort(t=>t.start);
	scheduled = tasks.filter(t=>!t.completed && !t.checked && t.scheduled && moment(t.scheduled.toString()).isSame(date)).sort(t=>t.scheduled);
	process = tasks.filter(t=>!t.completed && !t.checked && t.due && t.start && moment(t.due.toString()).isAfter(date) && moment(t.start.toString()).isBefore(date) );
	cancelled = tasks.filter(t=>!t.completed && t.checked && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
}

// Set Task
function setTask(obj, type) {
	var noteColor = getColor(obj);
	var noteIcon = getIcon(obj);
	var taskText = obj.text;
	var style = "";
	
	if (noteColor) {
		style = "color:" + noteColor + ";background:" + noteColor + transparency;
	};
	if (noteIcon) {
		taskText =  noteIcon + taskText;
	};
	
	var newTask = taskTemplate.replace("{{taskContent}}", taskText).replace("{{class}}", type).replace("{{taskPath}}", obj.header.path+"#"+obj.header.subpath).replace("{{due}}","done").replaceAll("{{style}}",style).replace("{{title}}", getFilename(obj.link.path) + ": " + obj.text);
	return newTask;
};

// Set Buttons
function setButtons() {
	var buttons = "<div class='buttons' id='buttons" + tid + "'><button id='prev"+tid+"'>←</button><button id='curr"+tid+"'></button><button id='next"+tid+"'>→</button></div>";
	dv.el("div", buttons, { cls: view+"ViewButtons", attr: {} });
};


// tasksCalendar: monthView

function monthView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");

	// Buttons
	setButtons();
	
	//var selectedDate = moment().date(1);
	var selectedDate = moment().startOf("month");
	var selectedMonth = moment(selectedDate).format("M");
	getMonth(tasks, selectedDate);
	
	document.querySelectorAll(`#buttons${tid} > button`).forEach(btn => btn.addEventListener('click', (() => {
		document.getElementById(`grid${tid}`).remove();
		if ( btn.id == "prev"+tid ) {
			selectedDate = moment(selectedDate).subtract(1, "months");
			selectedMonth = moment(selectedDate).format("M");
		} else if ( btn.id == "curr"+tid) {
			selectedDate = moment().date(1);
			selctedMonth = moment(selectedDate).format("M");
		} else if ( btn.id == "next"+tid ) {
			selectedDate = moment(selectedDate).add(1, "months");
			selectedMonth = moment(selectedDate).format("M");
		};
		getMonth(tasks, selectedDate);
	})));
};

function getMonth(tasks, month) {
	
	// Set Month Title
	document.getElementById(`curr${tid}`).innerText = moment(month).format("MMMM YYYY");

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
		var weekDay = moment(month).add(i, "days").format("d");
		var weekNr = moment(month).add(i, "days").format("[W]w");
		var shortDayName = moment(currentDate).format("D");
		var longDayName = moment(currentDate).format("D. MMM");
		var shortWeekday = moment(currentDate).format("ddd");
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = "";
	
		// Set Task And Append To Content Container
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue")}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due")};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence")};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start")};
		for (var t=0; t<scheduled.length; t++) {cellContent += setTask(scheduled[t], "scheduled")};
		for (var t=0; t<process.length; t++) {cellContent += setTask(process[t], "process")};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done")};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled")};
		
		// Add WeekNr To First Day Of Week
		if (weekDay == firstDayOfWeek) {
			longDayName = "<strong>" + weekNr + "</strong>" + longDayName;
			shortDayName = "<strong>" + weekNr + "</strong>" + shortDayName;
		};
	
		// Set Cell Name And Weekday
		if ( moment(month).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay);
			cell = cell.replace("{{class}}", "{{class}} newMonth");
		} else {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", shortDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay);
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
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view).replace("{{class}}",options);
	
	// Add Grid To Document
	dv.el("div", grid, { cls: view+"ViewGrid", attr: { id: "grid"+tid } });
};
	
// tasksCalendar: weekView

function weekView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");
	
	// Buttons
	setButtons();
	
	selectedDate = moment().startOf("week");
	getWeek(tasks, selectedDate);
	
	document.querySelectorAll(`#buttons${tid} > button`).forEach(btn => btn.addEventListener('click', (() => {
		document.getElementById(`grid${tid}`).remove();
		if ( btn.id == "prev"+tid ) {
			selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
		} else if ( btn.id == "curr"+tid ) {
			selectedDate = moment().startOf("week");
		} else if ( btn.id == "next"+tid ) {
			selectedDate = moment(selectedDate).add(7, "days").startOf("week");
		};
		getWeek(tasks, selectedDate);
	})));
};

function getWeek(tasks, week) {
	
	// Set Week Title
	document.getElementById(`curr${tid}`).innerText = moment(week).format("YYYY [W]w");

	// Build Grid
	var gridContent = "";
	
	var currentWeekday = moment(week).format("d");
	
	for (i=0-currentWeekday+firstDayOfWeek;i<7-currentWeekday+firstDayOfWeek;i++) {
		
		var currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
		var weekDay = moment(week).add(i, "days").format("d");
		var dayName = moment(currentDate).format("ddd, D. MMM")
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = "";
	
		// Set Task And Append To Content Container
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue")}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due")};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence")};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start")};
		for (var t=0; t<scheduled.length; t++) {cellContent += setTask(scheduled[t], "start")};
		for (var t=0; t<process.length; t++) {cellContent += setTask(process[t], "process")};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done")};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled")};
	
		// Set Cell Name And Weekday
		var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", dayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay);
			
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
	
	// Backlog
	var todo = tasks.filter(t=>!t.completed && !t.due && !t.start && !t.scheduled);
	var todos = "";
	for (var t=0; t<todo.length; t++) {
			todos += setTask(todo[t], "backlog " + options);
	};
	var ToDoBox = cellTemplate.replace("{{cellName}}", "Backlog").replace("{{cellContent}}", todos).replace("{{weekday}}","7").replace("{{class}}","");
	gridContent += ToDoBox;

	// Set Grid Content
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view).replace("{{class}}",options);
	
	// Add Grid To Document
	dv.el("div", grid, { cls: view+"ViewGrid", attr: { id: "grid"+tid } });
};

	
// tasksCalendar: widgetView

function widgetView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");
	
	// Buttons
	setButtons();
	
	selectedDate = moment().startOf("week");
	getWidget(tasks, selectedDate);
	
	document.querySelectorAll(`#buttons${tid} > button`).forEach(btn => btn.addEventListener('click', (() => {
		document.getElementById(`grid${tid}`).remove();
		if ( btn.id == "prev"+tid ) {
			selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
		} else if ( btn.id == "curr"+tid ) {
			selectedDate = moment().startOf("week");
		} else if ( btn.id == "next"+tid ) {
			selectedDate = moment(selectedDate).add(7, "days").startOf("week");
		};
		getWidget(tasks, selectedDate);
	})));
};

function getWidget(tasks, week) {
	
	// Set Week Title
	document.getElementById(`curr${tid}`).innerText = moment(week).format("MMM YYYY [W]w");

	// Build Grid
	var gridContent = "";
	
	var currentWeekday = moment(week).format("d");
	
	for (i=0-currentWeekday+firstDayOfWeek;i<7-currentWeekday+firstDayOfWeek;i++) {
		
		var currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
		var weekDay = moment(week).add(i, "days").format("d");
		var dayName = moment(currentDate).format("ddd D.")
	
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = "";
	
		// Set Task And Append To Content Container
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue")}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due")};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence")};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start")};
		for (var t=0; t<scheduled.length; t++) {cellContent += setTask(scheduled[t], "start")};
		for (var t=0; t<process.length; t++) {cellContent += setTask(process[t], "process")};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done")};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled")};
	
		// Set Cell Name And Weekday
		var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", dayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay);
			
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
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view).replace("{{class}}",options);
	
	// Add Grid To Document
	dv.el("div", grid, { cls: view+"ViewGrid", attr: { id: "grid"+tid } });
};
