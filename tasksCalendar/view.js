let {pages, view, firstDayOfWeek, globalTaskFilter, dailyNoteFolder, startPosition, dql, options} = input;

// Get, Set, Eval Pages
if (pages=="") {
	var tasks = dv.pages().file.tasks;
} else {
	if (pages.startsWith("dv.pages")) {
		var tasks = eval(pages);
	} else {
		var tasks = dv.pages(pages).file.tasks;
	};
};

// Variables
var done, doneWithoutCompletionDate, due, recurrence, overdue, start, scheduled, process, cancelled, dailyNote;
var tToday = moment().format("YYYY-MM-DD");
var tMonth = moment().format("M");
var tDay = moment().format("d");
var tYear = moment().format("YYYY");
var dateformat = "ddd, D. MMM";
var tid = (new Date()).getTime();
startPosition == null ? "" : startPosition;
var selectedMonth = moment(startPosition).date(1);
var selectedWeek = moment(startPosition).startOf("week");
var selectedDate = eval("selected"+capitalize(view));
var arrowLeftIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
var arrowRightIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
var filterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';
var monthIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>';
var weekIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M17 14h-6"></path><path d="M13 18H7"></path><path d="M7 14h.01"></path><path d="M17 18h.01"></path></svg>';
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><a class='internal-link cellName' href='{{dailyNote}}'>{{cellName}}</a><div class='cellContent'>{{cellContent}}</div></div>";
var taskTemplate = "<a class='internal-link' href='{{taskPath}}'><div class='task {{class}}' style='{{style}}' title='{{title}}'><div class='inner'>{{taskContent}}</div></div></a>";
const rootNode = dv.el("div", "", {cls: "tasksCalendar "+options, attr: {id: "tasksCalendar"+tid, view: view}});

// Initialze
getMeta(tasks);
setButtons();
eval("get"+capitalize(view))(tasks, selectedDate);

function getMeta(tasks) {
	for (i=0;i<tasks.length;i++) {
		var taskText = tasks[i].text;
		var taskFile = getFilename(tasks[i].path);
		var dailyNoteMatch = taskFile.match(/(\d{4}\-\d{2}\-\d{2})/);
		var dailyTaskMatch = taskText.match(/(\d{4}\-\d{2}\-\d{2})/);
		if (dailyNoteMatch) {
			if(!dailyTaskMatch) {
				tasks[i].dailyNote = dailyNoteMatch[1];
			};
		};
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

function getFilename(path) {
	var filename = path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)[1];
	return filename;
};

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
};

function getColor(task) {
	var color = dv.pages('"'+task.link.path+'"').color[0];
	if (color) { return color } else { return "" };
};

function getIcon(task) {
	var icon = dv.pages('"'+task.link.path+'"').icon[0];
	if (icon) { return icon } else { return "" };
};

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
	dailyNote = tasks.filter(t=>!t.completed && !t.checked && t.dailyNote && moment(t.dailyNote.toString()).isSame(date)).sort(t=>t.dailyNote);
};

function setTask(obj, type) {
	var noteColor = getColor(obj);
	var noteIcon = getIcon(obj);
	var taskText = obj.text.replace("'", "&apos;");
	var taskPath = obj.link.path.replace("'", "&apos;");
	var taskSubpath = obj.header.subpath;
	var taskLine = taskSubpath ? taskPath+"#"+taskSubpath : taskPath;
	var style = "";
	// if (noteColor) { style = "color:" + noteColor + ";background:" + noteColor + transparency };
	if (noteColor) {
		style = "--task-background:"+noteColor+"33;--task-color:"+noteColor;
	} else {
		style = "--task-background:#7D7D7D33;--task-color:#7D7D7D";
	};
	if (noteIcon) { taskText =  noteIcon + taskText };
	var newTask = taskTemplate.replace("{{taskContent}}", taskText).replace("{{class}}", type).replace("{{taskPath}}", taskLine).replace("{{due}}","done").replaceAll("{{style}}",style).replace("{{title}}", getFilename(taskPath) + ": " + taskText);
	return newTask;
};

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
	showTasks(dailyNote, "dailyNote");
	showTasks(done, "done");
	showTasks(cancelled, "cancelled");
	return cellContent;
};

