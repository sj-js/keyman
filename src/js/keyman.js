/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var ready = crossman.ready,
        getClass = crossman.getClass,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent
        ;
}catch(e){}

/***************************************************************************
 * Module
 ***************************************************************************/
function KeyMan(domElement){
    SjEvent.apply(this, arguments);

    /** Mode **/
    this.modeLock = false;
    this.targetKeyMapId = '_default';
    this.targetLocalStoragePath = '';
    this.targetDomElement = (domElement) ? domElement : document;

    /** Status **/
    this.downedKeyMap = {};
    this.downedKeyCount = 0;
    this.statusTypeable = null;

    /** KeyMap Cluster **/
    this.storage = null;
    this.system = null;
    this.user = null;
    this.mainClusterList = [];

    /** Runner **/
    this.runnerPool = null;

    /** FunctionKey Handler **/
    this.shortcutKeyHandler = null;
    this.commandKeyHandler = null;

    /** Inputer **/
    this.shortcutInputObjs = {};
    this.commandInputObjs = {};

    /** Commander **/
    this.commanders = {};

    /** Init **/
    this.init();
}
getClass(KeyMan).extend(SjEvent);


/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = KeyMan;
} catch (e) {}



/* Basical Final KeyCodeMap */
KeyMan.keyCodeMap = {
    8:'BACKSPACE',
    9:'TAB',
    13:'ENTER',
    16:'SHIFT',
    17:'CONTROL',
    18:'ALT',
    19:'PAUSE',
    20:'CAPSLOCK',
    27:'ESCAPE',
    32:'SPACE',
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
KeyMan.rightKeyMap = {
    CTRL:'CONTROL',
    ESC:'ESCAPE',
    DEL:'DELETE',
    ' ':'SPACE',
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
KeyMan.SPACE = 'SPACE';
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

KeyMan.PRIMARY_KEY_LIST = ['CONTROL', 'ALT', 'SHIFT'];

KeyMan.TYPE_SHORTCUT = 1;
KeyMan.TYPE_COMMAND = 2;

KeyMan.EVENT_AFTERDETECT = 'afterdetect';
KeyMan.EVENT_KEYDOWN = 'keydown';
KeyMan.EVENT_KEYUP = 'keyup';
KeyMan.EVENT_KEYDOWNFORCOMMAND = 'keydownforcommand';
KeyMan.EVENT_KEYUPFORCOMMAND = 'keyupforcommand';
KeyMan.EVENT_PUSHSHORTCUT = 'pushshortcut';
KeyMan.EVENT_FOCUS = 'focus';
KeyMan.EVENT_BLUR = 'blur';
KeyMan.EVENT_TYPEABLE = 'typeable';
KeyMan.EVENT_UNTYPEABLE = 'untypeable';
KeyMan.EVENT_CLICK = 'click';
KeyMan.EVENT_BEFOREKEYDOWN = 'beforekeydown';
KeyMan.EVENT_BEFOREKEYUP = 'beforekeyup';

KeyMan.EVENT_ADDEDKEY = 'addedkey';
KeyMan.EVENT_ADDEDMAP = 'addedmap';
KeyMan.EVENT_MODIFIEDKEY = 'modifiedkey';
KeyMan.EVENT_MODIFIEDMAP = 'modifiedmap';
KeyMan.EVENT_REMOVEDKEY = 'removedkey';
KeyMan.EVENT_REMOVEDMAP = 'removedmap';

/*************************
 *
 * Init
 *
 *************************/
KeyMan.prototype.init = function(){
    var that = this;
    //- Setup Default KeyMap
    var systemDefaultKeyMap = new KeyMan.KeyMap({modeRemovable: false}).setId('_system').setTitle('SYSTEM');
    var userDefaultKeyMap = new KeyMan.KeyMap({modeRemovable: false}).setId(this.targetKeyMapId).setTitle('DEFAULT');
    //- Setup KeyMapCluster
    this.storage = new KeyMan.Storage().setParent(this).add( systemDefaultKeyMap ).add( userDefaultKeyMap );
    this.system = new KeyMan.System().setParent(this).set( systemDefaultKeyMap );
    this.user = new KeyMan.User().setParent(this).set( userDefaultKeyMap );
    this.mainClusterList = [
        this.system,
        this.user
    ];

    //- Add Event
    var domElement = this.targetDomElement;
    domElement.addEventListener(KeyMan.EVENT_KEYDOWN, function(event){
        var key = that.getKeyFromEvent(event);
        var eventData = {event:event, key:key};
        that.turnOnAvailableLight(eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, eventData);
        if (key != null)
            that.downedKeyMap[key] = true;
        that.execEventListenerByEventName(KeyMan.EVENT_KEYDOWN, eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_KEYDOWNFORCOMMAND, eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_PUSHSHORTCUT, eventData);
        // that.execEventListenerByEventName('pushcommand', event);
        return true;
    });
    domElement.addEventListener(KeyMan.EVENT_KEYUP, function(event){
        var key = that.getKeyFromEvent(event);
        var eventData = {event:event, key:key};
        that.execEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, eventData);
        if (key != null)
            delete that.downedKeyMap[key];
        that.execEventListenerByEventName(KeyMan.EVENT_KEYUP, eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_KEYUPFORCOMMAND, eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_PUSHSHORTCUT, eventData);
        // that.execEventListenerByEventName('pushcommand', event);
        return true;
    });
    window.addEventListener(KeyMan.EVENT_FOCUS, function(event){
        var eventData = {event:event};
        that.turnOnAvailableLight(eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_FOCUS, eventData);
    });
    window.addEventListener(KeyMan.EVENT_BLUR, function(event){
        var eventData = {event:event};
        that.turnOffAvailableLight(eventData);
        that.clearKeyDownedMap(eventData);
        that.execEventListenerByEventName(KeyMan.EVENT_BLUR, eventData);
    });
    window.addEventListener(KeyMan.EVENT_CLICK, function(event){
        var eventData = {event:event};
        that.turnOnAvailableLight(eventData);
    });
    ready(function(event){
        var eventData = {event:event};
        if (!that.statusTypeable){
            // that.turnOnAvailableLight(eventData);
        }
    })
    return this;
};



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
        if (that.hasEventListenerByEventName(KeyMan.EVENT_AFTERDETECT))
            that.execEventListenerByEventName(KeyMan.EVENT_AFTERDETECT);
    });
    return this;
};
KeyMan.prototype.afterDetect = function(func){
    this.addEventListenerByEventName(KeyMan.EVENT_AFTERDETECT, func);
    return this;
};



/*************************
 *
 * Data - Save & Load
 *
 *************************/
KeyMan.prototype.saveData = function(url){ //TODO: Implements
    this.storage.saveData(url);
    this.system.saveData(url);
    this.user.saveData(url);
    return this;
};
KeyMan.prototype.loadData = function(url){ //TODO: Implements
    this.storage.loadData(url);
    this.system.loadData(url);
    this.user.loadData(url);
    return this;
};
KeyMan.prototype.loadDataFromObject = function(object){ //TODO: Implements
    if (typeof object == 'string'){
        object = JSON.stringify(object);
    }
    this.storage.loadDataFromObject(object.storage);
    this.system.loadDataFromObject(object.system);
    this.user.loadDataFromObject(object.user);
    return this;
};
KeyMan.prototype.extractData = function(){
    return {
        storage: this.storage.extractData(),
        system: this.system.extractMetaData(),
        user: this.user.extractMetaData()
    };
};



/*************************
 *
 * Others
 *
 *************************/
