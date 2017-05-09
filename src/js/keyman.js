/****************************************************************************************************
 *      KeyMan
 *      created by SUJKIM
 ****************************************************************************************************/
/****************************************************************************************************
 * 1. You can make shortcut keys and event
 *      - I recommend that DO NOT USE these method (ALERT, WINDOW.POPUP) When using EVENT 'keydown'
 *
 *
 * 2. How To Use
 *  Example)
 *      1) Create Instance of KeyMan
 *          var keyMan = new KeyMan();
 *
 *      2) How To Add Shorcut Key ('name' and 'keys' is Essential Parameter.)
 *          - addShortcut()
 *              keyMan.addShortcut({
 *                  name:'hello shortcut',
 *                  keys:[keyMan.CTRL, keyMan.SHIFT],
 *                  keydown:function(event){
 *                      console.log('key down')
 *                  },
 *                  keypress:function(event){
 *                      console.log('key press')
 *                  },
 *                  keyup:function(event){
 *                      console.log('key up')
 *                  }
 *              });
 *
 *      3) How To Chcck Shortcut Key Is Pressed
 *          - isOn() (it just check keydown status)
 *              if (keyMan.isOn('hello shortcut')) console.log('you come')
 *
 *          - check() (it check and remove keydown status. It was created to use alert and popup, but I don't like alert and popup. )
 *              if (keyMan.check('hello shortcut')) alert('');
 *
 *
 **************************************************/
function KeyMan(domElement){
    var that = this;
    var getEl = this.getEl;
    if (!domElement) domElement = document;
    this.keyDownedMap = {};
    this.eventListMap = {};
    this.keyMap = {};
    this.downedKeyCount = 0;
    this.keyListObjs = {};
    getEl(domElement).addEventListener('keydown', function(event){
        var key = that.getKeyFromEvent(event);
        if (key != null)
            that.keyDownedMap[key] = true;
        that.executeEvent('keydown', event);
        that.executeEvent('pushkeylist', event);
    });
    getEl(domElement).addEventListener('keyup', function(event){
        var key = that.getKeyFromEvent(event);
        if (key != null)
            delete that.keyDownedMap[key];
        that.executeEvent('keyup', event);
        that.executeEvent('pushkeylist', event);
    });
    return this;
}




/* Basical Final KeyCodes (User Can Use these)
 */
KeyMan.prototype.SHIFT = 'SHIFT';
KeyMan.prototype.CTRL = 'CONTROL';
KeyMan.prototype.ALT = 'ALT';
KeyMan.prototype.ENTER = 'ENTER';
KeyMan.prototype.ESC = 'ESCAPE';
KeyMan.prototype.SPACE = ' ';
KeyMan.prototype.DELELTE = 'DELETE';
KeyMan.prototype.BACKSPACE = 'BACKSPACE';
KeyMan.prototype.INSERT = 'INSERT';
KeyMan.prototype.HOME = 'HOME';
KeyMan.prototype.END = 'END';
KeyMan.prototype.PAGEDOWN = 'PAGEDOWN';
KeyMan.prototype.PAGEDOWN = 'PAGEUP';
KeyMan.prototype.DELELTE = 'BACKSPACE';
KeyMan.prototype.HANGULMODE = 'HANGULMODE';
KeyMan.prototype.HANJAMODE = 'HANJAMODE';
KeyMan.prototype.N0 = '0';
KeyMan.prototype.N1 = '1';
KeyMan.prototype.N2 = '2';
KeyMan.prototype.N3 = '3';
KeyMan.prototype.N4 = '4';
KeyMan.prototype.N5 = '5';
KeyMan.prototype.N6 = '6';
KeyMan.prototype.N7 = '7';
KeyMan.prototype.N8 = '8';
KeyMan.prototype.N9 = '9';
KeyMan.prototype.F1 = 'F1';
KeyMan.prototype.F2 = 'F2';
KeyMan.prototype.F3 = 'F3';
KeyMan.prototype.F4 = 'F4';
KeyMan.prototype.F5 = 'F5';
KeyMan.prototype.F6 = 'F6';
KeyMan.prototype.F7 = 'F7';
KeyMan.prototype.F8 = 'F8';
KeyMan.prototype.F9 = 'F9';
KeyMan.prototype.F10 = 'F10';
KeyMan.prototype.F11 = 'F11';
KeyMan.prototype.F12 = 'F12';