function setButtons() {
	var buttons = "<button class='monthView' title='Month'>"+monthIcon+"</button><button class='weekView' title='Week'>"+weekIcon+"</button><button class='current'></button><button class='previous'>"+arrowLeftIcon+"</button><button class='next'>"+arrowRightIcon+"</button><button class='filter'>"+filterIcon+"</button>";
	rootNode.querySelector("span").appendChild(dv.el("div", buttons, {cls: "buttons", attr: {}}));
	rootNode.querySelector("button."+view+"View").classList.add("active");
	setButtonEvents();
};

function setButtonEvents() {
	rootNode.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (() => {
		var activeView = rootNode.querySelector(".grid").getAttribute("data-view");
		if ( btn.className == "previous" ) {
			if (activeView == "month") {
				selectedDate = moment(selectedDate).subtract(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "week") {
				selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWeek(tasks, selectedDate);
			};
		} else if ( btn.className == "current") {
			if (activeView == "month") {
				selectedDate = moment().date(1);
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "week") {
				selectedDate = moment().startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWeek(tasks, selectedDate);
			};
		} else if ( btn.className == "next" ) {
			if (activeView == "month") {
				selectedDate = moment(selectedDate).add(1, "months");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getMonth(tasks, selectedDate);
			} else if (activeView == "week") {
				selectedDate = moment(selectedDate).add(7, "days").startOf("week");
				rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
				getWeek(tasks, selectedDate);
			};
		} else if ( btn.className == "filter" ) {
			rootNode.classList.toggle("noDone");
		} else if ( btn.className == "filter" ) {
			rootNode.classList.toggle("noDone");
		} else if ( btn.className == "monthView" ) {
			rootNode.querySelector("button.active").classList.remove("active");
			btn.classList.add("active");
			if ( moment().format("ww-YYYY") == moment(selectedDate).format("ww-YYYY") ) {
				selectedDate = moment().date(1);
			} else {
				selectedDate = moment(selectedDate).date(1);
			};
			rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
			getMonth(tasks, selectedDate);
		} else if ( btn.className == "weekView" ) {
			rootNode.querySelector("button.active").classList.remove("active");
			btn.classList.add("active");
			if (activeView == "month" && moment().format("MM-YYYY") != moment(selectedDate).format("MM-YYYY")) {
				selectedDate = moment(selectedDate).startOf("month").startOf("week");
			} else {
				selectedDate = moment().startOf("week");
			};
			rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
			getWeek(tasks, selectedDate);
		};
		btn.blur();
	})));
};

function setWrapperEvents() {
	rootNode.querySelectorAll('.wrapperButton').forEach(wBtn => wBtn.addEventListener('click', (() => {
		var week = wBtn.getAttribute("data-week");
		var year = wBtn.getAttribute("data-year");
		selectedDate = moment(moment(year).add(week, "weeks")).startOf("week");
		rootNode.querySelector("button.active").classList.remove("active");
		rootNode.querySelector(".weekView").classList.add("active");
		rootNode.querySelector(`#tasksCalendar${tid} .grid`).remove();
		getWeek(tasks, selectedDate);
	})));
};

