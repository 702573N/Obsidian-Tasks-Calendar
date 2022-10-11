# Obsidian-Tasks-Calendar
Dataview snippet to show tasks in different calendar views


## Story
All Obsidian and Task Plugin users love the program. What has been set up with the Task Plugin is just great and helps so many people to organize their work. However, just listing tasks according to certain criteria is sometimes a bit boring. To get a quick visual impression of one's workday/workweek/workmonth, a calendar view would be ideal. To be honest, I'm too stupid to program my own plugins for Obsidian, but I know some Javascript, so I programmed this Dataview snippet. I hope to offer many people a good addition to the Task Plugin and hope for an integration into the Task Plugin someday. But I'm sure there are better programmers out there, who can make my code, which is probably horrible for professionals, much better.


## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "tasksCalendar" or any other name and paste the files "view.js" and "view.css" into it

    ![11](https://user-images.githubusercontent.com/59178587/195023158-99381088-0cc0-428e-8077-6ea66a388992.png)

3.  Create a new note or edit an existing one and add the following code line:

    ```dataviewjs
    '''dataviewjs
    dv.view("tasksCalendar", {pages: "", view: "month", options: "noIcons"})
    '''
    ```
    
    If you paste the main files (js/css) into another folder then "tasksCalendar", you have to replace the name between the first quotation marks.
 
 4. There are 3 different variables to set path/location as "pages, calendar view style as "view" and visibility of note icons as "options"
 
    ```
    pages: ""
    # get all tasks from all notes in obsidian
    
    pages: "Task Management/Work"
    # custom folder
    
    view: "month"
    # Month calendar
    
    view: "week"
    #  Week calendar, Agenda calendar
    
    view: "widget"
    # Widget calendar, small week calendar
 
    options: ""
    # Typical Task plugin icons in front of each task
    
    options: "noIcons"
    # Hide Task plugin Icons in front of each task
    
    options: "vertical"
    options: "horizontal"
    # The sorting order of days inside the week calendar can be changed between horizontal (left to right) and vertical (top to bottom).
    ```
    
5. In each note file you can define custom "color" and "icon" to show up in the calendar. To do so, you only need to add the following metadata to the first line of your note.

    ```
    ---
    color: "#bf5af2"
    icon: "🧫 "
    ---
    ```
    
The color should be hex in quotation marks to work properly. This color is set for text and as semi-transparent background. The icon itself is placed in front of each task to help identify where this task comes from.

6. The week calendar has an additional information which is not shown in the other calendar views. The last cell lists all uncompleted tasks without date (start, scheduled, due). This "backlog" always remains in the field of view when switching through the individual weeks and is intended to ensure that these tasks are not forgotten.

![14](https://user-images.githubusercontent.com/59178587/195046274-b6b9479b-09b0-4dab-bfd5-577977babb5a.png)



## How It Works
This snippet fetch all tasks with a date like due, start, scheduled, done. Tasks with a start and a due date are presented on all days from start to end (due). This way you can show up periods on you calendar like a holiday.

![12](https://user-images.githubusercontent.com/59178587/195025709-ffd2da28-25c9-4010-8637-cdbc5f948c72.png)

Hovering a task let popup a small info about the note and the complete task title.

![13](https://user-images.githubusercontent.com/59178587/195028049-21d46f18-aa87-4bf2-a07c-a1d08ac315ef.png)



## Impressions

### Month Calendar
![1](https://user-images.githubusercontent.com/59178587/195021412-7991d71f-0529-4eab-990f-3e8b248587f4.png)
![2](https://user-images.githubusercontent.com/59178587/195021427-0adfe60c-5c9a-4df0-9129-707a5eac1ff7.png)
![7](https://user-images.githubusercontent.com/59178587/195021459-d3db3edc-c7c1-4cdf-b771-2a1cc579f91e.png)
![8](https://user-images.githubusercontent.com/59178587/195021467-71a7ac80-a1ed-4f13-bfe9-4a3dafe7a39f.png)

### Week/Agenda Calendar
![3](https://user-images.githubusercontent.com/59178587/195023404-b66e90e2-c977-4d3a-8382-f524f028259a.png)
![4](https://user-images.githubusercontent.com/59178587/195023423-0f1e6127-2916-45a1-acde-2fc38816373f.png)

### Widget Calendar
![5](https://user-images.githubusercontent.com/59178587/195023502-878d2ed5-3b30-4d89-abfd-ee97fce95b8a.png)
![6](https://user-images.githubusercontent.com/59178587/195023521-16d27087-8faa-4267-9df5-81824bd16d5d.png)