KeyMan.prototype.lock = function(){
    this.modeLock = true;
    return this;
};

KeyMan.prototype.unlock = function(){
    this.modeLock = false;
    return this;
};

KeyMan.prototype.turnOnAvailableLight = function(eventData){
    // if (this.statusTypeable)
    //     return;
    this.statusTypeable = true;
    this.execEventListenerByEventName(KeyMan.EVENT_TYPEABLE, eventData);
};
KeyMan.prototype.turnOffAvailableLight = function(eventData){
    this.statusTypeable = false;
    this.execEventListenerByEventName(KeyMan.EVENT_UNTYPEABLE, eventData);
};

KeyMan.prototype.add = function(functionKey){
    if (functionKey instanceof KeyMan.KeyMap){
        var keyMap = functionKey;
        this.storage.add(keyMap);
    }else{
        this.getTargetKeyMap().add(functionKey);
    }
    return this;
};
KeyMan.prototype.get = function(functionKey){
    return this.getTargetKeyMap().get(functionKey);
};
KeyMan.prototype.has = function(functionKey){
    return this.getTargetKeyMap().has(functionKey);
};
KeyMan.prototype.remove = function(functionKey){
    this.getTargetKeyMap().remove(functionKey);
    return this;
};
KeyMan.prototype.modify = function(functionKey, object){
    this.getTargetKeyMap().modify(functionKey, object);
    return this;
};
KeyMan.prototype.getTargetKeyMap = function(){
    return this.storage.get(this.targetKeyMapId);
};
KeyMan.prototype.setTargetKeyMap = function(targetKeyMap){
    if (!targetKeyMap)
        return;
    if (targetKeyMap instanceof KeyMap.KeyMap)
        targetKeyMap = targetKeyMap.id;
    if (typeof targetKeyMap == 'string')
        this.targetKeyMapId = targetKeyMap;
    return this;
};

KeyMan.prototype.setupKeyHandler = function(functionKey){
    switch (functionKey.type){
        case KeyMan.TYPE_COMMAND:
            var indexedCommandKeyCount = this.getIndexedCommandKeyCount();
            if (!this.commandKeyHandler && indexedCommandKeyCount > 0){
                this.makeCommandKeyHandlerForce();
            }else if (this.commandKeyHandler && indexedCommandKeyCount == 0){
                this.destroyCommandKeyHandlerForce();
            }
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            var indexedShortcutKeyCount = this.getIndexedShortcutKeyCount();
            if (!this.shortcutKeyHandler && indexedShortcutKeyCount > 0){
                this.makeShortcutKeyHandlerForce();
            }else if (this.shortcutKeyHandler && indexedShortcutKeyCount == 0){
                this.destroyShortcutKeyHandlerForce();
            }
            break;
    }
};
KeyMan.prototype.makeShortcutKeyHandlerForce = function(){
    if (this.shortcutKeyHandler)
        return;
    this.shortcutKeyHandler = new KeyMan.ShortcutKeyHandler(this);
    this.addKeyHandler(this.shortcutKeyHandler);
};
KeyMan.prototype.destroyShortcutKeyHandlerForce = function(){
    if (!this.shortcutKeyHandler)
        return;
    this.removeKeyHandler(this.shortcutKeyHandler);
    this.shortcutKeyHandler = null;
};
KeyMan.prototype.checkAndDestroyShortcutKeyHandler = function(){
    var indexedShortcutKeyCount = this.getIndexedShortcutKeyCount();
    if (indexedShortcutKeyCount == 0)
        this.destroyShortcutKeyHandlerForce();
};

KeyMan.prototype.makeCommandKeyHandlerForce = function(){
    if (this.commandKeyHandler)
        return;
    this.commandKeyHandler = new KeyMan.CommandKeyHandler(this);
    this.addKeyHandler(this.commandKeyHandler);
};
KeyMan.prototype.destroyCommandKeyHandlerForce = function(){
    if (!this.commandKeyHandler)
        return;
    this.removeKeyHandler(this.commandKeyHandler);
    this.commandKeyHandler = null;
};
KeyMan.prototype.checkAndDestroyCommandKeyHandler = function(){
    var indexedCommandKeyCount = this.getIndexedCommandKeyCount();
    if (indexedCommandKeyCount == 0)
        this.destroyCommandKeyHandlerForce();
};

KeyMan.prototype.addKeyHandler = function(keyHandler){
    if (keyHandler.getKeydownEventHandler() && keyHandler.getKeyupEventHandler())
        return;
    keyHandler.setup();
    this.addEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, keyHandler.getBeforeKeydownEventHandler());
    this.addEventListenerByEventName(KeyMan.EVENT_KEYDOWN, keyHandler.getKeydownEventHandler());
    this.addEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, keyHandler.getBeforeKeyupEventHandler());
    this.addEventListenerByEventName(KeyMan.EVENT_KEYUP, keyHandler.getKeyupEventHandler());
    console.debug('[KeyHandler] ADDED !', keyHandler);
};
KeyMan.prototype.removeKeyHandler = function(keyHandler){
    this.removeEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, keyHandler.getBeforeKeydownEventHandler());
    this.removeEventListenerByEventName(KeyMan.EVENT_KEYDOWN, keyHandler.getKeydownEventHandler());
    this.removeEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, keyHandler.getBeforeKeyupEventHandler());
    this.removeEventListenerByEventName(KeyMan.EVENT_KEYUP, keyHandler.getKeyupEventHandler());
    console.debug('[KeyHandler] REMOVED !', keyHandler);
};

KeyMan.prototype.getSystem = function(){
    return this.system;
};
KeyMan.prototype.getUser = function(){
    return this.user;
};
KeyMan.prototype.getStorage = function(){
    return this.storage;
};
KeyMan.prototype.getRunnerPool = function(){
    if (!this.runnerPool){
        this.runnerPool = new KeyMan.RunnerPool().setParent(this)
    }
    return this.runnerPool;
};



/*************************
 *
 *
 *
 *************************/
