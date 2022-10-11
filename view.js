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
var done, doneWithoutCompletionDate, due, recurrence, overdue, start, scheduled, progress, cancelled;

// Templates
var gridTemplate = "<div class='grid' data-view='{{view}}'>{{gridContent}}</div>";
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><div class='cellName'>{{cellName}}</div><div class='cellContent'>{{cellContent}}</div></div>";
var taskTemplate = "<a class='internal-link' href='{{taskPath}}'><div class='task {{class}}' style='color:{{color}};background:{{background}}33' title='{{title}}'>{{taskContent}}</div></a>";

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
			tasks[i].start = scheduledMatch[1];
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
	progress = tasks.filter(t=>!t.completed && !t.checked && t.due && t.start && moment(t.due.toString()).isAfter(date) && moment(t.start.toString()).isBefore(date) );
	cancelled = tasks.filter(t=>!t.completed && t.checked && t.due && moment(t.due.toString()).isSame(date)).sort(t=>t.due);
}

// Set Task
function setTask(obj, type, cssClass) {
	var noteColor = getColor(obj);
	var noteIcon = getIcon(obj);
	var newTask = taskTemplate.replace("{{taskContent}}", noteIcon+obj.text).replace("{{class}}",type + " " + cssClass).replace("{{taskPath}}", obj.header.path+"#"+obj.header.subpath).replace("{{due}}","done").replaceAll("{{color}}",noteColor).replaceAll("{{background}}",noteColor).replace("{{title}}", getFilename(obj.link.path) + ": " + obj.text);
	return newTask;
}


// tasksCalendar: monthView

function monthView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");

	// Buttons
	var buttons = "<div class='buttons'><button id='prevMonth'>←</button><button id='currMonth'></button><button id='nextMonth'>→</button></div>";
	dv.el(view+"ViewButtons", buttons)
	
	//var selectedDate = moment().date(1);
	var selectedDate = moment().startOf("month");
	var selectedMonth = moment(selectedDate).format("M");
	getMonth(tasks, selectedDate);
	
	document.querySelectorAll("button").forEach(btn => btn.addEventListener('click', (() => {
		document.querySelectorAll("monthView").forEach(function(el){
			el.remove();
		});
		if ( btn.id == "prevMonth" ) {
			selectedDate = moment(selectedDate).subtract(1, "months");
			selectedMonth = moment(selectedDate).format("M");
		} else if ( btn.id == "currMonth") {
			selectedDate = moment().date(1);
			selctedMonth = moment(selectedDate).format("M");
		} else if ( btn.id == "nextMonth" ) {
			selectedDate = moment(selectedDate).add(1, "months");
			selectedMonth = moment(selectedDate).format("M");
		};
		getMonth(tasks, selectedDate);
	})));
	
};

function getMonth(tasks, month, option) {
	
	// Set Month Title
	document.querySelectorAll('button[id=currMonth]').forEach(function(btn){
		btn.innerText = moment(month).format("MMMM YYYY");
	});

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
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue " + options)}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due " + options)};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence " + options)};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start " + options)};
		for (var t=0; t<progress.length; t++) {cellContent += setTask(progress[t], "progress " + options)};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done " + options)};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled " + options)};
		
		// Add WeekNr To First Day Of Week
		if (weekDay == firstDayOfWeek) {
			longDayName = "<strong>" + weekNr + "</strong>" + longDayName;
			shortDayName = "<strong>" + weekNr + "</strong>" + shortDayName;
		};
	
		// Set Cell Name And Weekday
		if ( moment(month).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay);
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
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view);
	
	// Add Grid To Document
	dv.el(view+"View", grid)

};
	
// tasksCalendar: weekView

function weekView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");
	
	// Buttons
	var buttons = "<div class='buttons'><button id='prevWeek'>←</button><button id='currWeek'></button><button id='nextWeek'>→</button></button>";
	dv.el(view+"ViewButtons", buttons)
	
	selectedDate = moment().startOf("week");
	getWeek(tasks, selectedDate);
	
	document.querySelectorAll("button").forEach(btn => btn.addEventListener('click', (() => {
		document.querySelectorAll("weekView").forEach(function(el){
			el.remove();
		});
		if ( btn.id == "prevWeek" ) {
			selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
		} else if ( btn.id == "currWeek") {
			selectedDate = moment().startOf("week");
		} else if ( btn.id == "nextWeek" ) {
			selectedDate = moment(selectedDate).add(7, "days").startOf("week");
		};
		getWeek(tasks, selectedDate);
	})));
};

function getWeek(tasks, week) {
	
	// Set Week Title
	document.querySelectorAll('button[id=currWeek]').forEach(function(btn){
		btn.innerText = moment(week).format("YYYY [W]w");
	});

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
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue " + options)}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due " + options)};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence " + options)};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start " + options)};
		for (var t=0; t<progress.length; t++) {cellContent += setTask(progress[t], "progress " + options)};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done " + options)};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled " + options)};
	
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
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view);
	
	// Add Grid To Document
	dv.el(view+"View", grid)
	
	if (options.indexOf("vertical") > -1 ) {
		var grid = document.querySelector(".grid[data-view='week']");
		if (firstDayOfWeek == 0) {
			var order = [0,4,1,5,2,6,3,7];
		} else if (firstDayOfWeek == 1) {
			var order = [1,5,2,6,3,0,4,7];
		};
		for (i=1;i<8;i++) {
			console.log("Index: " + i + " :: " + "Order: " + order[i]);
			var cell = document.querySelector(".cell[data-weekday='" + order[i] + "']");
			grid.appendChild(cell);
		};
	};

};

	
// tasksCalendar: widgetView

function widgetView(tasks) {
	
	// Refresh Today
	tToday = moment().format("YYYY-MM-DD");
	
	// Buttons
	var buttons = "<div class='buttons'><button id='prevWeek'>←</button><button id='currWeek'></button><button id='nextWeek'>→</button></button>";
	dv.el(view+"ViewButtons", buttons)
	
	selectedDate = moment().startOf("week");
	getWidget(tasks, selectedDate);
	
	document.querySelectorAll("button").forEach(btn => btn.addEventListener('click', (() => {
		document.querySelectorAll("widgetView").forEach(function(el){
			el.remove();
		});
		if ( btn.id == "prevWeek" ) {
			selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
		} else if ( btn.id == "currWeek") {
			selectedDate = moment().startOf("week");
		} else if ( btn.id == "nextWeek" ) {
			selectedDate = moment(selectedDate).add(7, "days").startOf("week");
		};
		getWidget(tasks, selectedDate);
	})));
};

function getWidget(tasks, week) {
	
	// Set Week Title
	document.querySelectorAll('button[id=currWeek]').forEach(function(btn){
		btn.innerText = moment(week).format("MMM YYYY [W]w");
	});

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
		if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue " + options)}};
		for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due " + options)};
		for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence " + options)};
		for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start " + options)};
		for (var t=0; t<progress.length; t++) {cellContent += setTask(progress[t], "progress " + options)};
		for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done " + options)};
		for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled " + options)};
	
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
	var grid = gridTemplate.replace("{{gridContent}}", gridContent).replace("{{view}}",view);
	
	// Add Grid To Document
	dv.el(view+"View", grid)
	
};
