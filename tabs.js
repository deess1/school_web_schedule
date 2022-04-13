///////////////////////////////////////////////////////////////////////////////////
// ver 01 (01.05.2012) - initial version
// ver 12 (26.09.2017) - last version of old desing
//                       refactoring and change desing 
//
// ver 20 (09.05.2018) - first release of new desing
// ver 21 (14.09.2018) - fix teachers sort in Chrome
// ver 22 (09.10.2018) - correct calc GetCurrMonday (truncate to scope last day in period)
// ver 23 (10.01.2019) - add autoresize window on goPrev, goNext button on Class Schedule 
// ver 24 (14.09.2019) - correct text strike-through on class week and day schedule for small fonts
// ver 25 (24.09.2019) - support autosize teachers button in custom capture
// ver 26 (04.09.2020) - fix error dual week schedule where period started not from monday
// ver 27 (07.09.2020) - use StartCalendarDate to calculate correct month to calendar of changes (depends on real changes)
// ver 28 (11.09.2020) - support parameter SHOW_EXPORT_DT to public export date/time on all pages
// ver 29 (16.10.2020) - add support parameter STRIKEOUT_FREE_LSN for classes schedule

var teachers; // sorted list

function InitGeneralTab() {
  ScrollPosX = 0;
  ScrollPosY = 0;	
	
  btns['classes'].v = false;
  btns['teachers'].v = false;
	
  labels['school'].color = TITLE_FONT_COLOR;
  labels['city'].color = TITLE_FONT_COLOR;
  labels['school'].v = true;
  labels['city'].v = true;
  __id('go_home').style.color = '#FFFFFF';
  btns['NL'].v = false;
  btns['NLs'].v = true;
  labels['title'].v = true;

  labels['period'].v = false;  
  btns['changes'].v = false;
  labels['change_ln1'].v = false;
  labels['change_ln2'].v = false;
  btns['arrow_left'].v = false;
  btns['arrow_right'].v = false;
  labels['prev_week_ln1'].v = false;
  labels['prev_week_ln2'].v = false;
  labels['next_week_ln1'].v = false;  
  labels['next_week_ln2'].v = false; 
  labels['prev_month_ln1'].v = false;
  labels['prev_month_ln2'].v = false;
  labels['next_month_ln1'].v = false;  
  labels['next_month_ln2'].v = false;
  labels['prev_day_ln2'].v = false;  
  labels['next_day_ln2'].v = false;
  
  // set visibility export date/time labels
 	labels['exp_lab'].v = false;
 	labels['exp_dt'].v = false;
  if (window['NIKA'].SHOW_EXPORT_DT) {
  	labels['exp_lab'].v = true;
  	labels['exp_dt'].v = true;
  }
}

function ResizeGeneralTab(ratio, is_calendar) {
  // align school name and city to the right-top corner
	var school_x = Canvas.width - SchoolLabelWidth - 50;
	if (school_x<Canvas.width/2+180/ratio+20) {
		school_x = Canvas.width/2+180/ratio+20;
	}
	TOP_HEIGHT = Math.round(140 + 55*(1-ratio));
			
	labels['school'].x = school_x;
	labels['school'].y = TOP_HEIGHT*0.3;
	labels['city'].x = school_x;
	labels['city'].y = TOP_HEIGHT*0.5;
	__id('go_home').style.left = (school_x).toString()+'px' ;
	__id('go_home').style.top = Math.round(TOP_HEIGHT*0.7) + 'px';
			
	// align logo at bottom		
	btns['NLs'].x = 140;
	btns['NLs'].y = Canvas.height-BOTTOM_HEIGHT + 10;
	__id('copyright').style.left = (btns['NLs'].x + 64).toString()+'px';
	__id('copyright').style.top = (btns['NLs'].y + 24).toString()+'px';

	labels['title'].x = Canvas.width/2;
	labels['title'].y = TOP_HEIGHT + 78;
	labels['period'].y = TOP_HEIGHT + 104;

  // export date/time labels 
  if (labels['exp_lab'].v) {	
		labels['exp_lab'].x = Canvas.width/2;
  	labels['exp_lab'].y = Canvas.height - 50;
		labels['exp_dt'].x = Canvas.width/2;
  	labels['exp_dt'].y = Canvas.height - 50 + 30/ratio;
  }
	  	
	// align grid
	if (is_calendar) {
	  ScrollBox.y = TOP_HEIGHT + 135;
	  ScrollBox.w = Math.round(Canvas.width - 450+307*(ratio-1));
	  if (ScrollBox.w>CL_MAX_WIDTH) ScrollBox.w = CL_MAX_WIDTH;
	  ScrollBox.h = Math.round(CalendarActualHeight*ScrollBox.w/CL_MAX_WIDTH);
	  if (ScrollBox.h>Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30) {
		ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;
		ScrollBox.w = Math.round(CL_MAX_WIDTH*ScrollBox.h/CalendarActualHeight);
  	  }
  	  ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
  	  ScrollTotalSizeX = ScrollBox.w; 
  	  ScrollTotalSizeY = ScrollBox.h;
	}
}

// rearrange scroll buttons related to scrollbox 
// horiz_lower - if horizontal buttons should be rather lower than cenetered
function ResizeScrollBtn(horiz_lower) {
		btns['LeftScrll'].x = ScrollBox.x - btns['LeftScrll'].w - 15;
		btns['RightScrll'].x = ScrollBox.x + ScrollBox.w + 15;
		if (horiz_lower) {
			btns['LeftScrll'].y = ScrollBox.y + ScrollBox.h - btns['LeftScrll'].h*3;
			btns['RightScrll'].y = ScrollBox.y + ScrollBox.h - btns['RightScrll'].h*3;
		}
		else {
			btns['LeftScrll'].y = ScrollBox.y + ScrollBox.h/2 - btns['LeftScrll'].h/2;
			btns['RightScrll'].y = ScrollBox.y + ScrollBox.h/2 - btns['RightScrll'].h/2;
		}
		btns['UpScrll'].x = ScrollBox.x + ScrollBox.w + 10;
		btns['UpScrll'].y = ScrollBox.y;
		btns['DownScrll'].x = ScrollBox.x + ScrollBox.w + 10;
		btns['DownScrll'].y = ScrollBox.y + ScrollBox.h - btns['DownScrll'].h;
	
}

function DrawBackGeneralTab(ctx, ratio) {
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, Canvas.width, Canvas.height);
	var y = TOP_HEIGHT;
	while (y<Canvas.height-BOTTOM_HEIGHT) {
		ctx.drawImage(BackgroundGrid, 0, y);
		y += BackgroundGrid.height;
	}
	
	//ctx.drawImage(BackgroundGrid, 0, 0, Canvas.width, Canvas.height-TOP_HEIGHT-BOTTOM_HEIGHT, 0, TOP_HEIGHT, Canvas.width, Canvas.height-TOP_HEIGHT-BOTTOM_HEIGHT);
  ctx.fillStyle = BASE_COLOR;
  ctx.fillRect(0, 0, Canvas.width, TOP_HEIGHT);
  ctx.fillRect(0, Canvas.height-BOTTOM_HEIGHT, Canvas.width, Canvas.height);
  ctx.drawImage(TopLineImg, 0, 0, TopLineImg.width, TopLineImg.height, 0, TOP_HEIGHT, Canvas.width, 23/ratio);
  ctx.drawImage(BottomLineImg, 0, 0, BottomLineImg.width, BottomLineImg.height, 0, Canvas.height-BOTTOM_HEIGHT-16, Canvas.width, 23);
}

// show current lesson, time and date in title (scalable)
function DrawTitleLesson(ctx) {
	  var ratio = 140/TOP_HEIGHT; 
		ctx.save();
    ctx.setTransform(1/ratio, 0, 0, 1/ratio, 100, 20);
    ctx.font = "normal 18px Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = TITLE_FONT_COLOR;
    		
	if (ctLine1) ctx.fillText(ctLine1, 64, 0,  80);
	if (ctLine2) ctx.fillText(ctLine2, 64, 20, 80);
	ctx.font = "bold 34px Arial, sans-serif";
	if (ctMinutNum) ctx.fillText(ctMinutNum, 64, 46, 80);
	ctx.font = "normal 18px Verdana, sans-serif";
	if (ctMinutes) ctx.fillText(ctMinutes,  64, 78, 80);
	if (ctLine1 || ctLine2) {
		ctx.strokeStyle = TITLE_FONT_COLOR;
		ctx.lineWidth = 3;
		ctx.strokeRect(20, -5, 92, 110);
	};
	ctx.font = "bold 48px Arial, sans-serif";
	if (ctTime) ctx.fillText(ctTime,  192, 0);
	ctx.font = "bold 48px Times, sans-serif";
	if (ctTimeColon && ctTime) ctx.fillText(ctTimeColon,  192, -4);
	ctx.font = "normal 20px Verdana, sans-serif";
	if (ctDate) ctx.fillText(ctDate,  192, 50);
	if (ctYear) ctx.fillText(ctYear,  192, 74);
	ctx.restore();	
}

// show current teacher label in title (scalable)
function DrawTitleTeacher(ctx, ratio) {
  ctx.save();
  ctx.setTransform(1/ratio, 0, 0, 1/ratio, Canvas.width/2, TOP_HEIGHT/2);
  ctx.fillStyle = TITLE_FONT_COLOR;
  ctx.fillRect(-180, -55, 360, 110);	
  
  ctx.font = "bold 20px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = BTN_TEXT_COLOR;
  // if teachers full names consist of two words they should be splitted 
  var s = NIKA.TEACHERS[CurrTeacher];
  var y, s1=s, s2='';
  var pos = s.indexOf(' ');
  if (pos>-1) {
  	s2 = s.substr(pos+1, s.length);
  	if (s2.length<=7) s2 = ''; else s1 = s.substr(0, pos);
  }
  if (s2) {	
		ctx.fillText(s1, 0, -32);
		ctx.fillText(s2, 0, -8);
		y = 20;
	}
	else {
		ctx.fillText(s, 0, -16);
		y = 14;
	}
  if (CurrTeachSubject) {
  	ctx.font = "bold 16px Verdana, sans-serif";
  	ctx.textAlign = "center";
  	ctx.fillStyle = BASE_COLOR;
  	ctx.fillText(CurrTeachSubject, 0, y);
  }
  ctx.fillStyle = YELLOW_LIGHT_COLOR;
  ctx.save();
  ctx.translate(-172, -46);
  ctx.rotate(-0.785);
  ctx.fillRect(-20, -6, 40, 12);	
  ctx.restore();
  ctx.translate(172, -46);
  ctx.rotate(0.785);
  ctx.fillRect(-20, -6, 40, 12);	
  ctx.restore();
}

function DrawTitleClass(ctx, ratio) {
  ctx.save();
  ctx.setTransform(1/ratio, 0, 0, 1/ratio, Canvas.width/2, TOP_HEIGHT/2);
  ctx.fillStyle = TITLE_FONT_COLOR;
  ctx.fillRect(-90, -55, 180, 110);	
  
  ctx.font = "bold 28px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = BTN_TEXT_COLOR;
  ctx.fillText(NIKA.CLASSES[CurrClass], 0, -30); 
  ctx.fillStyle = SCHED_FONT_COLOR;
  ctx.font = "normal 18px Verdana, sans-serif";
  var s = NIKA.CLASS_STR.toLowerCase();
  if (s.charAt(s.length-1)==':') s = s.substr(0, s.length-1);
  ctx.fillText(s, 0, 5);
  
  if (CurrSecondShiftStr) {
	  ctx.fillStyle = SECOND_SHIFT_COLOR;
	  ctx.fillText(CurrSecondShiftStr, 0, 26); 
  }
  
  ctx.fillStyle = YELLOW_LIGHT_COLOR;
  ctx.save();
  ctx.translate(-82, -46);
  ctx.rotate(-0.785);
  ctx.fillRect(-20, -6, 40, 12);	
  ctx.restore();
  ctx.translate(82, -46);
  ctx.rotate(0.785);
  ctx.fillRect(-20, -6, 40, 12);	
  ctx.restore();
}
		