/* Basical Final KeyCodeMap
 */
KeyMan.prototype.keyCodeMap = {
    8:'BACKSPACE',
    9:'TAB',
    13:'ENTER',
    16:'SHIFT',
    17:'CONTROL',
    18:'ALT',
    19:'PAUSE',
    20:'CAPSLOCK',
    27:'ESCAPE',
    32:' ',
    33:'PAGEUP',
    34:'PAGEDOWN',
    35:'END',
    36:'HOME',
    37:'ARROWLEFT',
    38:'ARROWUP',
    39:'ARROWRIGHT',
    40:'ARROWDOWN',
    45:'INSERT',
    46:'DELETE',
    144:'NUMBERLOCK',
    145:'SCROLLLOCK',
    186:';',
    187:'=',
    189:',',
    189:'-',
    191:'/',
    192:'`',
    219:"[",
    220:"\\",
    221:"]",
    222:"'"
};

/* Basical Final KeyCodeMap
 */
KeyMan.prototype.rightKeyMap = {
    CTRL:'CONTROL',
    ESC:'ESCAPE',
    DEL:'DELETE',
    SPACE:' ',
    UP:'ARROWUP',
    DOWN:'ARROWDOWN',
    RIGHT:'ARROWRIGHT',
    LEFT:'ARROWLEFT'
};

/**
 * Command
 */
KeyMan.UP = 1;
KeyMan.DOWN = 1;
KeyMan.LEFT = 1;
KeyMan.RIGHT = 1;



KeyMan.prototype.convertToRightKeyFromKeys = function(keys){
    var rightKey;
    var key;
    for (var i=0; i<keys.length; i++){
        key = keys[i].toUpperCase();
        rightKey = this.rightKeyMap[key];
        keys[i] = (rightKey) ? rightKey : key;
    }
    return keys;
};
KeyMan.prototype.getKeyFromEvent = function(event){
    var key;
    var keyCode = (event.keyCode) ? event.keyCode : event.which;
    var keyName = (event.key) ? event.key : null;
    if (keyCode == 229)
        return null;
    if (keyName){
        if (keyCode && 48 <= keyCode && keyCode <= 57){
            key = this.convertToKeyFromKeyCode(keyCode);
        }else{
            key = keyName.toUpperCase();
        }
    }else{
        key = this.convertToKeyFromKeyCode(keyCode).toUpperCase();
    }
    return key;
};

KeyMan.prototype.convertToKeyFromKeyCode = function(keyCode){
    var key = '';
    if (this.keyCodeMap[keyCode]){
        key += this.keyCodeMap[keyCode];
    }else if (65 <= keyCode && keyCode <= 90){
        key += String.fromCharCode(keyCode)
    }else if (keyCode == 96){
        key += 0;
    }else if (97 <= keyCode && keyCode <= 105){
        key += (keyCode - 96);
    }else if (112 <= keyCode && keyCode <= 123){
        key += 'F' + (keyCode-111);
    }else{
        key += String.fromCharCode(keyCode)
    }
    return key;
};

KeyMan.prototype.convertToKeyCodesFrom = function(keyList){
    var keyCodes = [];
    for (var i=0; i<keyList.length; i++){
        var key = keyList[i];
        if (typeof key == 'string')
            key = key.charCodeAt(0);
        keyCodes.push(key);
    }
    return keyCodes;
};


KeyMan.prototype.isOnKey = function(key){
    return this.keyDownedMap[key.toUpperCase()];
};
KeyMan.prototype.checkKey = function(key){
    key = key.toUpperCase();
    var isTrue = this.isOnKey(key);
    delete this.keyDownedMap[key];
    return isTrue;
};
KeyMan.prototype.clearKeyDownedMap = function(){
    for (var key in this.keyDownedMap){
        delete this.keyDownedMap[key];
    }
};

KeyMan.prototype.addEventListener = function(eventNm, func){
    if (!this.eventListMap[eventNm])
        this.eventListMap[eventNm] = [];
    this.eventListMap[eventNm].push(func);
};
KeyMan.prototype.removeEventListener = function(eventNm, func){
    var eventList = this.eventListMap[eventNm];
    if (func){
        if (eventList && eventList.length > 0){
            for (var i=0; i<eventList.length; i++){
                if (func == eventList[i])
                    eventList.splice(i, 1);
            }
        }
    }else{
        delete this.eventListMap[eventNm];
    }
};
KeyMan.prototype.executeEvent = function(eventNm, event){
    var eventList = this.eventListMap[eventNm];
    if (eventList){
        for (var i=0; i<eventList.length; i++){
            eventList[i](event);
        }
    }
};


