//// COMMON /////////////////////////////////////////////////////////////////////////////////
var Canvas;
var CurrentTab = "";
var CurrMonday;  // Date
var ExchangesExist;

var btns = [];
var labels = [];
var ScrollBox = {x: 0, y: 0, w: 0, h: 0};
var StrikeOutFreeLsn = true; // true  - strike out canceled lessons
                             // false - label 'lesson canceled' instead of strike 

//// HOMEPAGE //////////////////////////////////////////////////////////////////////////////////
var HOME_BTN_SIZE_X = 304;
var HOME_BTN_SIZE_Y = 125;

//// CURRENT TIME //////////////////////////////////////////////////////////////////////////////
var ctLine1 = '', ctLine2 = '', ctMinutNum = '', ctMinutes = '', ctTime = '', ctTimeColon = ' ', ctDate = '', ctYear = '';

var SchoolLabelWidth = 0;

/// Scroll variables ///////////////////////////////////////////
var SCROLL_DELTA = 5; // animation steps
var ScrollTotalSizeX; // total size of scrollable sheet
var ScrollTotalSizeY;
var ScrollStepX;     // scrolling resolution of the current sheet horizontally and vertically
var ScrollStepY; 
var ScrollPosX;      // top-left position of sheet corner after scroll ends
var ScrollPosY;
var ScrollDelta;     // {x, y} count of scrolling steps +/- animation
var CurrScrollStep;  // {x, y} amount of shift scroll-sheet (duting 1 step animation)
var ScrollTimeOutId; // 
var HoldPos;
var HoldScrollPos;
var HandScrollActive;    // flag: scrolling is proceed now
var FadeAnim;            // flag: animation of fading now
var ScrollTranspEdges=0; // transparent scrollbar edges: (bits) UDRL
var ScrollByHand = true;

var GRID_EDGE = 30; // semi-transparent edge around cells
var GRID_EDGE_COLOR = "rgba(255,255,255,255)";
var GRID_EDGE_COLOR_TRNSP = "rgba(255,255,255,0)";

var TOP_HEIGHT = 140; // variable 100...140
var BOTTOM_HEIGHT = 80; // constant

var ScrollBtnPressed = "";
var HLBtn = -1; // highlighted button/record

/// Auto-reload ////////////////////////////////////////////////////////////////
var RELOAD_TIMER = 60;      // (sec) the minimum time after which a check for data updates occurs if the interface is actively used
var RELOAD_TIMER2 = 600;    // (sec) the maximum time during which the data update check is surely performed
var REFRESH_TIMER = 120;    // (sec) the period of time during which a check for updates (HttpRequest) occurs in the absence of client activity
                            // it works if schedule placed on portal only
var IdleTime = 0;
var RefreshTime = 0;

var Redraw = false;

var FadeOutScreenCnt = 0;    // counter for smooth screen switch on
var FadeOutScreenMax = 20;   // number of steps while animation works
var FadeOutScreen = false;   // flag if screen is switched off
var idFadeOutScreenTimer;

/// Colors and gradients ///////////////////////////////////////////////////////
var BASE_COLOR = "#42825e";
var TITLE_FONT_COLOR = "#CCFADD";
var BTN_HL_COLOR = "#3CACC4";
var YELLOW_LIGHT_COLOR = "#F9FCC3";
var GRAY_TEXT_COLOR = "#838383"; 
var TS_TITLE_COLOR1 = "#CDF7E3";
var TS_TITLE_COLOR2 = "#BCEAD0";
var TS_CELL_COLOR1="#E6F3C7";
var TS_CELL_COLOR2="#FDFDC7";
var TS_METHOD_COLOR1="#EDBE90";
var TS_METHOD_COLOR2="#FDC690";
var TS_EXCHANGE_COLOR="#FB3602";
var TS_EXCHANGE_COLOR_TITLE="#FF3004";
var GRID_LINE_COLOR="#CACACA";

var CL_HOLIDAY_BK_COLOR = "#FEFECA";
var CL_HOLIDAY_TEXT_COLOR = "#FE7446";
var CL_EXCHANGE_COLOR = "#FF3004";

var CDS_ROW_COLOR_TRNSP = "rgba(127,239,164,0.18)";
var CDS_ROW_LINE_COLOR="#C6EBD4";
var CDS_TEACHER_COLOR="#44825D";

var CLASSES_COLORS = ["#D9E4FF", "#FEFCB1", "#E4C8FB", "#C7FBD4", "#FCC2EA", "#DCFEB1", "#C0F6F8", "#FCC9C8", "#E1ECA7", "#FBDFB7", "#F6FFAE", "#DBE0E3", "#C6EAFF"];
// russian version of declensions month nouns (not used in english version)
var MONTHS3_STR = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"]
 
var BTN_TEXT_COLOR = "#000000";
var BTN_HL_TEXT_COLOR = TITLE_FONT_COLOR;
var SCHED_TITLE_COLOR = "rgb(170,40,30)";
var SCHED_FONT_COLOR = "rgb(40,40,40)";
var SCHED_GROUP_COLOR = "rgb(100,100,100)";

var SECOND_SHIFT_COLOR="#306030";
var UPK_COLOR="rgb(0,137,198)";

/// Images ///////////////////////////////////////////////////////
var IMAGE_DIR = "images/";
var local_host = window.location.host.toLowerCase();
if (local_host=="raspisanie.nikasoft.ru") IMAGE_DIR = "/static/images/";
if (local_host=="localhost") IMAGE_DIR = "/static/images/";