function getMonth(tasks, month) {
	var currentTitle = "<span>"+moment(month).format("MMMM")+"</span><span> "+moment(month).format("YYYY");
	rootNode.querySelector('button.current').innerHTML = currentTitle;
	var gridContent = "";
	var firstDayOfMonth = moment(month).format("d");
	var lastDayOfMonth = moment(month).endOf("month").format("D");
	
	// Move First Week Of Month To Second Week In Month View
	if (firstDayOfMonth == 0) { firstDayOfMonth = 7};
	
	// Set Grid Heads
	var gridHeads = "";
	for (h=0-firstDayOfMonth+firstDayOfWeek;h<7-firstDayOfMonth+firstDayOfWeek;h++) {
		var weekDayNr = moment(month).add(h, "days").format("d");
		var weekDayName = moment(month).add(h, "days").format("ddd");
		if ( tDay == weekDayNr && tMonth == moment(month).format("M") && tYear == moment(month).format("YYYY") ) {
			gridHeads += "<div class='gridHead today' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
		} else {
			gridHeads += "<div class='gridHead' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
		};
	};
	gridContent += "<div class='gridHeads'><div class='gridHead'></div>"+gridHeads+"</div>";
	
	// Set Wrappers
	var wrappers = "";
	var start = 0-firstDayOfMonth+firstDayOfWeek;
	for (w=1; w<7; w++) {
		var wrapper = "";
		var weekNr = "";
		var yearNr = "";
		var monthName = moment(month).format("MMM").replace(".","").substring(0,3);
		for (i=start;i<start+7;i++) {
			if (i==start) {
				weekNr = moment(month).add(i, "days").format("w");
				yearNr = moment(month).add(i, "days").format("YYYY");
			};
			var currentDate = moment(month).add(i, "days").format("YYYY-MM-DD");
			var dailyNote = dailyNoteFolder ? dailyNoteFolder+"/"+currentDate : currentDate;
			var weekDay = moment(month).add(i, "days").format("d");
			var shortDayName = moment(month).add(i, "days").format("D");
			var longDayName = moment(month).add(i, "days").format("D. MMM");
			var shortWeekday = moment(month).add(i, "days").format("ddd");

			// Filter Tasks
			getTasks(currentDate);
		
			// Set New Content Container
			var cellContent = setTaskContentContainer(currentDate);
		
			// Set Cell Name And Weekday
			if ( moment(month).add(i, "days").format("D") == 1 ) {
				var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
				cell = cell.replace("{{class}}", "{{class}} newMonth");
			} else {
				var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", shortDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
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
			wrapper += cell;
		};
		wrappers += "<div class='wrapper'><div class='wrapperButton' data-week='"+weekNr+"' data-year='"+yearNr+"'>W"+weekNr+"</div>"+wrapper+"</div>";
		start += 7;
	};
	gridContent += "<div class='wrappers' data-month='"+monthName+"'>"+wrappers+"</div>";
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': "month"}}));
	setWrapperEvents();
};

function getWeek(tasks, week) {
	var currentTitle = "<span>"+moment(week).format("YYYY")+"</span><span> "+moment(week).format("[W]w");
	rootNode.querySelector('button.current').innerHTML = currentTitle
	var gridContent = "";
	var currentWeekday = moment(week).format("d");
	var weekNr = moment(week).format("[W]w");
	for (i=0-currentWeekday+firstDayOfWeek;i<7-currentWeekday+firstDayOfWeek;i++) {
		var currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
		var dailyNote = dailyNoteFolder ? dailyNoteFolder+"/"+currentDate : currentDate;
		var weekDay = moment(week).add(i, "days").format("d");
		var dayName = moment(currentDate).format("ddd D.");
		var longDayName = moment(currentDate).format("ddd, D. MMM");
		
		// Filter Tasks
		getTasks(currentDate);
	
		// Set New Content Container
		var cellContent = setTaskContentContainer(currentDate);
		
		// Set Cell Name And Weekday
		var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);

		// Set Cell Name And Weekday
		if ( moment(week).add(i, "days").format("D") == 1 ) {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", longDayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
		} else {
			var cell = cellTemplate.replace("{{date}}", currentDate).replace("{{cellName}}", dayName).replace("{{cellContent}}", cellContent).replace("{{weekday}}", weekDay).replace("{{dailyNote}}", dailyNote);
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
	rootNode.querySelector("span").appendChild(dv.el("div", gridContent, {cls: "grid", attr:{'data-view': "week", 'data-week': weekNr}}));
};