KeyMan.prototype.getKeyFromEvent = function(event){
    var key;
    var keyCode = (event.keyCode) ? event.keyCode : event.which;
    var keyName = (event.key) ? event.key : null;
    if (keyCode == 32) //SPACE
        return KeyMan.SPACE;
    if (keyCode == 229) //Something bad..
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
    if (KeyMan.keyCodeMap[keyCode]){
        key += KeyMan.keyCodeMap[keyCode];
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

KeyMan.prototype.eachFunctionKey = function(closure){
    this.eachFunctionKeyMap(function(fkMap){
        for (var fk in fkMap){
            closure(fk);
        }
    })
    return this;
};

KeyMan.prototype.eachFunctionKeyMap = function(closure){
    for (var functionKeyMap in this.functionKeyMaps){
        closure(functionKeyMap);
    }
    return this;
};



/*************************
 *
 * Ckeck Key
 *
 *************************/
KeyMan.prototype.isOnKey = function(key){
    return this.downedKeyMap[key.toUpperCase()];
};
KeyMan.prototype.isOnKeys = function(keys){
    if (keys instanceof KeyMan.FunctionKey)
        keys = keys.keys;
    for (var i=0; i<keys.length; i++){
        if (!this.isOnKey(keys[i]))
            return false;
    }
    return true;
};

/* isOn
 * isOn do that 'Return Shortcut is pressed'
 */
KeyMan.prototype.isOn = function(downedShortcutId){
    return this.system.isOn(downedShortcutId) || this.user.isOn(downedShortcutId);
};

KeyMan.prototype.getIndexedShortcutKeyCount = function(){
    return this.system.getIndexedShortcutKeyCount() + this.user.getIndexedShortcutKeyCount();;
};

KeyMan.prototype.getIndexedCommandKeyCount = function(){
    return this.system.getIndexedCommandKeyCount() + this.user.getIndexedCommandKeyCount();
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







/*************************
 * @Deprecated
 * @param functionKey
 * @returns {KeyMan}
 *************************/
KeyMan.prototype.addShortcut = function(infoObj){
    return this.add(infoObj);
};
KeyMan.prototype.getShortcut = function(shortcutName){
    return this.get(shortcutName);
};
KeyMan.prototype.hasShortcut = function(shortcutName){
    return this.has(shortcutName);
};
KeyMan.prototype.delShortcut = function(shortcutName){
    return this.remove(shortcutName);
};
KeyMan.prototype.addCommand = function(infoObj){
    this.addEventListenerByEventName('saveCommand', plusFuncKeyDown);
};
KeyMan.prototype.delCommand = function(keyPatternName){
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
        this.addEventListenerByEventName(KeyMan.EVENT_KEYDOWNFORCOMMAND, commander.keydownFunc );
        this.addEventListenerByEventName(KeyMan.EVENT_KEYUPFORCOMMAND, commander.keyupFunc );
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
    this.removeEventListenerByEventName(KeyMan.EVENT_KEYDOWNFORCOMMAND, commander.definedKeydownFunc );
    this.removeEventListenerByEventName(KeyMan.EVENT_KEYUPFORCOMMAND, commander.definedKeyupFunc );
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
 * FunctionKey
 *
 *
 ****************************************************************************************************/
KeyMan.FunctionKey = function(object){
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.title = 'No Title';
    this.type = KeyMan.TYPE_SHORTCUT;
    this.modeLock = false;
    this.modeEditable = true;
    this.modeRemovable = true;
    this.runner = null; //Event Code or Function or Runner
    this.data = ''; //User set parameter for runner
    this.keys = null; //KeyMan Expression
    this.keydown = null; //Event Function
    this.keypress = null; //Event Function
    this.keyup = null; //Event Function

    //_
    this.parent; //KeyMap
    this.keyman; //KeyMan
    this.originKeys = null;
    this.keyStepList = null;
    this.rightKeys = null;
    this.statusPressed = false;

    //_
    this.tempCopy;
    this.statusDuplicated;
    this.statusNew;
    this.statusSameRunner;
    this.statusSameData;
    this.statusSameKeyStepList;

    if (object)
        this.init(object);
};
KeyMan.FunctionKey.prototype.init = function(object){
    for (var key in object)
        this[key] = object[key];
    if (!this.id)
        this.id = this._id;
    return this;
};
KeyMan.FunctionKey.prototype.setup = function(){
    /** Keys **/
    this.originKeys = this.keys;
    var keys = this.keys = KeyMan.convertToRightKeyFromKeys(this.originKeys);
    // var keyCodes = this.convertToKeyCodesFrom(keys);
    this.keyStepList = (keys) ? KeyMan.parseToKeyStepList(keys) : [];
    console.error('CCC', this.keys, this.keyStepList);
    /** EventHandler **/
    this.type = KeyMan.getHandlerType(this.keyStepList);
    if (this.type == KeyMan.TYPE_SHORTCUT){
        if (this.keys && this.keys.length == 1 && this.keys[0] instanceof Array){
            this.keys = this.keys[0];
        }
    }
    return this;
};

KeyMan.FunctionKey.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};
KeyMan.FunctionKey.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.FunctionKey.prototype.saveData = function(){

};
KeyMan.FunctionKey.prototype.loadDataFromObject = function(){

};
KeyMan.FunctionKey.prototype.loadData = function(){

};
KeyMan.FunctionKey.prototype.extractData = function(){
    return {
        id: this.id,
        title: this.title,
        name: this.name,
        runner: this.runner,
        data: this.data,
        keys: getData(this.keyStepList).collect(function(it){ return it.keys }),
        modeLock: this.modeLock,
        modeEditable: this.modeEditable,
        modeRemovable: this.modeRemovable
    };
};

KeyMan.FunctionKey.prototype.modify = function(object){
    console.error('[FunctionKey] modify...', this)
    var differentKeyStepList = object.keys && !KeyMan.FunctionKey.equalsKeyStepList(
        KeyMan.parseToKeyStepList(this.keys),
        KeyMan.parseToKeyStepList(object.keys)
    );
    console.error('...modifye...', differentKeyStepList);
    /** Check before indexing **/
    if (differentKeyStepList){
        //- Reindexing
        if (this.parent && this.parent.parent)
            this.parent.parent.removeIndex(this);
        if (this.keyman)
            this.keyman.setupKeyHandler(this);
    }
    /** Modify **/
    this.init(object).setup();
    /** Check after indexing **/
    if (differentKeyStepList){
        if (this.parent && this.parent.parent)
            this.parent.parent.addIndex(this);
        if (this.keyman)
            this.keyman.setupKeyHandler(this);
    }
    if (this.keyman){
        /** Event **/
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDKEY, this);
    }
    return this;
};
KeyMan.FunctionKey.prototype.press = function(){
    this.statusPressed = true;
    return this;
};
KeyMan.FunctionKey.prototype.unpress = function(){
    this.statusPressed = false;
    return this;
};
KeyMan.FunctionKey.prototype.isPressed = function(){
    return this.statusPressed;
};

KeyMan.FunctionKey.prototype.execute = function(){
    this.triggerKeydown();
    var runner = this.runner;
    var data = this.data;
    if (runner !== null){
        if (typeof runner == 'string'){
            this.keyman.getRunnerPool().run(runner, data);
        }else if (runner instanceof Function){
            runner(data);
        }else if (runner instanceof KeyMan.Runner){
            this.keyman.getRunnerPool().run(runner, data);
        }
    }
    return this;
};
KeyMan.FunctionKey.prototype.triggerKeydown = function(){
    (this.keydown && this.keydown(this.data));
    return this;
};
KeyMan.FunctionKey.prototype.triggerKeypress = function(){
    (this.keypress && this.keypress(this.data));
    return this;
};
KeyMan.FunctionKey.prototype.triggerKeyup = function(){
    (this.keyup && this.keyup(this.data));
    return this;
};
KeyMan.FunctionKey.prototype.removeFromKeyMap = function(){
    this.parent.remove(this);
    return this;
};

KeyMan.FunctionKey.equalsKeyStepList = function(a, b){
    console.error('Equals !!? ', a, b);
    if (a == null || b == null)
        return false;
    if (a.length != b.length)
        return false;
    for (var i=0; i<a.length; i++){
        if (!a[i].equals(b[i]))
            return false;
    }
    return true;
};
KeyMan.FunctionKey.copy = function(object, parentRepoMap, checkNumber){
    //- Make new title
    var oldTitle = object.title;
    var checkNumber = (checkNumber) ? checkNumber : 0;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.FunctionKey.copy(object, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('titl', newTitle, parentRepoMap);
    return new KeyMan.FunctionKey( getData(object).clone().merge({id:null, title:newTitle}).returnData() );
};





/****************************************************************************************************
 *
 *
 * KeyMap
 *
 *
 ****************************************************************************************************/
KeyMan.KeyMap = function(object){
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.title = 'No Title';
    this.modeLock = false;
    this.modeEditable = true;
    this.modeRemovable = true;

    //_
    this.functionKeyMap = {};
    this.parent; //KeyMapCluster
    this.keyman; //KeyMan

    //_
    this.tempCopy;
    this.statusDuplicated;
    this.statusNew;
    if (object)
        this.init(object);
};
KeyMan.KeyMap.prototype.init = function(object){
    for (var key in object)
        this[key] = object[key];
    if (!this.id)
        this.id = this._id;
    return this;
};
KeyMan.KeyMap.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};
KeyMan.KeyMap.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyMap.prototype.setId = function(id){
    this.id = id;
    return this;
};
KeyMan.KeyMap.prototype.setName = function(name){
    this.name = name;
    return this;
};
KeyMan.KeyMap.prototype.setTitle = function(title){
    this.title = title;
    return this;
};

KeyMan.KeyMap.prototype.saveData = function(){

};
KeyMan.KeyMap.prototype.loadDataFromObject = function(){

};
KeyMan.KeyMap.prototype.loadData = function(){

};
KeyMan.KeyMap.prototype.extractData = function(){
    return {
        id: this.id,
        name: this.name,
        title: this.title,
        functionKeyMap: getData(this.functionKeyMap).collectMap(function(k, v){
            return {
                key: k,
                value: v.extractData()
            };
        }),
        modeLock: this.modeLock,
        modeEditable: this.modeEditable,
        modeRemovable: this.modeRemovable
    };
};

KeyMan.KeyMap.prototype.lock = function(){
    this.modeLock = true;
};
KeyMan.KeyMap.prototype.unlock = function(){
    this.modeLock = false;
};
KeyMan.KeyMap.prototype.add = function(functionKey){
    if (functionKey == null)
        throw 'Null Pointer Exception';
    if (! (functionKey instanceof KeyMan.FunctionKey))
        functionKey = new KeyMan.FunctionKey(functionKey);
    if (this.has(functionKey))
        throw 'Already exists function-key.';
    functionKey.setParent(this).setup();
    if (this.keyman)
        functionKey.setKeyMan(this.keyman);
    this.functionKeyMap[functionKey.id] = functionKey;
    /** Check Indexing **/
    if (this.parent)
        this.parent.addIndex(functionKey);
    if (this.keyman){
        /** Check Handler **/
        this.keyman.setupKeyHandler(functionKey);
        /** Event **/
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_ADDEDKEY, functionKey);
    }
    console.debug('[FunctionKey] '+ functionKey.id +' was added to (Map) '+ this.id);
    return this;
};
KeyMan.KeyMap.prototype.get = function(functionKey){
    if (!functionKey)
        return;
    var functionKeyId = '';
    if (typeof functionKey == 'string')
        functionKeyId = functionKey;
    else if (functionKey instanceof KeyMan.FunctionKey)
        functionKeyId = functionKey.id;
    else
        functionKeyId = functionKey.id;
    return this.functionKeyMap[functionKeyId];
};
KeyMan.KeyMap.prototype.getByTitle = function(functionKey){
    if (!functionKey)
        return;
    var functionKeyTitle = '';
    if (typeof functionKey == 'string')
        functionKeyTitle = functionKey;
    else if (functionKey instanceof KeyMan.FunctionKey)
        functionKeyTitle = functionKey.title;
    else
        functionKeyTitle = functionKey.title;
    var result = null;
    var fk;
    for (var fKeyId in this.functionKeyMap){
        fk = this.functionKeyMap[fKeyId];
        if (functionKeyTitle == fk.title){
            result = fk;
            break;
        }
    }
    return result;
};
KeyMan.KeyMap.prototype.has = function(functionKey){
    return !!this.get(functionKey);
};
KeyMan.KeyMap.prototype.remove = function(functionKey){
    functionKey = this.get(functionKey);
    if (!functionKey)
        return this;
    //- Remove Data
    functionKey.setParent(null);
    delete this.functionKeyMap[functionKey.id];
    /** Check Indexing **/
    if (this.parent)
        this.parent.removeIndex(functionKey);
    if (this.keyman){
        /** Check Handler **/
        this.keyman.setupKeyHandler(functionKey);
        /** Check Event **/
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_REMOVEDKEY, functionKey);
    }
    console.debug('[FunctionKey] '+ functionKey.id +' was removed from (Map) '+ this.id);
    return this;
};
KeyMan.KeyMap.prototype.removeFromKeyCluster = function(){
    var functionKey, functionKeyId;
    for (functionKeyId in this.functionKeyMap){
        functionKey = this.functionKeyMap[functionKeyId];
        console.error(functionKey, functionKey.keyStepList);
        /** Check Indexing **/
        if (this.parent)
            this.parent.removeIndex(functionKey);
        /** Check Handler **/
        if (this.keyman)
            this.keyman.setupKeyHandler(functionKey);
    }
    delete this.parent.functionKeyMaps[this.id];
    if (this.keyman){
        /** Check Event **/
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_REMOVEDMAP, this);
    }

    this.parent = null;
    return this;
};
KeyMan.KeyMap.prototype.removeFromKeyMan = function(){
    this.removeFromKeyCluster();
    this.keyman = null;
    return this;
};
KeyMan.KeyMap.prototype.modify = function(object){
    console.error('[KeyMap] modify...', this)
    /** Check before indexing **/
    // None
    /** Modify **/
    this.init(object);
    /** Check after indexing **/
    // None
    if (this.keyman){
        /** Event **/
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDMAP, this);
    }
    return this;
};
KeyMan.KeyMap.copy = function(object, parentRepoMap, checkNumber){
    //- Make new title
    var oldTitle = object.title;
    var checkNumber = (checkNumber) ? checkNumber : 0;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.KeyMap.copy(object, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('titl', newTitle, parentRepoMap);
    return new KeyMan.KeyMap( getData(object).clone().merge({id:null, title:newTitle}).returnData() );
};





/****************************************************************************************************
 *
 *
 * KeyMapCluster
 *
 *
 ****************************************************************************************************/
KeyMan.KeyMapCluster = function(object){
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.modeLock = false;
    this.modeAutoSave = false;
    this.modeMultiMap = false;
    this.keyMapSelectedWhenMultiMapMode = '_default';
    this.savePath = 'keyman';
    this.functionKeyMaps = {};
    //_
    this.parent = null; //KeyMan
    this.inversionIndexedShortcutFunctionKeyIdMapMap = {};
    this.inversionIndexedCommandFunctionKeyIdMapMap = {};
    if (object)
        this.init(object);
};
KeyMan.KeyMapCluster.ERROR_001 = 'You can add only KeyMan.KeyMap';

KeyMan.KeyMapCluster.prototype.init = function(object){
    for (var key in object)
        this[key] = object[key];
    if (!this.id)
        this.id = this._id;
    return this;
};
KeyMan.KeyMapCluster.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};