window['tabs'] = { 
//var tabs = {
/////	HOMEPAGE ///////////////////////////////////////////////////////////////////////////////////////////
"home": {
	BackTab: "",
	init: function()
	{
		InitGeneralTab();
	  ScrollBox.x = 0;
	  ScrollBox.y = 0;
	  ScrollBox.w = 0;
	  ScrollBox.h = 0;
		
	  ScrollPosX = 0;
	  ScrollPosY = 0;
	  TeachScrollPosY = 0;
	  ScrollDelta = {x: 0, y: 0};
	  CurrScrollStep = {x: 0, y: 0};
	  ScrollTotalSizeX = 0;
		ScrollTotalSizeY = 0;
	  ScrollStepX = 1;
	  ScrollStepY = 1;
	  ScrollTranspEdges=0; // 0000
	  
	  labels['title'].v = false;
	  btns['classes'].v = true;
	  btns['teachers'].v = NIKA.SHOW_TEACHERS;
	  
	  labels['school'].color = '#FFFFFF';
	  labels['city'].color = '#FFFFFF';
	  labels['school'].v = true;
	  labels['city'].v = true;
	  btns['NL'].v = true;
	  btns['NLs'].v = false;

		// set visibility export date/time labels
	 	labels['exp_lab'].v = false;
	 	labels['exp_dt'].v = false;
	  if (window['NIKA'].SHOW_EXPORT_DT) {
	  	labels['exp_lab'].v = true;
	  	labels['exp_dt'].v = true;
	  }
	  
	  __id('go_home').style.color = '#00FFFF';
	  
	},
	drawback: function(ctx, ratio) 
	{
		//background (dashboard)
		var w = Canvas.width, h = Canvas.height;
		if (h>BackgroundImg1.height) {
			w = w*(BackgroundImg1.height/Canvas.height);
			h = BackgroundImg1.height;
		}
		var left = BackgroundImg1.width - Canvas.width;
		if (left<0) left = 0;
		if (left>260) left = 260;

		ctx.drawImage(BackgroundImg1, left, BackgroundImg1.height-h, w, h, 0, 0, Canvas.width, Canvas.height);
		
		// calendar on home page (scalable)
		ctx.save();
		ctx.setTransform(1/ratio, 0, 0, 1/ratio, 100/ratio, 30);
		ctx.rotate(-0.04);
		ctx.drawImage(CalendarImg1, 0, 0, CalendarImg1.width, CalendarImg1.height);
    ctx.font = "normal 18px Verdana , sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#FFFFFF";
	  
		if (ctLine1) ctx.fillText(ctLine1, 64, 72,  80);
		if (ctLine2) ctx.fillText(ctLine2, 64, 92, 80);
		ctx.font = "bold 34px Arial, sans-serif";
		if (ctMinutNum) ctx.fillText(ctMinutNum, 64, 118, 80);
		ctx.font = "normal 18px Verdana, sans-serif";
		if (ctMinutes) ctx.fillText(ctMinutes,  64, 150, 80);
		ctx.font = "bold 48px Arial, sans-serif";
		ctx.fillStyle = "#000";
		if (ctTime) ctx.fillText(ctTime,  192, 72);
		ctx.font = "bold 48px Times, sans-serif";
		if (ctTimeColon && ctTime) ctx.fillText(ctTimeColon,  192, 68);
		ctx.font = "normal 22px Verdana, sans-serif";
		ctx.fillStyle = "#3B3E3F";
		if (ctDate) ctx.fillText(ctDate,  192, 126);
		if (ctYear) ctx.fillText(ctYear,  192, 154);
		ctx.restore();

		// title (scalable)
		ctx.drawImage(TitleImg1, Canvas.width/2 - (TitleImg1.width/ratio)/2, 380/ratio, TitleImg1.width/ratio, TitleImg1.height/ratio);
		
	},
	resize: function(ratio)
	{
	  // align school name and city to the right-top corner
		var school_x = Canvas.width - SchoolLabelWidth - 50;
		
		labels['school'].x = school_x;
		labels['school'].y = 50;
		labels['city'].x = school_x;
		labels['city'].y = 76;
		__id('go_home').style.left = (school_x).toString()+'px' ;
		__id('go_home').style.top = '116px';
			
		btns['NL'].x = 140;
		btns['NL'].y = Canvas.height-127;
		
		__id('copyright').style.left = (btns['NL'].x + 96).toString()+'px';
		__id('copyright').style.top = (btns['NL'].y + 60).toString()+'px';
	
	  // set central position of home buttons 
		btns['classes'].w = HOME_BTN_SIZE_X/ratio;
		btns['classes'].h = HOME_BTN_SIZE_Y/ratio;

		//	export date/time labels at top of home page
		labels['exp_lab'].x = 250/ratio;
	  labels['exp_lab'].y = 30 + 230/ratio;
		labels['exp_dt'].x = 250/ratio;
	  labels['exp_dt'].y = 30 + 260/ratio;
	  
		if (btns['teachers'].v) {
			if (btns['teachers'].hasOwnProperty('caption') && btns['teachers'].caption.length>7) {
				btns['teachers'].w = 1.05*HOME_BTN_SIZE_X*btns['teachers'].caption.length/(ratio*8);
			} 
			else {
				btns['teachers'].w = HOME_BTN_SIZE_X/ratio;
			}
			btns['teachers'].h = HOME_BTN_SIZE_Y/ratio;
			
			btns['classes'].x = Canvas.width/2 - btns['classes'].w - 80/ratio; 
			btns['classes'].y = 600/ratio;
			btns['teachers'].x = Canvas.width/2 + 80/ratio; 
			btns['teachers'].y = 600/ratio;
		} 
		else {
			btns['classes'].x = Canvas.width/2 - btns['classes'].w/2; 
			btns['classes'].y = 600/ratio;
		}
		
  },
  drawscroll: function(ctx) {
  },
  getbtn: function(pos)
  {
  	function CheckBtnSpace(btn)
  	{
  		return (btn.v && pos.x>=btn.x && pos.x<=btn.x+btn.w && pos.y>=btn.y && pos.y<=btn.y+btn.h);
  	}
  	if (CheckBtnSpace(btns['classes'])) return 0;
  	if (CheckBtnSpace(btns['teachers'])) return 1;
  	
    return -1;  	
  },
  clickbtn: function() {
  }
},
//// CLASSES ///////////////////////////////////////////////////////////////////////////////////
"classes": {
	BackTab: "home",
	init: function()
	{
		InitGeneralTab();
	  		
		// calculate max classes str length and max classes per course
	    MaxClsLen=0;
	    for (var cls in NIKA.CLASSES)
			if (NIKA.CLASSES[cls].length>MaxClsLen) MaxClsLen = NIKA.CLASSES[cls].substr(0,12).length;
		CLASS_BTN_FONT = "bold 22px Arial";
		CLASS_BTN_TOP_LINE = 14;
		if (MaxClsLen>5) MaxClsLen = 6;
	},
	resize: function(ratio)
	{
		ResizeGeneralTab(ratio, false);
		ScrollBox.y = TOP_HEIGHT + 100;
		ScrollBox.w = Math.round(Canvas.width - 400+357*(ratio-1));
		ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;

		// resize and recalculate cell size
		CLASS_GRID_ROW_SIZE = Math.round(ScrollBox.h/7);
		if (CLASS_GRID_ROW_SIZE>76) CLASS_GRID_ROW_SIZE = 76;
		if (CLASS_GRID_ROW_SIZE<45) CLASS_GRID_ROW_SIZE = 45;
		
		CLASS_BTN_SIZE_Y = Math.round(CLASS_GRID_ROW_SIZE*0.67);
		CLASS_BTN_SIZE_X = Math.round(24*CLASS_BTN_SIZE_Y/76 + MaxClsLen*16);
		CLASS_GRID_COL_SIZE = Math.round(ScrollBox.w/12);
		if (CLASS_GRID_COL_SIZE-CLASS_BTN_SIZE_X<30) CLASS_GRID_COL_SIZE = CLASS_BTN_SIZE_X + 30;
		if (CLASS_GRID_COL_SIZE-CLASS_BTN_SIZE_X>55) CLASS_GRID_COL_SIZE = CLASS_BTN_SIZE_X + 55;
		
		// measure scroll area
	    ScrollTotalSizeX = 0;
	    ScrollTotalSizeY = GRID_EDGE;
		
		ClassListIterator(function(x, y, cls) {
			if (x+CLASS_GRID_COL_SIZE>ScrollTotalSizeX) ScrollTotalSizeX = x+CLASS_GRID_COL_SIZE;
			if (y+CLASS_GRID_ROW_SIZE>ScrollTotalSizeY) ScrollTotalSizeY = y+CLASS_GRID_ROW_SIZE;
		});
    
    if (ScrollBox.w>ScrollTotalSizeX) {
    	ScrollBox.w = ScrollTotalSizeX;
    } 
    else {
    	 ScrollTotalSizeX += 2*GRID_EDGE-(CLASS_GRID_COL_SIZE-CLASS_BTN_SIZE_X);
		};
    if (Canvas.width-(ScrollBox.x+ScrollBox.w)<300) ScrollBox.x = Canvas.width-ScrollBox.w-300;
    if (ScrollBox.h>ScrollTotalSizeY) {
    	ScrollBox.h = ScrollTotalSizeY;
    }
    
    ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
    ScrollStepX = CLASS_GRID_COL_SIZE;
    ScrollStepY = CLASS_GRID_ROW_SIZE;
    ScrollTranspEdges=15; // UDRL
    ResizeScrollBtn(false);
	},
	drawback: function(ctx, ratio) 
	{
	  var s = String(NIKA.SCHEDULE_STR + " " + NIKA.FOR_CLASS_STR).toLowerCase();
	  s = s.charAt(0).toUpperCase() + s.slice(1);
		
		DrawBackGeneralTab(ctx, ratio);
		labels['title'].caption = s;

	  DrawTitleLesson(ctx);
	},
	drawscroll: function(ctx)
	{
		var color_index = -1, last_y = 0, btn_index = 0;
		 
		ClassListIterator(function(x, y, cls) {
    	if (y>last_y) color_index++;
    	last_y = y;
    	btn_index++;
			if (HLBtn==cls) {
				ctx.fillStyle = BTN_HL_COLOR;
				ctx.fillRect(x, y, CLASS_BTN_SIZE_X, CLASS_BTN_SIZE_Y);
      } else {
      	ctx.fillStyle = CLASSES_COLORS[color_index % CLASSES_COLORS.length];
      	ctx.fillRect(x, y, CLASS_BTN_SIZE_X, CLASS_BTN_SIZE_Y);
      	ctx.drawImage(CLASSES_BUTTONS[btn_index % CLASSES_BUTTONS.length], 0, 0, 98,51, x, y, CLASS_BTN_SIZE_X, CLASS_BTN_SIZE_Y);
      }	
		});
	
		ctx.font = "bold 22px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		ClassListIterator(function(x, y, cls) {
			if (HLBtn==cls)   {
      	ctx.fillStyle = BTN_HL_TEXT_COLOR;
      }  else  {
				ctx.fillStyle = BTN_TEXT_COLOR;
      }
    
			ctx.fillText(NIKA.CLASSES[cls].substr(0,11),  x + CLASS_BTN_SIZE_X/2, y + CLASS_BTN_SIZE_Y/2-10);
		});
		
	},
	getbtn: function(pos)
	{
		if (pos.x<GRID_EDGE || pos.y<GRID_EDGE || pos.x>ScrollTotalSizeX-GRID_EDGE || pos.y>ScrollTotalSizeY-GRID_EDGE+15) return -1;
  	
		var ret_cls = -1;
		ClassListIterator(function(x, y, cls) {
		if (pos.x>=x && pos.y>=y && pos.x<x+CLASS_BTN_SIZE_X && pos.y<y+CLASS_BTN_SIZE_Y)
  			ret_cls = cls;
  	});
  	return ret_cls;
	},
	clickbtn: function()
  {
	  if (HLBtn==-1) return;
	  CurrClass = HLBtn; // current selected class
	  GetCurrMonday(new Date());
	  GotoTab("classched");  	
  }
},
//// TEACHERS ///////////////////////////////////////////////////////////////////////////////////
"teachers": {
	BackTab: "home",
	init: function()
	{
		InitGeneralTab();
		ScrollPosY = TeachScrollPosY;
	  		
			// sort teachers
	    teachers = []; // sorted list
	  	for (i in NIKA.TEACHERS) {
			  if (NIKA.TEACHERS.hasOwnProperty(i)) {
	  			teachers.push(i);
			  }
		  }
		  function TeachCompare(t1, t2) {
			  if (NIKA.TEACHERS[t1]>NIKA.TEACHERS[t2]) return 1;
			  else if (NIKA.TEACHERS[t1]<NIKA.TEACHERS[t2]) return -1;
			  else return 0;
		  }
	  	teachers.sort(TeachCompare);		
		
	    ScrollTotalSizeX = 0;
	    ScrollTotalSizeY = 2*GRID_EDGE + TEACHERS_GRID_ROW_SIZE;
	  
	    // calc maximum teacher str len
	    var s, s2, pos;
	    MaxTeachLen = 0;
	    NIKA.TEACHERS_SHORT = [];
	    for (var teach in NIKA.TEACHERS) {
	      s = NIKA.TEACHERS[teach];
	      if (s.length>17) {
	      	// cut off long teacher names to initials Adams Smith -> Adams S.  
	      	pos = s.indexOf(' ');
	      	if (pos>-1) {
	      		s2 = s.substr(0, pos) + ' ' + s[pos+1]+'.';
	      	  
	      	  pos = s.indexOf(' ', pos+1);	
	      	  if (pos>-1) {
	      	  	s2 += ' ' + s[pos+1]+'.';
	      	  }
	      	}
	      	s = s2;
	      }
	      
	      if (s.length>22) {
	      	s = s.substr(0, 19) + '...';
	      }
	      
	      NIKA.TEACHERS_SHORT[teach] = s;
	      if (s.length>MaxTeachLen) MaxTeachLen = s.length;
	    }
	    if (MaxTeachLen>22) MaxTeachLen = 22;
	    if (MaxTeachLen<9)  MaxTeachLen = 8;
	},
	resize: function(ratio)
	{
			ResizeGeneralTab(ratio, false);
			ScrollBox.y = TOP_HEIGHT + 100;
			ScrollBox.w = Math.round(Canvas.width - 400+357*(ratio-1));
			ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;
			
			// resize and recalculate cell size
			TEACHERS_GRID_ROW_SIZE = Math.round(ScrollBox.h/7);
			if (TEACHERS_GRID_ROW_SIZE>82) TEACHERS_GRID_ROW_SIZE = 82;
			if (TEACHERS_GRID_ROW_SIZE<45) TEACHERS_GRID_ROW_SIZE = 45;
			
			TEACHER_BTN_SIZE_Y = Math.round(CLASS_GRID_ROW_SIZE*0.62);
			TEACHER_BTN_SIZE_X = Math.round(24*TEACHER_BTN_SIZE_Y/76 + MaxTeachLen*12);
			
			// calc MaxTeachColumns
			MaxTeachColumns = 5;
			while (MaxTeachColumns>1 && 2*GRID_EDGE+MaxTeachColumns*(TEACHER_BTN_SIZE_X+30)-30>ScrollBox.w) {
			  MaxTeachColumns--;
			}
			TEACHERS_GRID_COL_SIZE = Math.round((ScrollBox.w-2*GRID_EDGE)/MaxTeachColumns);
			
			// measure scroll area
			ScrollBox.w = MaxTeachColumns*TEACHERS_GRID_COL_SIZE+2*GRID_EDGE - (TEACHERS_GRID_COL_SIZE-TEACHER_BTN_SIZE_X);
	    ScrollTotalSizeX = ScrollBox.w;
	    ScrollTotalSizeY = GRID_EDGE;
	    
	    TeacherListIterator(function(x, y, teach) {
	      if (y+TEACHERS_GRID_ROW_SIZE>ScrollTotalSizeY) ScrollTotalSizeY = y+TEACHERS_GRID_ROW_SIZE;	
	    });
	
	    if (Canvas.width-(ScrollBox.x+ScrollBox.w)<300) ScrollBox.x = Canvas.width-ScrollBox.w-300;
	    ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
			
	    ScrollStepX = TEACHERS_GRID_COL_SIZE;
	    ScrollStepY = TEACHERS_GRID_ROW_SIZE;
	    ScrollTranspEdges=15; // UDRL
	    ResizeScrollBtn(false);
	},
	drawback: function(ctx, ratio) 
	{
	  var s = String(NIKA.SCHEDULE_STR + " " + NIKA.FOR_TEACHER_STR).toLowerCase();
	  s = s.charAt(0).toUpperCase() + s.slice(1);
		
		DrawBackGeneralTab(ctx, ratio);
		labels['title'].caption = s;

	  DrawTitleLesson(ctx);
	},	
	drawscroll: function(ctx)
	{
		ctx.lineWidth = 2;
		ctx.fillStyle = "#FFFFFF";
		var btn_index = 0;
		TeacherListIterator(function(x, y, teach) {
			btn_index++;
			ctx.fillRect(x, y, TEACHER_BTN_SIZE_X, TEACHER_BTN_SIZE_Y);
			if (HLBtn==teach) {
				ctx.strokeStyle = BTN_HL_COLOR;
	    	ctx.drawImage(TEACHER_BUTTONS_HL[btn_index % TEACHER_BUTTONS.length], 0, 0, 98,51, x, y, TEACHER_BTN_SIZE_X, TEACHER_BTN_SIZE_Y);
  		} else {
  			ctx.strokeStyle = BASE_COLOR;
	    	ctx.drawImage(TEACHER_BUTTONS[btn_index % TEACHER_BUTTONS.length], 0, 0, 98,51, x, y, TEACHER_BTN_SIZE_X, TEACHER_BTN_SIZE_Y);
  		}	
    	
  		
			ctx.strokeRect(x, y, TEACHER_BTN_SIZE_X, TEACHER_BTN_SIZE_Y);  		
		});
 	
  	ctx.font = "bold 22px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillStyle = BTN_TEXT_COLOR;  	  		
  	  		
 	  TeacherListIterator(function(x, y, teach) {
 			ctx.fillText(NIKA.TEACHERS_SHORT[teach],  x + TEACHER_BTN_SIZE_X/2, y + TEACHER_BTN_SIZE_Y/2-10)	
 	  });		
	},
	getbtn: function(pos)
	{
  	if (pos.x<GRID_EDGE || pos.y<GRID_EDGE || pos.x>ScrollTotalSizeX-GRID_EDGE || pos.y>ScrollTotalSizeY-GRID_EDGE+20) return -1;
  	var ret_teach = -1;
  	TeacherListIterator(function(x, y, teach) {
  		if (pos.x>=x && pos.y>=y && pos.x<x+TEACHER_BTN_SIZE_X && pos.y<y+TEACHER_BTN_SIZE_Y)
  	    ret_teach = teach;	
  	});
  	return ret_teach;		
	},
	clickbtn: function()
  {
	  if (HLBtn==-1) return;
	  CurrTeacher = HLBtn; // current selected teacher
	  GetCurrMonday(new Date());
	  TeachScrollPosY = ScrollPosY; // store position of teacher list
	  GotoTab("teachsched");  	
  }
},
//// TEACHERS SCHEDULE ///////////////////////////////////////////////////////////////////////////////////
"teachsched": {
	BackTab: "teachers",
	init: function()
	{
		InitGeneralTab();
		labels['period'].v = true;
	    SetTeacherWeek(0);
	},
	resize: function(ratio)
	{
		  ResizeGeneralTab(ratio, false);

		  // resize and recalculate cell size
		  TS_FIRST_COL_SIZE_X = Math.round(TS_COL_SIZE_X*0.9);
		  TS_FIRST_ROW_SIZE_Y = Math.round(TS_ROW_SIZE_Y*0.9);
	      ScrollTotalSizeX = TS_FIRST_COL_SIZE_X + TS_COL_SIZE_X*NIKA.WEEKDAYNUM+1;
	      ScrollTotalSizeY = TS_FIRST_ROW_SIZE_Y + TS_ROW_SIZE_Y*NIKA.LESSONSINDAY+1;
	      if (!NIKA.FIRSTLESSONNUM) ScrollTotalSizeY += TS_ROW_SIZE_Y; // zero lesson 
	      ScrollStepX = TS_COL_SIZE_X;
	      ScrollStepY = TS_ROW_SIZE_Y;
			
	      ScrollBox.w = Math.round(Canvas.width - 450+307*(ratio-1));
	      if (ScrollBox.w>ScrollTotalSizeX) ScrollBox.w = ScrollTotalSizeX;
	  	  ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
	  	  ScrollBox.y = TOP_HEIGHT + 124;
	      ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;
	      if (ScrollBox.h>ScrollTotalSizeY) ScrollBox.h = ScrollTotalSizeY;
				
	      labels['period'].x = ScrollBox.x+ScrollBox.w/2; 
	      ScrollTranspEdges = 0;
	      btns['changes'].x = ScrollBox.x - Math.round(160/ratio);
	      btns['changes'].y = ScrollBox.y - Math.round(80/ratio);
	      btns['changes'].w = Math.round(206/ratio);
	      btns['changes'].h = Math.round(206/ratio);
	      labels['change_ln1'].x = btns['changes'].x + btns['changes'].w/2;
	      labels['change_ln2'].x = labels['change_ln1'].x;
	      labels['change_ln1'].y = btns['changes'].y + Math.round(btns['changes'].h*0.55);
	      labels['change_ln2'].y = labels['change_ln1'].y + Math.round(22/ratio);
			
			if (ExchangesExist) {
				btns['arrow_left'].x = ScrollBox.x - 87;
				btns['arrow_left'].y = ScrollBox.y + ScrollBox.h/2;
				btns['arrow_right'].x = ScrollBox.x + ScrollBox.w + 20;
				btns['arrow_right'].y = btns['arrow_left'].y;
				labels['prev_week_ln1'].x = ScrollBox.x - 110;
			    labels['prev_week_ln1'].y = btns['arrow_left'].y - 30;				
				labels['prev_week_ln2'].x = ScrollBox.x - 110;
			    labels['prev_week_ln2'].y = btns['arrow_left'].y - 10;				
				labels['next_week_ln1'].x = btns['arrow_right'].x;
			    labels['next_week_ln1'].y = btns['arrow_right'].y - 30;				
				labels['next_week_ln2'].x = btns['arrow_right'].x;
			    labels['next_week_ln2'].y = btns['arrow_right'].y - 10;				
			}
			ResizeScrollBtn(true);
	},
	drawback: function(ctx, ratio) 
	{
		var s;
		switch (CurrWeekNum) {
			case 0: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_WEEK);  break;
			case 1: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_1WEEK); break; 
			case 2: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_2WEEK); break;
		}
	  s = s.charAt(0).toUpperCase() + s.slice(1);
		
	  DrawBackGeneralTab(ctx, ratio);
	  labels['title'].caption = s;
	  DrawTitleLesson(ctx);
	  DrawTitleTeacher(ctx, ratio);
	},		
	drawscroll: function(ctx)
	{
  	ctx.textBaseline = "top";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    var x, y, period, DayNum, lsn, g, subj, cls, room, groups, texty, exch;
    
  	// draw cells
  	x = TS_FIRST_COL_SIZE_X;
  	dat = new Date(CurrMonday);
  	for (var i=0;i<NIKA.WEEKDAYNUM;i++) {
  		DayNum = dat.getDay();
  		DayNum = (DayNum)? DayNum:7;
  		period = GetPeriod(dat);
  		
/////////////////////////////////////////////////////////////
      function drawText(color, fontstyle, txt) {
      	if (txt.length<9)  ctx.font = fontstyle + " 18px Arial"; 
       	  else
      	if (txt.length<12)  ctx.font = fontstyle + " 16px Arial"; 
      	  else
       	if (txt.length<14)  ctx.font = fontstyle + " 14px Arial"; 
       	  else
      	if (txt.length<17)  ctx.font = fontstyle + " 12px Arial";   	
      	  else {
      	    txt = txt.substr(0,14)+"...";
      	    ctx.font = fontstyle + " 12px Arial"; 
      	};
      	  
      	ctx.fillStyle = exch?TS_EXCHANGE_COLOR:color;  	
      	if (FreeTeacher) {
      		ctx.fillText(txt,  x + TS_COL_SIZE_X/2, texty);
      		ctx.strokeStyle = TS_EXCHANGE_COLOR;
      		ctx.strokeRect(x + TS_COL_SIZE_X/2-ctx.measureText(txt).width/2, texty+10, ctx.measureText(txt).width, 1);
      	}
      	else 
      		ctx.fillText(txt, x + TS_COL_SIZE_X/2, texty);
      	texty += 20;
      }; 
/////////////////////////////////////////////////////////////
  		
  		if (window['NIKA'].TEACH_SCHEDULE[period] && window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher]) {
        y = TS_FIRST_ROW_SIZE_Y;
        ctx.textAlign = "center";
  		  for (var LessonNum=NIKA.FIRSTLESSONNUM;LessonNum<=NIKA.LESSONSINDAY;LessonNum++) {
  			  lsn = DayNum.toString()+addZero(LessonNum);
  			  FreeTeacher = false;
  			  cls = ""; subj=""; room = ""; texty = y+10; groups = ""; exch = false;
  			  
		  		if (window['NIKA'].TEACH_EXCHANGE 
		  		 && window['NIKA'].TEACH_EXCHANGE[CurrTeacher]
		  		 && window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)]
		  		 && window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum]) {
		  			exch = true; // cell has exchanges
		  			FreeTeacher = (NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].s=='F'); 	
		  			if (!FreeTeacher) {
		  				// classes after exchanges
							for (var j in NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].c) {
    						if (cls) cls += ", ";
    						cls += NIKA.CLASSES[NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].c[j]];
    					}
    					// room after exchanges
    					if (NIKA.USEROOMS && window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].r) {
    						room = "("+NIKA.ROOMS[NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].r]+")";
    						if (cls.length+room.length<14) {
    							cls += " "+room;
    							room="";
    						}
    					}	
    					// groups after exchanges
    					if (window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].g) {
    						for (var grp in NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].g) {
    							g = NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].g[grp];
    							if (g!=-1) {
    								g = NIKA.CLASSGROUPS[g];
    								if (groups.indexOf(g)!=-1) continue;
    								if (groups) groups += ',';
    								groups += g;
    							}
    						}	
    					}
    					// subject after exchanges
   						subj = NIKA.SUBJECTS[NIKA.TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)][LessonNum].s];
		  			}
  				}
 
				if (LessonNum & 1 ^ DayNum & 1) ctx.fillStyle = TS_CELL_COLOR1;
				else
					ctx.fillStyle = TS_CELL_COLOR2;
				ctx.fillRect(x, y, TS_COL_SIZE_X, TS_ROW_SIZE_Y);
		  		
  			  if (!exch || FreeTeacher) {
  			  	  while (true) 
  				  if (window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher][lsn]) { 
  					if (window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher][lsn].s=="M") {
  	  			  	// method hour
  	  			  		if (LessonNum & 1 ^ DayNum & 1) ctx.fillStyle = TS_METHOD_COLOR1;
  	  			  			else
  	  			  				ctx.fillStyle = TS_METHOD_COLOR2; 
    				  	ctx.fillRect(x, y, TS_COL_SIZE_X, TS_ROW_SIZE_Y);
    				  	break;		
    				}
    					else
    					{
    						// classes 
    						for (var j in NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].c) {
    							if (cls) cls += ", ";
    							cls += NIKA.CLASSES[NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].c[j]];
    						}
    						// room
    						if (NIKA.USEROOMS && window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher][lsn].r) {
    							room = "("+NIKA.ROOMS[NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].r]+")";
    							if (cls.length+room.length<14) {
    								cls += " "+room;
    								room="";
    							}
    						}
    						// groups
    						if (window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher][lsn].g) {
    							for (var grp in NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].g) {
	    							g = NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].g[grp];
  	  							if (g!=-1) {
    									g = NIKA.CLASSGROUPS[g];
    									if (groups.indexOf(g)!=-1) continue;
    									if (groups) groups += ',';
    									groups += g;
    								}
    							}
    						}
    						// subject
    						subj = NIKA.SUBJECTS[NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].s];
    					    break;
    					}
    				}
    				else // try to find one-week hour for dualweek schedule
    				{
    					if (CurrWeekNum>0 && lsn.length==3) lsn = CurrWeekNum.toString() + lsn;
    					   else break;
    				}
    			}
    			
    			if (subj) {  // if not method hour
    				if (cls)  drawText(SCHED_FONT_COLOR, 'bold', cls);
    				if (room) drawText(SCHED_FONT_COLOR, 'bold', room);
    				if (groups) drawText(SCHED_GROUP_COLOR, 'italic', groups);
    				if ((CurrSubject==-1 && texty-y-10<50) || (CurrSubject!=-1 && subj!=CurrSubject)) drawText(SCHED_FONT_COLOR, 'bold', subj);
    			}
  			  y += TS_ROW_SIZE_Y;
  		  } // LessonNum
  	  }  
  
  		dat.setDate(dat.getDate()+1);
  		x += TS_COL_SIZE_X; 
  	} 
  	
  	// fix top header
    ctx.translate(0, ScrollPosY);
  	ctx.fillStyle = "#FFFFFF";
  	ctx.fillRect(0, 0, ScrollTotalSizeX, TS_FIRST_ROW_SIZE_Y);	
  	ctx.translate(0, -ScrollPosY);
  	
  	dat = new Date(CurrMonday);
    ctx.translate(0, ScrollPosY);
  	x = TS_FIRST_COL_SIZE_X;
  	for (var i=0;i<NIKA.WEEKDAYNUM;i++) {
  		DayNum = dat.getDay();
  		DayNum = (DayNum)? DayNum:7;
  
  		if (DayNum & 1) ctx.fillStyle = TS_TITLE_COLOR1;
  		else
  			ctx.fillStyle = TS_TITLE_COLOR2; 
  		ctx.fillRect(x, 0, TS_COL_SIZE_X, TS_FIRST_ROW_SIZE_Y);		
  			
  		ctx.fillStyle = BTN_TEXT_COLOR;
  		ctx.font = "bold 22px Arial, sans-serif";
  		ctx.textAlign = "center";
  		ctx.fillText(NIKA.DAY_NAMESH[DayNum-1],  x + TS_COL_SIZE_X/2, 14);
  		ctx.font = "normal 16px Arial";	
  		ctx.fillStyle = GRAY_TEXT_COLOR;	
  		ctx.fillText(DateAsStr(dat),  x + TS_COL_SIZE_X/2, TS_FIRST_ROW_SIZE_Y - 24);
  		
  		if (window['NIKA'].TEACH_EXCHANGE && 
  			window['NIKA'].TEACH_EXCHANGE[CurrTeacher] && 
  			window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)]) {

				ctx.strokeStyle = TS_EXCHANGE_COLOR_TITLE;
				ctx.lineWidth = 2;
				ctx.strokeRect(x+1, 2, TS_COL_SIZE_X-4, TS_FIRST_ROW_SIZE_Y-2);
  		}
  		dat.setDate(dat.getDate()+1);
  		x += TS_COL_SIZE_X; 
  	}
  	ctx.translate(0, -ScrollPosY);
  	
    // fix left header (lessonnum)
    ctx.translate(ScrollPosX, 0);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, TS_FIRST_COL_SIZE_X, ScrollTotalSizeY);		
  	y = TS_FIRST_ROW_SIZE_Y;
  	for (var LessonNum=NIKA.FIRSTLESSONNUM;LessonNum<=NIKA.LESSONSINDAY;LessonNum++) {
  		if (LessonNum & 1) ctx.fillStyle = TS_TITLE_COLOR1;
  		else
  			ctx.fillStyle = TS_TITLE_COLOR2; 
    	ctx.fillRect(0, y, TS_FIRST_COL_SIZE_X, TS_ROW_SIZE_Y);		
    	
  		ctx.fillStyle = BTN_TEXT_COLOR;
  		ctx.font = "bold 22px Arial, sans-serif";
  		ctx.textAlign = "center";
  		ctx.fillText(LessonNum.toString()+" " + NIKA.LESSON_STR, TS_FIRST_COL_SIZE_X/2, y+14);
  		ctx.textAlign = "center";
  		ctx.fillStyle = GRAY_TEXT_COLOR;
  		ctx.font = "normal 16px Arial, sans-serif";
  		ctx.fillText(NIKA.LESSON_TIMES[LessonNum][0]+" - "+NIKA.LESSON_TIMES[LessonNum][1], TS_FIRST_COL_SIZE_X/2, y+42);
  		y += TS_ROW_SIZE_Y;
  	}
    ctx.translate(-ScrollPosX, 0);	
    
    // top-left corner
    ctx.translate(ScrollPosX, ScrollPosY);	
  	ctx.fillStyle = TS_TITLE_COLOR2;
   	ctx.fillRect(0, 0, TS_FIRST_COL_SIZE_X, TS_FIRST_ROW_SIZE_Y);		
  	ctx.translate(-ScrollPosX, -ScrollPosY);
	},
	getbtn: function(pos)
	{
		return -1;
	},
	toPrev: function()
	{
		SetTeacherWeek(-7);
		window.onresize();
	},
	toNext: function()
	{
		SetTeacherWeek(7);
		window.onresize();
	},
	toCalendar: function()
	{
		GotoTab("teachcalendar");
	}
},
//// TEACHERS CALENDAR ///////////////////////////////////////////////////////////////////////////////////
"teachcalendar": {
	BackTab: "teachsched",
	init: function()
	{
		InitGeneralTab();
		labels['period'].v = true;
		SetMonth(0);
		labels['prev_month_ln1'].v = true;
		labels['prev_month_ln2'].v = true;
		labels['next_month_ln1'].v = true;
		labels['next_month_ln2'].v = true;
	},
	resize: function(ratio)
	{
		ResizeGeneralTab(ratio, true);

		labels['period'].x = ScrollBox.x+ScrollBox.w/2; 
    
		btns['arrow_left'].x = ScrollBox.x - 87;
		btns['arrow_left'].y = ScrollBox.y + ScrollBox.h/2;
		btns['arrow_right'].x = ScrollBox.x + ScrollBox.w + 20;
		btns['arrow_right'].y = btns['arrow_left'].y;
		
		labels['prev_month_ln1'].x = ScrollBox.x - 110;
		labels['prev_month_ln1'].y = btns['arrow_left'].y - 30;				
		labels['prev_month_ln2'].x = ScrollBox.x - 110;
		labels['prev_month_ln2'].y = btns['arrow_left'].y - 10;				
		labels['next_month_ln1'].x = btns['arrow_right'].x;
		labels['next_month_ln1'].y = btns['arrow_right'].y - 30;				
		labels['next_month_ln2'].x = btns['arrow_right'].x;
		labels['next_month_ln2'].y = btns['arrow_right'].y - 10;				
		
		ResizeScrollBtn(true);
	},
	drawback: function(ctx, ratio) {
		DrawBackGeneralTab(ctx, ratio);

	  DrawTitleLesson(ctx);		
	  DrawTitleTeacher(ctx, ratio);	  
	},
	drawscroll: function(ctx)
	{
		DrawCalendar(ctx, function (dat) {
			if (window['NIKA'].TEACH_EXCHANGE && 
	    			window['NIKA'].TEACH_EXCHANGE[CurrTeacher] && 
	    			window['NIKA'].TEACH_EXCHANGE[CurrTeacher][DateAsStr(dat)]) {
	    			  return true;
	    		}			
			return false;
		});
	},
	getbtn: function(pos)
	{
	   	var DayNum,
	   	    month = StartCalendarDate.getMonth(),
	   	  	dat = dat = new Date(StartCalendarDate.getFullYear(), StartCalendarDate.getMonth(), 1),
	   			y = Math.round(CL_FIRST_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH);
	   	while (dat.getMonth()==month) {
	   		DayNum = dat.getDay();
	    	DayNum = (DayNum)? DayNum:7;
	      
	      if (pos.y>=y && pos.y<=y+Math.round(CL_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH)) {
	      	return dat;
	      }
	      if (DayNum==7) y += Math.round(CL_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH);	
	      dat.setDate(dat.getDate()+1); 	
   	}
		
		return -1;
	},
	clickbtn: function()
  {
	  if (HLBtn==-1) return;
	  GetCurrMonday(HLBtn);
	  GotoTab("teachsched");  	
  },	
	toPrev: function()
	{
		SetMonth(-1);
	},
	toNext: function()
	{
		SetMonth(1);
	}
},
//// CLASSES SCHEDULE ///////////////////////////////////////////////////////////////////////////////////
"classched": {
	BackTab: "classes",
	init: function()
	{
	  InitGeneralTab();
	  labels['period'].v = true;
	  SetClassWeek(0);
	},
	resize: function(ratio)
	{
	  ResizeGeneralTab(ratio, false);
  	  ScrollBox.y = TOP_HEIGHT + 124;
  	  ScrollBox.w = Math.round(Canvas.width - 450+307*(ratio-1));
      ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;
	  
	  ClassSchedColCount = 3;
	  
	  // calc scroll area width
	  while (ClassSchedColCount>1) {
		  RealDayDistanceX = CS_MAX_DAY_DISTANCE;
		  ScrollTotalSizeX = ClassSchedColCount*CS_DAY_WIDTH + (ClassSchedColCount-1)*RealDayDistanceX;
		  if (ScrollBox.w<ScrollTotalSizeX) {
			  RealDayDistanceX = Math.round((ScrollBox.w - 20 - ClassSchedColCount*CS_DAY_WIDTH)/(ClassSchedColCount-1));
			  if (RealDayDistanceX<CS_MIN_DAY_DISTANCE) RealDayDistanceX = CS_MIN_DAY_DISTANCE;
			  ScrollTotalSizeX = ClassSchedColCount*CS_DAY_WIDTH + (ClassSchedColCount-1)*RealDayDistanceX;
		  }
		  
		  if (ScrollBox.w>=ScrollTotalSizeX) {
	    	  ScrollBox.w = ScrollTotalSizeX;
	    	  break;
		  } 
		  ClassSchedColCount--;
	  }
  	  ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
	  
	  // calc scroll area height
	  var row_count = Math.ceil(NIKA.WEEKDAYNUM/ClassSchedColCount);

	  var r = row_count, box_height = CS_ADD_BOX_HEIGHT + MaxLessonCount*CS_ROW_SIZE_Y;
	  while (true) {
		  if (r>1) {
		  	RealDayDistanceY = Math.round((ScrollBox.h - r*box_height)/(r-1));
		  	if (RealDayDistanceY<CS_MIN_DAY_DISTANCE)  r--; else break;
		  }
		  else if (r=1) {
			  RealDayDistanceY = CS_MIN_DAY_DISTANCE;
			  break;
		  }
	  }
	  if (RealDayDistanceY>CS_MAX_DAY_DISTANCE) RealDayDistanceY = CS_MAX_DAY_DISTANCE;
	  ScrollTotalSizeY = row_count*box_height+(row_count-1)*RealDayDistanceY;
	 
      if (ScrollBox.h>ScrollTotalSizeY) ScrollBox.h = ScrollTotalSizeY;

	  ScrollStepX = CS_DAY_WIDTH;
      ScrollStepY = box_height + RealDayDistanceY;

      labels['period'].x = ScrollBox.x+ScrollBox.w/2; 
      ScrollTranspEdges = 0;
      btns['changes'].x = ScrollBox.x - Math.round(160/ratio);
      btns['changes'].y = ScrollBox.y - Math.round(80/ratio);
      btns['changes'].w = Math.round(206/ratio);
      btns['changes'].h = Math.round(206/ratio);
      labels['change_ln1'].x = btns['changes'].x + btns['changes'].w/2;
      labels['change_ln2'].x = labels['change_ln1'].x;
      labels['change_ln1'].y = btns['changes'].y + Math.round(btns['changes'].h*0.55);
      labels['change_ln2'].y = labels['change_ln1'].y + Math.round(22/ratio);
			
		if (ExchangesExist) {
			btns['arrow_left'].x = ScrollBox.x - 87;
			btns['arrow_left'].y = ScrollBox.y + ScrollBox.h/2;
			btns['arrow_right'].x = ScrollBox.x + ScrollBox.w + 20;
			btns['arrow_right'].y = btns['arrow_left'].y;
			labels['prev_week_ln1'].x = ScrollBox.x - 110;
		    labels['prev_week_ln1'].y = btns['arrow_left'].y - 30;				
			labels['prev_week_ln2'].x = ScrollBox.x - 110;
		    labels['prev_week_ln2'].y = btns['arrow_left'].y - 10;				
			labels['next_week_ln1'].x = btns['arrow_right'].x;
		    labels['next_week_ln1'].y = btns['arrow_right'].y - 30;				
			labels['next_week_ln2'].x = btns['arrow_right'].x;
		    labels['next_week_ln2'].y = btns['arrow_right'].y - 10;				
		}
		ResizeScrollBtn(true);

	},
	drawback: function(ctx, ratio) 
	{
		var s;
		switch (CurrWeekNum) {
			case 0: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_WEEK);  break;
			case 1: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_1WEEK); break; 
			case 2: s = String(NIKA.SCHEDULE_STR.toLowerCase() + " " + NIKA.FOR_2WEEK); break;
		}
		s = s.charAt(0).toUpperCase() + s.slice(1);
		
		DrawBackGeneralTab(ctx, ratio);
		labels['title'].caption = s;
		DrawTitleLesson(ctx);
		DrawTitleClass(ctx, ratio);
	},
	drawscroll: function(ctx)
	{
		ctx.textBaseline = "top";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		var period, x=0, y=0, LsnY, SubjStr, PrevSubj, RoomsStr, r, PrevEmpty, LessonsExist,
			exch, FreeClass, RelativeLessonNum, upk, FirstShift, FirstRow, 
			DayHeight = CS_ADD_BOX_HEIGHT + MaxLessonCount*CS_ROW_SIZE_Y;
		    dat = new Date(CurrMonday);
		
		CS_BusyDay = [];    
		for (var DayNum = 1; DayNum<=NIKA.WEEKDAYNUM; DayNum++) {
			period = GetPeriod(dat);
			FirstRow = true;
			CS_BusyDay[DayNum] = true;

			// draw daybox rectangle
			ctx.drawImage(DayLineImg, x, y, DayLineImg.width, DayHeight);
			ctx.drawImage(DayBoxImg, x+4, y, CS_DAY_WIDTH, DayHeight);			
			
			// day caption
			ctx.font = "bold 18px Arial";
			ctx.textAlign = "center";
			ctx.fillStyle = BTN_TEXT_COLOR;
			ctx.fillText(NIKA.DAY_NAMES[DayNum-1], x + CS_DAY_WIDTH/2, y + 18);
			ctx.font = "normal 14px Arial, sans-serif"; 
			ctx.fillStyle = SCHED_FONT_COLOR;
			ctx.fillText("("+dat.getDate() + " " + NIKA.MONTHS2[dat.getMonth()]+")", x + CS_DAY_WIDTH/2, y + 40);
			
			LsnY = 60;
			ctx.textAlign = "left";	
			PrevEmpty = false;
			LessonsExist = false;
			FirstShift = (SecondShiftNum==1);
			for (var LessonNum = MinFirstLessonNum; LessonNum<=NIKA.LESSONSINDAY; LessonNum++) {
				lsn = DayNum.toString()+addZero(LessonNum);	
				SubjStr = ""; PrevSubj = ""; RoomsStr = ""; exch = false; FreeClass = false; upk = false;
		  		if (window['NIKA'].CLASS_EXCHANGE 
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass]
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)]
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum]) {
				  			exch = true; // cell has exchanges
				  			FreeClass = (NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].s[0]=='F'); 	
				  			if (!FreeClass) {
				  				for (var i in NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].s) {
				  					Subj = NIKA.SUBJECTS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].s[i]];
				  					if (!Subj) Subj=NIKA.LESSON_CANCELED_STR;
				  					if (Subj!=PrevSubj) {
				  						if (SubjStr) SubjStr += "/";
				  						SubjStr += Subj;
				  						PrevSubj = Subj;
				  					}
				  					if (NIKA.USEROOMS && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].r) {
				  						if (RoomsStr) RoomsStr += ",";
				  						r = NIKA.ROOMS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].r[i]];
				  						if (!r) r=NIKA.NO_STR;
				  						RoomsStr += r;
				  					}
				  				}	
				  			} else 
				  			if (!StrikeOutFreeLsn) {
				  				SubjStr = NIKA.LESSON_CANCELED_STR;
				  			}
		  		}
		  		
		  		if (!exch || (FreeClass && StrikeOutFreeLsn) ) {
		  			SubjStr = ""; PrevSubj = ""; RoomsStr = "";
		  			while (true)
		  			if (window['NIKA'].CLASS_SCHEDULE[period] && window['NIKA'].CLASS_SCHEDULE[period][CurrClass] &&
		  				window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn]) {
		  				for (var i in NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s) {
		  					Subj = NIKA.SUBJECTS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s[i]];
		  					if (!Subj) Subj="("+NIKA.NO_LESSONS_STR+")";
		  					if (Subj!=PrevSubj) {
		  						if (SubjStr) SubjStr += "/";
		  						SubjStr += Subj;
		  						PrevSubj = Subj;
		  					}
		  					if (NIKA.USEROOMS && window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn].r) {
		  						if (RoomsStr) RoomsStr += ",";
		  						r = NIKA.ROOMS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].r[i]];
		  						if (!r) r=NIKA.NO_STR;
		  						RoomsStr += r;
		  					}
		  				}
		  				if (NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s.length==1) {
		  					if (NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s[i][0]=='u') upk = true;
		  				
		  				}
		  				break;
		  			}
		  			else
		  			{
    					if (CurrWeekNum>0 && lsn.length==3) lsn = CurrWeekNum.toString() + lsn;
    					   else break;
		  			}
		  		} 
		  		
	    	 if (RoomsStr && SubjStr) SubjStr = SubjStr + " ("+RoomsStr+")"; 
	    	 if (SubjStr) {
	    		 // draw time for first lesson
	    		 if (FirstRow) {
	    			 ctx.fillStyle = SCHED_GROUP_COLOR;
             ctx.strokeStyle = SCHED_GROUP_COLOR;
	    			 ctx.font = "underline 12px Arial, sans-serif";
	    			 ctx.fillText(NIKA.LESSON_TIMES[LessonNum][0], x + CS_LEFT_SHIFT, y + LsnY-1);
	    			 ctx.fillRect(x + CS_LEFT_SHIFT, y + LsnY+12, ctx.measureText(NIKA.LESSON_TIMES[LessonNum][0]).width, 1);
	    			 LsnY += CS_ROW_SIZE_Y - 14;
	    			 FirstRow = false;
	    		 }
	    		 
	    		 // calc relative lesson number for second shift
	    		 RelativeLessonNum = LessonNum;
	    		 asterisk = false;
	    		 if (SecondShiftNum>1 && !FirstShift) {
	    			 if (LessonNum<SecondShiftNum) {
	    				 FirstShift = true;
	    			 }
	    			 else {
	    				 RelativeLessonNum = LessonNum-SecondShiftNum+1;
	    				 asterisk = true;
	    			 }
	    		 }
		    	 ctx.fillStyle = (exch && (!FreeClass || (FreeClass && !StrikeOutFreeLsn)) )?TS_EXCHANGE_COLOR:
		    		 				FreeClass?SCHED_GROUP_COLOR: 
		    		 					upk?UPK_COLOR: BTN_TEXT_COLOR;  	
		    	 ctx.font = "normal 16px Arial, sans-serif";
		    	 
		    	 if (NIKA.SECOND_RELATIVE) {
		    		 ctx.fillText(RelativeLessonNum + ".", x + CS_LEFT_SHIFT, y + LsnY+5);
		    	 }
		    	 else {
		    		 ctx.fillText(LessonNum + ".", x + CS_LEFT_SHIFT, y + LsnY+5);
		    	 }
		    	 font_height = 14;
		    	 if (ctx.measureText(SubjStr).width>CS_DAY_WIDTH-50) {
		    		 ctx.font = "normal 14px Arial, sans-serif";
		    		 font_height = 14;
		    	 }
		    	 if (ctx.measureText(SubjStr).width>CS_DAY_WIDTH-50) {
		    		 ctx.font = "normal 12px Arial, sans-serif";
		    		 font_height = 10;
		    	 }
		    	 if (ctx.measureText(SubjStr).width>CS_DAY_WIDTH-50) {
		    		 ctx.font = "normal 10px Arial, sans-serif";
		    		 font_height = 8;
		    	 }
		    	 if (ctx.measureText(SubjStr).width>CS_DAY_WIDTH-50) {
		    		var lines = SubjStr.split(" (", 2);
		    		
		    		ctx.fillText(lines[0], x + CS_LEFT_SHIFT + 22, y + LsnY-1);
		    		ctx.fillText("("+lines[1], x+CS_LEFT_SHIFT + 22, y + LsnY+12);
			    	if (FreeClass && StrikeOutFreeLsn) {
			    			ctx.strokeStyle = SCHED_GROUP_COLOR;
			    			ctx.fillRect(x + CS_LEFT_SHIFT + 22, y + LsnY+4, ctx.measureText(lines[0]).width, 1);
			    			ctx.fillRect(x + CS_LEFT_SHIFT + 22, y + LsnY+17, ctx.measureText(lines[1]).width, 1);
			    	}		    		
		    	 }
		    	 else {
		    		 ctx.fillText(SubjStr, x + CS_LEFT_SHIFT + 22, y + LsnY+5);
			    	 if (FreeClass && StrikeOutFreeLsn) {
			    		 	ctx.strokeStyle = SCHED_GROUP_COLOR;
			    		 	ctx.fillRect(x + CS_LEFT_SHIFT + 22, y + LsnY+font_height, ctx.measureText(SubjStr).width, 1);
				       	}
		    	 }
	    	 
		    	 if (asterisk) {
		    		 ctx.font = "bold 16px Arial";
		    		 ctx.fillStyle = SECOND_SHIFT_COLOR;
		    		 if (NIKA.SECOND_RELATIVE) {
		    			 ctx.fillText('*', x+CS_LEFT_SHIFT+ctx.measureText(RelativeLessonNum).width, y + LsnY+5); 
		    		 }
		    		 else {
		    			 ctx.fillText('*', x+CS_LEFT_SHIFT+ctx.measureText(LessonNum).width, y + LsnY+5); 
		    		 }
		    	 }
		    	 
		    	 LsnY += CS_ROW_SIZE_Y;
		    	 PrevEmpty = false;
		    	 LessonsExist = true;
	    	 }
	    	 else
	    		 {
	    		 	if (!PrevEmpty) LsnY += CS_ROW_SIZE_Y;
	    		 	PrevEmpty = true;
	    		 	// don't keep first cell free for second shift
	    		 	if (!FirstShift && LessonNum<SecondShiftNum) {
	    		 		PrevEmpty = false;
	    		 		LsnY -= CS_ROW_SIZE_Y;
	    		 	}
	    		 }
			}
			
			if (!LessonsExist) {
				CS_BusyDay[DayNum] = false;
				ctx.textAlign = 'center';
				ctx.fillStyle = SCHED_GROUP_COLOR;
				ctx.font = "bold 16px Arial";
				ctx.fillText(NIKA.NO_LESSONS_STR, x + CS_DAY_WIDTH/2, y + 75);
				ctx.textAlign = 'left';
			}
			else {
				// highlight selected day
				if (HLBtn==DayNum) ctx.drawImage(SelectDayHL, x + 16, y + 16);
				else
				  ctx.drawImage(SelectDay, x + 16, y + 16); 
			}
			
			x += CS_DAY_WIDTH + RealDayDistanceX;
			if (DayNum % ClassSchedColCount==0) {
				y += RealDayDistanceY+DayHeight;
				x = 0;
			}
			
			dat.setDate(dat.getDate()+1); 	
		}
		
	},
	getbtn: function(pos)
	{
		var x=0, y=0, DayHeight=CS_ADD_BOX_HEIGHT + MaxLessonCount*CS_ROW_SIZE_Y;;
		for (var DayNum = 1; DayNum<=NIKA.WEEKDAYNUM; DayNum++) {
			if (pos.x>=x && pos.x<x+CS_DAY_WIDTH && pos.y>=y && pos.y<y+DayHeight-6) {
				return DayNum;
			}
			x += CS_DAY_WIDTH + RealDayDistanceX;
			if (DayNum % ClassSchedColCount==0) {
				y += RealDayDistanceY+DayHeight;
				x = 0;
			}
		}
		return -1;
	},
	toPrev: function()
	{
		SetClassWeek(-7);
		window.onresize();
	},
	toNext: function()
	{
		SetClassWeek(7);
		window.onresize();
	},
	clickbtn: function()
	{
		if (HLBtn==-1) return;
		if (!CS_BusyDay[HLBtn]) return;
		CurrDay = new Date(CurrMonday);
		CurrDay.setDate(CurrDay.getDate()+HLBtn-1);
		GotoTab("classday");
	},
	toCalendar: function()
	{
		GotoTab("classcalendar");
	}	
},
////CLASS CALENDAR ///////////////////////////////////////////////////////////////////////////////////
"classcalendar": {
	BackTab: "classched",
	init: function()
	{
		InitGeneralTab();
		labels['period'].v = true;
		SetMonth(0);
		labels['prev_month_ln1'].v = true;
		labels['prev_month_ln2'].v = true;
		labels['next_month_ln1'].v = true;
		labels['next_month_ln2'].v = true;
	},
	resize: function(ratio)
	{
		ResizeGeneralTab(ratio, true);

		labels['period'].x = ScrollBox.x+ScrollBox.w/2; 
    
		btns['arrow_left'].x = ScrollBox.x - 87;
		btns['arrow_left'].y = ScrollBox.y + ScrollBox.h/2;
		btns['arrow_right'].x = ScrollBox.x + ScrollBox.w + 20;
		btns['arrow_right'].y = btns['arrow_left'].y;
		
		labels['prev_month_ln1'].x = ScrollBox.x - 110;
		labels['prev_month_ln1'].y = btns['arrow_left'].y - 30;				
		labels['prev_month_ln2'].x = ScrollBox.x - 110;
		labels['prev_month_ln2'].y = btns['arrow_left'].y - 10;				
		labels['next_month_ln1'].x = btns['arrow_right'].x;
		labels['next_month_ln1'].y = btns['arrow_right'].y - 30;				
		labels['next_month_ln2'].x = btns['arrow_right'].x;
		labels['next_month_ln2'].y = btns['arrow_right'].y - 10;				
		
		ResizeScrollBtn(true);
	},
	drawback: function(ctx, ratio) {
		DrawBackGeneralTab(ctx, ratio);

		DrawTitleLesson(ctx);		
		DrawTitleClass(ctx, ratio);	  
	},
	drawscroll: function(ctx)
	{
		DrawCalendar(ctx, function (dat) {
			if (window['NIKA'].CLASS_EXCHANGE && 
	    			window['NIKA'].CLASS_EXCHANGE[CurrClass] && 
	    			window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)]) {
	    			  return true;
	    		}		
			return false;
		});
	},
	getbtn: function(pos)
	{
	   	var DayNum,
	   	    month = StartCalendarDate.getMonth(),
	   			dat = dat = new Date(StartCalendarDate.getFullYear(), StartCalendarDate.getMonth(), 1),
	   			y = Math.round(CL_FIRST_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH);
	   	while (dat.getMonth()==month) {
	   		DayNum = dat.getDay();
	    	DayNum = (DayNum)? DayNum:7;
	      
	      if (pos.y>=y && pos.y<=y+Math.round(CL_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH)) {
	      	return dat;
	      }
	      if (DayNum==7) y += Math.round(CL_ROW_SIZE_Y*ScrollBox.w/CL_MAX_WIDTH);	
	      dat.setDate(dat.getDate()+1); 	
   	}
		
		return -1;
	},
	clickbtn: function()
	{
		if (HLBtn==-1) return;
		GetCurrMonday(HLBtn);
		GotoTab("classched");  	
	},	
	toPrev: function()
	{
		SetMonth(-1);
	},
	toNext: function()
	{
		SetMonth(1);
	}	
},
////CLASS DAY SCHEDULE ///////////////////////////////////////////////////////////////////////////////////
"classday": {
	BackTab: "classched",
	init: function()
	{
	  InitGeneralTab();
	  labels['period'].v = false;
	  SetClassDay(0);
	},
	resize: function(ratio)
	{
		ResizeGeneralTab(ratio, false);
		ScrollBox.y = TOP_HEIGHT + 124;
		ScrollBox.w = Math.round(Canvas.width - 280);
		if (ScrollBox.w>CDS_TABLE_WIDTH) ScrollBox.w = CDS_TABLE_WIDTH;
		ScrollBox.h = Canvas.height - ScrollBox.y - BOTTOM_HEIGHT - 30;
		ScrollBox.x = Canvas.width/2-ScrollBox.w/2;
		
		ScrollStepX = 1;
		ScrollStepY = CDS_ROW_HEIGHT;
		ScrollTranspEdges = 12;
		
		ScrollTotalSizeX = ScrollBox.w;
		ScrollTotalSizeY = 0;
		
		if (FirstLessonNum==-1) { // empty day
			ScrollTotalSizeY += CDS_ROW_HEIGHT;
		}
		else
		for (var lsn = FirstLessonNum; lsn<=LastLessonNum; lsn++) {
			ScrollTotalSizeY += CDS_ROW_HEIGHT;
		}	
		
		if (ScrollBox.h>ScrollTotalSizeY) ScrollBox.h = ScrollTotalSizeY;
			
		btns['arrow_left'].x = ScrollBox.x - 87;
		btns['arrow_left'].y = ScrollBox.y + ScrollBox.h/2;
		btns['arrow_right'].x = ScrollBox.x + ScrollBox.w + 20;
		btns['arrow_right'].y = btns['arrow_left'].y;
		labels['prev_month_ln1'].x = ScrollBox.x - 110;
		labels['prev_month_ln1'].y = btns['arrow_left'].y - 30;				
		labels['prev_day_ln2'].x = ScrollBox.x - 110;
		labels['prev_day_ln2'].y = btns['arrow_left'].y - 10;				
		labels['next_month_ln1'].x = btns['arrow_right'].x;
		labels['next_month_ln1'].y = btns['arrow_right'].y - 30;				
		labels['next_day_ln2'].x = btns['arrow_right'].x;
		labels['next_day_ln2'].y = btns['arrow_right'].y - 10;				

		ResizeScrollBtn(true);
	},
	drawback: function(ctx, ratio) 
	{
	  var DayNum = CurrDay.getDay();
	  DayNum = (DayNum)? DayNum:7;
		
	  var s = String(NIKA.DAY_NAMES[DayNum-1] + ", " + CurrDay.getDate() + " " + NIKA.MONTHS2[CurrDay.getMonth()]).toLowerCase();
	  s = s.charAt(0).toUpperCase() + s.slice(1);
		
	  DrawBackGeneralTab(ctx, ratio);

	  if (CurrWeekNum) {
		  s += " (";
		  if (CurrWeekNum==1) s += NIKA.FIRSTWEEK_STR;
		  if (CurrWeekNum==2) s += NIKA.SECONDWEEK_STR;
		  s += ")";
	  }
	  
	  labels['title'].caption = s;
	  DrawTitleLesson(ctx);
	  DrawTitleClass(ctx, ratio);
	},
	drawscroll: function(ctx)
	{
		ctx.textBaseline = "alphabetic";
		var period = GetPeriod(CurrDay),
		    y, lsn, s, s1,
		    RelativeLessonNum, asterisk, upk, FreeClass,
		    Fsize, FTsize, dy, cy, sy, Gwidth, Swidth, Twidth, Rwidth,
		        Tleft = Math.round(0.56*ScrollBox.w),
		        Rleft = ScrollBox.w - 80,
				GroupList = [],
				SubjList = [],
				TeachList = [],
				RoomList = [],
				DayNum = CurrDay.getDay(),
				DayHeight = 86+(LastLessonNum-FirstLessonNum+1)*CDS_ROW_HEIGHT;
				DayNum = (DayNum)? DayNum:7;
			
			y = 0; 
			// check for empty day
			if (FirstLessonNum==-1) {
    	 		ctx.fillStyle = SCHED_GROUP_COLOR;
    	 		ctx.font = "normal 24px Arial, sans-serif";
    	 		ctx.textAlign = "center";	
    	 		ctx.fillText(NIKA.NO_LESSONS_STR, ScrollBox.w/2, y+30);
    	 		return;
			}
			var FirstShift = (SecondShiftNum==1);
			for (var LessonNum = FirstLessonNum; LessonNum<=LastLessonNum; LessonNum++) {
				if (LessonNum & 1)  {
					ctx.fillStyle = CDS_ROW_COLOR_TRNSP;
					ctx.fillRect(0, y, ScrollTotalSizeX, CDS_ROW_HEIGHT);
				}
				lsn = DayNum.toString()+addZero(LessonNum);	
				exch = false; FreeClass = false; upk = false; 
				GroupList = [];	SubjList = []; TeachList = []; RoomList = []; 	
		  		if (window['NIKA'].CLASS_EXCHANGE 
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass]
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)]
				  		 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum]) {
				  			exch = true; // cell has exchanges
				  			FreeClass = (NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].s[0]=='F'); 	
				  			if (!FreeClass) {
				  				for (var i in NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].s) {
				  					s = NIKA.SUBJECTS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].s[i]];
				  					s1 = "";
				  					if (!s || s==undefined) s=NIKA.LESSON_CANCELED_STR;
				  						else {
				  							if (NIKA.USEROOMS && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].r) {
				  								s1 = NIKA.ROOMS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].r[i]];
				  								if (s1==undefined) s1 = NIKA.NO_STR;
				  							}
				  						}
				  					SubjList.push(s);
				  					RoomList.push(s1.substr(0,6));
				  				}
				  				
				  				if (window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].g) {
				  					for (var i in NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].g) {
				  						s = NIKA.CLASSGROUPS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].g[i]];
				  						if (s==undefined) s="";
				  						GroupList.push(s);	
				  					}
				  				}		
				  				
				  				if (window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].t) {
				  					for (var i in NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].t) {
				  						s = NIKA.TEACHERS[NIKA.CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum].t[i]];
				  						if (s==undefined) s="";
				  						TeachList.push(s);	
				  					}
				  				}		  				
				  			} else
				  			if (!StrikeOutFreeLsn) {
				  				SubjList.push(NIKA.LESSON_CANCELED_STR);
				  			}
		  		}
		  		
		  		if (!exch || (FreeClass && StrikeOutFreeLsn)) {
		  			GroupList = [];	SubjList = []; TeachList = []; RoomList = []; 	
		  			while (true)	
		  			if (window['NIKA'].CLASS_SCHEDULE[period] && window['NIKA'].CLASS_SCHEDULE[period][CurrClass] &&
		  					window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn]) {
		  					
		  					for (var i in window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn].s) {
		  						s = NIKA.SUBJECTS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s[i]];
		  						s1 = "";
		  						if (!s || s==undefined) s=NIKA.NO_LESSONS_STR;
		  							else {
		  								if (NIKA.USEROOMS && window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn].r) 
		  									s1 = NIKA.ROOMS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].r[i]];	
  		  								if (s1==undefined) s1 = NIKA.NO_STR;
		  							}
		  						SubjList.push(s);
		  						RoomList.push(s1.substr(0,6));
		  					}

		  					if (NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s.length==1) {
			  					if (NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].s[i][0]=='u') upk = true;
			  				}
		  					
		  					if (window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn].g) {
		  						for (var i in NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].g) {
				  						s = NIKA.CLASSGROUPS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].g[i]];
				  						if (s==undefined) s="";
				  						GroupList.push(s);	
		  						}	
		  					}
		  					
		  					if (window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn].t) {
				  				for (var i in NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].t) {
				  					s = NIKA.TEACHERS[NIKA.CLASS_SCHEDULE[period][CurrClass][lsn].t[i]];
				  					if (s==undefined) s="";
				  					TeachList.push(s);	
				  				}
				  			}	 
				  		break;
		  			}
		  			else {
	   					if (CurrWeekNum>0 && lsn.length==3) lsn = CurrWeekNum.toString() + lsn;
    					   else break;
		  			}
		  		}
		  	
		   // draw lesson number and time
   		 // calc relative lesson number for second shift
	 		 RelativeLessonNum = LessonNum;
	 		 asterisk = false;
	 		 if (SecondShiftNum>1 && !FirstShift) {
	 			 if (LessonNum<SecondShiftNum) FirstShift = true;
		 			 else {
	  				 RelativeLessonNum = LessonNum-SecondShiftNum+1;
	   				 asterisk = true;
	   			 }
	   		 }
		   ctx.fillStyle = BTN_TEXT_COLOR;  	
		   ctx.font = "bold 18px Arial, sans-serif";
		   ctx.textAlign = "center";
		    
		   if (NIKA.SECOND_RELATIVE) {
			   var lesson_str = RelativeLessonNum + " " + NIKA.LESSON_STR;
			   ctx.fillText(lesson_str, 55, y+30);
		   }
		   else {
			   var lesson_str = LessonNum + " " + NIKA.LESSON_STR;
			   ctx.fillText(lesson_str, 55, y+30);
		   }
		   ctx.fillStyle = SCHED_GROUP_COLOR;
		   ctx.font = "normal 16px Arial, sans-serif";
		   ctx.fillText(NIKA.LESSON_TIMES[LessonNum][0]+" - "+NIKA.LESSON_TIMES[LessonNum][1], 55, y+60);
		   
    	 if (asterisk) {
    		 ctx.textAlign = "left";
    		 ctx.font = "bold 18px Arial, sans-serif";
    		 ctx.fillStyle = SECOND_SHIFT_COLOR;
    		 ctx.fillText('*', 60 + Math.round(ctx.measureText(lesson_str).width/2), y+30);
    	 }
    	 
    	 switch (SubjList.length) {
    	   case 0:
    	 			ctx.fillStyle = SCHED_GROUP_COLOR;
    	 			ctx.font = "normal 22px Arial, sans-serif";
    	 			ctx.textAlign = "left";	
    	 			ctx.fillText(NIKA.NO_LESSONS_STR, 120, y+20);
    	 			dy = 0;
    	 			sy = y+35;
    	 			break;
    	   case 1:
    	   		Fsize = '22px Arial, sans-serif';
    	   		FTsize= '16px Arial, sans-serif';
    	   		dy = 1;
    	   		sy = y+41;
    	   		break;
    	   case 2:
    	   		Fsize = '18px Arial, sans-serif';
    	   		FTsize= '16px Arial, sans-serif';
    	   		dy = 30;
    	   		sy = y+29;
    	   		break;
    	   case 3:
    	   		Fsize = '16px Arial, sans-serif';
    	   		FTsize= '16px Arial, sans-serif';
    	   		dy = 22;
    	   		sy = y+19;
    	   		break;
    	   case 4:
    	   		Fsize = '14px Arial, sans-serif';
    	   		FTsize= '14px Arial, sans-serif';
    	   		dy = 16;
    	   		sy = y+15;
    	   		break;
				}
    		
    	// draw group: list	
    	ctx.textAlign = "left";	
    	ctx.textBaseline = "top";
    	Gwidth = 0;	
    	cy = sy;
    	if (GroupList.length>0) {
    		ctx.font = 'italic ' + Fsize;
    		ctx.fillStyle = (FreeClass && StrikeOutFreeLsn)?SCHED_GROUP_COLOR:exch?TS_EXCHANGE_COLOR:BTN_TEXT_COLOR;	

    		for (var i in GroupList) {
    			Gwidth = Math.max(ctx.measureText(GroupList[i]).width, Gwidth);
    			ctx.fillText(GroupList[i]+':', 130, cy);
    			cy += dy;
    		}
    		Gwidth += 10;
    	}	
    	
    	// draw subject list	
    	cy = sy;
    	Swidth = 0;	
    	if (SubjList.length>0) {
    		ctx.font = 'normal ' + Fsize;	
    		ctx.fillStyle = (FreeClass && StrikeOutFreeLsn)?SCHED_GROUP_COLOR:exch?TS_EXCHANGE_COLOR:upk?UPK_COLOR:BTN_TEXT_COLOR;  	
    		for (var i in SubjList) {
    			if (ctx.measureText(SubjList[i]).width>Swidth) Swidth = ctx.measureText(SubjList[i]).width;
	    		ctx.fillText(SubjList[i], 130+Gwidth, cy);	
    			cy += dy;
    		}
    		Swidth += 10;
    	}
    	
    	// draw teacher list 	
    	cy = sy;
    	Twidth = 0;
    	if (TeachList.length>0) {
    		ctx.font = 'bold ' + FTsize;		
    		ctx.fillStyle = (FreeClass && StrikeOutFreeLsn)?SCHED_GROUP_COLOR:exch?TS_EXCHANGE_COLOR:CDS_TEACHER_COLOR;
    		for (var i in TeachList) {
    			s = TeachList[i];
    			while (Tleft+ctx.measureText(s).width>Rleft-10) {
    			  s = s.substr(0,s.length-5)+"...";
    			}
	    		ctx.fillText(s, Tleft, cy);	
	    		Twidth = Math.max(ctx.measureText(s).width, Twidth);
    			cy += dy;
    		}
    	} 
    	
    	// draw room list
    	cy = sy;
    	Rwidth = 0;
    	if (RoomList.length>0) {
    		ctx.font = 'normal ' + Fsize;	
    		ctx.fillStyle = (FreeClass && StrikeOutFreeLsn)?SCHED_GROUP_COLOR:exch?TS_EXCHANGE_COLOR:upk?UPK_COLOR:BTN_TEXT_COLOR;  	
    		for (var i in RoomList) {
	    		ctx.fillText(RoomList[i], Rleft, cy);	
	    		Rwidth = Math.max(ctx.measureText(RoomList[i]).width, Rwidth);
    			cy += dy;
    		}
    	}    	
    	
    	if (FreeClass && StrikeOutFreeLsn) {
    		cy = sy;
    		for (var i in SubjList) {
					ctx.beginPath();
					ctx.strokeStyle = SCHED_GROUP_COLOR;		
					ctx.moveTo(130, cy+10);
					ctx.lineTo(130+Gwidth+Swidth, cy+10);
					if (TeachList.length>i && TeachList[i]!='') {
						ctx.moveTo(Tleft, cy+10);
						ctx.lineTo(Tleft+Twidth, cy+10);					
					}
					if (RoomList.length>i && RoomList[i]!='') { 
						ctx.moveTo(Rleft, cy+10);
						ctx.lineTo(Rleft+Rwidth, cy+10);
					}
					ctx.closePath();		
					ctx.stroke();   
					cy += dy; 		
				}
    	}
    	 	
    	 // draw horizontal line
   		ctx.beginPath();
   		ctx.lineWidth = 2;
   		ctx.strokeStyle = CDS_ROW_LINE_COLOR;		
   		ctx.moveTo(12, y);
 		  ctx.lineTo(CDS_TABLE_WIDTH-20, y);
 		  ctx.closePath();		
	  	ctx.stroke();
		  		
		  	y += CDS_ROW_HEIGHT;	
		 	} // LessonNum
	},
	getbtn: function(pos)
	{
		return -1;
	},
  toPrev: function() {
		if (!ExchangesExist && CurrDay.getDay()==1) return;
		SetClassDay(-1);
		window.onresize();
	},
	toNext: function() {
		if (!ExchangesExist && CurrDay.getDay()==NIKA.WEEKDAYNUM) return;
		SetClassDay(1);
		window.onresize();
	}
}

};
    
