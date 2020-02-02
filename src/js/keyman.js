/****************************************************************************************************
 * 1. You can make shortcut keys and event
 *      - I recommend that DO NOT USE these method (ALERT, WINDOW.POPUP) When using EVENT 'keydown'
 *
 *
 * 2. How To Use
 *  Example)
 *      1) Create Instance of KeyMan
 *          var keyman = new KeyMan();
 *
 *      2) How To Add Shorcut Key ('name' and 'keys' is Essential Parameter.)
 *          - addShortcut()
 *              keyman.addShortcut({
 *                  name:'hello shortcut',
 *                  keys:[keyman.CTRL, keyman.SHIFT],
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
 *              if (keyman.isOn('hello shortcut')) console.log('you come')
 *
 *          - check() (it check and remove keydown status. It was created to use alert and popup, but I don't like alert and popup. )
 *              if (keyman.check('hello shortcut')) alert('');
 *
 *
 **************************************************/

/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var ready = crossman.ready,
        getEl = crossman.getEl,
        newEl = crossman.newEl,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent
    ;
}catch(e){}

/***************************************************************************
 * Module
 ***************************************************************************/
function KeyMan(domElement){
    var that = this;
    this.event = new SjEvent();

    if (!domElement)
        domElement = document;
    this.downedKeyMap = {};
    this.eventListMap = {};
    this.keyMap = {};
    this.downedKeyCount = 0;
    this.shortcutInputObjs = {};
    this.commandInputObjs = {};

    this.commanders = {};

    domElement.addEventListener('keydown', function(event){
        var key = that.getKeyFromEvent(event);
        if (key != null)
            that.downedKeyMap[key] = true;
        that.execEventListenerByEventName('keydown', event);
        that.execEventListenerByEventName('keydownforcommand', key);
        that.execEventListenerByEventName('pushshortcut', event);
        // that.execEventListenerByEventName('pushcommand', event);
        return true;
    });
    domElement.addEventListener('keyup', function(event){
        var key = that.getKeyFromEvent(event);
        if (key != null)
            delete that.downedKeyMap[key];
        that.execEventListenerByEventName('keyup', event);
        that.execEventListenerByEventName('keyupforcommand', key);
        that.execEventListenerByEventName('pushshortcut', event);
        // that.execEventListenerByEventName('pushcommand', event);
        return true;
    });
    return this;
}

/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = KeyMan;
} catch (e) {}



/* Basical Final KeyCodes (User Can Use these) */
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

/* Basical Final KeyCodeMap */
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

/* Basical Final KeyCodeMap */
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
KeyMan.UP = 8;
KeyMan.DOWN = 2;
KeyMan.LEFT = 4;
KeyMan.RIGHT = 6;
KeyMan.DOWNRIGHT = 3;
KeyMan.DOWNLEFT = 1;
KeyMan.UPLEFT = 7;
KeyMan.UPRIGHT = 9;
KeyMan.A = 'A';
KeyMan.B = 'B';
KeyMan.C = 'C';
KeyMan.D = 'D';

KeyMan.SHIFT = 'SHIFT';
KeyMan.CTRL = 'CONTROL';
KeyMan.ALT = 'ALT';
KeyMan.ENTER = 'ENTER';
KeyMan.ESC = 'ESCAPE';
KeyMan.SPACE = ' ';
KeyMan.DELELTE = 'DELETE';
KeyMan.BACKSPACE = 'BACKSPACE';
KeyMan.INSERT = 'INSERT';
KeyMan.HOME = 'HOME';
KeyMan.END = 'END';
KeyMan.PAGEDOWN = 'PAGEDOWN';
KeyMan.PAGEDOWN = 'PAGEUP';
KeyMan.HANGULMODE = 'HANGULMODE';
KeyMan.HANJAMODE = 'HANJAMODE';
KeyMan.N0 = '0';
KeyMan.N1 = '1';
KeyMan.N2 = '2';
KeyMan.N3 = '3';
KeyMan.N4 = '4';
KeyMan.N5 = '5';
KeyMan.N6 = '6';
KeyMan.N7 = '7';
KeyMan.N8 = '8';
KeyMan.N9 = '9';
KeyMan.F1 = 'F1';
KeyMan.F2 = 'F2';
KeyMan.F3 = 'F3';
KeyMan.F4 = 'F4';
KeyMan.F5 = 'F5';
KeyMan.F6 = 'F6';
KeyMan.F7 = 'F7';
KeyMan.F8 = 'F8';
KeyMan.F9 = 'F9';
KeyMan.F10 = 'F10';
KeyMan.F11 = 'F11';
KeyMan.F12 = 'F12';