KeyMan.KeyMapCluster.prototype.saveData = function(){

};
KeyMan.KeyMapCluster.prototype.loadDataFromObject = function(){

};
KeyMan.KeyMapCluster.prototype.loadData = function(){

};
KeyMan.KeyMapCluster.prototype.extractData = function(){
    var result = getData(this.functionKeyMaps).collectMap(function(k, v){
        return {
            key: k,
            value: v.extractData()
        };
    });
    return result;
};
KeyMan.KeyMapCluster.prototype.extractMetaData = function(){
    var keyMapNameList = getData(this.functionKeyMaps).collect(function(k, v){
        return k;
    });
    return {
        keyMapNameList: keyMapNameList,
        modeLock: this.modeLock
    };
};

KeyMan.KeyMapCluster.prototype.set = function(keyMap){
    this.clear();
    this.add(keyMap);
    return this;
};
KeyMan.KeyMapCluster.prototype.add = function(keyMap){
    if (keyMap instanceof KeyMan.KeyMap){
        if (this.has(keyMap))
            return this;
        this.functionKeyMaps[keyMap.id] = keyMap;
        keyMap.setParent(this);
        if (this.parent){
            keyMap.setKeyMan(this.parent);
            /** Event **/
            //- Does not works when init.
            this.parent.execEventListenerByEventName(KeyMan.EVENT_ADDEDMAP, keyMap);
        }
    }else{
        throw KeyMan.KeyMapCluster.ERROR_001;
    }
    /** Check Indexing **/
    this.addIndex(keyMap);
    return this;
};
KeyMan.KeyMapCluster.prototype.get = function(keyMap){
    if (!keyMap)
        return;
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else
        id = keyMap
    return this.functionKeyMaps[id];
};
KeyMan.KeyMapCluster.prototype.getByTitle = function(keyMap){
    if (!keyMap)
        return;
    var keyMapTitle = '';
    if (typeof keyMap == 'string')
        keyMapTitle = keyMap;
    else if (keyMap instanceof KeyMan.KeyMap)
        keyMapTitle = keyMap.title;
    else
        keyMapTitle = keyMap.title;
    var result = null;
    var km;
    for (var kmId in this.functionKeyMaps){
        km = this.functionKeyMaps[kmId];
        if (keyMapTitle == km.title){
            result = km;
            break;
        }
    }
    return result;
};
KeyMan.KeyMapCluster.prototype.has = function(keyMap){
    return !!this.get(keyMap);
};
KeyMan.KeyMapCluster.prototype.remove = function(keyMap){
    if (!keyMap)
        return;
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else
        id = keyMap
    delete this.functionKeyMaps[id];
    /** Check Indexing **/
    this.removeIndex(id);
    return this;
};
KeyMan.KeyMapCluster.prototype.clear = function(){
    for (var keyMapId in this.functionKeyMaps){
        this.remove(keyMapId);
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.getFirst = function(){
    var keyMapIdList = Object.keys(this.functionKeyMaps);
    return this.get(keyMapIdList[0]);
};
KeyMan.KeyMapCluster.prototype.getFunctionKeyMaps = function(){
    return this.functionKeyMaps;
};

KeyMan.KeyMapCluster.prototype.getIndexdShortcutKeyMap = function(){
    return this.inversionIndexedShortcutFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedCommandKeyMap = function(){
    return this.inversionIndexedCommandFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedShortcutKeyCount = function(){
    return Object.keys(this.inversionIndexedShortcutFunctionKeyIdMapMap).length;
};
KeyMan.KeyMapCluster.prototype.getIndexedCommandKeyCount = function(){
    return Object.keys(this.inversionIndexedCommandFunctionKeyIdMapMap).length;
};

KeyMan.KeyMapCluster.prototype.addIndex = function(functionKey){
    if (functionKey instanceof KeyMan.KeyMap){
        var keyMap = functionKey;
        for (var functionKeyId in keyMap.functionKeyMap){
            this.addIndex(keyMap.functionKeyMap[functionKeyId]);
        }
        return this;
    }
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    if (!keyStepFirst) //Empty FunctionKey => No Indexing
        return this;
    var keys = keyStepFirst.keys;
    switch (functionKey.type){
        case KeyMan.TYPE_COMMAND:
            var inversionIndexedCommandFunctionKeyIdMapMap = this.getIndexedCommandKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (!inversionIndexedCommandFunctionKeyIdMapMap[key])
                    inversionIndexedCommandFunctionKeyIdMapMap[key] = {};
                inversionIndexedCommandFunctionKeyIdMapMap[key][functionKey.id] = functionKey;
            }
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            var inversionIndexedShortcutFunctionKeyIdMapMap = this.getIndexdShortcutKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (!inversionIndexedShortcutFunctionKeyIdMapMap[key])
                    inversionIndexedShortcutFunctionKeyIdMapMap[key] = {};
                inversionIndexedShortcutFunctionKeyIdMapMap[key][functionKey.id] = functionKey;
            }
            break;
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.getIndex = function(functionKey){
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    var keys = keyStepFirst.keys;
    switch (functionKey.type){
        case KeyMan.TYPE_COMMAND:
            var inversionIndexedCommandFunctionKeyIdMapMap = this.getIndexedCommandKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedCommandFunctionKeyIdMapMap[key])
                    return inversionIndexedCommandFunctionKeyIdMapMap[key][functionKey.id];
            }
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            var inversionIndexedShortcutFunctionKeyIdMapMap = this.getIndexdShortcutKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedShortcutFunctionKeyIdMapMap[key])
                    return inversionIndexedShortcutFunctionKeyIdMapMap[key][functionKey.id];
            }
            break;
    }
    return [];
};
KeyMan.KeyMapCluster.prototype.hasIndex = function(functionKey){
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    var keys = keyStepFirst.keys;
    switch (functionKey.type){
        case KeyMan.TYPE_COMMAND:
            var inversionIndexedCommandFunctionKeyIdMapMap = this.getIndexedCommandKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedCommandFunctionKeyIdMapMap[key] && inversionIndexedCommandFunctionKeyIdMapMap[key][functionKey.id])
                    return true;
            }
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            var inversionIndexedShortcutFunctionKeyIdMapMap = this.getIndexdShortcutKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedShortcutFunctionKeyIdMapMap[key] && inversionIndexedShortcutFunctionKeyIdMapMap[key][functionKey.id])
                    return true;
            }
            break;
    }
    return false;
};
KeyMan.KeyMapCluster.prototype.removeIndex = function(functionKey){
    if (functionKey instanceof KeyMan.KeyMap){
        var keyMap = functionKey;
        for (var functionKeyId in keyMap.functionKeyMap){
            this.removeIndex(keyMap.functionKeyMap[functionKeyId]);
        }
        return this;
    }
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    if (!keyStepFirst) //Empty FunctionKey => No Indexing
        return this;
    var keys = keyStepFirst.keys;
    switch (functionKey.type){
        case KeyMan.TYPE_COMMAND:
            var inversionIndexedCommandFunctionKeyIdMapMap = this.getIndexedCommandKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedCommandFunctionKeyIdMapMap[key]){
                    var functionKeyMap = inversionIndexedCommandFunctionKeyIdMapMap[key];
                    delete functionKeyMap[functionKey.id];
                    if (Object.keys(functionKeyMap).length == 0)
                        delete inversionIndexedCommandFunctionKeyIdMapMap[key];
                }
            }
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            var inversionIndexedShortcutFunctionKeyIdMapMap = this.getIndexdShortcutKeyMap();
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                if (inversionIndexedShortcutFunctionKeyIdMapMap[key]){
                    var functionKeyMap = inversionIndexedShortcutFunctionKeyIdMapMap[key];
                    delete functionKeyMap[functionKey.id];
                    if (Object.keys(functionKeyMap).length == 0)
                        delete inversionIndexedShortcutFunctionKeyIdMapMap[key];
                }
            }
            break;
    }
    return this;
};