///// schedule routine ///////////////////////////////////////////////////////////////////////////    
function GetClassNum(ClassID)
{
	if (window['NIKA'].CLASS_COURSES) {
		return NIKA.CLASS_COURSES[ClassID];
	}
	var num=new String(),
	    ClassName = NIKA.CLASSES[ClassID];
	for (var i=0; i<ClassName.length; i++)
		if ("0123456789".indexOf(ClassName.charAt(i))+1) num += ClassName.charAt(i);
  return Number(num);
}

// iterator to make class grid
function ClassListIterator(func) {
var x = GRID_EDGE,
		y = GRID_EDGE,
		num = -1;
		for (var cls in NIKA.CLASSES)	{
		  if (num != GetClassNum(cls) && num!=-1) {
				num = GetClassNum(cls);

				if (NIKA.VERTICAL_CLASSES==undefined || !NIKA.VERTICAL_CLASSES) { 
					x  += CLASS_GRID_COL_SIZE;
					y = GRID_EDGE;					
				} 
				else {
					x = GRID_EDGE;
					y += CLASS_GRID_ROW_SIZE;
				};
			}
			else
				if (num==-1) num = GetClassNum(cls);
			func(x, y, cls);
			if (NIKA.VERTICAL_CLASSES==undefined || !NIKA.VERTICAL_CLASSES) { 
			  y += CLASS_GRID_ROW_SIZE;
			}
			else {
				x += CLASS_GRID_COL_SIZE;
			}
		}
}