/* isOn
 * isOn do that 'Return Shortcut is pressed'
 */
KeyMan.prototype.isOn = function(downedShortcutName){
    var shorcutMap = this.keyMap[downedShortcutName];
    return shorcutMap && shorcutMap.isPressed;
};

/* check
 * check do that 'Return Shortcut is pressed' and 'Init keys you downed'
 * If you use alert, you need to this check method.
 */
KeyMan.prototype.check = function(downedShortcutName){
    var isTrue = this.isOn(downedShortcutName);
    if (isTrue){
        var shorcutMap = this.keyMap[downedShortcutName];
        if (shorcutMap.keyup) shorcutMap.keyup();
        shorcutMap.isPressed = false;
    }
    this.clearKeyDownedMap();
    return isTrue;
};

/* addShortcut
 * add a shortcut
 */
KeyMan.prototype.addShortcut = function(infoObj){
    var that = this;
    // 1. Get Info
    var shortcutName = infoObj.name;
    var keys = this.convertToRightKeyFromKeys(infoObj.keys);
//    var keyCodes = this.convertToKeyCodesFrom(keys);
    var funcKeyDown = infoObj.keydown;
    var funcKeyPress = infoObj.keypress;
    var funcKeyUp = infoObj.keyup;
    // 2. Create Function keydown
    var plusFuncKeyDown = function(event){
        for (var i=0; i<keys.length; i++){
            if (!that.isOnKey(keys[i])){
                that.keyMap[shortcutName].isPressed = false;
                return false;
            }
        }
        var data = that.keyMap[shortcutName].data;
        if (!that.keyMap[shortcutName].isPressed){
            that.keyMap[shortcutName].isPressed = true;
            if (funcKeyDown)
                funcKeyDown(data);
        }
        if (funcKeyPress)
            funcKeyPress(data);
        return true;
    };
    // 3. Create Function keyup
    var plusFuncKeyUp = function(event){
        for (var i=0; i<keys.length; i++){
            if (!that.isOnKey(keys[i])){
                var data = that.keyMap[shortcutName].data;
                if (that.keyMap[shortcutName].isPressed){
                    that.keyMap[shortcutName].isPressed = false;
                    if (funcKeyUp)
                        funcKeyUp(data);
                    return true;
                }
            }
        }
        return false;
    };
    // 4. Set
    if (shortcutName){
        this.keyMap[shortcutName] = infoObj;
        this.keyMap[shortcutName].keydownImpl = plusFuncKeyDown;
        this.keyMap[shortcutName].keyupImpl = plusFuncKeyUp;
        this.keyMap[shortcutName].isPressed = false;
    }
    this.addEventListener('keydown', plusFuncKeyDown);
    this.addEventListener('keyup', plusFuncKeyUp);
    return this;
};

/* delShortcut
 * delete a shortcut key
 */
KeyMan.prototype.delShortcut = function(shortcutName){
    var shortcutMap = this.keyMap[shortcutName];
    if (shortcutMap){
        var events = ['keydown', 'keyup'];
        for (var i=0; i<events.length; i++){
            var eventNm = events[i];
            var eventImplNm = events[i] + 'Impl';
            if (shortcutMap[eventImplNm])
                this.removeEventListener(eventNm, shortcutMap[eventImplNm]);
        }
        delete this.keyMap[shortcutName];
    }
    return this;
};



/* addKeyPattern
 * add a keyPattern
 */
KeyMan.prototype.addCommand = function(infoObj){
    this.addEventListener('saveCommand', plusFuncKeyDown);
};
/* delKeyPattern
 * delete a keyPattern
 */
KeyMan.prototype.delCommand = function(keyPatternName){
};



/* lock
 * Key Lock
 */
KeyMan.prototype.lock = function(){
};
/* unlock
 * Key Unlock
 */
KeyMan.prototype.unlock = function(){
};
/* stop
 * KeyMan Stop
 */
KeyMan.prototype.stop = function(){
};
/* start
 * KeyMan Start
 */
KeyMan.prototype.start = function(){
};


