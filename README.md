# Obsidian-Tasks-Calendar
Dataview snippet to show tasks in different calendar views


## Story
All Obsidian and Task Plugin users love the program. What has been set up with the Task Plugin is just great and helps so many people to organize their work. However, just listing tasks according to certain criteria is sometimes a bit boring. To get a quick visual impression of one's workday/workweek/workmonth, a calendar view would be ideal. To be honest, I'm too stupid to program my own plugins for Obsidian, but I know some Javascript, so I programmed this Dataview snippet. I hope to offer many people a good addition to the Task Plugin and hope for an integration into the Task Plugin someday. But I'm sure there are better programmers out there, who can make my code, which is probably horrible for professionals, much better.


## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "tasksCalendar" or any other name and paste the files "view.js" and "view.css" into it

    <img width="259" alt="Bildschirm­foto 2022-10-30 um 10 00 03" src="https://user-images.githubusercontent.com/59178587/198870629-392cb4fe-654a-421c-b8fb-d4b66def329b.png">

3.  Create a new note or edit an existing one and add the following code line:

    ````
    ```dataviewjs
    dv.view("tasksCalendar", {pages: "", view: "month", firstDayOfWeek: 1, globalTaskFilter: "#task", dailyNoteFolder: "", options: ""})
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
```
Month calendar

```
view: "agenda"
```
Agenda calendar

```
view: "widget"
```
Widget calendar
    
---
### firstDayOfWeek:
```
firstDayOfWeek: 1
```
Set monday as first day of week

```
firstDayOfWeek: 0
```
Set sunday as first day of week

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
options: "noWeekNr"
```
Hide the week number in the first cell of each week

```
options: "mini"
```
Set smaller text on tasks, cell names and grid heads and reduces the height of the calendar grid.
On mobile devices, the font size is automatically reduced on month and widget calendar, because the limited screen size.

```
options: "horizontal"
```
Only supported on agenda calendar view. The sorting order of days is vertical (by column - top to bottom and from left to right) by default and can be switched to horizontal (by row - from left to right and top to bottom).

```
options: "noDone noDue noStart noProcess noScheduled noRecurrence"
```
Each task-group (done, due, start, process, scheduled, recurrence) can be hidden on all calendar-views.

```
options: "noDailyNote"
```
Disable clickability of date-headers/cellNames to prevent unwanted jumps into daily-notes

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
This snippet fetch all tasks with a date like due, start, scheduled, done. Tasks with a start and a due date are presented on all days from start to end (due). This way you can show up periods on you calendar like a holiday.

<img width="633" alt="Bildschirm­foto 2022-10-30 um 10 01 11" src="https://user-images.githubusercontent.com/59178587/198870677-be4465fc-017e-4e8f-844e-6c8a751e07e7.png">

Hovering a task let popup a small info about the note and the complete task title.

<img width="289" alt="Bildschirm­foto 2022-10-30 um 10 00 33" src="https://user-images.githubusercontent.com/59178587/198870683-f2463c62-3522-4646-9497-19114ba9b220.png">

After a task is completed the start- and scheduled dates are no longer needed and will be hidden. The task is now only displayed on the final completion date.

---

## Impressions

### Month Calendar
<img width="500" alt="Bildschirm­foto 2022-10-30 um 09 58 45" src="https://user-images.githubusercontent.com/59178587/198870787-402843d9-6b47-45ae-ace0-dfc0d04baa7b.png">

---

### Agenda Calendar
<img width="500" alt="Bildschirm­foto 2022-10-30 um 09 59 30" src="https://user-images.githubusercontent.com/59178587/198870790-f5373624-23aa-4557-b2d0-68b7c183b8d6.png">

---

### Widget Calendar
<img width="500" alt="Bildschirm­foto 2022-10-30 um 09 59 40" src="https://user-images.githubusercontent.com/59178587/198870795-06eb5c00-d45f-43ad-900a-46d142d29984.png">