// iterator to make Teachers grid
function TeacherListIterator(func) {
var x = GRID_EDGE,
  	y = GRID_EDGE,
  	num = 0;
  	for (var t in teachers)
  	{
  		teach = teachers[t];
  		num++;
  		if (num>MaxTeachColumns) {
  			num = 1;
  			x = GRID_EDGE;	
  			y += TEACHERS_GRID_ROW_SIZE;
  		}
  		func(x, y, teach);
  		x += TEACHERS_GRID_COL_SIZE;
  	}
}

function GetCurrMonday(dat)
{
	CurrMonday = new Date(dat);
	CurrMonday.setHours(0, 0, 0, 0);  // truncate date
	while (CurrMonday.getDay()>1) CurrMonday.setDate(CurrMonday.getDate()-1);
	while (CurrMonday.getDay()<1) CurrMonday.setDate(CurrMonday.getDate()+1);
}

///////// set CurrWeekNum from period p and CurrMonday //////////
function GetCurrWeekNum(p)
{
  if (window['NIKA']['DUALWEEK'] && p!=-1 && window['NIKA'].PERIODS[p] &&
      window['NIKA'].PERIODS[p]['fwm']) {
  	var FirstDayOfCycle = new Date(Number(NIKA.PERIODS[p]['fwm'].substr(6,4)), Number(NIKA.PERIODS[p]['fwm'].substr(3,2))-1, Number(NIKA.PERIODS[p]['fwm'].substr(0,2)));
  	CurrWeekNum = (parseInt((Math.abs((CurrMonday-FirstDayOfCycle)/(1000*60*60*24))).toFixed(0)/7) & 1)+1;
  }
  else
    CurrWeekNum = 0;
}