/*************************
 *
 * DETECT DOM SETUPED WITH KEYMAN OPTION
 *
 *************************/
KeyMan.prototype.detect = function(afterDetectFunc){
    var that = this;
    ready(function(){
        var setupedElementList;
        /** 객체탐지 적용(단축키 입력란) **/
        setupedElementList = document.querySelectorAll('[data-shortcut-input]');
        for (var j=0; j<setupedElementList.length; j++){
            that.addShortcutInput(setupedElementList[j]);
        }
        /** 객체탐지 적용(커맨드키 입력란) **/ //TODO: ??? Maybe not yet implemnets..
        setupedElementList = document.querySelectorAll('[data-command-input]');
        for (var j=0; j<setupedElementList.length; j++){
            that.addCommandInput(setupedElementList[j]);
        }
        /** Run Function After Detect **/
        if (afterDetectFunc)
            afterDetectFunc(that);
        if (that.hasEventListenerByEventName('afterdetect'))
            that.execEventListenerByEventName('afterdetect');
    });
    return this;
};
KeyMan.prototype.afterDetect = function(func){
    this.addEventListenerByEventName('afterdetect', func);
    return this;
};



/*************************
 *
 * EVENT
 *
 *************************/
KeyMan.prototype.addEventListener               = function(element, eventName, eventFunc){ this.event.addEventListener(element, eventName, eventFunc); return this; };
KeyMan.prototype.addEventListenerById           = function(element, eventName, eventFunc){ this.event.addEventListenerById(element, eventName, eventFunc); return this; };
KeyMan.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
KeyMan.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
KeyMan.prototype.hasEventListenerById           = function(element, eventName, eventFunc){ return this.event.hasEventListenerById(element, eventName, eventFunc); };
KeyMan.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
KeyMan.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
KeyMan.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
KeyMan.prototype.removeEventListenerById        = function(element, eventName, eventFunc){ return this.event.removeEventListenerById(element, eventName, eventFunc); };
KeyMan.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
KeyMan.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
KeyMan.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
KeyMan.prototype.execEventListenerById          = function(element, eventName, event){ return this.event.execEventListenerById(element, eventName, event); };
KeyMan.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };
KeyMan.prototype.execEvent                      = function(eventMap, eventNm, event){ return this.event.execEvent(eventMap, eventNm, event); };



