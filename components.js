////////////////////////////////////////////////////////////
// 
// Description: 
// Simply frame engine based on HTML5 canvas includes controls:
// label, button, scrollbar managed by gesture 
// and navigation buttons
// designed to publication school's timetables on the web or info kiosks.
//
//         NikaSoft 2002-2022(c)
// 
// License: 
// This software is the property of NikaSoft company (www.nikasoft.ru).  
// But you may use this software for any purpose including modification/redistribution, 
// so long as this header remains intact and that you do not claim any
// rights of ownership or authorship of this software. 
//
// Dependencies:
// tabs.js - frame functionality
// vars.js - all variables and constants (incliding color scheme) collected in separate file
// nika_data.js - source timetable data in JSON format
//
// ver 01 (01.05.2012) - initial version

// ver 20 (09.05.2018) - first release of new desing
// ver 21 (25.09.2018) - fix localization of title buttons and home link
// ver 22 (24.09.2019) - support autosize teachers button in custom capture
// ver 23 (26.09.2019) - support parameter MOBILE_LINK (hidden/visible/undefined) and switch off mobile link for rotated big screens (height>width)
// ver 24 (29.09.2019) - correct background image fit on home page
// ver 25 (11.09.2020) - support parameter SHOW_EXPORT_DT to public export date/time on all pages
// ver 26 (27.09.2020) - fix MOBILE_LINK=visible link behavior
// ver 27 (16.10.2020) - add support parameter STRIKEOUT_FREE_LSN for classes schedule
// ver 28 (16.04.2021) - add online check schedule version and use RELOAD_TIMER 
// ver 29 (09.07.2021) - support Work periods (auth switch-off screen) and Video saver on idle


// New parameters
//  NIKA.VERTICAL_CLASSES = true/false
// New string definitions:
//  NIKA.YEAR_STR = "года"
//  NIKA.FROM_STR = "через"
//  NIKA.FOR_WEEK = "на неделю"
//  NIKA.PERIOD_STR = "на период" -> "период"
//  NIKA.CHANGES_STR = "Замены"
//  PREVIOUS_STR = "Предыдущая"
//  PREVIOUS2_STR = "Предыдущий"
//  NEXT_STR = "Следующая"
//  NEXT2_STR = "Следующий"
//  MONTH_STR = "месяц"
//  WEEK_STR = "неделя"
//  IN_STR = "в" 
//  SCHEDULE2_STR = "расписании"
//  MONTHS3	 = ["январе", ...]
//  REFRESH_STR = "Обновлено"
//  TODAY_STR = "сегодня в"
//  YESTERDAY_STR = "вчера в"
  
  
//if ('ontouchstart' in document.documentElement)
function __id(elem) {return document.getElementById(elem);}

function CreateBtn(name, width, height, imgName, imgNameHL) {
	// button has attributes:
	// x,y - position
	// v - visibility
	// width, height - size
	// img - image for normal state
	// imgHL - image for highlighted state
  btns[name] = {x: 0, y: 0, w: width, h: height, v: false, img: null, imgHL: null};
  btns[name].img = new Image();
  btns[name].img.src=IMAGE_DIR+imgName;
  btns[name].imgHL = new Image();
  btns[name].imgHL.src=IMAGE_DIR+imgNameHL;
};

function CreateLabel(name, ax, ay, acaption, afont, acolor, halign) {
	// label has attributes:
	// x,y - position
	// caption
	// v - visibility
	// font, color
	// horizontal align: "left", "center", "right"
  labels[name] = {x: ax, y: ay, v: false, caption: acaption, font: afont, color: acolor, align: halign, scalable: false};	
}

function CursorPosFromEvent(ev) {
	// browser depended transformation event -> mouse position
    if (ev === undefined)  // IE
        { ev = window.event; };

    if (ev.offsetX || ev.offsetX == 0) { // Opera
        var MousePos= {x: ev.offsetX,
        					     y: ev.offsetY};
    }
      else  // Firefox
        var MousePos= {x: ev.pageX - ev.target.offsetLeft,
        							 y: ev.pageY - ev.target.offsetTop};
    return MousePos;
}

function CursorPosInScrollBox(pos) {
	return (pos.x>=ScrollBox.x && pos.x<=ScrollBox.x+ScrollBox.w && pos.y>=ScrollBox.y && pos.y<=ScrollBox.y+ScrollBox.h);
}

function GetBtnFromCursorPos(pos) {
	// find a button under cursor
	for (btn in btns) {
		if (btns[btn].v && pos.x>=btns[btn].x && pos.x<=btns[btn].x+btns[btn].w && pos.y>=btns[btn].y && pos.y<=btns[btn].y+btns[btn].h) 
		  return btn;
	}
	return -1;
}

function str_trim(s, l) {
	if (s.length>l) {
		s = s.substr(0, l-1) + '...';
	}
	return s;
}

function GetCurrentRatio() {
	var ratio_w = BackgroundImg1.width/Canvas.width,
	    ratio_h = 1024/Canvas.height;
	ratio = ratio_h;    
	if (ratio_w>ratio_h) ratio = ratio_w;
	if (ratio>1.7) ratio=1.7;		
	if (ratio<1.0) ratio=1.0;	
	return ratio;	
}
		
function PrintRefreshDate() {
	var dat = new Date(),
	    s = NIKA.EXPORT_DATE;
	if (s==undefined) return;
	if (dat.getDate()==s.substr(0,2) && dat.getMonth()+1==s.substr(3,2) && dat.getFullYear()==s.substr(6,4)) {
    return String((NIKA.TODAY_STR==undefined)?"сегодня в":NIKA.TODAY_STR) + " " + NIKA.EXPORT_TIME.substr(0,5);
  }
  dat.setDate(dat.getDate()-1);
	if (dat.getDate()==s.substr(0,2) && dat.getMonth()+1==s.substr(3,2) && dat.getFullYear()==s.substr(6,4)) {
    return String((NIKA.YESTERDAY_STR==undefined)?"вчера в":NIKA.YESTERDAY_STR) + " " + NIKA.EXPORT_TIME.substr(0,5);
  }
  return NIKA.EXPORT_DATE + " " + NIKA.EXPORT_TIME.substr(0,5);
}		