KeyMan.KeyMapCluster.prototype.isOn = function(downedShortcutKeyId){
    var shortcutFunctionKey;
    for (var functionKeyMap in this.functionKeyMaps){
        shortcutFunctionKey = functionKeyMap[downedShortcutKeyId];
        if (shortcutFunctionKey)
            return shortcutFunctionKey.isPressed();
    }
    return false;
};
KeyMan.KeyMapCluster.prototype.lock = function(){
    this.modeLock = true;
    return this;
};
KeyMan.KeyMapCluster.prototype.unlock = function(){
    this.modeLock = false;
    return this;
};




/*************************
 *
 * Storage
 *
 *************************/
KeyMan.Storage = getClass(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();

/*************************
 *
 * System
 *
 *************************/
KeyMan.System = getClass(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();

/*************************
 *
 * User
 *
 *************************/
KeyMan.User = getClass(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();





/****************************************************************************************************
 *
 *
 * Handler
 *
 *
 ****************************************************************************************************/
KeyMan.KeyHandler = function(keyman){
    this.keyman = keyman;
    this.timeForContinuousInspection = 300;
    this.timeForJudgmentSimultaneousKeyPress = 20;
    this.indexedFunctionKeyBufferMap = [];
    //Event Handler
    this.beforeKeydownEventHandler = null;
    this.keydownEventHandler = null;
    this.beforeKeyupEventHandler = null;
    this.keyupEventHandler = null;
    this.init();
;};
KeyMan.KeyHandler.prototype.init = function(){
    //Implements..
};
KeyMan.KeyHandler.prototype.setup = function(){
    //Implements..
};
KeyMan.KeyHandler.prototype.getBeforeKeydownEventHandler = function(){
    return this.beforeKeydownEventHandler;
};
KeyMan.KeyHandler.prototype.setBeforeKeydownEventHandler = function(beforeKeydownEventHandler){
    this.beforeKeydownEventHandler = beforeKeydownEventHandler;
    return this;
};
KeyMan.KeyHandler.prototype.getKeydownEventHandler = function(){
    return this.keydownEventHandler;
};
KeyMan.KeyHandler.prototype.setKeydownEventHandler = function(keydownEventHandler){
    this.keydownEventHandler = keydownEventHandler;
    return this;
};
KeyMan.KeyHandler.prototype.getBeforeKeyupEventHandler = function(){
    return this.beforeKeyupEventHandler;
};
KeyMan.KeyHandler.prototype.setBeforeKeyupEventHandler = function(beforeKeyupEventHandler){
    this.beforeKeyupEventHandler = beforeKeyupEventHandler;
    return this;
};
KeyMan.KeyHandler.prototype.getKeyupEventHandler = function(){
    return this.keyupEventHandler;
};
KeyMan.KeyHandler.prototype.setKeyupEventHandler = function(keyupEventHandler){
    this.keyupEventHandler = keyupEventHandler;
    return this;
};


/*************************
 *
 * ShortcutKeyHandler
 *
 *************************/
KeyMan.ShortcutKeyHandler = getClass(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
})
.extend(KeyMan.KeyHandler)
.returnFunction();

KeyMan.ShortcutKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
    this.setBeforeKeydownEventHandler(function(eventData){
        //None
    });
    this.setKeydownEventHandler(function(eventData){
        var key = eventData.key;
        that.keydown(key);
    });
    this.setBeforeKeyupEventHandler(function(eventData){
        //None
    });
    this.setKeyupEventHandler(function(eventData){
        var key = eventData.key;
        that.keyup(key);
    });
};
KeyMan.ShortcutKeyHandler.prototype.keydown = function(key){
    var that = this;
    var keyman = this.keyman;
    //Check Time
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    //Check Key
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var keySize = downedKeyList.length;
    that.lastKey = key;
    that.lastKeySize = keySize;
    that.lastKeyDownTime = currentTime;
    /** Event **/
    keyman.execEventListenerByEventName('shortcutkeydown', {
        keyStepList: [new KeyMan.KeyStep(downedKeyList)]
    });
    that.execute(keyman.getSystem(), key);
    that.execute(keyman.getUser(), key);
};
KeyMan.ShortcutKeyHandler.prototype.keyup = function(key){
    var that = this;
    var keyman = this.keyman;
    //Check Keyup
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var nowKeySize = downedKeyList.length;
    /** Check - For Example, One button keyup from two button keydown status **/
    // if (1 < that.lastKeySize && nowKeySize < that.lastKeySize){
    //     setTimeout(function(){
    //         var downedKeyList = Object.keys(keyman.downedKeyMap);
    //         var checkKeySize = downedKeyList.length;
    //         if (checkKeySize == nowKeySize){
    //             //Keydown forcely
    //             for (var i=0; i<checkKeySize; i++){
    //                 that.keydown(downedKeyList[i]);
    //             }
    //         }
    //     }, this.timeForJudgmentSimultaneousKeyPress);
    // }
    /** Status **/
    that.lastKey = null;
    /** Event **/
    var fk;
    for (var i=that.indexedFunctionKeyBufferMap.length -1; i>-1; i--){
        fk = that.indexedFunctionKeyBufferMap[i];
        if (!keyman.isOnKeys(fk) && fk.isPressed()){
            fk.unpress().triggerKeyup();
            that.indexedFunctionKeyBufferMap.splice(i, 1);
        }
    }
    keyman.execEventListenerByEventName('shortcutkeyup', {
        keyStepList: that.keyStepProcessList
    });
};
KeyMan.ShortcutKeyHandler.prototype.execute = function(keyCluster, key){
    if (keyCluster.modeLock)
        return;
    var indexedFunctionKeyMap = keyCluster.getIndexdShortcutKeyMap()
    var functionKeyMap = indexedFunctionKeyMap[key];
    var fk;
    for (var keyId in functionKeyMap){
        fk = functionKeyMap[keyId];
        if (!this.keyman.isOnKeys(fk)){
            fk.unpress();
            continue;
        }
        //Run Shortcut
        if (!fk.isPressed()){
            fk.press();
            this.executeFunctionKey(fk);
            this.indexedFunctionKeyBufferMap.push(fk);
        }
    }
};
KeyMan.ShortcutKeyHandler.prototype.executeFunctionKey = function(functionKey){
    functionKey.execute();
    if (this.keyman){
        this.keyman.execEventListenerByEventName('execute', {
            keyStepList: null,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Shortcut)] ', functionKey);
};



/*************************
 *
 * CommandKeyHandler
 *
 *************************/
KeyMan.CommandKeyHandler = getClass(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
    this.parent = null;
    //Test - Process
    this.standardDefinedKeyOrderList = [];
    this.keyOrderList = [];
    this.keyStepProcessList = [];
    // this.keyStepIndex = -1;
    this.currentKeyStepProcess = null;

    /** Defined Control **/
    this.downedDefinedKeyMap = {};
    this.definedKeyMap = {};
    this.definedKeydownFuncMap = {};
    this.definedKeyupFuncMap = {};

    /** Status **/
    this.statusPressed = false;
    this.isReversed = false;
    this.lastDirection = null;
    this.lastBtn = null;
    this.lastKeyTime = 0;
    this.timer = null;
})
.extend(KeyMan.KeyHandler)
.returnFunction();

KeyMan.CommandKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
    this.setBeforeKeydownEventHandler(function(eventData){
        var key = eventData.key;
        //Check Pressed - Not allowed
        that.statusPressed = !!keyman.downedKeyMap[key];
    });
    this.setKeydownEventHandler(function (eventData){
        //Check Pressed - Not allowed
        if (that.statusPressed)
            return false;
        var key = eventData.key;
        that.keydown(key);
    });
    this.setBeforeKeyupEventHandler(function(eventData){
        //None
    });
    this.setKeyupEventHandler(function(eventData){
        var key = eventData.key;
        that.keyup(key);
    });
};
KeyMan.CommandKeyHandler.prototype.keydown = function(key){
    var that = this;
    var keyman = this.keyman;
    //Check Time - Decision 'Continue' and 'Reset'
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    if (that.timeForContinuousInspection < connectionTime)
        that.clearDefinedKey();
    //Check Key
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var keySize = downedKeyList.length;
    //Save Key
    that.addKeyToCommandChecker(key, connectionTime, downedKeyList);
    that.lastKey = key;
    that.lastKeySize = keySize;
    that.lastKeyDownTime = currentTime;
    /** Event **/
    keyman.execEventListenerByEventName('commandkeydown', {
        keyStepList: that.keyStepProcessList
    });
    //Run when KeyStep == KeyOrderList == KeyStepProcess
    that.execute(keyman.mainClusterList, that.keyStepProcessList, that.keyOrderList, that.functionKeyMap);
    // that.checkTimer();
};
KeyMan.CommandKeyHandler.prototype.keyup = function(key){
    var that = this;
    var keyman = this.keyman;
    //Check Keyup
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var nowKeySize = downedKeyList.length;
    /** Check - For Example, One button keyup from two button keydown status **/
    if (1 < that.lastKeySize && nowKeySize < that.lastKeySize){
        setTimeout(function(){
            var downedKeyList = Object.keys(keyman.downedKeyMap);
            var checkKeySize = downedKeyList.length;
            if (checkKeySize == nowKeySize){
                //Keydown forcely
                for (var i=0; i<checkKeySize; i++){
                    that.keydown(downedKeyList[i]);
                }
            }
        }, this.timeForJudgmentSimultaneousKeyPress);
    }
    /** Status **/
    that.lastKey = null;
    /** Event **/
    keyman.execEventListenerByEventName('commandkeyup', {
        keyStepList: that.keyStepProcessList
    });
};
KeyMan.CommandKeyHandler.prototype.addKeyToCommandChecker = function(key, connectionTime, downedKeyList){
    //- Make KeyStepList
    this.keyOrderList.push(key);
    //- Make KeyStepList
    if (connectionTime < this.timeForJudgmentSimultaneousKeyPress && this.lastKey != key){
        if (this.currentKeyStepProcess)
            this.currentKeyStepProcess.add(key);
    }else{
        console.error(connectionTime);
        this.currentKeyStepProcess = new KeyMan.KeyStep( downedKeyList );
        this.keyStepProcessList.push( this.currentKeyStepProcess );
    }
    this.testShow();
};
KeyMan.CommandKeyHandler.prototype.testShow = function(){
    var that = this;
    var log = '';
    var keyStepProcess;
    for (var i=0; i<that.keyStepProcessList.length; i++){
        keyStepProcess = that.keyStepProcessList[i];
        log += JSON.stringify(keyStepProcess.keys) + ' ';
    }
    console.debug('DownedKey', that.keyOrderList, log);
};
KeyMan.CommandKeyHandler.prototype.checkTimer = function(){
    var that = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function(){
        that.clearDefinedKey(that);
    }, this.timeForContinuousInspection);
};
KeyMan.CommandKeyHandler.prototype.clearDefinedKey = function(){
    this.keyStepProcessList = [];
    this.keyOrderList = [];
    this.lastKey = null;
    this.lastDirection = null;
    this.lastBtn = null;
    this.indexedFunctionKeyBufferMap = [];
    console.debug('DownedKey (Clean)', this.keyOrderList);
};
KeyMan.CommandKeyHandler.prototype.execute = function(keyClusterList, keyStepProcessList, keyOrderList, functionKeyMap){
    var newIndexedFunctionKeyBufferMap = [];
    var keyStepLength = keyStepProcessList.length;
    var keyStepIndex = keyStepLength -1;
    var keyStepProcess = keyStepProcessList[keyStepIndex];

    if (keyStepLength == 1){ //1
        for (var k=0; k<keyClusterList.length; k++){
            var inversionIndexedFunctionKeyMapMap = keyClusterList[k].getIndexedCommandKeyMap();
            var keys = keyStepProcess.keys;
            var functionKeyMap, functionKey;
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                functionKeyMap = inversionIndexedFunctionKeyMapMap[key];
                console.error('asdf',functionKeyMap);
                if (functionKeyMap){
                    //Run - System
                    for (var functionKeyId in functionKeyMap){
                        functionKey = functionKeyMap[functionKeyId];
                        if (functionKey.type != KeyMan.TYPE_COMMAND)
                            continue;
                        if (functionKey.keyStepList.length == 1){
                            this.executeFunctionKey(functionKey);
                        }else if (functionKey.keyStepList.length > 1){
                            //Collecting next matching KeyStepList
                            newIndexedFunctionKeyBufferMap.push(functionKey);
                        }
                    }
                }
            }
        }

    }else{ //2...
        var indexedFunctionKeyBufferMap = this.indexedFunctionKeyBufferMap;
        var keyStep;
        for (var i=0, functionKey; i<indexedFunctionKeyBufferMap.length; i++){
            functionKey = indexedFunctionKeyBufferMap[i];
            keyStep = functionKey.keyStepList[keyStepIndex];
            if (keyStepProcess.equals(keyStep)){
                if (functionKey.keyStepList.length -1 == keyStepIndex){
                    this.executeFunctionKey(functionKey);
                }else{
                    //Collecting next matching KeyStepList
                    newIndexedFunctionKeyBufferMap.push(functionKey);
                }
            }
        }
    }

    this.indexedFunctionKeyBufferMap = newIndexedFunctionKeyBufferMap;
    console.debug('[Command buffer]', this.indexedFunctionKeyBufferMap);
    return this;
};
KeyMan.CommandKeyHandler.prototype.executeFunctionKey = function(functionKey){
    functionKey.execute();
    if (this.keyman){
        this.keyman.execEventListenerByEventName('execute', {
            keyStepList: this.keyStepProcessList,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Command)] ', functionKey);
};



/****************************************************************************************************
 *
 *
 * KeyStep
 *
 *
 ****************************************************************************************************/
KeyMan.KeyStep = function(keys){
    this.keys = keys ? keys : [];
    this.length = keys ? keys.length : 0;
};
KeyMan.KeyStep.prototype.add = function(key){
    this.keys.push(key);
    this.length += 1;
    return this;
};
KeyMan.KeyStep.prototype.get = function(index){
    return this.keys[index];
};
KeyMan.KeyStep.prototype.equals = function(keyStep){
    if (!keyStep || keyStep.length != this.length)
        return;
    for (var i=0; i<keyStep.length; i++){
        if (keyStep.get(i) != this.get(i))
            return false;
    }
    return true;
};
KeyMan.KeyStep.prototype.clone = function(){
    var newInstance = new KeyMan.KeyStep();
    var stepList = this.keys;
    var length = stepList.length;
    for (var i=0; i<length; i++){
        newInstance.add(stepList[i]);
    }
    return newInstance;
};



/****************************************************************************************************
 *
 *
 * Runner
 *
 *
 ****************************************************************************************************/
KeyMan.Runner = getClass(function(object){
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.title = '';
    this.execute = null; //Function
    //_
    this.parent; //RunnerPool
    this.keyman; //KeyMan
    if (object)
        this.init(object);
})
.extend(SjEvent)
.returnFunction();
KeyMan.Runner.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};
KeyMan.Runner.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.Runner.prototype.init = function(object){
    for (var key in object)
        this[key] = object[key];
    if (!this.id)
        this.id = this._id;
    return this;
};

