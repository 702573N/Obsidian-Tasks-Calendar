# Obsidian-Tasks-Calendar
Dataview snippet to show tasks in different calendar views


## Story
All Obsidian and Task Plugin users love the program. What has been set up with the Task Plugin is just great and helps so many people to organize their work. However, just listing tasks according to certain criteria is sometimes a bit boring. To get a quick visual impression of one's workday/workweek/workmonth, a calendar view would be ideal. To be honest, I'm too stupid to program my own plugins for Obsidian, but I know some Javascript, so I programmed this Dataview snippet. I hope to offer many people a good addition to the Task Plugin and hope for an integration into the Task Plugin someday. But I'm sure there are better programmers out there, who can make my code, which is probably horrible for professionals, much better.


## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "tasksCalendar" or any other name and paste the files "view.js" and "view.css" into it

    ![11](https://user-images.githubusercontent.com/59178587/195023158-99381088-0cc0-428e-8077-6ea66a388992.png)

3.  Create a new note or edit an existing one and add the following code line:

    ```
    '''dataviewjs
    dv.view("tasksCalendar", {pages: "", view: "month", firstDayOfWeek: 1, options: "noIcons"})
    '''
    ```
    
    If you paste the main files (js/css) into another folder then "tasksCalendar", you have to replace the name between the first quotation marks.
 
 4. There are 4 different variables to set path/location as "pages", calendar view style as "view", first day of the week (0 or 1) as "firstDayOfWeek" and some style classes as "options"
 
    ```
    pages: ""
    # Get all tasks from all notes in obsidian
    
    pages: "Task Management/Work"
    # Set a custom folder to get tasks from
    
    ---
    
    view: "month"
    # Month calendar
    
    view: "week"
    #  Week calendar, Agenda calendar
    
    view: "widget"
    # Widget calendar, small week calendar
    
    ---
 
    firstDayOfWeek: 1
    # Monday as first day of week
    
    firstDayOfWeek: 0
    # Sunday as first day of week
    
    ---
 
    # You can combine all available options
 
    options: "noIcons"
    # Hide Task plugin Icons in front of each task
    
    options: "noProcess"
    # The tasks with a start-date and a due-date are not displayed on all days between them.
    
    options: "noWeekNr"
    # Hide the week number in the first cell of each week
    
    options: "largeText"
    # Set larger text on tasks, cell names and grid heads
    # On mobile devices this style class doesn't take effect in combination with month and widget calendar view, because the limited screen size
    
    options: "fullHeight"
    # Set height of the calendar view to fit the screen (especially suitable for mobile devices)
    
    options: "vertical"
    options: "horizontal"
    # Attention: Only supported on week calendar view. The sorting order of days inside the week calendar can be changed between horizontal (left to         right) and vertical (top to bottom).
    
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

After a task is completed the start- and scheduled dates are no longer needed and will be hidden. The task is now only displayed on the final completion date.



## Impressions

### Month Calendar
![15](https://user-images.githubusercontent.com/59178587/195291256-8079668d-cca3-4581-9795-93f9d5df9858.png)
![7](https://user-images.githubusercontent.com/59178587/195291631-193a3097-0726-4719-bbb5-6bc494a3f5d2.png)

![18](https://user-images.githubusercontent.com/59178587/195291344-99dac5d7-802b-40a8-8d6b-04a3be17e5d8.png)
![2](https://user-images.githubusercontent.com/59178587/195291931-571a5801-02ed-4bc0-bdb7-90db67a55fef.png)




### Week/Agenda Calendar
![17](https://user-images.githubusercontent.com/59178587/195292199-80ba52ae-0463-480f-9370-ae4688315fad.png)
![3](https://user-images.githubusercontent.com/59178587/195292211-308f4c52-ae80-475a-a127-c29d7eb6dbfd.png)


### Widget Calendar
![16](https://user-images.githubusercontent.com/59178587/195292466-db898e24-553c-4434-8b8c-8b1c6f1a47d3.png)
![5](https://user-images.githubusercontent.com/59178587/195292541-0b7e3bc5-f873-4a64-ab44-50fcc6d3cae3.png)