function SetTeacherWeek(delta) {
	if (delta) {
		CurrMonday.setDate(CurrMonday.getDate()+delta);
		FadeAnim = 5;
	}
	
	btns['arrow_left'].v = ExchangesExist;
	btns['arrow_right'].v = ExchangesExist;	
  labels['prev_week_ln1'].v = ExchangesExist;
  labels['prev_week_ln2'].v = ExchangesExist;
	labels['next_week_ln1'].v = ExchangesExist;  
	labels['next_week_ln2'].v = ExchangesExist; 	


	btns['changes'].v = false;
	labels['change_ln1'].v = false;
  labels['change_ln2'].v = false;

	function CheckTeacherExchangesMonth(dat) {
		var keys = Object.keys(window['NIKA'].TEACH_EXCHANGE[CurrTeacher]);
		for (k in keys) {
			if (StrAsDate(keys[k]).getMonth()==dat.getMonth()) return dat;
			
		}
		return -1;
	}

	if (ExchangesExist && window['NIKA'].TEACH_EXCHANGE	&& window['NIKA'].TEACH_EXCHANGE[CurrTeacher]) {
		var dat = new Date(CurrMonday);
		dat.setDate(dat.getDate()+5);
		var ExchangesMonth = CheckTeacherExchangesMonth(dat);
		if (ExchangesMonth==-1) {
			ExchangesMonth = CheckTeacherExchangesMonth(CurrMonday);
		}
		
		if (ExchangesMonth!=-1) {
			StartCalendarDate = new Date(ExchangesMonth.getFullYear(), ExchangesMonth.getMonth(), 1);
			btns['changes'].v = true;
			labels['change_ln2'].caption = String((NIKA.IN_STR==undefined)? "в":NIKA.IN_STR).toLowerCase() + " ";
			if (NIKA.MONTHS3==undefined)
				labels['change_ln2'].caption += String(MONTHS3_STR[ExchangesMonth.getMonth()]).toLowerCase();
			else
				labels['change_ln2'].caption += String(NIKA.MONTHS3[ExchangesMonth.getMonth()]).toLowerCase();
	    	
			labels['change_ln1'].v = true;
			labels['change_ln2'].v = true;
		}
	}
	
	var period = GetPeriod(CurrMonday);
	var i = 1;
	var dat = new Date(CurrMonday); 
	while (period==-1 && i<6) {
		dat.setDate(dat.getDate()+1);
	  period = GetPeriod(dat);
		i++;
	}
	
	GetCurrWeekNum(period);
	
	if (period!=-1) {
		var s = NIKA.PERIOD_STR;
		if (s.substr(0,3)=="на ") s = s.substr(3, s.length);
		labels['period'].caption = s + "   " + NIKA.PERIODS[period].name;
	}
	else 
		labels['period'].caption = ""; 

	// check if teacher has only one subject
	CurrTeachSubject = '';
	
	if (window['NIKA'].TEACH_SCHEDULE[period] && window['NIKA'].TEACH_SCHEDULE[period][CurrTeacher]) {
	  for (var lsn in NIKA.TEACH_SCHEDULE[period][CurrTeacher]) {
	    if (NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].s!='M')
	  	  if (!CurrTeachSubject) CurrTeachSubject=NIKA.SUBJECTS[NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].s];
	  	  	else
	  	  if (CurrTeachSubject!=NIKA.SUBJECTS[NIKA.TEACH_SCHEDULE[period][CurrTeacher][lsn].s]) {
	  		  CurrTeachSubject = '';
	  		  break;
	  	  }		
	  }
	}
}