function FadeOutScreenFunc() {
	if (FadeOutScreenCnt) 
		FadeOutScreenCnt--;
	else {
		window.clearInterval(idFadeOutScreenTimer);
		idFadeOutScreenTimer = undefined;
		if (!FadeOutScreen) {
			__id('AddElements').style.display = 'block';
		}
	}
	Redraw = true;
}

function SwitchFadeOutScreen(value) {
	if (FadeOutScreen!=value) {
		FadeOutScreen = value;
		if (FadeOutScreen) {
			__id('AddElements').style.display = 'none';
			SwitchVideoSaver(false);
		}
		FadeOutScreenCnt = FadeOutScreenMax;
		if (idFadeOutScreenTimer==undefined)
		  idFadeOutScreenTimer = window.setInterval(FadeOutScreenFunc, 30);
	}
} 

function SwitchVideoSaver(value) {
	// switching to video screen saver mode is possible only if the schedule is not published on the portal
	// and there is a link to the video file placed locally
	if (NIKA.TERM_VIDEO_SAVER_FILE==undefined || window['schedule_check_url']!=undefined) return;
	
	if (VideoSaverMode!=value) {
		if (value) {
			if (FadeOutScreen) return;
			VideoSaverMode = value;			
			__id('AddElements').style.display = 'none';
			Canvas.style.display = 'none';
			if (__id('VideoScreenSaver')==undefined) {
				var video_elm = document.createElement('video');
				video_elm.id = 'VideoScreenSaver';
				video_elm.loop = 'loop';
				video_elm.autoplay = 'autoplay';
				video_elm.muted = 'muted';
				video_elm.style='height: 100vh; width: 100%; object-fit: cover; position: absolute;';
				video_elm.src = NIKA.TERM_VIDEO_SAVER_FILE;
				video_elm.innerHTML = '<p>qwerqwer</p>';
				__id('MainDiv').insertBefore(video_elm, Canvas);
				video_elm.onmousedown = function(e)	{
					location.href=location.href;
				}
				if (TouchSupport) {
					video_elm.addEventListener('touchstart', function(e){
						location.href=location.href;
					}
					);
				}
			}
		}
		else {
			VideoSaverMode = value;	
			__id('AddElements').style.display = 'block';
			Canvas.style.display = 'block';
			if (__id('VideoScreenSaver')!=undefined) __id('VideoScreenSaver').style.display = 'none';
		}
	}
}

// check work period on idle timer switch off the screen and restart timer if necessary
function CheckWorkPeriod() {
	if (NIKA.TERM_WORK_PERIOD==undefined) return;
	
	var days = NIKA.TERM_WORK_PERIOD.split(';');
	    
	if (days==undefined) return;    

	var times, 
	    dat = new Date(),
	    dn, daynum = (dat.getDay())? dat.getDay():7,
      curr_time = dat.getHours()*60 + dat.getMinutes(),
	    start_time, end_time;

	for (d in days) {
		times = days[d].match(/\d{2}:\d{2}/g);
		dn = days[d].match(/=\d/);
		if (times!=null && times.length==2 && dn!=null && dn.length==1) {
			dn =dn[0][1];
			start_time = Number(times[0][0]+times[0][1])*60 + Number(times[0][3]+times[0][4]);
			end_time = Number(times[1][0]+times[1][1])*60 + Number(times[1][3]+times[1][4]);
			if (dn!=undefined && dn == daynum) {
				if (curr_time>=start_time && curr_time<=end_time) {
					SwitchFadeOutScreen(false);
					return;
				}
				break;
			}
		}
	}
  SwitchFadeOutScreen(true);
}
		
window['Init'] = Init;