/****************************************************************************************************
 *
 *
 * RunnerPool
 *
 *
 ****************************************************************************************************/
KeyMan.RunnerPool = getClass(function(){
    this.parent = this;
    this.runnerMap = {};
})
.extend(SjEvent)
.returnFunction();
KeyMan.RunnerPool.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};
KeyMan.RunnerPool.prototype.add = function(runner){
    if (!runner)
        return this;
    if (runner instanceof KeyMan.Runner){
    }else if (typeof runner == 'object'){
        runner = new KeyMan.Runner(runner);
    }
    if (this.has(runner))
        throw 'Already exists. Check your ID ' + runner.id;
    runner.setParent(this)
    if (this.keyman){
        runner.setKeyMan(this.keyman);
    }
    this.runnerMap[runner.id] = runner;
    return this;
};
KeyMan.RunnerPool.prototype.get = function(runner){
    if (!runner)
        return null;
    var id;
    if (typeof runner == 'string')
        id = runner;
    else if (runner instanceof KeyMan.Runner)
        id = runner.id;
    return this.runnerMap[id];
};
KeyMan.RunnerPool.prototype.has = function(runner){
    return !!this.get(runner);
};
KeyMan.RunnerPool.prototype.remove = function(runner){
    runner = this.get(runner);
    if (!runner)
        return this;
    delete this.runnerMap[runner.id];
    return this;
};
KeyMan.RunnerPool.prototype.run = function(runner, data){
    runner = this.get(runner);
    if (!runner)
        return null;
    return (runner.execute && runner.execute(data));
};
KeyMan.RunnerPool.prototype.getRunnerMap = function(){
    return this.runnerMap;
}



