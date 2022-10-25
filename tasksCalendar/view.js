// Get Input
let {pages, view, firstDayOfWeek, globalTaskFilter, options} = input;

// Get Tasks From Pages
if (pages=="") {
	var tasks = dv.pages().file.tasks;
} else {
	//var tasks = dv.pages('"'+pages+'"').file.tasks;
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
var moreIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
var arrowLeftIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
var arrowRightIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
var filterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';

// Set Root Node
const rootNode = dv.el("div", "", {cls: "tasksCalendar "+options, attr: {id: "tasksCalendar"+tid, view: view}});

// Templates
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><div class='cellName'>{{cellName}}</div><div class='cellContent'>{{cellContent}}</div></div>";
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
		if (repeatMatch>0) {
			tasks[i].recurrence = true;
			tasks[i].text = tasks[i].text.substring(0, repeatMatch)
		};
		var lowMatch = taskText.indexOf("🔽");
		if (lowMatch>0) {
			tasks[i].priority = "C";
		};
		var mediumMatch = taskText.indexOf("🔼");
		if (mediumMatch>0) {
			tasks[i].priority = "B";
		};
		var highMatch = taskText.indexOf("⏫");
		if (highMatch>0) {
			tasks[i].priority = "A";
		};
		if (globalTaskFilter) { // remove global task filter
			tasks[i].text = tasks[i].text.replaceAll(globalTaskFilter,"");
		} else {
			tasks[i].text = tasks[i].text.replaceAll("#task","");
		};
		tasks[i].text = tasks[i].text.replace(/(\[).*(\:\:).*(\])/gm,""); // remove inline fields
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
	var taskText = obj.text;
	var style = "";
	if (noteColor) { style = "color:" + noteColor + ";background:" + noteColor + transparency };
	if (noteIcon) { taskText =  noteIcon + taskText };
	var newTask = taskTemplate.replace("{{taskContent}}", taskText).replace("{{class}}", type).replace("{{taskPath}}", obj.header.path+"#"+obj.header.subpath).replace("{{due}}","done").replaceAll("{{style}}",style).replace("{{title}}", getFilename(obj.link.path) + ": " + obj.text);
	return newTask;
};

// Set Task And Append To Content Container
function setTaskContentContainer(currentDate) {
	var cellContent = "";
	if (tToday == currentDate) {for (var t=0; t<overdue.length; t++) {cellContent += setTask(overdue[t], "overdue")}};
	for (var t=0; t<due.length; t++) {cellContent += setTask(due[t], "due")};
	for (var t=0; t<recurrence.length; t++) {cellContent += setTask(recurrence[t], "recurrence")};
	for (var t=0; t<start.length; t++) {cellContent += setTask(start[t], "start")};
	for (var t=0; t<scheduled.length; t++) {cellContent += setTask(scheduled[t], "start")};
	for (var t=0; t<process.length; t++) {cellContent += setTask(process[t], "process")};
	for (var t=0; t<done.length; t++) {cellContent += setTask(done[t], "done")};
	for (var t=0; t<cancelled.length; t++) {cellContent += setTask(cancelled[t], "cancelled")};
	return cellContent;
};

// Set Buttons
function setButtons() {
	var buttons = "<button class='more'>"+moreIcon+"</button><button class='previous'>"+arrowLeftIcon+"</button><button class='current'></button><button class='next'>"+arrowRightIcon+"</button><button class='filter'>"+filterIcon+"</button>";
	rootNode.querySelector("span").appendChild(dv.el("div", buttons, {cls: "buttons", attr: {}}));
	rootNode.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (() => {
		if ( btn.className == "previous" ) {
			if (view == "month") {
				selectedDate = moment(selectedDate).subtract(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (view == "agenda" || view == "widget") {
				selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			}
		} else if ( btn.className == "current") {
			if (view == "month") {
				selectedDate = moment().date(1);
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (view == "agenda") {
				selectedDate = moment().startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			} else if (view == "widget") {
				selectedDate = moment().startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWidget(tasks, selectedDate);
			}
		} else if ( btn.className == "next" ) {
			if (view == "month") {
				selectedDate = moment(selectedDate).add(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (view == "agenda") {
				selectedDate = moment(selectedDate).add(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getAgenda(tasks, selectedDate);
			} else if (view == "widget") {
				selectedDate = moment(selectedDate).add(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWidget(tasks, selectedDate);
			}
		} else if ( btn.className == "filter" ) {
			rootNode.classList.toggle("noDone");
		} else if ( btn.className == "more" ) {
			alert("Obsidian-Tasks-Calendar ❤️ 702573N");
		};
	})));
};

// tasksCalendar: monthView
function getMonth(tasks, month) {
	
	// Set Month Title
	rootNode.querySelector('button.current').innerText = moment(month).format("MMMM YYYY");

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
		var cellContent = setTaskContentContainer(currentDate);
		
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
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': view}}));
};
	
// tasksCalendar: agendaView
function getAgenda(tasks, week) {
	
	// Set Week Title
	rootNode.querySelector('button.current').innerText = moment(week).format("YYYY [W]w");

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
		var cellContent = setTaskContentContainer(currentDate);
	
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
	
	if (options.indexOf("backlog") > 0) {
		// Backlog
		var todo = tasks.filter(t=>!t.completed && !t.due && !t.start && !t.scheduled);
		var todos = "";
		for (var t=0; t<todo.length; t++) {
			todos += setTask(todo[t], "backlog " + options);
		};
		var ToDoBox = cellTemplate.replace("{{cellName}}", "Backlog").replace("{{cellContent}}", todos).replace("{{weekday}}","7").replace("{{class}}","");
		gridContent += ToDoBox;
	};

	// Set Grid Content
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': view}}));
};


// tasksCalendar: widgetView
function getWidget(tasks, week) {
	
	// Set Week Title
	rootNode.querySelector('button.current').innerText = moment(week).format("MMM YYYY [W]w");

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
		var cellContent = setTaskContentContainer(currentDate);
	
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
	
	// SetGrid Content
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': view}}));
};