function SetClassWeek(delta) {
	if (delta) {
		CurrMonday.setDate(CurrMonday.getDate()+delta);
		FadeAnim = 5;
	}
	
	
	btns['arrow_left'].v = ExchangesExist;
	btns['arrow_right'].v = ExchangesExist;	
    labels['prev_week_ln1'].v = ExchangesExist;
    labels['prev_week_ln2'].v = ExchangesExist;
	labels['next_week_ln1'].v = ExchangesExist;  
	labels['next_week_ln2'].v = ExchangesExist; 	
	
	btns['changes'].v = false;
	labels['change_ln1'].v = false;
	labels['change_ln2'].v = false;

	function CheckClassExchangesMonth(dat) {
		  var keys = Object.keys(window['NIKA'].CLASS_EXCHANGE[CurrClass]);
			for (k in keys) {
				if (StrAsDate(keys[k]).getMonth()==dat.getMonth()) return dat;
			}
			return -1;
		}
	
	if (ExchangesExist && window['NIKA'].CLASS_EXCHANGE && window['NIKA'].CLASS_EXCHANGE[CurrClass]) {
		var dat = new Date(CurrMonday);
		dat.setDate(dat.getDate()+5);
		var ExchangesMonth = CheckClassExchangesMonth(dat);
		if (ExchangesMonth==-1) {
			ExchangesMonth = CheckClassExchangesMonth(CurrMonday);
		}
		
		if (ExchangesMonth!=-1) {
			StartCalendarDate = new Date(ExchangesMonth.getFullYear(), ExchangesMonth.getMonth(), 1);
			btns['changes'].v = true;
			labels['change_ln2'].caption = String((NIKA.IN_STR==undefined)? "в":NIKA.IN_STR).toLowerCase() + " ";
			if (NIKA.MONTHS3==undefined)
				labels['change_ln2'].caption += String(MONTHS3_STR[ExchangesMonth.getMonth()]).toLowerCase();
			else
				labels['change_ln2'].caption += String(NIKA.MONTHS3[ExchangesMonth.getMonth()]).toLowerCase();
		
			labels['change_ln1'].v = true;
			labels['change_ln2'].v = true;
		}
	}

	var period = GetPeriod(CurrMonday),
		lsn,
		dat = new Date(CurrMonday);
		
	if (period==-1) {
		var i = 1;
		while (period==-1 && i<6) {
			dat.setDate(dat.getDate()+1);
	  	period = GetPeriod(dat);
			i++;
		}	
		dat = new Date(CurrMonday);
	}
		
	GetCurrWeekNum(period);

	if (period!=-1) {
		var s = NIKA.PERIOD_STR;
		if (s.substr(0,3)=="на ") s = s.substr(3, s.length);
		labels['period'].caption = s + "   " + NIKA.PERIODS[period].name;
	}
	else
		labels['period'].caption = "";
	
	// calc maximum lesson per day (for calculation daybox height)
	MaxLessonCount = 1;
	var MaxLastLessonNum = -1;
	MinFirstLessonNum = NIKA.LESSONSINDAY;
	for (var DayNum = 1; DayNum<=NIKA.WEEKDAYNUM; DayNum++) {
		LastLessonNum = -1;
		FirstLessonNum = -1;
		for (var LessonNum = NIKA.FIRSTLESSONNUM; LessonNum<=NIKA.LESSONSINDAY; LessonNum++) {
			if (window['NIKA'].CLASS_EXCHANGE 
				 	 && window['NIKA'].CLASS_EXCHANGE[CurrClass]
				 	 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)]
				 	 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum]
		  			 && window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(dat)][LessonNum].s[0]!='F') {
		  			if (FirstLessonNum==-1 || FirstLessonNum>LessonNum) FirstLessonNum = LessonNum;
		  			if (LastLessonNum==-1  || LastLessonNum<LessonNum)  LastLessonNum = LessonNum;
		  			MaxLessonCount = Math.max(MaxLessonCount, LastLessonNum-FirstLessonNum+1);
		  		}
		  else {
		  	lsn = DayNum.toString()+addZero(LessonNum);
		  	while (true) 
		  	  if (window['NIKA'].CLASS_SCHEDULE[period] && window['NIKA'].CLASS_SCHEDULE[period][CurrClass] &&
				      window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn]) {
	        	if (FirstLessonNum==-1 || FirstLessonNum>LessonNum) FirstLessonNum = LessonNum;
	        	if (LastLessonNum==-1  || LastLessonNum<LessonNum)  LastLessonNum = LessonNum;
	        	MaxLessonCount = Math.max(MaxLessonCount, LastLessonNum-FirstLessonNum+1);
	        	break;
	        }
	        else {
	        	if (CurrWeekNum>0 && lsn.length==3) lsn = CurrWeekNum.toString() + lsn;
    				  else break;
	        }
		  }
		}
		if (FirstLessonNum<MinFirstLessonNum && FirstLessonNum!=-1) MinFirstLessonNum = FirstLessonNum;
		if (LastLessonNum>MaxLastLessonNum) MaxLastLessonNum = LastLessonNum;
		dat.setDate(dat.getDate()+1);
		period = GetPeriod(dat);
	}

	period = GetPeriod(CurrMonday);
	// calc second shift for current class
	SecondShiftNum = 1;
	if (window['NIKA'].CLASS_SHIFT && window['NIKA'].CLASS_SHIFT[period] && window['NIKA'].CLASS_SHIFT[period][CurrClass]) {
		SecondShiftNum = window['NIKA'].CLASS_SHIFT[period][CurrClass]; 
	}
	
	CurrSecondShiftStr = "";
	if (SecondShiftNum>1) {
		CurrSecondShiftStr = "(*"+ NIKA.SECOND_SHIFT_STR+")"; 
	}	
}

