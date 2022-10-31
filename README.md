# Obsidian-Tasks-Calendar
Dataview snippet to show tasks in different calendar views


## Story
All Obsidian and Task Plugin users love the program. What has been set up with the Task Plugin is just great and helps so many people to organize their work. However, just listing tasks according to certain criteria is sometimes a bit boring. To get a quick visual impression of one's workday/workweek/workmonth, a calendar view would be ideal. To be honest, I'm too stupid to program my own plugins for Obsidian, but I know some Javascript, so I programmed this Dataview snippet. I hope to offer many people a good addition to the Task Plugin and hope for an integration into the Task Plugin someday. But I'm sure there are better programmers out there, who can make my code, which is probably horrible for professionals, much better.

## Update 1.2.0
The concept of Obsidian Task Calendar has been fundamentally revised. The goal is to provide the user with two different calendar views. **By selecting a week in the month view, the user should be able to jump directly to the week view**. However, if several different week views exist, it has to be defined somehow which one should be displayed when selected. For this reason I decided to **remove the third calendar view** (widget). So now there is a month view to big overview and a week based detail view. But don't worry, the display of the week view can be customized to the user's needs with different styles. **With this approach, the calendar perspectives could be reduced to two, but at the same time the possible styles of the week view could be multiplied.** Thus, the Obsidian Task Calendar is customizable like never before and more week view styles are to follow in the future.
Likewise, users kept asking me about the daily notes. Originally, Obsidian-Task-Calendar was intended exclusively for the **[Obsidian-Task-Plugin](https://github.com/obsidian-tasks-group/obsidian-tasks)** with its own syntax and shall continue to be the main focus. Nevertheless, with this update there is now also the option to **display all tasks from daily notes in the calendar**, even if they have not been assigned any date (due, start, scheduled, etc.). In this case, the tasks are assigned to the date from the file name of the daily note and displayed accordingly in the calendar. Only the standard Obsidian nomenclature `YYYY-MM-DD` is supported here. **For the reasons mentioned above, I do not plan to allow customization here.**

## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "tasksCalendar" or any other name and paste the files "view.js" and "view.css" into it

    <img width="259" alt="Bildschirm­foto 2022-10-30 um 10 00 03" src="https://user-images.githubusercontent.com/59178587/198870629-392cb4fe-654a-421c-b8fb-d4b66def329b.png">

3.  Create a new note or edit an existing one and add the following code line:

    ````
    ```dataviewjs
    dv.view("tasksCalendar", {pages: "", view: "month", firstDayOfWeek: 1, globalTaskFilter: "#task", dailyNoteFolder: "", options: "style1"})
    ```
    ````
    
    If you paste the main files (js/css) into another folder then "tasksCalendar", you have to replace the name between the first quotation marks.
 
 4. There are 4 different variables to set path/location as "pages", calendar view style as "view", first day of the week (0 or 1) as "firstDayOfWeek" and some style classes as "options"

---
### pages:
```
pages: ""
```
Get all tasks from all notes in obsidian.

```
pages: '"Task Management/Work"'
```
Set a custom folder to get tasks from.

The dv.pages command is the same and works exactly the same like in dataview-plugin. For help and instruction take a look here [Dataview Help](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvpagessource)

    
---
### view:
```
view: "month"
view: "week"
```
With the view parameter you can set the default selected calendar
  
---
### firstDayOfWeek:
```
firstDayOfWeek: 1
firstDayOfWeek: 0
```
Set monday (1) or sunday (0) as first day of week

---
### dailyNoteFolder:
```
dailyNoteFolder: ""
dailyNoteFolder: "MyCustomFolder"
dailyNoteFolder: "Inbox/Daily Notes/Work"
```
This parameter must only be specified if this is to be used. Here you can define a custom folder path for the daily notes if they should not be saved in the default folder for new files. Of course, folder structures with several levels can also be defined here. This paramter 

---
### globalTaskFilter:
```
globalTaskFilter: ""
globalTaskFilter: "#task"
```
This parameter must only be specified if this is to be used. Set a global task filter to hide from task text/description inside tasks-calendar.

---
### options:
##### You can combine all available options

```
options: "noIcons"
```
Hide Task plugin Icons in front of each task

```
options: "noProcess"
```
The tasks with a start-date and a due-date are not displayed on all days between them

```
options: "noDailyNote"
```
Disable clickability of cell names to prevent unwanted jumps into daily-notes and hide daily notes inside calendar views

```
options: "mini"
```
Set smaller text on tasks, cell names and grid heads and reduces the height of the calendar grid.
On mobile devices, the font size is automatically reduced on month and widget calendar, because the limited screen size.


---

## Style options

```
options: "style1"
options: "style2"
options: "style3"
options: "style4"
options: "style5"
options: "style6"
```
There are different style options to change to look of the second calendar view (week)

![styles](https://user-images.githubusercontent.com/59178587/198985206-91e59b28-ee63-48c7-b998-b59db1f4f46e.png)

---

## Note color & icon
In each note file you can define custom "color" and "icon" to show up in the calendar. To do so, you only need to add the following metadata to the first line of your note.

```
---
color: "#bf5af2"
icon: "❤️"
---
```
    
The color should be hex in quotation marks to work properly. This color is set for text and as semi-transparent background. The icon itself is placed in front of each task to help identify where this task comes from.

---

## Filter
On the upper right corner of each calendar-view is a filter-icon to show or hide all completed/done tasks. The default-filter is set by options. If you have `noDone` inside your options parameter, the filter is enabled by default.

---

## How It Works
This snippet fetch all tasks with a date like due, start, scheduled, done. Tasks with a start and a due date are presented on all days from start to end (due). This way you can show up periods on you calendar like a holiday. This default handling can be disabled in `options` inside the dataviewjs code line by adding `noProcess`.

<img width="1115" alt="Bildschirm­foto 2022-10-30 um 10 23 43" src="https://user-images.githubusercontent.com/59178587/198871481-bd9d4b89-ff99-435c-8c30-625f27f1a4f7.png">

Hovering a task let popup a small info about the note and task (note-title: task-description). In the upper left corner is the calendar switcher, which can be used to switch between two different calendar views (month/week). Under `view` in the dataviewjs code line the default calendar view is set. When switching between the views, the calendar remains in the previous month. By clicking on the calendar header, you can return to today (the current month or week) at any time. The arrow keys in the upper right corner can be used to scroll backwards and forwards through the months/weeks. The filter in the upper right corner allows you to hide all finished tasks in the calendar. The filter itself can be switched on by default with `noDone` in the `options` within the dataviewjs code line.

<img width="1116" alt="Bildschirm­foto 2022-10-30 um 10 19 22" src="https://user-images.githubusercontent.com/59178587/198871327-7eb684f4-04ee-4155-83be-7016889b2fee.png">

After a task is completed the start- and scheduled dates are no longer needed and will be hidden. The task is now only displayed on the final completion date.

---

## Impressions

### Month Calendar
![Month](https://user-images.githubusercontent.com/59178587/198986791-85c1a346-fc53-4688-8764-72681c5834e7.png)

---

### Week Calendar (style6)
![Week (Style6)](https://user-images.githubusercontent.com/59178587/198986823-c2a7a9a2-4002-4394-a575-e2ad9cc388a8.png)