function Init() {
	// define string constants
	NIKA.FOR_WEEK = (NIKA.FOR_WEEK==undefined)?"на неделю":NIKA.FOR_WEEK;
	if (window['NIKA']['DUALWEEK']) {
		NIKA.FOR_1WEEK = (NIKA.FOR_1WEEK==undefined)?"на I неделю":NIKA.FOR_1WEEK;
		NIKA.FOR_2WEEK = (NIKA.FOR_2WEEK==undefined)?"на II неделю":NIKA.FOR_2WEEK;
	}
	
  __id('go_mobile').onclick = function () {
		if (location.href.indexOf('Schedule.html')==-1) {
			  CookieManager.set('schedule_mobile', '1', 360);
			  location.href = location.href.replace(location.hash,'');
			}	else {
				location.href = location.href.replace('Schedule.html', 'm.schedule.html');
			}
  }
	
	// initialization, assign event handlers and create controls 
	Canvas = __id('MainCanvas');
	//TouchSupport = ('ontouchstart' in document.documentElement);
	TouchSupport = false;
	if ('ontouchstart' in window) {
	    //iOS & android
	    TouchSupport = true;
	
	} else if(window.navigator.msPointerEnabled) {
	    // Windows
	    // To test for touch capable hardware 
	    if(navigator.msMaxTouchPoints) {
	        TouchSupport = true;
	    }
	}
	
	Canvas.onmousedown = function(e)
	{
		SwitchFadeOutScreen(false);
		var pos = CursorPosFromEvent(e);
		
		if (!TouchSupport && CursorPosInScrollBox(pos)) {
			HoldPos = pos;
			HoldScrollPos = {x: ScrollPosX, y: ScrollPosY};
			HandScrollActive = false;
			HoldActive = true;
		}
		else {
			var btn = GetBtnFromCursorPos(pos);
			switch (btn) {
				case "LeftScrll":
				case "RightScrll":
				case "UpScrll":
				case "DownScrll":
					ScrollBtnDown(btn);
					break;
			}
		}
	  Canvas.onmousemove(e);
	};
	
	if (TouchSupport) {
		Canvas.addEventListener('touchstart', function(e){
			SwitchFadeOutScreen(false);
			var pos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
			if (CursorPosInScrollBox(pos)) {
				HoldPos = pos;
				HoldScrollPos = {x: ScrollPosX, y: ScrollPosY};
				HandScrollActive = false;
				HoldActive = true;
			} else {
				HLBtn = GetBtnFromCursorPos(pos);
				if (HLBtn!=-1) {
					switch (HLBtn) {
						case "LeftScrll":
						case "RightScrll":
						case "UpScrll":
						case "DownScrll":
							ScrollBtnDown(btn);
							break;
					}
					
				  e.preventDefault();	
				  Redraw = true;
				}
				 
			}
		});
		
		Canvas.addEventListener('touchmove', function(e){
			var pos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
			var PrevHLBtn = HLBtn; 
			if (CursorPosInScrollBox(pos)) {
				
				if (HoldActive && ScrollTotalSizeX) {
					var changed = false;
		  	  	    if ((pos.x<HoldPos.x && HoldScrollPos.x+HoldPos.x-pos.x+ScrollBox.w<ScrollTotalSizeX+ (ScrollStepX>>1) && ScrollPosX+ScrollBox.w<ScrollTotalSizeX)	||
		  	    	      (pos.x>HoldPos.x && HoldScrollPos.x+HoldPos.x-pos.x>0  && ScrollPosX>0)) {
			  	    	    changed = true; 
			  	    	    HandScrollActive = true;		
			      		  	ScrollPosX = HoldScrollPos.x+HoldPos.x-pos.x;
		      		  }
		   
		    	  	  if ((pos.y<HoldPos.y && HoldScrollPos.y+HoldPos.y-pos.y+ScrollBox.h<ScrollTotalSizeY+ (ScrollStepY>>1) && ScrollPosY+ScrollBox.h<ScrollTotalSizeY)	||
		    	  	      (pos.y>HoldPos.y && HoldScrollPos.y+HoldPos.y-pos.y>0  && ScrollPosY>0)) {
		    	  		  	changed = true;  	 
		    	  		  	HandScrollActive = true;		   	  	      	
		    		    	ScrollPosY = HoldScrollPos.y+HoldPos.y-pos.y;
		    		    }
					  Redraw = true;  
					  if (changed) e.preventDefault();
				}
			} else {
				HLBtn = GetBtnFromCursorPos(pos);
				if (HLBtn!=PrevHLBtn) Redraw = true;				
			}
		});
		
		Canvas.addEventListener('touchend', function(e){
			var pos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
			if (CursorPosInScrollBox(pos) && HandScrollActive) {
				
				var p = ScrollStepX*(ScrollPosX/ScrollStepX>>0);
  			if ( ScrollDelta.x = Math.round(10*(ScrollPosX-p)/ScrollStepX) ) {
  				if (ScrollDelta.x>=5) {
  					ScrollDelta.x = ScrollDelta.x-10;
  					p += ScrollStepX;
  				}
  				CurrScrollStep.x = Math.round((p-ScrollPosX)/ScrollDelta.x);
  			}
  			p = ScrollStepY*(ScrollPosY/ScrollStepY>>0);
  			if ( ScrollDelta.y = Math.round(10*(ScrollPosY-p)/ScrollStepY) ) {
  				if (ScrollDelta.y>=5) {
  					ScrollDelta.y = ScrollDelta.y-10;
  					p += ScrollStepY;
  				}
  				CurrScrollStep.y = Math.round((p-ScrollPosY)/ScrollDelta.y);
  			}
  			HandScrollActive = false;
  			HoldActive = false; 
  			Redraw = true;   		
  			e.preventDefault();	
			} else 
				if (HLBtn!=-1) {
					DoClickBtn(HLBtn);
					HLBtn = undefined;
					Redraw = true;  
				}
		});
		
	}
	
	Canvas.onmousemove = function(e) {
		if (!CurrentTab) return;
		var pos = CursorPosFromEvent(e);
		IdleTime = 0; // reset idle timer

		var PrevHLBtn = HLBtn;
		if (CursorPosInScrollBox(pos)) {
			// hold shift more than 10px initiates scroll by mouse (finger)
		  if (HoldActive && ScrollTotalSizeX && (Math.abs(pos.x-HoldPos.x)>10 || Math.abs(pos.y-HoldPos.y)>10))
			 if (ScrollByHand && !TouchSupport) HandScrollActive = true; else return;
		  
  		  if (HandScrollActive) {
  	  	    if ((pos.x<HoldPos.x && HoldScrollPos.x+HoldPos.x-pos.x+ScrollBox.w<ScrollTotalSizeX + (ScrollStepX>>1) && ScrollPosX+ScrollBox.w<ScrollTotalSizeX)	||
  	    	      (pos.x>HoldPos.x && HoldScrollPos.x+HoldPos.x-pos.x>0 && ScrollPosX>0))
      		  	ScrollPosX = HoldScrollPos.x+HoldPos.x-pos.x;
   
    	  	  if ((pos.y<HoldPos.y && HoldScrollPos.y+HoldPos.y-pos.y+ScrollBox.h<ScrollTotalSizeY + (ScrollStepY>>1) && ScrollPosY+ScrollBox.h<ScrollTotalSizeY)	||
    	  	      (pos.y>HoldPos.y && HoldScrollPos.y+HoldPos.y-pos.y>0 && ScrollPosY>0))
    		    	ScrollPosY = HoldScrollPos.y+HoldPos.y-pos.y;
    	  	Redraw = true;  
  		    return;
  	      }
  		  
  		  if (ScrollDelta.x || ScrollDelta.y || FadeAnim) return;
  		  pos.x -= ScrollBox.x - ScrollPosX;
  		  pos.y -= ScrollBox.y - ScrollPosY;
  		  HLBtn = tabs[CurrentTab].getbtn(pos);
		}
		else 
			HLBtn = GetBtnFromCursorPos(pos);
	//  && !TouchSupport		
		if (HLBtn!=PrevHLBtn) Redraw = true;
	};
	
	Canvas.onmouseup = function(e) {
		if (!CurrentTab) return;
		Redraw = true;
		var pos = CursorPosFromEvent(e);
		if (CursorPosInScrollBox(pos)) {
  		if (HandScrollActive && !TouchSupport) {
  			
  			var p = ScrollStepX*(ScrollPosX/ScrollStepX>>0);
  			if ( ScrollDelta.x = Math.round(10*(ScrollPosX-p)/ScrollStepX) ) {
  				if (ScrollDelta.x>=5) {
  					ScrollDelta.x = ScrollDelta.x-10;
  					p += ScrollStepX;
  				}
  				CurrScrollStep.x = Math.round((p-ScrollPosX)/ScrollDelta.x);
  			}
  			
  			
  			p = ScrollStepY*(ScrollPosY/ScrollStepY>>0);
  			if ( ScrollDelta.y = Math.round(10*(ScrollPosY-p)/ScrollStepY) ) {
  				if (ScrollDelta.y>=5) {
  					ScrollDelta.y = ScrollDelta.y-10;
  					p += ScrollStepY;
  				}
  				CurrScrollStep.y = Math.round((p-ScrollPosY)/ScrollDelta.y);
  			}
  		}
  		else {
  			if (ScrollDelta.x || ScrollDelta.y || FadeAnim) return;
    		pos.x -= ScrollBox.x - ScrollPosX;
    		pos.y -= ScrollBox.y - ScrollPosY;
 	  		HLBtn = tabs[CurrentTab].getbtn(pos);
 	  		if (window['tabs'][CurrentTab].clickbtn) tabs[CurrentTab].clickbtn();
  	  }
  	}
		else {
		var btn = GetBtnFromCursorPos(pos);
		DoClickBtn(btn);
  	}
  	HandScrollActive = false;
  	HoldActive = false;
	};
	Canvas.onmouseout = function(e)	{
		Redraw = true;
		HLBtn = -1;
		HandScrollActive = false;
		HoldActive = false;
	};
	
	function DoClickBtn(btn) {
		switch (btn) {
  		case "LeftScrll":
  		case "RightScrll":
  		case "UpScrll":
  		case "DownScrll":
  		  ScrollBtnUp(btn);
  		  break;
  		case "home": 
  		case "classes": 
  		case "teachers": 
  		  GotoTab(btn);
  		  break;
  		case "back":
  		  GotoTab(tabs[CurrentTab].BackTab);
  		  break;
  		case "arrow_left":
  		case "prev_month":
  		case "prev_day":
  			if (window['tabs'][CurrentTab].toPrev) tabs[CurrentTab].toPrev();
  			break;
  		case "arrow_right":
  		case "next_month":
  		case "next_day":
  			if (window['tabs'][CurrentTab].toNext) tabs[CurrentTab].toNext();
  			break;
  		case "changes":
  			if (window['tabs'][CurrentTab].toCalendar) tabs[CurrentTab].toCalendar();
  			break;
  		case "NL": // click on logo	
  		case "NLs":
  		  if (window['NIKA'].DISABLE_LINK_LOGO=="1") break;
  		    else
  		    	location.href="http://www.nikasoft.ru";
  	}
	};
	
	window.onresize = function() {
		Canvas.width  = __id('MainDiv').clientWidth;
		Canvas.height = __id('MainDiv').clientHeight;
		
		__id('go_mobile').style.left = (Canvas.width-180).toString()+'px';
		__id('go_mobile').style.top = (Canvas.height-40).toString()+'px';
		if (window['NIKA'].MOBILE_LINK=='hidden') 
		  __id('go_mobile').style.visibility = 'hidden'; 
		else if (window['NIKA'].MOBILE_LINK=='visible' && CurrentTab=='home') 
		  __id('go_mobile').style.visibility = 'visible'; 
		else {  
			if (CurrentTab=='home' && screen.availWidth/(window.devicePixelRatio || 1) < 1800 && screen.availHeight/(window.devicePixelRatio || 1) < 1800) {
			  __id('go_mobile').style.visibility = 'visible';
			} else
			  __id('go_mobile').style.visibility = 'hidden'; 
		}
		    
		if (!CurrentTab) return;
	  var ratio = GetCurrentRatio();
		tabs[CurrentTab].resize(ratio);
		
		// resize bottom buttons
		btns['back'].w = 67;
		btns['back'].h = 68;
		btns['home'].w = btns['back'].w;
		btns['home'].h = btns['back'].h;
		
		//btns['back'].x = Canvas.width - 2*btns['back'].w-120/ratio;
		btns['back'].x = Canvas.width - 2*btns['back'].w-120;
		//btns['back'].y = Canvas.height - BOTTOM_HEIGHT/2 - btns['back'].h/2;
		btns['back'].y = Canvas.height - BOTTOM_HEIGHT/2 - btns['back'].h/2;
		btns['home'].x = btns['back'].x + btns['back'].w + 20;
		btns['home'].y = btns['back'].y;
		
		ScrollBtnUpdate();
		
		// disable cursor for fullscreen touch screen
	  if (TouchSupport && window.screen.width==Canvas.width)
	    Canvas.style.cursor = 'None';
	  else
	  	Canvas.style.cursor = '';
		
		animate();
	};
	
  // create components	//////////////////////////////
  // init copyright date 
  var dat = new Date();
  __id('copyright').innerHTML= "&copy; 1997-" + dat.getFullYear() + "  Ника-Софт &trade;";
  
  document.body.style.backgroundColor = BASE_COLOR;
  
  // for common russian words on main page it's better to use images of buttons with captions
  // for other custom captions used empty button's image
  if (NIKA.CLASSES_BTN.toLowerCase()=='классы') {
	  CreateBtn('classes', HOME_BTN_SIZE_X, HOME_BTN_SIZE_Y, 'classes_btn.png', 'classes_hl.png');
	} else if (NIKA.CLASSES_BTN.toLowerCase()=='группы') {
		CreateBtn('classes', HOME_BTN_SIZE_X, HOME_BTN_SIZE_Y, 'groups_btn.png', 'groups_hl.png');
	} else {
		CreateBtn('classes', HOME_BTN_SIZE_X, HOME_BTN_SIZE_Y, 'title_btn.png', 'title_btnHL.png');
		btns['classes'].caption = NIKA.CLASSES_BTN.substr(0,8);
	}
		
	if (NIKA.TEACHERS_BTN.toLowerCase()=='учителя') {	
		CreateBtn('teachers', HOME_BTN_SIZE_X, HOME_BTN_SIZE_Y, 'teachers_btn.png', 'teachers_hl.png');	
	} else {
		CreateBtn('teachers', HOME_BTN_SIZE_X, HOME_BTN_SIZE_Y, 'title_btn.png', 'title_btnHL.png');		
		btns['teachers'].caption = NIKA.TEACHERS_BTN.substr(0,13);	
	}
		
  // ScrollBox buttons
  CreateBtn('LeftScrll',  48, 48, 'left_scroll.png', 'left_scrollHL.png');
  CreateBtn('RightScrll', 48, 48, 'right_scroll.png','right_scrollHL.png');
  CreateBtn('UpScrll',    48, 48, 'up_scroll.png',   'up_scrollHL.png');
  CreateBtn('DownScrll',  48, 48, 'down_scroll.png', 'down_scrollHL.png');			
  // Nika logo
  CreateBtn('NL',         86, 88, 'nika.png', 'nikaHL.png');
  btns['NL'].v = true;
  btns['NL'].x = 0;
  btns['NL'].y = 0;
  CreateBtn('NLs',         53, 54, 'small_nika.png', 'small_nikaHL.png');

  // right-top corner school+city
  CreateLabel('school', 0,0, str_trim(NIKA.SCHOOL_NAME, 40), "300 18px Arial, sans-serif", "#FFFFFF", "left");
  CreateLabel('city',   0,0, str_trim(NIKA.CITY_NAME, 40),   "300 18px Arial, sans-serif", "#FFFFFF", "left");  
  // top labels
  CreateLabel('title',    0,0, "", "normal 55px RomanaScript", BTN_TEXT_COLOR, "center");      
  CreateLabel('period',   0,0, NIKA.PERIOD_STR, "normal 20px Arial, sans-serif", GRAY_TEXT_COLOR, "center");      
  CreateLabel('subject',  0,0, "", "italic bold 24px Arial, sans-serif", SCHED_TITLE_COLOR, "left");      
  // refresh export date labels
  
  CreateLabel('exp_lab', 0,0, (NIKA.REFRESH_STR==undefined)? "Обновлено":NIKA.REFRESH_STR, "italic 28px Arial, sans-serif", "#FFFFFF", "center");
  CreateLabel('exp_dt', 0,0, PrintRefreshDate(), "italic 28px Arial, sans-serif", "#FFFFFF", "center");
  labels['exp_lab'].scalable = true;
  labels['exp_dt'].scalable = true;
  
  // navigate buttons
  CreateBtn('back',     67, 68, "back.png", "backHL.png");
  CreateBtn('home',     67, 68, "home.png", "homeHL.png");
  // next/prev week(month) buttons
  CreateBtn('arrow_left',     68, 36, "arrow_left.png", "arrow_leftHL.png");
  CreateBtn('arrow_right',     67, 37, "arrow_right.png", "arrow_rightHL.png");
  
  // changes spot (goto calendar)
  CreateBtn('changes', 206, 206, "changes.png", "changesHL.png");
  CreateLabel('change_ln1', 0,0, String((NIKA.CHANGES_STR==undefined)? "Замены":NIKA.CHANGES_STR), "normal 20px Arial, sans-serif", "#FFFFFF", "center");
  CreateLabel('change_ln2', 0,0,"", "normal 20px Arial, sans-serif", "#FFFFFF", "center");
  labels['change_ln1'].scalable = true;
  labels['change_ln2'].scalable = true;

  CreateLabel('prev_week_ln1', 0,0, String((NIKA.PREVIOUS_STR==undefined)? "Предыдущая":NIKA.PREVIOUS_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('prev_week_ln2', 0,0, String((NIKA.WEEK_STR==undefined)? "неделя":NIKA.WEEK_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('next_week_ln1', 0,0, String((NIKA.NEXT_STR==undefined)? "Следующая":NIKA.NEXT_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('next_week_ln2', 0,0, String((NIKA.WEEK_STR==undefined)? "неделя":NIKA.WEEK_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");

  CreateLabel('prev_month_ln1', 0,0, String((NIKA.PREVIOUS2_STR==undefined)? "Предыдущий":NIKA.PREVIOUS2_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('prev_month_ln2', 0,0, String((NIKA.MONTH_STR==undefined)? "месяц":NIKA.MONTH_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('next_month_ln1', 0,0, String((NIKA.NEXT2_STR==undefined)? "Следующий":NIKA.NEXT2_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('next_month_ln2', 0,0, String((NIKA.MONTH_STR==undefined)? "месяц":NIKA.MONTH_STR), "normal 16px Arial, sans-serif", BASE_COLOR, "left");

  CreateLabel('prev_day_ln2', 0,0, NIKA.DAY_NUM_STR, "normal 16px Arial, sans-serif", BASE_COLOR, "left");
  CreateLabel('next_day_ln2', 0,0, NIKA.DAY_NUM_STR, "normal 16px Arial, sans-serif", BASE_COLOR, "left");
    
  ExchangesExist = (window["NIKA"].CLASS_EXCHANGE || window["NIKA"].PERIODS.length>1 || window["NIKA"].DUALWEEK);
  
  if (NIKA.STRIKEOUT_FREE_LSN!=undefined) {
  	StrikeOutFreeLsn = NIKA.STRIKEOUT_FREE_LSN;
  }
  
  if (NIKA.HOMEPAGE_BTN && NIKA.HOMEPAGE_URL) {
  	__id('go_home').style.visibility = 'visible';
  	__id('go_home').href = NIKA.HOMEPAGE_URL;
  	__id('go_home').innerHTML = NIKA.HOMEPAGE_BTN;
  } 
  else {
  	__id('go_home').style.visibility = 'hidden';
  }
  
  GotoTab('home');

  FadeAnim = 0;
  window.setInterval(TimeRefresh, 1000);
	window.onresize();
}

/// Animation routine /////////////////////////////////////////////////////////////

window['requestAnimFrame'] = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

function animate() {
	if (!Canvas.getContext) return;
	if (!CurrentTab) return;
	
	if (!Redraw) {
		requestAnimFrame( animate );
		return;
	}
	
	var ctx=Canvas.getContext("2d");
	
	if (FadeOutScreen && FadeOutScreenCnt==0) {
		ctx.fillStyle = '#0';
		ctx.fillRect(0, 0, Canvas.width, Canvas.height);
		requestAnimFrame( animate );
		return;
	}	
	
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.lineWidth = 1;
	
	// draw background
	var ratio = GetCurrentRatio();
	tabs[CurrentTab].drawback(ctx, ratio);
	
	// draw buttons
	ctx.textBaseline = "alphabetic";
	for (var btn in btns) {
		if (btns[btn].v) {
      if (btns[btn].hasOwnProperty('caption')) {
    	  ctx.textAlign = "center";
    	  if (btns[btn].hasOwnProperty('align')) {
    	  	ctx.textAlign = btns[btn].align;
    	  }
    	  if (btns[btn].caption.length<7)
    		  ctx.font = "800 42px Arial, sans-serif";
    	  else 
    		  ctx.font = "800 40px Arial, sans-serif";
    	  if (btn==HLBtn)
    		  ctx.fillStyle = BTN_HL_COLOR;
    	  else
    		  ctx.fillStyle = BASE_COLOR;
    	}
			if (btn==HLBtn)		
		    ctx.drawImage(btns[btn].imgHL, btns[btn].x, btns[btn].y, btns[btn].w, btns[btn].h);
      else  {
	      ctx.drawImage(btns[btn].img, btns[btn].x, btns[btn].y, btns[btn].w, btns[btn].h);
	    } 			
    	if (btns[btn].hasOwnProperty('caption')) {
    	  ctx.save();
    	  ctx.setTransform(1/ratio, 0, 0, 1.25/ratio, btns[btn].x + btns[btn].w/2, btns[btn].y + btns[btn].h/2+22-5.5*ratio);
    	  ctx.fillText(btns[btn].caption, 0,0);
    	  ctx.restore();
      }
    
		}
	}

  // measure max width of school labels right-top corner 	
	if (SchoolLabelWidth==0) {
		ctx.font = labels['school'].font;
		SchoolLabelWidth = ctx.measureText(labels['school'].caption).width + 10;
		if (ctx.measureText(labels['city'].caption).width + 10>SchoolLabelWidth) 
		  SchoolLabelWidth = ctx.measureText(labels['city'].caption).width + 10;
		if (SchoolLabelWidth<200) SchoolLabelWidth = 200;
	}
	
	// draw labels	
	for (var lab in labels) {
		if (labels[lab].v) {
			ctx.font = labels[lab].font;
			ctx.textAlign = labels[lab].align;
			ctx.fillStyle = labels[lab].color;
			
			if (labels[lab].scalable) {
				ctx.save();
				ctx.setTransform(1/ratio, 0, 0, 1/ratio, labels[lab].x, labels[lab].y);
				ctx.fillText(labels[lab].caption, 0, 0);
				ctx.restore();
			}
			else {
      	ctx.fillText(labels[lab].caption, labels[lab].x, labels[lab].y);
      }
		}
	}

  // draw ScrollBox	
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ScrollBox.x,ScrollBox.y);	
  ctx.lineTo(ScrollBox.x+ScrollBox.w,ScrollBox.y);
  ctx.lineTo(ScrollBox.x+ScrollBox.w,ScrollBox.y+ScrollBox.h);
  ctx.lineTo(ScrollBox.x,ScrollBox.y+ScrollBox.h);
  ctx.closePath();
  ctx.clip();
	
  ctx.translate(-ScrollPosX+ScrollBox.x, -ScrollPosY+ScrollBox.y);
  tabs[CurrentTab].drawscroll(ctx);
  ctx.restore();

	if (FadeAnim) {
		if (FadeAnim==5 && !LastAnimTime) {
			LastAnimTime = new Date();
		}
		ctx.globalAlpha = FadeAnim/5;
		
		ctx.fillStyle = '#FFFFFF';// BASE_COLOR;
		ctx.fillRect(ScrollBox.x, ScrollBox.y, ScrollBox.w, ScrollBox.h);
		//StartAnimTime
		var curDate = new Date();
		if (curDate.getTime()-LastAnimTime.getTime()>30) {
			FadeAnim--;
			LastAnimTime = curDate; 
		}
		if (!FadeAnim) LastAnimTime = null;	
		ctx.globalAlpha = 1;
		requestAnimFrame( animate );
		return;
	}	
	
  if (!HandScrollActive && (ScrollDelta.x || ScrollDelta.y || ScrollStepX*Math.round(ScrollPosX/ScrollStepX)!=ScrollPosX || ScrollStepY*Math.round(ScrollPosY/ScrollStepY)!=ScrollPosY))  {
	  ScrollBtnUpdate();
	}
  else
	  Redraw = false;

  // transparent edges around scrollbox
  if (ScrollPosX>0 && ScrollTranspEdges & 1)
  {
	  ctx.save();
	  ctx.translate(ScrollBox.x, ScrollBox.y);
	  var LeftScrollGradient = ctx.createLinearGradient(0, 0, GRID_EDGE, 0);
	  LeftScrollGradient.addColorStop(0,GRID_EDGE_COLOR);
	  LeftScrollGradient.addColorStop(1,GRID_EDGE_COLOR_TRNSP);
	  ctx.fillStyle = LeftScrollGradient;
	  ctx.fillRect(0, 0, GRID_EDGE, ScrollBox.h);	
	  ctx.restore();
  }
  
	if (ScrollPosX+ScrollBox.w<ScrollTotalSizeX && ScrollTranspEdges & 2)
	{	
		ctx.save();
		ctx.translate(ScrollBox.x, ScrollBox.y);
		var RightScrollGradient = ctx.createLinearGradient(ScrollBox.w-GRID_EDGE, 0, ScrollBox.w, 0);
		RightScrollGradient.addColorStop(0,GRID_EDGE_COLOR_TRNSP);
		RightScrollGradient.addColorStop(1,GRID_EDGE_COLOR);
		ctx.fillStyle = RightScrollGradient;
		ctx.fillRect(ScrollBox.w-GRID_EDGE, 0, GRID_EDGE, ScrollBox.h);
		ctx.restore();
	}

  if (ScrollPosY>0 && ScrollTranspEdges & 8) {
	  ctx.save();
	  ctx.translate(ScrollBox.x, ScrollBox.y);
	  var TopScrollGradient = ctx.createLinearGradient(0, 0, 0, GRID_EDGE);
	  TopScrollGradient.addColorStop(0,GRID_EDGE_COLOR);
	  TopScrollGradient.addColorStop(1,GRID_EDGE_COLOR_TRNSP);
	  ctx.fillStyle = TopScrollGradient;
	  ctx.fillRect(0, 0, ScrollBox.w, GRID_EDGE);	
	  ctx.restore();
  }
  
	if (ScrollPosY+ScrollBox.h<ScrollTotalSizeY && ScrollTranspEdges & 4)	{
		ctx.save(); 
		ctx.translate(ScrollBox.x, ScrollBox.y);
		var BottomScrollGradient = ctx.createLinearGradient(0, ScrollBox.h-GRID_EDGE, 0,ScrollBox.h);
		BottomScrollGradient.addColorStop(0,GRID_EDGE_COLOR_TRNSP);
		BottomScrollGradient.addColorStop(1,GRID_EDGE_COLOR);
		ctx.fillStyle = BottomScrollGradient;
		ctx.fillRect(0, ScrollBox.h-GRID_EDGE, ScrollBox.w, GRID_EDGE);
		ctx.restore();
	}
	
	if (FadeOutScreenCnt) {
		var sx;
		if (FadeOutScreen)
		  sx = Math.round(255*(FadeOutScreenMax-FadeOutScreenCnt)/FadeOutScreenMax).toString(16);
		else
			sx = Math.round(255*FadeOutScreenCnt/FadeOutScreenMax).toString(16);
			
		if (sx.length==1) sx = "0" + sx;
		ctx.fillStyle = '#000000' + sx;
		ctx.fillRect(0, 0, Canvas.width, Canvas.height);
	}
	
	requestAnimFrame( animate );
}

/// ScrollBox  functionality ////////////////////////////////////////////////////////////////////////
function ScrollBtnUpdate()
{
	Redraw = true;
	if (ScrollDelta.x>0) {ScrollPosX += CurrScrollStep.x;};
	if (ScrollDelta.x<0 && ScrollPosX>0) {ScrollPosX -= CurrScrollStep.x;};
	if (ScrollDelta.y>0) {ScrollPosY += CurrScrollStep.y;};
	if (ScrollDelta.y<0 && ScrollPosY>0) {ScrollPosY -= CurrScrollStep.y;};
	
// adjust scroll image to the grid
  if (!HandScrollActive && !ScrollDelta.x && ScrollStepX*Math.round(ScrollPosX/ScrollStepX)!=ScrollPosX) {
  	
		ScrollPosX = ScrollStepX*Math.round(ScrollPosX/ScrollStepX);
	}

  if (!HandScrollActive && !ScrollDelta.y && ScrollStepY*Math.round(ScrollPosY/ScrollStepY)!=ScrollPosY) {
		ScrollPosY = ScrollStepY*Math.round(ScrollPosY/ScrollStepY);
	}
  	
	if (ScrollPosX>0) btns['LeftScrll'].v = true;
	  else {
		btns['LeftScrll'].v = false;
		if (ScrollDelta.x<0) ScrollBtnUp();
	}
	
	if (ScrollPosY>0) btns['UpScrll'].v = true;
	  else	{  	
		btns['UpScrll'].v = false;
		if (ScrollDelta.y<0) ScrollBtnUp();
	}
	
	
	if (ScrollPosX+ScrollBox.w<ScrollTotalSizeX) {
		btns['RightScrll'].v = true;
	}
	  else	{
		btns['RightScrll'].v = false;
		if (ScrollDelta.x>0) ScrollBtnUp();
	}

	if (ScrollPosY+ScrollBox.h<ScrollTotalSizeY) btns['DownScrll'].v = true;
	  else	{
		btns['DownScrll'].v = false;
		if (ScrollDelta.y>0) ScrollBtnUp();
	}

	if (ScrollDelta.x>0) ScrollDelta.x--;
	if (ScrollDelta.x<0) ScrollDelta.x++;
	if (ScrollDelta.y>0) ScrollDelta.y--;
	if (ScrollDelta.y<0) ScrollDelta.y++;
	
	if (!ScrollDelta.x && !ScrollDelta.y && ScrollBtnPressed) { 
	  ScrollTimeOutId = window.setTimeout(function(){ScrollBtnDown(ScrollBtnPressed);}, 20);
	}
}

function ScrollBtnUp() {
	clearTimeout(ScrollTimeOutId);
	ScrollBtnPressed = "";
	Redraw = true;
}

function ScrollBtnDown(btn) {
	Redraw = true;
	switch (btn) {
		case "LeftScrll":  
		  ScrollDelta.x -= SCROLL_DELTA;
		  break;
		case "RightScrll":
		  ScrollDelta.x += SCROLL_DELTA;
		  break;
		case "UpScrll":		
		  ScrollDelta.y -= SCROLL_DELTA;
		  break;
		case "DownScrll":  
		  ScrollDelta.y += SCROLL_DELTA;
		  break;
		default:
		  return;  
	}
	if (ScrollBtnPressed=="") {
	  ScrollTimeOutId = window.setTimeout(function(){ScrollBtnDown(ScrollBtnPressed=btn);}, 400);
	  CurrScrollStep = {x: Math.round(ScrollStepX/SCROLL_DELTA), y: Math.round(ScrollStepY/SCROLL_DELTA)};
	}
}

//// Tab navigator /////////////////////////////////////////////////////////////////////////////////////
function GotoTab(tab) {
	FadeAnim = 5;
	HLBtn = -1;
	CurrentTab = tab;		
	HandScrollActive = false;  
	HoldActive = false;
	ScrollDelta = {x: 0,y: 0};
	tabs[CurrentTab].init();
	window.onresize();
	btns['back'].v = (CurrentTab!='home');
	btns['home'].v = (CurrentTab!='home');
	RefreshScheduleOnline();
}

/////////////////////////////////////////////////////////////////////////////////////

function RefreshScheduleOnline() {
	if (window['schedule_check_url']!=undefined && window['initial_schedule_id']!=undefined) {
		if ((RefreshTime>RELOAD_TIMER && CurrentTab!='home') || RefreshTime>RELOAD_TIMER2) {
				RefreshTime = 0;
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
			    if (this.readyState == 4 && this.status == 200) {
			    	  if (initial_schedule_id!=this.responseText)
			    	    location.href=location.href;
			    }
				};
			  xmlhttp.open("GET", schedule_check_url, true);
			  xmlhttp.send();
			}
			return true;
	}
	else {
		return false;
	}
}	

function TimeRefresh() {
	ctLine1 = ''; ctLine2 = ''; ctMinutNum = ''; ctMinutes = ''; ctTime = ''; ctDate = ''; ctYear = '';
	RefreshTime++;
	
	var dat = new Date();
	// blink timer colon	
	if (ctTimeColon==':') ctTimeColon = ' '; else ctTimeColon = ':';
	ctTime = addZero(dat.getHours())+" "+addZero(dat.getMinutes());
	ctDate = String(dat.getDate())+" "+NIKA.MONTHS2[Number(dat.getMonth())].toLowerCase();
	ctYear = String(dat.getFullYear()) + " " + String((NIKA.YEAR_STR==undefined)? "года":NIKA.YEAR_STR);
	
	var currT, startT, endT, dT, first = true;
	for (var i in NIKA.LESSON_TIMES) {
		// current hour and minutes
		currT  = dat.getHours()*60+dat.getMinutes();
		// interval start/end hours and minutes
		startT = Number(String(NIKA.LESSON_TIMES[i][0]).split(":")[0])*60+Number(String(NIKA.LESSON_TIMES[i][0]).split(":")[1]);
		endT   = Number(String(NIKA.LESSON_TIMES[i][1]).split(":")[0])*60+Number(String(NIKA.LESSON_TIMES[i][1]).split(":")[1]);
		
		if (currT<startT && ((currT>startT-15 && first) || !first)) { // 15 minutes before first lesson
			dT = String(startT-currT);
			ctLine1 = Number(i)+" "+NIKA.LESSON_STR;
			ctLine2 = (NIKA.FROM_STR==undefined)? "через":NIKA.FROM_STR;
			ctMinutNum = dT; 
			// russian support for time notation
			if ((dT.charAt(dT.length-1)=="1" && dT>20) || dT==1) ctMinutes = NIKA.MINUTES1;
			else if ("234".indexOf(dT.charAt(dT.length-1))+1 && (dT<10 || dT>20)) ctMinutes = NIKA.MINUTES2;
			else ctMinutes += NIKA.MINUTES3;
			break;
		} else if (currT >= startT && currT <= endT) {  // lesson is going now
			ctLine2 = NIKA.TIME_GO;
			ctMinutNum = Number(i);
			ctMinutes = NIKA.LESSON_STR;
			break;
		}
		if (currT<startT && first) break;
		first = false;
	}
	Redraw = true;
	// auto reload schedule according RELOAD_TIMER (while interface is idle) 
	IdleTime++;
	if (IdleTime>REFRESH_TIMER) {
		IdleTime = 0;
		// check if screen should be switch off (make it entirely black at night period)
		CheckWorkPeriod();
		// switch to screen saver mode (animation) 
		SwitchVideoSaver(true);
	   // do not refresh schedule if it's in switch off mode or video saver mode
		if (!VideoSaverMode && !FadeOutScreen && !RefreshScheduleOnline()) location.href=location.href; // refresh local page	
		GotoTab('home');
	}
}