function SetMonth(delta) {
	btns['arrow_left'].v = true;
	btns['arrow_right'].v = true;	
	
	labels['period'].caption = String((NIKA.CHANGES_STR==undefined)? "изменения":NIKA.CHANGES_STR).toLowerCase() + " " + String((NIKA.IN_STR==undefined)? "в":NIKA.IN_STR).toLowerCase() + " " + String((NIKA.SCHEDULE2_STR==undefined)? "расписании":NIKA.SCHEDULE2_STR).toLowerCase();
	var month = StartCalendarDate.getMonth()+delta;
	if (delta) {
  	if (month==-1) month = 11; 
  	else if (month==12) month = 0;
		while (StartCalendarDate.getMonth()!=month) StartCalendarDate.setDate(StartCalendarDate.getDate()+delta*7);
		FadeAnim = 5;
	}
  labels['title'].caption = NIKA.MONTHS[month]+ "  "+(StartCalendarDate.getFullYear());
  
    // calc grid row count and actual height
	CalendarActualHeight = 2*CL_FIRST_ROW_SIZE_Y + CL_ROW_SIZE_Y;
	
	var dat = new Date(StartCalendarDate.getFullYear(), StartCalendarDate.getMonth(), 1);
	while (dat.getMonth()==month) {
		DayNum = dat.getDay();
	    DayNum = (DayNum)? DayNum:7;
      if (DayNum==7) CalendarActualHeight += CL_ROW_SIZE_Y;
		dat.setDate(dat.getDate()+1); 		
	}
}