KeyMan.prototype.convertToRightKeyFromKeys = function(keys){
    var rightKey;
    var key;
    if (typeof keys == 'string'){
        keys = this.parse(keys);
    }
    for (var i=0; i<keys.length; i++){
        key = keys[i].toUpperCase();
        rightKey = this.rightKeyMap[key];
        keys[i] = (rightKey) ? rightKey : key;
    }
    return keys;
};
KeyMan.prototype.parse = function(keyExpression){
    var keyList = [];
    if (typeof keyExpression == 'string'){
        var keyStringArray = keyExpression.split(/\s[+]\s/);
        for (var i=0, keyString; i<keyStringArray.length; i++){
            keyString = keyStringArray[i];
            keyList.push(keyString);
        }
    }
    return keyList;
};
KeyMan.prototype.convertToKeyExpression = function(keys){
    var keyExpression = '';
    if (keys instanceof Array){
        keyExpression = keys.join(' + ');
    }
    return keyExpression;
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
    return this.downedKeyMap[key.toUpperCase()];
};
KeyMan.prototype.checkKey = function(key){
    key = key.toUpperCase();
    var isTrue = this.isOnKey(key);
    delete this.downedKeyMap[key];
    return isTrue;
};
KeyMan.prototype.clearKeyDownedMap = function(){
    for (var key in this.downedKeyMap){
        delete this.downedKeyMap[key];
    }
};
KeyMan.prototype.clearCommanderKey = function(){
    var commanders = this.commanders;
    for (var commanderName in commanders){
        var commander = commanders[commanderName];
        commander.clearDefinedKey();
    }
    return this;
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
    this.clearCommanderKey();
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
        //Validation - Keys isOn?
        for (var i=0; i<keys.length; i++){
            if (!that.isOnKey(keys[i])){
                that.keyMap[shortcutName].isPressed = false;
                return false;
            }
        }
        //Run Shortcut
        // console.log('Shortcut Success!', keys);
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
    this.addEventListenerByEventName('keydown', plusFuncKeyDown);
    this.addEventListenerByEventName('keyup', plusFuncKeyUp);
    return this;
};

KeyMan.prototype.hasShortcut = function(shortcutName){
    var shortcutMap = this.keyMap[shortcutName];
    return !!shortcutMap;
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
            if (shortcutMap[eventImplNm]){
                // console.log(eventImplNm, shortcutMap[eventImplNm]);
                this.removeEventListenerByEventName(eventNm, shortcutMap[eventImplNm]);
            }
        }
        delete this.keyMap[shortcutName];
    }
    return this;
};



/* addKeyPattern
 * add a keyPattern
 */