/*
 *
 */
KeyMan.prototype.getKeyListById = function(id){
    var el = document.getElementById(id);
    return this.keyListObjs[el.manid].keyList;
};
KeyMan.prototype.getKeyListByManId = function(manid){
    return this.keyListObjs[manid].keyList;
};


/* detect
 * detect view setting
 */
KeyMan.prototype.detect = function(){
    var that = this;
    getEl().ready(function(){
        /** 객체탐지 적용() **/
        tempEls = document.querySelectorAll('[data-keylist]');
        for (var j=0; j<tempEls.length; j++){
            that.addKeyListInput(tempEls[j]);
        }
    });
    return this;
};
KeyMan.prototype.addKeyListInput = function(el, infoObj){
    infoObj = (infoObj)? infoObj:{};

    var that = this;
    var keyListObjs = this.keyListObjs;

    var manid = (infoObj.manid)? infoObj.manid : getEl(keyListObjs).getNewSeqId('tmpKeyList');
    el.manid = manid;
    this.keyListObjs[manid] = infoObj;
    this.keyListObjs[manid].el = el;
    this.keyListObjs[manid].manid = manid;

    var func = function(keyDownedList){
        that.inputKeyList(el, keyDownedList, ' + ');
    };
    getEl(el).addEventListener('focus', function(event){
        for (var keyName in that.keyDownedMap){
            delete that.keyDownedMap[keyName];
        }
        that.startPushKeyList(func);
    });
    getEl(el).addEventListener('blur', function(event){
        for (var keyName in that.keyDownedMap){
            delete that.keyDownedMap[keyName];
        }
        that.stopPushKeyList(func);
    });
    return manid;
};
KeyMan.prototype.inputKeyList = function(inputElement, keyList, seperator){
    seperator = (seperator) ? seperator : ' + ';
    var sortedKeyList = this.sortKeyList(keyList);
    inputElement.value = (keyList != null) ? sortedKeyList.join(seperator) : '';
    var manid = inputElement.manid;
    if (manid){
        this.keyListObjs[manid].keyList = sortedKeyList;
    }
};
KeyMan.prototype.sortKeyList = function(keyList){
    var primaryList = ['CONTROL', 'ALT', 'SHIFT'];
    var sortedKeyList = keyList.sort(function(a, b){
        var resultA = primaryList.indexOf(a);
        var resultB = primaryList.indexOf(b);
        if (resultA != -1 && resultA < resultB)
            return 0;
        else if (resultB != -1)
            return 1;
        else
            return -1;
    });
    return sortedKeyList;
};
KeyMan.prototype.startPushKeyList = function(func){
    var that = this;
    var funcPlusKeyList = function(event){
        event.returnValue = false;
        var keyDownedList = Object.keys(that.keyDownedMap);
        var beforeKeyDownedCount = that.downedKeyCount;
        var nowKeyDownedCount = keyDownedList.length;
        that.downedKeyCount = nowKeyDownedCount;
        if (beforeKeyDownedCount < nowKeyDownedCount)
            func(keyDownedList);
        return true;
    };
    this.addEventListener('pushkeylist', funcPlusKeyList);
    return this;
};
KeyMan.prototype.stopPushKeyList = function(){
    this.removeEventListener('pushkeylist');
    return this;
};


/**
 * KeyManCommand
 */