/****************************************************************************************************
 *
 *
 * Merge Option
 *
 *
 ****************************************************************************************************/
KeyMan.MergeOption = function(opt){
    this.name = 'none';
    this.code = KeyMan.MergeOption.TYPE_NONE;
    if (opt)
        this.init(opt);
};
KeyMan.MergeOption.TYPE_NONE = 0;
KeyMan.MergeOption.TYPE_OVERWRITE = 1;
KeyMan.MergeOption.TYPE_NEW = 2;
KeyMan.MergeOption.TYPE_IGNORE = 3;
KeyMan.MergeOption.TYPE_SYNC = 4;

KeyMan.MergeOption.prototype.init = function(opt){
    var value;
    if (opt instanceof CrossMan){
        var foundEl = opt.findChildEl(function(it){ return it.attr('type') == 'radio' && it.prop('checked'); });
        value = (!opt.hasClass('none') && foundEl.exists()) ? foundEl.value() : null;
        // console.error(foundEl, foundEl.exists(), opt.hasClass('none'));
    }else{
        value = opt;
    }
    if (!value)
        value = 'none';
    switch (value.toLowerCase()){
        case 'ignore': this.code = KeyMan.MergeOption.TYPE_IGNORE; break;
        case 'new': this.code = KeyMan.MergeOption.TYPE_NEW; break;
        case 'sync': this.code = KeyMan.MergeOption.TYPE_SYNC; break;
        case 'overwrite': this.code = KeyMan.MergeOption.TYPE_OVERWRITE; break;
        default: this.code = KeyMan.MergeOption.TYPE_NONE; break;
    }
};