KeyMan.prototype.addCommand = function(infoObj){
    this.addEventListenerByEventName('saveCommand', plusFuncKeyDown);
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











/****************************************************************************************************
 *
 *
 * INPUT for SHORTCUT
 *
 *
 ****************************************************************************************************/
KeyMan.prototype.newShortcutInput = function(infoObj){
    var element = newEl('input', {type:'text'}).returnElement();
    this.addShortcutInput(element, infoObj);
    return element;
};
KeyMan.prototype.addShortcutInput = function(element, infoObj){
    infoObj = (infoObj)? infoObj:{};

    var that = this;
    var shortcutInputObjs = this.shortcutInputObjs;

    // ID 적용
    var manid = (infoObj.manid) ? infoObj.manid : getEl(shortcutInputObjs).getNewSeqId('tmpShortcutKeyList');
    var id = (infoObj.id) ? infoObj.id : (element.id) ? element.id : manid;
    element.manid = manid;
    element.id = id;
    shortcutInputObjs[manid] = infoObj;
    shortcutInputObjs[manid].el = element;
    shortcutInputObjs[manid].manid = manid;

    getEl(element)
        .addEventListener('focus', function(event){
            for (var keyName in that.downedKeyMap){
                delete that.downedKeyMap[keyName];
            }
            that.startPushShortcutInputValue(function(keyDownedList){
                that.setShortcutInputValue(element, keyDownedList, ' + ');
            });
        })
        .addEventListener('blur', function(event){
            for (var keyName in that.downedKeyMap){
                delete that.downedKeyMap[keyName];
            }
            that.stopPushShortcutInputValue();
        });
    return manid;
};
KeyMan.prototype.getShortcutInputById = function(id){
    var el = document.getElementById(id);
    return this.shortcutInputObjs[el.manid].keyList;
};
KeyMan.prototype.getShortcutInputByManId = function(manid){
    return this.shortcutInputObjs[manid].keyList;
};
KeyMan.prototype.setShortcutInputValue = function(inputElement, keyList, seperator){
    //Seperator
    seperator = (seperator) ? seperator : ' + ';
    //KeyList
    var sortedKeyList = this.sortKeyList(keyList);
    //Element
    if (typeof inputElement == 'string'){
        inputElement = document.getElementById(inputElement);
    }
    inputElement.value = (keyList != null) ? sortedKeyList.join(seperator) : '';
    var manid = inputElement.manid;
    if (manid){
        this.shortcutInputObjs[manid].keyList = sortedKeyList;
    }
};
KeyMan.prototype.clearShortcutInputValue = function(inputElement){
    this.setShortcutInputValue(inputElement, []);
    return this;
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
KeyMan.prototype.startPushShortcutInputValue = function(func){
    var that = this;
    var funcPlusPushShortcut = function(event){
        event.returnValue = false;
        var keyDownedList = Object.keys(that.downedKeyMap);
        var beforeKeyDownedCount = that.downedKeyCount;
        var nowKeyDownedCount = keyDownedList.length;
        that.downedKeyCount = nowKeyDownedCount;
        if (beforeKeyDownedCount < nowKeyDownedCount)
            func(keyDownedList);
        return true;
    };
    this.addEventListenerByEventName('pushshortcut', funcPlusPushShortcut);
    return this;
};
KeyMan.prototype.stopPushShortcutInputValue = function(){
    this.removeEventListenerByEventName('pushshortcut');
    return this;
};





/****************************************************************************************************
 *
 *
 * INPUT for COMMAND
 *
 *
 ****************************************************************************************************/
KeyMan.prototype.newCommandInput = function(infoObj){
    var element = newEl('input', {type:'text'}).returnElement();
    this.addCommandInput(element, infoObj);
    return element;
};
KeyMan.prototype.addCommandInput = function(element, infoObj){
    infoObj = (infoObj)? infoObj:{};

    var that = this;
    var commandInputObjs = this.commandInputObjs;

    var manid = (infoObj.manid)? infoObj.manid : getEl(commandInputObjs).getNewSeqId('tmpCommandKeyList');
    var id = (infoObj.id) ? infoObj.id : (element.id) ? element.id : manid;
    element.manid = manid;
    element.id = id;
    commandInputObjs[manid] = infoObj;
    commandInputObjs[manid].el = element;
    commandInputObjs[manid].manid = manid;

    getEl(element)
        .addEventListener('focus', function(event){
            for (var keyName in that.downedKeyMap){
                delete that.downedKeyMap[keyName];
            }
            that.startPushCommandInputValue(function(keyDownedList){
                that.setCommandInputValue(element, keyDownedList, ' -> ');
            });
        })
        .addEventListener('blur', function(event){
            for (var keyName in that.downedKeyMap){
                delete that.downedKeyMap[keyName];
            }
            that.stopPushCommandInputValue();
        });
    return manid;
};
KeyMan.prototype.getCommandInputById = function(id){
    var el = getEl(id).returnElement();
    return this.commandInputObjs[el.manid].keyList;
};
KeyMan.prototype.getCommandInputByManId = function(manid){
    return this.commandInputObjs[manid].keyList;
};
KeyMan.prototype.setCommandInputValue = function(inputElement, keyList, seperator){
    seperator = (seperator) ? seperator : ' + ';
    // var sortedKeyList = this.sortKeyList(keyList);
    var sortedKeyList = keyList;
    inputElement.value = (keyList != null) ? sortedKeyList.join(seperator) : '';
    var manid = inputElement.manid;
    if (manid){
        this.commandInputObjs[manid].keyList = sortedKeyList;
    }
};

KeyMan.prototype.startPushCommandInputValue = function(func){
    var that = this;
    var commanderForInput = this.addCommander('_input', true);
    commanderForInput.funcEventWhenCommand = function(keyDownedList){
        func(keyDownedList);
    };
    return this;
};
KeyMan.prototype.stopPushCommandInputValue = function(){
    this.delCommander('_input');
    return this;
};




/*************************
 *
 * COMMANDER - Add Commander
 * @param commanderName
 * @returns {KeyManCommander}
 *
 *************************/
KeyMan.prototype.addCommander = function(commanderName, modeDefinedKey){
    var commander;
    if (!this.getCommander(commanderName)){
        commander = new KeyManCommander(commanderName);
        commander.parent = this;
        commander.keydownFunc = (modeDefinedKey) ? commander.handleDefinedKeydown() : commander.handleKeydown();
        commander.keyupFunc = (modeDefinedKey) ? commander.handleDefinedKeyup() : commander.handleKeyup();
        this.commanders[commanderName] = commander;
        this.addEventListenerByEventName('keydownforcommand', commander.keydownFunc );
        this.addEventListenerByEventName('keyupforcommand', commander.keyupFunc );
    }else{
        commander = this.getCommander(commanderName);
    }
    return commander;
};
KeyMan.prototype.getCommander = function(commanderName){
    return this.commanders[commanderName];
};
KeyMan.prototype.hasCommander = function(commanderName){
    var commanders = this.commanders;
    if (commanderName){
        return commanders[commanderName] != null && commanders[commanderName] != undefined;
    }else{
        return commanders != null && commanders != undefined && Object.keys(commanders).length > 0;
    }
};
KeyMan.prototype.delCommander = function(commanderName){
    var commanders = this.commanders;
    var commander = commanders[commanderName];
    this.removeEventListenerByEventName('keydownforcommand', commander.definedKeydownFunc );
    this.removeEventListenerByEventName('keyupforcommand', commander.definedKeyupFunc );
    delete commanders[commanderName];
    return this;
};
KeyMan.prototype.delAllCommander = function(){
    var commanders = this.commanders;
    for (var commanderName in commanders){
        this.delCommander(commanderName);
    }
    return this;
};









/****************************************************************************************************
 *
 *
 * KeyManCommand
 *
 *
 ****************************************************************************************************/
function KeyManCommander(commanderName){
    this.parent = null;
    this.commanderName = commanderName;

    this.downedDefinedKeyMap = {};
    this.definedKeyMap = {};
    this.definedKeydownFuncMap = {};
    this.definedKeyupFuncMap = {};
    this.definedKeyOrderList = [];
    this.standardDefinedKeyOrderList = [];
    this.funcEventWhenCommand = null;

    this.isReversed = false;
    this.lastDirection = null;
    this.lastBtn = null;
    this.timer = null;

    this.commandMap = {};
    this.commandEventMap = {};


    this.addCommand = function(commandName, keyList){
        this.commandMap[commandName] = keyList;
        return this;
    };
    this.addCommandEvent = function(commandName, func){
        this.commandEventMap[commandName] = func;
        return this;
    };
    this.addCommandMap = function(commandMapParam){
        for (var commandName in commandMapParam){
            this.commandMap[commandName] = commandMapParam[commandName];
        }
        return this;
    };
    this.addCommandEventMap = function(commandEventMapParam){
        for (var commandName in commandEventMapParam){
            this.commandEventMap[commandName] = commandEventMapParam[commandName];
        }
        return this;
    };

    this.defineKey = function(definedKeyName, key ,keydownFunc, keyupFunc){
        var that = this;
        if (!keydownFunc)
            keydownFunc = function(){};
        if (!keyupFunc)
            keyupFunc = function(){};
        this.definedKeydownFuncMap[definedKeyName] = function(){
            that.downedDefinedKeyMap[definedKeyName] = true;
            keydownFunc();
        };
        this.definedKeyupFuncMap[definedKeyName] = function(){
            delete that.downedDefinedKeyMap[definedKeyName];
            keyupFunc();
        };
        if (key instanceof Array){
            for (var i=0; i<key.length; i++){
                var keyName = key[i];
                keyName = keyName.toUpperCase();
                this.definedKeyMap[keyName] = definedKeyName;
            }
        }else{
            var keyName = key;
            keyName = keyName.toUpperCase();
            this.definedKeyMap[keyName] = definedKeyName;
        }
    };
    this.setUp = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.UP, key, keydownFunc ,keyupFunc); return this; };
    this.setDown = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.DOWN, key, keydownFunc ,keyupFunc); return this; };
    this.setLeft = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.LEFT, key, keydownFunc ,keyupFunc); return this; };
    this.setRight = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.RIGHT, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonA = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.A, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonB = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.B, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonC = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.C, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonD = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.D, key, keydownFunc ,keyupFunc); return this; };

    this.setReverse = function(flag){
        this.isReversed = flag;
        return this;
    };
    this.handleDefinedKeydown = function(){
        var that = this;
        return function (key) {
            var definedKeyName = that.definedKeyMap[key];
            var func = that.definedKeydownFuncMap[definedKeyName];
            (func && func());
            that.handleSaveDefinedKey(definedKeyName);
        };
    };
    this.handleDefinedKeyup = function(){
        var that = this;
        return function (key){
            var definedKeyName = that.definedKeyMap[key];
            var func = that.definedKeyupFuncMap[definedKeyName];
            (func && func());
            that.handleSaveDefinedKey(definedKeyName);
        };
    };
    this.handleKeydown = function(){
        var that = this;
        return function (key){
            var func = that.definedKeydownFuncMap[key];
            if (func){
                func();
            }else{
                that.downedDefinedKeyMap[key] = true;
            }
            that.handleSaveKey(key);
        };
    };
    this.handleKeyup = function(){
        var that = this;
        return function (key){
            var func = that.definedKeyupFuncMap[key];
            if (func){
                func();
            }else{
                delete that.downedDefinedKeyMap[key];
            }
            that.handleSaveKey(key);
        };
    };
    this.getType = function(definedKeyName){
        return (typeof definedKeyName == 'string') ? 'btn' : 'direction';
    };
    this.handleSaveKey = function(key){
        var that = this;
        var downedDefinedKeyMap = this.downedDefinedKeyMap;
        key = Object.keys(downedDefinedKeyMap)[0];
        var isSameKey = (this.lastDirection == key);
        this.lastDirection = key;
        //Key
        if (key !== null && key !== undefined){
            if (!isSameKey){
                this.definedKeyOrderList.push(key);
                this.standardDefinedKeyOrderList.push(key);
            }
            console.log('DownedKey', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
        }
        //Event
        (this.funcEventWhenCommand && this.funcEventWhenCommand(this.standardDefinedKeyOrderList));
        if (key !== null && key !== undefined){
            //Do Skill
            var skillNm = this.getMatchedCommand(this.standardDefinedKeyOrderList);
            if (skillNm){
                this.executeSkill(skillNm);
                this.definedKeyOrderList = [];
                this.standardDefinedKeyOrderList = [];
            }
            //Clear Timer And Restart Timer
            clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                that.clearDefinedKey(that);
                console.log('DownedKey (Clean)', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
            }, 300);
        }
    };
    this.handleSaveDefinedKey = function(definedKeyName){
        var that = this;
        // 변하면 입력
        var directionKeyCode;
        var buttonKeyCode;
        var isSameDirectionKey;
        var isSameButtonKey;
        var downedDefinedKeyMap = this.downedDefinedKeyMap;
        //Key - Direction
        directionKeyCode = this.getDirectionCodeFromDownKeys(downedDefinedKeyMap, 8);
        isSameDirectionKey = (this.lastDirection == directionKeyCode);
        this.lastDirection = directionKeyCode;
        if ( !isSameDirectionKey && directionKeyCode != 0 ){
            this.definedKeyOrderList.push(directionKeyCode);
            if (this.isReversed)
                directionKeyCode = this.getReversedDirectionCodeList(directionKeyCode);
            this.standardDefinedKeyOrderList.push(directionKeyCode);
        }
        //Key - Button
        buttonKeyCode = this.getBtnCodeFromDownKeys(downedDefinedKeyMap);
        isSameButtonKey = (this.lastBtn == buttonKeyCode);
        this.lastBtn = buttonKeyCode;
        if ( !isSameButtonKey && buttonKeyCode != 0 ){
            this.definedKeyOrderList.push(buttonKeyCode);
            this.standardDefinedKeyOrderList.push(buttonKeyCode);
            // this.parent.execEventListenerByEventName('keydown', this.standardDefinedKeyOrderList);
        }
        //Event
        (this.funcEventWhenCommand && this.funcEventWhenCommand(this.standardDefinedKeyOrderList));
        if (directionKeyCode != 0 || buttonKeyCode !=0){
            console.log('DownedDefinedKey', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
            //Do Skill
            var skillNm = this.getMatchedCommand(this.standardDefinedKeyOrderList);
            if (skillNm){
                this.executeSkill(skillNm);
                this.definedKeyOrderList = [];
                this.standardDefinedKeyOrderList = [];
            }
            //Clear Timer And Restart Timer
            clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                that.clearDefinedKey(that);
                console.log('DownedDefinedKey (Clean)', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
            }, 300);
        }
    };
    this.clearDefinedKey = function(){
        this.downedDefinedKeyMap = {};
        this.definedKeyOrderList = [];
        this.standardDefinedKeyOrderList = [];
        this.lastDirection = null;
        this.lastBtn = null;
        // testLog.innerHTML = definedKeyOrderList;
    };
    this.getMatchedCommand = function(standardDefinedKeyOrderList){
        var matchedPattern = {};
        var selectedSkillNm = '';
        var orderStr = JSON.stringify(standardDefinedKeyOrderList);
        for (var skillNm in this.commandMap){
            var pattern = JSON.stringify(this.commandMap[skillNm]);
            pattern = pattern.substring(1, pattern.length-1);
            // console.log('[Compare]',  orderStr, pattern);
            if (orderStr.indexOf(pattern) != -1)
                matchedPattern[skillNm] = pattern;
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


    this.executeSkill = function(skillNm){
        console.debug(skillNm);
        this.startSkill(skillNm);
    };
    this.startSkill = function(skillNm){
        var skillFunc = this.commandEventMap[skillNm];
        if (skillFunc)
            skillFunc();
    };
    this.serverReceiveSkill = function(data){
    };





    /** 방향 코드 얻기 **/
    this.getDirectionCodeFromDownKeys = function(downKeys, howManyWay){
        if (howManyWay == 4 || howManyWay === undefined) {
            if (downKeys[KeyMan.RIGHT]) return KeyMan.RIGHT;
            else if(downKeys[KeyMan.LEFT]) return KeyMan.LEFT;
            else if(downKeys[KeyMan.UP]) return KeyMan.UP;
            else if(downKeys[KeyMan.DOWN]) return KeyMan.DOWN
            else return 0;
        }else if (howManyWay == 8){
            if (downKeys[KeyMan.DOWN] && downKeys[KeyMan.RIGHT]) return KeyMan.DOWNRIGHT;
            else if(downKeys[KeyMan.UP] && downKeys[KeyMan.RIGHT]) return KeyMan.UPRIGHT;
            else if(downKeys[KeyMan.DOWN] && downKeys[KeyMan.LEFT]) return KeyMan.DOWNLEFT;
            else if(downKeys[KeyMan.UP] && downKeys[KeyMan.LEFT]) return KeyMan.UPLEFT;
            else if(downKeys[KeyMan.RIGHT]) return KeyMan.RIGHT;
            else if(downKeys[KeyMan.LEFT]) return KeyMan.LEFT;
            else if(downKeys[KeyMan.UP]) return KeyMan.UP;
            else if(downKeys[KeyMan.DOWN]) return KeyMan.DOWN;
            else return 0;
        }
    };
    /** 방향 코드 좌우 반전시키기 **/
    this.getReversedDirectionCodeList = function(key){
        if (key==4) return 6;
        else if (key==6) return 4;
        else if (key==7) return 9;
        else if (key==9) return 7;
        else if (key==1) return 3;
        else if (key==3) return 1;
        return key;
    };
    /** 방향 코드 얻기 **/
    this.getBtnCodeFromDownKeys = function(downKeys){
        if (downKeys[KeyMan.A]) return KeyMan.A;
        else if(downKeys[KeyMan.B]) return KeyMan.B;
        else if(downKeys[KeyMan.C]) return KeyMan.C;
        else if(downKeys[KeyMan.D]) return KeyMan.D;
        else return 0;
    };
}