function KeyManCommander(diPatternsForSkill, diSkillFuncs){
    var downedKeys = {};
    var orderList = [];
    var orderListForSkill = [];
    var isReversed = false;

    var lastDirection = null;
    var lastBtn = null;
    var timer = null;

    var commandMap = diPatternsForSkill;
    var commandEventMap = diSkillFuncs;

    this.add = function(commandName, keyList){
        commandMap[commandName] = keyList;
    };
    this.addEvent = function(commandName, func){
        commandEventMap[commandName] = func;
    };

    this.setReverse = function(flag){
        isReversed = flag;
    };
    this.addKey = function(keyPattern, type){
        // 변하면 입력
        var patternCode;
        var isSameKey;
        if (type=='direction'){
            patternCode = this.getDirectionCodeFromDownKeys(sjgd.downKeys, 8);
            isSameKey = (lastDirection == patternCode);
            lastDirection = patternCode;
        }else if(type=='btn') {
            patternCode = this.getBtnCodeFromDownKeys(sjgd.downKeys);
            isSameKey = (lastBtn == patternCode);
            lastBtn = patternCode;
        }
        if (!isSameKey && patternCode != 0) {
            orderList.push(patternCode);
            if (isReversed)
                patternCode = this.getReversedDirectionCodeList(patternCode);
            orderListForSkill.push(patternCode);
            // testLog.innerHTML = orderList;
            var skillNm = this.getMatchedCommand(orderListForSkill);
            if (skillNm){
                this.executeSkill(skillNm);
                orderList = [];
                orderListForSkill = [];
            }
            //입력시간 카운트 초기화
            clearTimeout(timer);
            timer = setTimeout(function(){
                orderList = [];
                orderListForSkill = [];
                lastDirection = null;
                lastBtn = null;
                // testLog.innerHTML = orderList;
            }, 300);
        }
    };

    this.getMatchedCommand = function(orderListForSkill){
        var matchedPattern = {};
        var selectedSkillNm = '';
        var orderStr = JSON.stringify(orderListForSkill);
        // testLog2.innerHTML = JSON.stringify(orderList);
        // testLog2.innerHTML += '<br/>'+orderStr;
        for (var skillNm in commandMap){
            var pattern = JSON.stringify(commandMap[skillNm]);
            pattern = pattern.substring(1, pattern.length-1);
            if (orderStr.indexOf(pattern) != -1) matchedPattern[skillNm] = pattern;
        }

        var matchedSkills = Object.keys(matchedPattern);
        if (1 == matchedSkills.length){
            selectedSkillNm = matchedSkills[0];
        }else if (1 < matchedSkills.length){
            var longger = 0;
            for (var pNm in matchedPattern){
                if (longger < matchedPattern[pNm].length){
                    longger = matchedPattern[pNm].length;
                    selectedSkillNm = pNm;
                }
            }
        }
        return selectedSkillNm;
    };


    this.executeSkill = function(skillNm, pattern){
    };
    this.startSkill = function(userNm, skillNm){
        var skillFunc = commandEventMap[skillNm];
        if (skillFunc)
            skillFunc(userNm);
    };
    this.serverReceiveSkill = function(data){
    };





    /** 방향 코드 얻기 **/
    this.getDirectionCodeFromDownKeys = function(downKeys, howManyWay){
        if (howManyWay==4 || howManyWay===undefined) {
            if (downKeys['right']) return 1;
            else if(downKeys['left']) return 2;
            else if(downKeys['up']) return 3;
            else if(downKeys['down']) return 4;
            else return 0;
        }else if (howManyWay==8){
            if (downKeys['down'] && downKeys['right']) return 5;
            else if(downKeys['up'] && downKeys['right'])    return 6;
            else if(downKeys['down'] && downKeys['left']) return 7;
            else if(downKeys['up'] && downKeys['left']) return 8;
            else if(downKeys['right']) return 1;
            else if(downKeys['left']) return 2;
            else if(downKeys['up']) return 3;
            else if(downKeys['down']) return 4;
            else return 0;
        }
    };
    /** 방향 코드 좌우 반전시키기 **/
    this.getReversedDirectionCodeList = function(key){
        if (key==1) return 2;
        else if (key==2) return 1;
        else if (key==5) return 7;
        else if (key==7) return 5;
        else if (key==6) return 8;
        else if (key==8) return 6;
        return key;
    };

    /** 방향 코드 얻기 **/
    this.getBtnCodeFromDownKeys = function(downKeys){
        if (downKeys['a']) return 'a';
        else if(downKeys['b']) return 'b';
        else return 0;
    };
}






/*************************
 * getEl
 * do cross browsing
 *************************/
KeyMan.prototype.getEl = function(id){
    var el = (typeof id == 'object') ? id : document.getElementById(id);
    var getEl = {
        addEventListener : function(eventNm, fn){
            /* FireFox */
            if (navigator.userAgent.indexOf('Firefox') != -1){
                el.addEventListener(eventNm, function(e){window.event=e;}, true);
            }
            /*  */
            if (el.addEventListener){
                el.addEventListener(eventNm, function(event){
                    fn(event);
                });
                /* IE8 */
            }else{
                el.attachEvent('on'+eventNm, function(event){
                    if (!event.target && event.srcElement) event.target = event.srcElement;
                    fn(event);
                });
            }
            return true;
        }
    };
    return getEl;
};