KeyMan.MergeOptionForImport = getClass(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'import';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForMap = getClass(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'map';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForKey = getClass(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'key';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForOption = getClass(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'option';
})
.extend(KeyMan.MergeOption)
.returnFunction();






/****************************************************************************************************
 *
 *
 * Util
 *
 *
 ****************************************************************************************************/
KeyMan.convertToRightKeyFromKeys = function(keys){
    if (typeof keys == 'string'){
        keys = KeyMan.parse(keys);
        keys = (keys.length == 1) ? keys[0] : keys;
    }else if (keys instanceof Array){
        for (var i=0; i<keys.length; i++){
            keys[i] = KeyMan.convertToRightKeyFromKeys(keys[i]);
        }
    }
    return keys;
};
KeyMan.parse = function(keyExpression){
    var keyList = [];
    if (typeof keyExpression == 'string'){
        var keyStringArray = keyExpression.split(/\s[+]\s/);
        for (var i=0, keyString, correctKeyString; i<keyStringArray.length; i++){
            keyList.push( KeyMan.correctKey(keyStringArray[i]) );
        }
    }
    return keyList;
};
KeyMan.correctKey = function(keyString){
    keyString = keyString.toUpperCase();
    var correctKeyString = KeyMan.rightKeyMap[keyString];
    return (correctKeyString) ? correctKeyString : keyString;
}

KeyMan.parseToKeyStepList = function(keys){
    var resultKeyStepList = [];
    if (!keys)
        return resultKeyStepList;
    keys = KeyMan.convertToRightKeyFromKeys(keys);
    KeyMan.makeKeyStepList(keys, 0, new KeyMan.KeyStep(), resultKeyStepList);
    console.debug('=========================');
    console.debug('INPUT: ', keys);
    console.debug('OUTPUT: ', resultKeyStepList);
    console.debug('=========================');
    return resultKeyStepList;
};
KeyMan.makeKeyStepList = function(keys, keyIndex, procKeyStep, resultKeyStepList){
    if (keyIndex >= keys.length){
        if (keys[keys.length -1] instanceof Array)
            return;
        resultKeyStepList.push(procKeyStep);
        return;
    }
    var key = keys[keyIndex];
    if (key instanceof Array){
        KeyMan.makeKeyStepList(key, 0, procKeyStep.clone(), resultKeyStepList);
    }else{
        procKeyStep.add(key);
    }
    KeyMan.makeKeyStepList(keys, keyIndex +1, procKeyStep, resultKeyStepList);
};

KeyMan.convertToKeyExpression = function(keys){
    var keyExpression = '';
    if (keys instanceof Array){
        keyExpression = keys.join(' + ');
    }
    return keyExpression;
};

KeyMan.getHandlerType = function(keyStepList){
    return (keyStepList.length > 1) ? KeyMan.TYPE_COMMAND : KeyMan.TYPE_SHORTCUT;
};

KeyMan.getHandler = function(type, keyman, functionKey){
    switch (type){
        case KeyMan.TYPE_COMMAND:
            return new KeyMan.CommandKeyHandler(keyman, functionKey);
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            return new KeyMan.ShortcutKeyHandler(keyman, functionKey);
            break;
    }
};

KeyMan.getNameByHandlerType = function(type){
    console.error('asdfasdf', type);
    switch (type){
        case KeyMan.TYPE_COMMAND:
            return 'COMMAND';
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            return 'SHORTCUT';
            break;
    }
};

KeyMan.encodeData = function(somePlanData){
    if (typeof somePlanData == 'string'){
        somePlanData = somePlanData
    }else{
        somePlanData = JSON.stringify(somePlanData);
    }
    var btoaStringDataOrigin = btoa(unescape(encodeURIComponent(somePlanData)));
    //Test Log
    console.debug(' [ENCODED] ');
    console.debug(somePlanData, somePlanData.length);
    console.debug(btoaStringDataOrigin, btoaStringDataOrigin.length);
    return btoaStringDataOrigin;
};

KeyMan.decodeData = function(someEncodedStringData){
    var atobStringData = decodeURIComponent(escape(atob(someEncodedStringData)));
    var objectData = JSON.parse(atobStringData);
    //Test Log
    console.debug(' [DECODED] ');
    console.debug(someEncodedStringData, someEncodedStringData.length);
    console.debug(atobStringData, atobStringData.length);
    console.debug(objectData, objectData.length);
    return objectData;
};