function SetClassDay(delta) {
	btns['arrow_left'].v = true;
	btns['arrow_right'].v = true;
	labels['prev_month_ln1'].v = true;
	labels['prev_day_ln2'].v = true;
	labels['next_month_ln1'].v = true;
	labels['next_day_ln2'].v = true;
	
	if (delta) {
		CurrDay.setDate(CurrDay.getDate()+delta);
		FadeAnim = 5;
	}
	GetCurrMonday(CurrDay);
	
	// find first/last lessons for current class and current day
	FirstLessonNum = -1; 
	LastLessonNum = -1;
	var period = GetPeriod(CurrDay),
		lsn, 
		DayNum = CurrDay.getDay();
	
	GetCurrWeekNum(period);
	if (period!=-1) {
		labels['period'].caption = NIKA.PERIOD_STR + "   " + NIKA.PERIODS[period].name;
	}
	else
		labels['period'].caption = "";
	
	DayNum = (DayNum)? DayNum:7;
	for (var LessonNum = NIKA.FIRSTLESSONNUM; LessonNum<=NIKA.LESSONSINDAY; LessonNum++) {
		if (window['NIKA'].CLASS_EXCHANGE 
	  		 		&& window['NIKA'].CLASS_EXCHANGE[CurrClass]
	  		 		&& window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)]
	  		 		&& window['NIKA'].CLASS_EXCHANGE[CurrClass][DateAsStr(CurrDay)][LessonNum]) {
 						if (FirstLessonNum==-1 || FirstLessonNum>LessonNum) FirstLessonNum = LessonNum;
 						if (LastLessonNum==-1  || LastLessonNum<LessonNum)  LastLessonNum = LessonNum;
 				}
 		else {		
			lsn = DayNum.toString()+addZero(LessonNum);
			while (true)
				if (window['NIKA'].CLASS_SCHEDULE[period] && window['NIKA'].CLASS_SCHEDULE[period][CurrClass] &&
						window['NIKA'].CLASS_SCHEDULE[period][CurrClass][lsn]) {
	        		if (FirstLessonNum==-1 || FirstLessonNum>LessonNum) FirstLessonNum = LessonNum;
	        		if (LastLessonNum==-1  || LastLessonNum<LessonNum)  LastLessonNum = LessonNum;
	        		break;
	        	}			
	      else {
	       	if (CurrWeekNum>0 && lsn.length==3) lsn = CurrWeekNum.toString() + lsn;
    			  else break;
	      }
		}
 	}
 	
	// calc second shift for current class
	SecondShiftNum = 1;
	if (window['NIKA'].CLASS_SHIFT && window['NIKA'].CLASS_SHIFT[period] && window['NIKA'].CLASS_SHIFT[period][CurrClass]) {
		SecondShiftNum = window['NIKA'].CLASS_SHIFT[period][CurrClass]; 
	}
	
	CurrSecondShiftStr = "";
	if (SecondShiftNum>1) {
		CurrSecondShiftStr = "(*"+ NIKA.SECOND_SHIFT_STR+")"; 
	}	
}

////// "2" -> "02" //////////
function addZero(num) {
	num = num.toString();
	if (num.length<2) num = "0" + num;
	return num;
}
	
/////// return "dd.mm.yyyy" ///////////	
function DateAsStr(d) {
	return addZero(d.getDate())+"."+addZero(d.getMonth()+1)+"."+(d.getFullYear()).toString();
}

function StrAsDate(s) {
	return new Date(s[6]+s[7]+s[8]+s[9], s[3]+s[4] - 1, s[0]+s[1]);
}


//////// return PeriodId from date  ///////////////
function GetPeriod(dat) {
	var DateBegin, DateEnd;
	for (var p in NIKA.PERIODS) {
		DateBegin = new Date(Number(NIKA.PERIODS[p].b.substr(6,4)), Number(NIKA.PERIODS[p].b.substr(3,2))-1, Number(NIKA.PERIODS[p].b.substr(0,2)));
		DateEnd = new Date(Number(NIKA.PERIODS[p].e.substr(6,4)), Number(NIKA.PERIODS[p].e.substr(3,2))-1, Number(NIKA.PERIODS[p].e.substr(0,2)));
		//DateEnd.setDate(DateEnd.getDate()+); // include last day of period
		if (dat>=DateBegin && dat<=DateEnd) return p;
	}
	return -1;
}

function DrawCalendar(ctx, IsExchangeDay) {
	var month = StartCalendarDate.getMonth();

 	ctx.save();
 	ctx.scale(ScrollBox.w/CL_MAX_WIDTH, ScrollBox.w/CL_MAX_WIDTH);
 	
  // fill colors 
 	ctx.fillStyle = '#FFFFFF';
 	ctx.fillRect(0, 0, CL_MAX_WIDTH, CalendarActualHeight);
 	// header
 	ctx.fillStyle = GRID_LINE_COLOR;
 	ctx.fillRect(0, 0, CL_MAX_WIDTH, CL_FIRST_ROW_SIZE_Y);
 	//trailer
 	ctx.fillRect(0, CalendarActualHeight-CL_FIRST_ROW_SIZE_Y, CL_MAX_WIDTH, CL_FIRST_ROW_SIZE_Y);
 	 	
 	// draw day names, vertical grid lines
 	ctx.font = "bold 24px Arial";
 	ctx.textAlign = "center";
 	ctx.textBaseline = "alphabetic";
	ctx.strokeStyle = GRID_LINE_COLOR;
	ctx.fillStyle = BTN_TEXT_COLOR;
 	for (DayNum=0;DayNum<=7;DayNum++) {
 		if (DayNum)	ctx.fillText(NIKA.DAY_NAMESH[DayNum-1],  DayNum*CL_ROW_SIZE_X-CL_ROW_SIZE_X/2, CL_FIRST_ROW_SIZE_Y/2+12);	
 		 
 		ctx.beginPath();
 		ctx.moveTo(DayNum*CL_ROW_SIZE_X, CL_FIRST_ROW_SIZE_Y);
 		ctx.lineTo(DayNum*CL_ROW_SIZE_X ,CalendarActualHeight-CL_FIRST_ROW_SIZE_Y);
 		ctx.closePath();		
 		ctx.stroke(); 
 	} 	
 	
    // draw numbers
 	ctx.font = "100 54px Arial, sans-serif";
 	dat = new Date(StartCalendarDate.getFullYear(), StartCalendarDate.getMonth(), 1);
 	var y = CL_FIRST_ROW_SIZE_Y, x;
 	while (dat.getMonth()==month) {
 		DayNum = dat.getDay();
  	    DayNum = (DayNum)? DayNum:7;
  	    x = (DayNum-1)*CL_ROW_SIZE_X;

  	    if (IsExchangeDay(dat)) {
  	    	ctx.fillStyle = CL_EXCHANGE_COLOR;
 			ctx.fillRect(x, y, CL_ROW_SIZE_X-1, CL_ROW_SIZE_Y-1);
 			ctx.fillStyle = '#FFFFFF';
  	    }
  	    else if (DayNum<6) {
 			//ctx.fillStyle = "#000000";
 			ctx.fillStyle = BTN_TEXT_COLOR;
 		} 
 		else {
 			ctx.fillStyle = CL_HOLIDAY_BK_COLOR;
 			ctx.fillRect(x, y, CL_ROW_SIZE_X-1, CL_ROW_SIZE_Y-1);
 			ctx.fillStyle = CL_HOLIDAY_TEXT_COLOR;
 		}
        
        ctx.fillText(dat.getDate(),  x + CL_ROW_SIZE_X/2, y + CL_ROW_SIZE_Y/2+20);
    
	    // draw horizontal lines
	    if (DayNum==7) {
	    	y += CL_ROW_SIZE_Y;
		 		ctx.beginPath();
	 			ctx.moveTo(0, y);
	 			ctx.lineTo(CL_MAX_WIDTH, y);
	 			ctx.closePath();		
	 			ctx.stroke();    	
	    }
		dat.setDate(dat.getDate()+1); 		
 	}
 	
 	
 	ctx.restore();
}

