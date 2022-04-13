# School schedule on the WEB

This is very optimized pure javascript project to show school, college and other educational timetables on WEB or info-terminals.
It support touch screens and has adaptive interface. Solution doesn't use any third party libraries and required HTML5 support only.
<BR>
  <BR><I>Feature list</I>:
<BR>  
- show 1-week schedule for selected class or teacher for whole week or for chosen day
- support 2-week schedule 
- showed schedule compiled from a JSON data-file consists of schedule objects such as classes, lessons, subjects, groups, bell schedule and so on
- multilanguage interface provided by the text constants passed in the JSON data-file
- support joining and spliting classes by groups as usual practice in school around the world
- show and highlight changes (exchanges) in basic schedule
- solution has minimal system's requirements and very fast time response on refresh schedule page. It can work without any backend, database server and so on. It's just a dynamic html-page. 

JSON data-file described in <B>Schedule_JSON_format.pdf</B>. This file generated by NIKA-Soft (https://nikasoft.ru) products which allow to make up schedule in automatic or manual mode. And also mantains changes in schedule in the actual state. Project used in NikaSoft web-portal to show client's schedules on the WEB and also distributed to end users for placing schedules on their own resources.

# How to compile and use

Use compile.bat script (for windows). Your should have Java installed. <B>Prod.html</B> is the base html container for schedule.js with program code and nika_data.js with schedule data in JSON-format.



All rights belong to developer Ivan deess@mail.ru. Source codes can be used and modified for other projects