var BackgroundImg1 = new Image();
BackgroundImg1.src=IMAGE_DIR +"background1.jpg";

var BackgroundGrid = new Image();
BackgroundGrid.src=IMAGE_DIR +"grid.png";

var CalendarImg1 = new Image();
CalendarImg1.src=IMAGE_DIR +"calendar1.png";

var TitleImg1 = new Image();
TitleImg1.src=IMAGE_DIR +"title1.png";

var TopLineImg = new Image();
TopLineImg.src=IMAGE_DIR +"top_line.png";

var BottomLineImg = new Image();
BottomLineImg.src=IMAGE_DIR +"bottom_line.png";

var SelectDay = new Image();
SelectDay.src=IMAGE_DIR +"cs_day.png";

var SelectDayHL = new Image();
SelectDayHL.src=IMAGE_DIR +"cs_day_hl.png";

var CLASSES_BUTTONS = [new Image(), new Image(), new Image(), new Image()];
CLASSES_BUTTONS[0].src=IMAGE_DIR +"class_btn1.png";
CLASSES_BUTTONS[1].src=IMAGE_DIR +"class_btn2.png";
CLASSES_BUTTONS[2].src=IMAGE_DIR +"class_btn3.png";
CLASSES_BUTTONS[3].src=IMAGE_DIR +"class_btn4.png";

var DayBoxImg = new Image();
DayBoxImg.src=IMAGE_DIR +"day_box.png"; 
var DayLineImg = new Image();
DayLineImg.src=IMAGE_DIR +"day_line.png"; 

var LastAnimTime;

/// Classes list variables ///////////////////////////////////////////
var CLASS_GRID_COL_SIZE; // calculated
var CLASS_GRID_ROW_SIZE = 76;
var CLASS_BTN_SIZE_X;  // calculated
var CLASS_BTN_SIZE_Y = 51;
var CLASS_BTN_FONT; // calulated
var MaxClsLen; // calculated

/// Teachers list variables ///////////////////////////////////////////
var TEACHERS_GRID_COL_SIZE; // calculated
var TEACHERS_GRID_ROW_SIZE = 54;
var TEACHER_BTN_SIZE_X; // calculated
var TEACHER_BTN_SIZE_Y = 51;
var TEACHER_DISTANCE_X = 40;
var MaxTeachLen, MaxTeachColumns;
var TeachScrollPosY;  // postion of list teacher (to restore after return)

var TEACHER_BUTTONS = [new Image(), new Image(), new Image(), new Image()];
var TEACHER_BUTTONS_HL = [new Image(), new Image(), new Image(), new Image()];
for (var i=1;i<=4;i++) {
  TEACHER_BUTTONS[i-1].src=IMAGE_DIR +"teach_btn" + String(i) + ".png";
  TEACHER_BUTTONS_HL[i-1].src=IMAGE_DIR +"teach_btnHL" + String(i) + ".png";
}

var StartCalendarDate = -1; // first day of month used for passing to exchange calendar (if they exist)

//// TEACHERS SCHEDULE ///////////////////////////////////////////////////////////
var TS_FIRST_COL_SIZE_X = 100;
var TS_FIRST_ROW_SIZE_Y = 45;
var TS_COL_SIZE_X = 128;
var TS_ROW_SIZE_Y = 70;
var CurrSubject;  // !=-1 if teacher has only one subject
var CurrTeacher;
var CurrTeachSubject;

//// CLASSES SCHEDULE ////////////////////////////////////////////////////////////
var CS_DAY_WIDTH = 264;  // day-box width
var RealDayDistanceX, RealDayDistanceY, ClassSchedColCount; // calculated
var CS_MAX_DAY_DISTANCE = 100;
var CS_MIN_DAY_DISTANCE = 10;
var CS_ROW_SIZE_Y = 27; // height of lesson line inside day-box
var CS_LEFT_SHIFT = 20;
var CS_ADD_BOX_HEIGHT = 96;
var MaxLessonCount; // calculated (SetClassWeek)
var MinFirstLessonNum; // calculated (SetClassWeek)
var CurrClass;
var CurrSecondShiftStr;
var CS_BusyDay = [];  // calculated on day schedule drawscroll

//// CLASS DAY SCHEDULE ////////////////////////////////////////////////////////////
var CurrDay;
var CDS_TABLE_WIDTH = 960;
var CDS_ROW_HEIGHT = 82;
var FirstLessonNum, LastLessonNum, SecondShiftNum; // calculated (SetClassDay)

//// CALENDAR ////////////////////////////////////////////////////////////////////
var CL_FIRST_ROW_SIZE_Y = 50;
var CL_MAX_WIDTH = 875;
var CL_MAX_HEIGHT = 590;
var CL_ROW_SIZE_X = 125;
var CL_ROW_SIZE_Y = 80;
var CalendarActualHeight;

//// CookieManager ///////////////////////////////////////////////////////////////
var CookieManager = {
    set: function (name, value, days) {
         var expires = "";
          if (days) {
              var d = new Date();
              d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
              expires = "; expires=" + d.toUTCString();
          }
          document.cookie = name + "=" + value + expires + "; path=/";
         // return this.get(name);
    },
    get: function (name) {
		  var matches = document.cookie.match(new RegExp(
		    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  		 ));
  		return matches ? decodeURIComponent(matches[1]) : undefined;
		},
    remove: function (name) {
          this.set(name, "", -1);
    }
};

var TouchSupport;
