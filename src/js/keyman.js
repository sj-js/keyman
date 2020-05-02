/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var ready = crossman.ready,
        getClazz = crossman.getClazz,
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
    this.targetKeyMapId = '_system_default_map';
    this.targetDomElement = (domElement) ? domElement : document;

    /** Status **/
    this.downedKeyMap = {};
    this.downedKeyCount = 0;
    this.statusTypeable = null;

    /** KeyMap Cluster **/
    this.storage = null;
    this.system = null;
    this.group = null;
    this.user = null;
    this.mainClusterList = [];
    this.keyMapClusters = {};
    this.length = 0;

    /** Runner **/
    this.runnerPool = null;

    /** FunctionKey Handler **/
    this.shortcutKeyHandler = null;
    this.commandKeyHandler = null;
    this.typingKeyHandler = null;

    /** Inputer **/
    this.shortcutInputObjs = {};
    this.commandInputObjs = {};

    /** Commander **/
    this.commanders = {};

    /** Init **/
    this.init();
}
getClazz(KeyMan).extend(SjEvent);


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

KeyMan.TYPE_NONE = 0;
KeyMan.TYPE_SHORTCUT = 1;
KeyMan.TYPE_COMMAND = 2;
KeyMan.TYPE_TYPING = 3;

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
KeyMan.EVENT_ADDEDCLUSTER = 'addedcluster';
KeyMan.EVENT_MODIFIEDKEY = 'modifiedkey';
KeyMan.EVENT_MODIFIEDMAP = 'modifiedmap';
KeyMan.EVENT_MODIFIEDCLUSTER = 'modifiedcluster';
KeyMan.EVENT_REMOVEDKEY = 'removedkey';
KeyMan.EVENT_REMOVEDMAP = 'removedmap';
KeyMan.EVENT_REMOVEDCLUSTER = 'removedcluster';
KeyMan.EVENT_MODIFIEDOPTION = 'modifiedoption';


/*************************
 *
 * Init
 *
 *************************/
KeyMan.prototype.init = function(){
    var that = this;

    /**- Add Event **/
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

    /** Setup Entity **/
    //- Setup KeyMapCluster for Storage
    this.storage = new KeyMan.Storage().setParent(this);
    this.addEventListener(KeyMan.EVENT_ADDEDMAP, function(data){
            that.storage.addKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_ADDEDCLUSTER, function(data){
            that.storage.addKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_REMOVEDMAP, function(data){
            that.storage.removeKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_REMOVEDCLUSTER, function(data){
            that.storage.removeKeyMap(data);
        });
    //- Setup KeyMapCluster for Default
    this.system = new KeyMan.KeyMapCluster().setId('_system').setTitle('SYSTEM').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId(this.targetKeyMapId).setTitle('SYSTEM_DEFALUT_MAP')
    );
    this.group = new KeyMan.KeyMapCluster().setId('_group').setTitle('GROUP').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId('_group_default_map').setTitle('GROUP_DEFAULT_MAP')
    );
    this.user = new KeyMan.KeyMapCluster().setId('_user').setTitle('USER').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId('_user_default_map').setTitle('USER_DEFAULT_MAP')
    );
    this.mainClusterList = [
        this.system,
        this.group,
        this.user
    ];
    this.addCluster(this.mainClusterList);
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
    if (functionKey instanceof Array){
        for (var i=0; i<functionKey.length; i++){
            this.add(functionKey[i]);
        }
        return this;
    }
    if (functionKey instanceof KeyMan.KeyMapCluster){
        var cluster = functionKey;
        this.addCluster(cluster);
    }else if (functionKey instanceof KeyMan.KeyMap){
        var keyMap = functionKey;
        this.getTargetKeyMap().add(keyMap);
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
KeyMan.prototype.getTargetKeyMap = function(){
    return this.getStorage().getKeyMap(this.targetKeyMapId);
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


KeyMan.prototype.addCluster= function(cluster){
    if (cluster instanceof Array){
        for (var i=0; i<cluster.length; i++){
            this.addCluster(cluster[i]);
        }
        return this;
    }
    if (this.hasCluster(cluster))
        throw 'Already exists KeyMapCluster.';
    if (cluster instanceof KeyMan.KeyMapCluster){
        cluster.setParent(this);
        this.keyMapClusters[cluster.id] = cluster;
        this.length++;
        /** Setup **/
        cluster.setup(this);
        /** Event **/
        this.execEventListenerByEventName(KeyMan.EVENT_ADDEDCLUSTER, cluster);
    }else{
        //- Error
    }
    return this;
};
KeyMan.prototype.getCluster = function(cluster){
    if (!cluster)
        return null;
    return this.keyMapClusters[cluster];
};
KeyMan.prototype.hasCluster = function(cluster){
    return !!this.getCluster(cluster);
};
KeyMan.prototype.removeCluster = function(cluster){
    var id;
    if (cluster instanceof KeyMan.KeyMapCluster)
        id = cluster.id;
    else
        id = cluster;
    if (!this.hasCluster(cluster))
        return this;
    //Unsetup all keyMap
    cluster.unsetup();
    //Remove keyMapCluster
    delete this.keyMapClusters[id];
    this.length--;
    /** Check Event **/
    this.execEventListenerByEventName(KeyMan.EVENT_REMOVEDCLUSTER, cluster);
    /** Save Auto **/
    //- None
    /** null **/
    cluster.setParent(null).setKeyMan(null);
    return this;
};





KeyMan.prototype.setupKeyHandler = function(functionKey){
    switch (functionKey.type){
        case KeyMan.TYPE_TYPING:
            var indexedTypingKeyCount = this.getIndexedTypingKeyCount();
            if (!this.typingKeyHandler && indexedTypingKeyCount > 0){
                this.makeTypingKeyHandlerForce();
            }else if (this.typingKeyHandler && indexedTypingKeyCount == 0){
                this.destroyTypingKeyHandlerForce();
            }
            break;
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

KeyMan.prototype.makeTypingKeyHandlerForce = function(){
    if (this.typingKeyHandler)
        return;
    this.typingKeyHandler = new KeyMan.TypingKeyHandler(this);
    this.addKeyHandler(this.typingKeyHandler);
};
KeyMan.prototype.destroyTypingKeyHandlerForce = function(){
    if (!this.typingKeyHandler)
        return;
    this.removeKeyHandler(this.typingKeyHandler);
    this.typingKeyHandler = null;
};
KeyMan.prototype.checkAndDestroyTypingKeyHandler = function(){
    var indexedCommandKeyCount = this.getIndexedTypingKeyCount();
    if (indexedCommandKeyCount == 0)
        this.destroyTypingKeyHandlerForce();
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
KeyMan.prototype.getIndexedTypingKeyCount = function(){
    return this.system.getIndexedTypingKeyCount() + this.user.getIndexedTypingKeyCount();
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
    this.type = KeyMan.TYPE_NONE;
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
KeyMan.FunctionKey.prototype.setup = function(keyman){
    if (this.keyman){
        console.error('[FunctionKey] setup... Already Setuped !!', this);
        return this;
    }
    if (!keyman)
        return this;
    this.setKeyMan(keyman);
    console.error('[FunctionKey] setup... ', this, this.parent.parent);
    this.setupKeyStepList();
    /** Check Indexing **/
    this.parent.parent.addIndex(this);
    /** Check Handler **/
    this.keyman.setupKeyHandler(this);
    return this;
};
KeyMan.FunctionKey.prototype.setupKeyStepList = function(){
    /** Keys **/
    this.originKeys = this.keys;
    this.keys = KeyMan.convertToRightKeyFromKeys(this.originKeys);
    var keys = this.keys;
    // var keyCodes = this.convertToKeyCodesFrom(keys);
    this.keyStepList = (keys) ? KeyMan.parseToKeyStepList(keys) : [];
    /** EventHandler **/
    console.error('////////////////////////', this.type);
    if (this.type === null || this.type === undefined || this.type === KeyMan.TYPE_NONE)
        this.type = KeyMan.getHandlerType(this.keyStepList);
    console.error('KeySetup !!! => ', KeyMan.getNameByHandlerType(this.type), this.keys, this.keyStepList);
    if (this.type == KeyMan.TYPE_SHORTCUT){
        if (this.keys && this.keys.length == 1 && this.keys[0] instanceof Array){
            this.keys = this.keys[0];
        }
    }
};
KeyMan.FunctionKey.prototype.unsetup = function(){
    console.error('[FunctionKey] unsetup...', this);
    /** Check Indexing **/
    if (this.parent && this.parent.parent)
        this.parent.parent.removeIndex(this);
    /** Check Handler **/
    if (this.keyman)
        this.keyman.setupKeyHandler(this);
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
KeyMan.FunctionKey.prototype.loadData = function(dataObject){
    if (dataObject && dataObject._data)
        return this.loadDataFromObject(dataObject._data);
    return this;
};
KeyMan.FunctionKey.prototype.loadDataFromObject = function(_data){
    var that = this;
    this.id = _data.id;
    this.name = _data.name;
    this.title = _data.title;
    this.data = _data.data;
    console.error('123123123123123', _data.type);
    this.type = _data.type;
    this.runner = _data.runner;
    this.modeLock = _data.modeLock;
    this.modeEditable = _data.modeEditable;
    this.modeRemovable = _data.modeRemovable;
    this.keys = _data.keys;
    this.setupKeyStepList();
    return this;
};

KeyMan.FunctionKey.prototype.extractData = function(){
    return {
        _objectType: 'key-object',
        _data: {
            id: this.id,
            name: this.name,
            title: this.title,
            data: this.data,
            type: this.type,
            runner: this.runner,
            modeLock: this.modeLock,
            modeEditable: this.modeEditable,
            modeRemovable: this.modeRemovable,
            keys: getData(this.keyStepList).collect(function(it){
                return it.keys;
            }),
        }
    };
};
KeyMan.FunctionKey.prototype.copy = function(){
    return KeyMan.FunctionKey.copy(
        this.extractData()._data,
        this.parent.functionKeyMap
    );
};


KeyMan.FunctionKey.prototype.modify = function(object){
    console.error('[FunctionKey] modify...', this);
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
    this.init(object).setupKeyStepList();
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
    if (this.parent && this.parent.parent)
        this.parent.parent.saveAuto();
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
KeyMan.FunctionKey.copy = function(_data, parentRepoMap, checkNumber){
    //- Make new title
    var oldTitle = _data.title;
    var checkNumber = (checkNumber) ? checkNumber : 0;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.FunctionKey.copy(_data, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('titl', newTitle, parentRepoMap);
    return new KeyMan.FunctionKey().loadDataFromObject(_data).init({id:null, title:newTitle});
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
    this.init(object);
};
KeyMan.KeyMap.prototype.init = function(object){
    if (object){
        for (var key in object)
            this[key] = object[key];
    }
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
    // this.traverse(function(keyObject){
    //     keyObject.setKeyMan(keyman);
    // });
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
KeyMan.KeyMap.prototype.loadData = function(dataObject){
    if (dataObject && dataObject._data)
        return this.loadDataFromObject(dataObject._data);
    return this;
};
KeyMan.KeyMap.prototype.loadDataFromObject = function(_data){
    var that = this;
    this.id = _data.id,
    this.name = _data.name,
    this.title = _data.title,
    this.modeLock = _data.modeLock,
    this.modeEditable = _data.modeEditable,
    this.modeRemovable = _data.modeRemovable,
    getData(_data.functionKeyMap).each(function(fKeyId, fKeyData){
        console.error('add Key', fKeyData, that);
        that.add( new KeyMan.FunctionKey().loadData(fKeyData) );
    });
    return this;
};
KeyMan.KeyMap.prototype.extractData = function(){
    return {
        _objectType: 'key-map',
        _data: {
            id: this.id,
            name: this.name,
            title: this.title,
            modeLock: this.modeLock,
            modeEditable: this.modeEditable,
            modeRemovable: this.modeRemovable,
            functionKeyMap: getData(this.functionKeyMap).collectMap(function(fKeyId, fKey){
                return {
                    key: fKeyId,
                    value: fKey.extractData()
                };
            })
        }
    }
};
KeyMan.KeyMap.prototype.copy = function(){
    return KeyMan.KeyMap.copy(
        this.extractData()._data,
        this.parent.functionKeyMaps
    );
};
KeyMan.KeyMap.prototype.traverse = function(callback){
    getData(this.functionKeyMap).any(function(keyObjectId, keyObject){
        callback(keyObject);
    });
    return this;
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
    if (functionKey instanceof Array){
        for (var i=0; i<functionKey.length; i++){
            this.add(functionKey[i]);
        }
        return this;
    }
    if ( !(functionKey instanceof KeyMan.FunctionKey) )
        functionKey = new KeyMan.FunctionKey(functionKey);
    if (this.has(functionKey))
        throw 'Already exists function-key.';
    this.functionKeyMap[functionKey.id] = functionKey;
    functionKey.setParent(this);
    /** Setup **/
    functionKey.setup(this.keyman);
    /** Event **/
    if (this.keyman)
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_ADDEDKEY, functionKey);
    /** Save Auto **/
    if (this.parent)
        this.parent.saveAuto();
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
    else{
        //TODO: CrossMan find부터 재구조화 필요.
        // functionKeyId = getData(this.functionKeyMap).find(functionKey);
        functionKeyId = getEl(this.functionKeyMap).findAll(functionKey);
        if (functionKeyId.length > 0){
            functionKeyId = functionKeyId[0].id;
        }else{
            return null;
        }
    }
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
    //- Unsetup
    functionKey.unsetup();
    //- Remove Data
    delete this.functionKeyMap[functionKey.id];
    /** Check Event **/
    if (this.keyman)
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_REMOVEDKEY, functionKey);
    /** Save Auto **/
    if (this.parent)
        this.parent.saveAuto();
    /** null **/
    functionKey.setParent(null).setKeyMan(null);
    console.debug('[FunctionKey] '+ functionKey.id +' was removed from (Map) '+ this.id);
    return this;
};
KeyMan.KeyMap.prototype.removeFromKeyCluster = function(){
    if (this.parent){
        this.parent.removeKeyMap(this);
    }
    return this;
};
KeyMan.KeyMap.prototype.removeFromKeyMan = function(){
    this.removeFromKeyCluster();
    return this;
};
KeyMan.KeyMap.prototype.clear = function(){
    console.error('[KeyMap] clear...', this);
    for (var keyId in this.functionKeyMap){
        this.remove(keyId);
    }
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
    /** Event **/
    if (this.keyman)
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDMAP, this);
    /** Save Auto **/
    if (this.parent)
        this.parent.saveAuto();
    return this;
};
KeyMan.KeyMap.prototype.setup = function(keyman){
    if (this.keyman){
        console.error('[KeyMap] setup... Already Setuped !!', this);
        return this;
    }
    if (!keyman)
        return this;
    console.error('[KeyMap] setup...', this);
    this.setKeyMan(keyman);
    var keyObject;
    for (var keyId in this.functionKeyMap){
        keyObject = this.functionKeyMap[keyId];
        keyObject.setup(keyman);
    }
    return this;
};
KeyMan.KeyMap.prototype.unsetup = function(){
    console.error('[KeyMap] unsetup...', this);
    var keyObject;
    for (var keyId in this.functionKeyMap){
        keyObject = this.functionKeyMap[keyId];
        keyObject.unsetup();
    }
    return this;
};

KeyMan.KeyMap.copy = function(_data, parentRepoMap, checkNumber){
    //- Make new title
    var oldTitle = _data.title;
    var checkNumber = (checkNumber) ? checkNumber : 0;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.KeyMap.copy(_data, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('titl', newTitle, parentRepoMap);
    return new KeyMan.KeyMap().loadDataFromObject(_data).init({id:null, title:newTitle});
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
    this.title;
    this.modeLock = false;
    this.modeAutoSave = false;
    this.modeMultiMap = false;
    this.modeDefinedKey = false;
    this.keyMapSelectedWhenMultiMapMode = null;
    this.storagePath = 'keyman';
    this.functionKeyMaps = {};
    this.targetKeyMapId;
    //_
    this.parent = null; //KeyMan
    this.keyman = null; //KeyMan
    this.length = 0;
    //_Index
    this.inversionIndexedShortcutFunctionKeyIdMapMap = {};
    this.inversionIndexedCommandFunctionKeyIdMapMap = {};
    this.inversionIndexedTypingFunctionKeyIdMapMap = {};
    //_DefinedKey
    this.definedKeyMap;
    this.init(object);
};
KeyMan.KeyMapCluster.ERROR_001 = 'You can add only KeyMan.KeyMap';

KeyMan.KeyMapCluster.prototype.init = function(object){
    if (object){
        for (var key in object)
            this[key] = object[key];
    }
    if (!this.id)
        this.id = this._id;
    if (!this.keyMapSelectedWhenMultiMapMode)
        this.selectKeyMapOnMultiMapMode(this.getFirst());
    return this;
};
KeyMan.KeyMapCluster.prototype.setId = function(id){
    this.id = id
    return this;
};
KeyMan.KeyMapCluster.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};
KeyMan.KeyMapCluster.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyMapCluster.prototype.setTitle = function(title){
    this.title = title;
    return this;
};
KeyMan.KeyMapCluster.prototype.setModeAutoSave = function(mode){
    this.modeAutoSave = mode;
    this.parent.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDOPTION, {modeAutoSave: mode});
    return this;
};
KeyMan.KeyMapCluster.prototype.setModeMultiMap = function(mode){
    this.modeMultiMap = mode;
    this.parent.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDOPTION, {modeMultiMap: mode});
    return this;
};
KeyMan.KeyMapCluster.prototype.setModeDefinedKey = function(mode){
    this.modeDefinedKey = mode;
    this.parent.execEventListenerByEventName(KeyMan.EVENT_MODIFIEDOPTION, {modeDefinedKey: mode});
    return this;
};
KeyMan.KeyMapCluster.prototype.selectKeyMapOnMultiMapMode = function(keyMap){
    var id;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else
        id = keyMap;
    this.keyMapSelectedWhenMultiMapMode = id;
    return this;
};

KeyMan.KeyMapCluster.prototype.save = function(){
    var storageKey = this.storagePath + '/' + this.id;
    var dataObject = this.extractData();
    console.error('===== [SAVE] ===== ', storageKey, dataObject);
    getStorage(storageKey).save(dataObject);
    return this;
};
KeyMan.KeyMapCluster.prototype.saveAuto = function(){
    if (this.modeAutoSave)
        this.save();
    return this;
};
KeyMan.KeyMapCluster.prototype.saveData = function(){
    return this;
};
KeyMan.KeyMapCluster.prototype.load = function(){
    var that = this;
    var storageKey = this.storagePath + '/' + this.id;
    console.error('123123123123123', storageKey);
    getStorage(storageKey).load(function(dataObject){
        that.loadData(dataObject);
    });
};
KeyMan.KeyMapCluster.prototype.loadData = function(dataObject){
    console.error('123123123123123', dataObject);
    if (dataObject && dataObject._data)
        return this.loadDataFromObject(dataObject._data);
    return this;
};
KeyMan.KeyMapCluster.prototype.loadDataFromObject = function(_data){
    var that = this;
    this.id = _data.id;
    this.name = _data.name;
    this.title = _data.title;
    this.modeAutoSave = _data.modeAutoSave;
    this.modeMultiMap = _data.modeMultiMap;
    this.clearKeyMaps();
    getData(_data.functionKeyMaps).each(function(keyMapId, keyMapData){
        that.addKeyMap( new KeyMan.KeyMap().loadData(keyMapData) );
    });
    if (getData(_data.functionKeyMaps).isEmpty())
        this.newKeyMap();
    return this;
};
KeyMan.KeyMapCluster.prototype.mergeData = function(keyMapClusterForMerge, optionMapForMerge){
    switch (optionMapForMerge['import']){
        case KeyMan.MergeOption.TYPE_OVERWRITE:
            keyMapClusterForMerge.statusDuplicated;
            keyMapClusterForMerge.statusNew;
            //Delete and Insert
            this.importData(keyMapClusterForMerge.extractData());
            break;

        case KeyMan.MergeOption.TYPE_SYNC:
        default:
            switch (optionMapForMerge['map']){
                case KeyMan.MergeOption.TYPE_OVERWRITE:
                    //겹치면 modify / 안겹치면 new
                    keyMapClusterForMerge.getUser().traverse(function(toKeyMap){
                        toKeyMap.traverse(function(toKeyObject){

                        });
                    });
                    break;
                case KeyMan.MergeOption.TYPE_NEW:
                    //겹치면 새걸로 new / 안겹치면 new
                    break;
                case KeyMan.MergeOption.TYPE_IGNORE:
                    //겹치면 무시 / 안겹치면 new
                    break;
                case KeyMan.MergeOption.TYPE_SYNC:
                    //겹치면 KeyObject 옵션에 따름
                    default:
            }
            break;
    }
    return this;
};

KeyMan.KeyMapCluster.prototype.extractData = function(){
    return {
        _objectType: 'key-map-cluster',
        _data: {
            id: this.id,
            name: this.name,
            title: this.title,
            modeAutoSave: this.modeAutoSave,
            modeMultiMap: this.modeMultiMap,
            functionKeyMaps: getData(this.functionKeyMaps).collectMap(function(k, v){
                return {
                    key: k,
                    value: v.extractData()
                };
            })
        }
    };
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
KeyMan.KeyMapCluster.prototype.importData = function(dataObject){
    var that = this;
    this.clearKeyMaps();
    if (dataObject.objectType == 'keymap-cluster'){
        getData(dataObject._data.functionKeyMaps).each(function(keyMapId, keyMapData){
            var keyMap = new KeyMap({id:keyMapId});
            that.addKeyMap( keyMap.importData(keyMapData) );
        });
    }
};

KeyMan.KeyMapCluster.prototype.traverse = function(callback){
    getData(this.functionKeyMaps).any(function(keyMapId, keyMap){
        callback(keyMap);
    });
    return this;
};



KeyMan.KeyMapCluster.prototype.add = function(keyObject){
    if (keyObject instanceof Array){
        for (var i=0; i<keyObject.length; i++){
            this.add(keyObject[i]);
        }
        return this;
    }
    if (keyObject instanceof KeyMan.KeyMap) {
        this.addKeyMap(keyObject);
    }else if (typeof keyObject == 'object'){
        this.getTargetKeyMap().add(keyObject);
    }else{
        throw KeyMan.KeyMapCluster.ERROR_001;
    }
    /** Check Indexing **/
    // this.addIndex(keyObject);
    return this;
};
KeyMan.KeyMapCluster.prototype.get = function(keyObject){
    return this.getTargetKeyMap().get(keyObject);
};
KeyMan.KeyMapCluster.prototype.getByTitle = function(keyObject){
    return this.getTargetKeyMap().getByTitle(keyObject)
};
KeyMan.KeyMapCluster.prototype.has = function(keyObject){
    return !!this.get(keyObject);
};
KeyMan.KeyMapCluster.prototype.remove = function(keyObject){
    this.getTargetKeyMap().remove(keyObject);
    return this;
};
KeyMan.KeyMapCluster.prototype.clear = function(){
    for (var keyMapId in this.functionKeyMaps){
        this.remove(keyMapId);
    }
    return this;
};


KeyMan.KeyMapCluster.prototype.setKeyMap = function(keyMap){
    this.clearKeyMaps();
    this.addKeyMap(keyMap);
    //Setup targetKeyMapId
    var targetKeyMapId = null;
    var keyMapLength = Object.keys(this.functionKeyMaps).length;
    if (keyMapLength > 0){
        for (var keyMapId in this.functionKeyMaps){
            targetKeyMapId = keyMapId;
            break;
        }
    }
    this.targetKeyMapId = targetKeyMapId;
    return this;
};
KeyMan.KeyMapCluster.prototype.newKeyMap = function(){
    return this.addKeyMap( new KeyMan.KeyMap() );
};
KeyMan.KeyMapCluster.prototype.addKeyMap = function(keyMap){
    if (keyMap instanceof Array){
        for (var i=0; i<keyMap.length; i++){
            this.addKeyMap(keyMap[i]);
        }
        return this;
    }
    if (keyMap instanceof KeyMan.KeyMapCluster){
        var cluster = keyMap;
        for (var keyMapId in cluster.functionKeyMaps){
            this.addKeyMap(cluster.functionKeyMaps[keyMapId]);
        }
        return this;
    }else if (keyMap instanceof KeyMan.KeyMap){
        if (this.hasKeyMap(keyMap))
            return this;
        this.functionKeyMaps[keyMap.id] = keyMap;
        this.length++;
        /** Check selected map **/
        if (!this.keyMapSelectedWhenMultiMapMode || this.length == 1)
            this.selectKeyMapOnMultiMapMode(keyMap);
        /** Setup **/
        keyMap.setParent(this);
        keyMap.setup(this.keyman);
        /** Event **/
        //- Does not works when init.
        if (this.parent)
            this.parent.execEventListenerByEventName(KeyMan.EVENT_ADDEDMAP, keyMap);
    }else if (typeof keyMap == 'string'){
        return this.addKeyMap( new KeyMan.KeyMap({id:keyMap}) );
    }else{
        throw KeyMan.KeyMapCluster.ERROR_001;
    }
    /** Check Indexing **/
    // this.addIndex(keyMap);
    /** Save Auto **/
    this.saveAuto();
    console.error('aadddddKeyMap', keyMap, this.functionKeyMaps, this.parent);
    return this;
};
KeyMan.KeyMapCluster.prototype.getKeyMap = function(keyMap){
    if (!keyMap)
        return;
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else
        id = keyMap
    return this.functionKeyMaps[id];
};
KeyMan.KeyMapCluster.prototype.getKeyMapByTitle = function(keyMap){
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
KeyMan.KeyMapCluster.prototype.hasKeyMap = function(keyMap){
    return !!this.getKeyMap(keyMap);
};
KeyMan.KeyMapCluster.prototype.removeKeyMap = function(keyMap){
    if (!keyMap)
        return;
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else{
        id = keyMap;
        keyMap = this.getKeyMap(id);
    }
    //Unsetup all keyObject
    keyMap.unsetup();
    //Remove keyMap
    delete this.functionKeyMaps[id];
    this.length--;
    /** Check selected map **/
    if (this.length == 0)
        this.selectKeyMapOnMultiMapMode(null);
    /** Check Event **/
    if (this.parent)
        this.parent.execEventListenerByEventName(KeyMan.EVENT_REMOVEDMAP, keyMap);
    /** Save Auto **/
    this.saveAuto();
    /** null **/
    keyMap.setParent(null).setKeyMan(null);
    return this;
};
KeyMan.KeyMapCluster.prototype.setup = function(keyman){
    if (this.keyman){
        console.error('[KeyMapCluster] setup... Already Setuped !!', this);
        return this;
    }
    if (!keyman)
        return this;
    console.error('[KeyMapCluster] setup... ', this);
    this.setKeyMan(keyman);
    var keyMap;
    for (var keyMapId in this.functionKeyMaps){
        keyMap = this.functionKeyMaps[keyMapId];
        keyMap.setup(keyman);
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.unsetup = function(){
    var keyMap;
    for (var keyMapId in this.functionKeyMaps){
        keyMap = this.functionKeyMaps[keyMapId];
        keyMap.unsetup();
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.clearKeyMaps = function(){
    for (var keyMapId in this.functionKeyMaps){
        this.removeKeyMap(keyMapId);
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.getFirst = function(){
    var keyMapIdList = Object.keys(this.functionKeyMaps);
    return this.getKeyMap(keyMapIdList[0]);
};
KeyMan.KeyMapCluster.prototype.getFunctionKeyMaps = function(){
    return this.functionKeyMaps;
};
KeyMan.KeyMapCluster.prototype.getTargetKeyMap = function(){
    return this.getKeyMap(this.targetKeyMapId);
};
KeyMan.KeyMapCluster.prototype.setTargetKeyMap = function(targetKeyMap){
    if (!targetKeyMap)
        return;
    if (targetKeyMap instanceof KeyMan.KeyMap)
        targetKeyMap = targetKeyMap.id;
    if (typeof targetKeyMap == 'string')
        this.targetKeyMapId = targetKeyMap;
    return this;
};

KeyMan.KeyMapCluster.prototype.getIndexedKeyMap = function(type){
    var inversionIndexedSomeFunctionKeyIdMapMap;
    switch (type){
        case KeyMan.TYPE_TYPING: inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedTypingKeyMap(); break;
        case KeyMan.TYPE_COMMAND: inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedCommandKeyMap(); break;
        case KeyMan.TYPE_SHORTCUT: default: inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexdShortcutKeyMap(); break;
    }
    return inversionIndexedSomeFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexdShortcutKeyMap = function(){
    return this.inversionIndexedShortcutFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedCommandKeyMap = function(){
    return this.inversionIndexedCommandFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedTypingKeyMap = function(){
    return this.inversionIndexedTypingFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedShortcutKeyCount = function(){
    return Object.keys(this.inversionIndexedShortcutFunctionKeyIdMapMap).length;
};
KeyMan.KeyMapCluster.prototype.getIndexedCommandKeyCount = function(){
    return Object.keys(this.inversionIndexedCommandFunctionKeyIdMapMap).length;
};
KeyMan.KeyMapCluster.prototype.getIndexedTypingKeyCount = function(){
    return Object.keys(this.inversionIndexedTypingFunctionKeyIdMapMap).length;
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
    var inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedKeyMap(functionKey.type);
    for (var i=0, key; i<keys.length; i++){
        key = keys[i];
        if (!inversionIndexedSomeFunctionKeyIdMapMap[key])
            inversionIndexedSomeFunctionKeyIdMapMap[key] = {};
        inversionIndexedSomeFunctionKeyIdMapMap[key][functionKey.id] = functionKey;
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.getIndex = function(functionKey){
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    var keys = keyStepFirst.keys;
    var inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedKeyMap(functionKey.type);
    for (var i=0, key; i<keys.length; i++){
        key = keys[i];
        if (inversionIndexedSomeFunctionKeyIdMapMap[key])
            return inversionIndexedSomeFunctionKeyIdMapMap[key][functionKey.id];
    }
    return [];
};
KeyMan.KeyMapCluster.prototype.hasIndex = function(functionKey){
    var keyStepList = functionKey.keyStepList;
    var keyStepFirst = keyStepList[0];
    var keys = keyStepFirst.keys;
    var inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedKeyMap(functionKey.type);
    for (var i=0, key; i<keys.length; i++){
        key = keys[i];
        if (inversionIndexedSomeFunctionKeyIdMapMap[key] && inversionIndexedSomeFunctionKeyIdMapMap[key][functionKey.id])
            return true;
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
    if (!keyStepList)
        return this;
    var keyStepFirst = keyStepList[0];
    if (!keyStepFirst) //Empty FunctionKey => No Indexing
        return this;
    var keys = keyStepFirst.keys;
    var inversionIndexedSomeFunctionKeyIdMapMap = this.getIndexedKeyMap(functionKey.type);
    for (var i=0, key; i<keys.length; i++){
        key = keys[i];
        if (inversionIndexedSomeFunctionKeyIdMapMap[key]){
            var functionKeyMap = inversionIndexedSomeFunctionKeyIdMapMap[key];
            delete functionKeyMap[functionKey.id];
            if (Object.keys(functionKeyMap).length == 0)
                delete inversionIndexedSomeFunctionKeyIdMapMap[key];
        }
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
KeyMan.Storage = getClazz(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
    this.name = 'storage';
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();

KeyMan.Storage.prototype.addKeyMap = function(keyMap){ //- Just store
    if (keyMap instanceof Array){
        for (var i=0; i<keyMap.length; i++){
            this.addKeyMap(keyMap[i]);
        }
        return this;
    }
    if (keyMap instanceof KeyMan.KeyMapCluster){
        var cluster = keyMap;
        for (var keyMapId in cluster.functionKeyMaps){
            this.addKeyMap(cluster.functionKeyMaps[keyMapId]);
        }
        return this;
    }
    if (this.hasKeyMap(keyMap))
        return this;
    //Add keyMap
    this.functionKeyMaps[keyMap.id] = keyMap;
    this.length++;
    return this;
};
KeyMan.Storage.prototype.removeKeyMap = function(keyMap){ //- Just unstore
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else{
        id = keyMap;
        keyMap = this.getKeyMap(id);
    }
    if (this.hasKeyMap(keyMap))
        return this;
    //Remove keyMap
    delete this.functionKeyMaps[id];
    this.length--;
    return this;
};




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
    this.matchingStartKeyStepIndex = -1;
    this.matchingProcessKeyStepIndex = -1;
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
    this.status = KeyMan.KeyStep.STATUS_NONE;
};
KeyMan.KeyStep.STATUS_NONE = 0;
KeyMan.KeyStep.STATUS_CHECKING = 1;
KeyMan.KeyStep.STATUS_RUN = 2;

KeyMan.KeyStep.prototype.setStatus = function(status){
    this.status = status;
    return this;
};
KeyMan.KeyStep.prototype.checkStatus = function(status){
    return this.status == status;
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
KeyMan.Runner = getClazz(function(object){
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.title = '';
    this.execute = null; //Function
    //_
    this.parent; //RunnerPool
    this.keyman; //KeyMan
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
    if (object){
        for (var key in object)
            this[key] = object[key];
    }
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
KeyMan.RunnerPool = getClazz(function(){
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
    this.init(opt);
};
KeyMan.MergeOption.TYPE_NONE = 0;
KeyMan.MergeOption.TYPE_OVERWRITE = 1;
KeyMan.MergeOption.TYPE_NEW = 2;
KeyMan.MergeOption.TYPE_IGNORE = 3;
KeyMan.MergeOption.TYPE_SYNC = 4;

KeyMan.MergeOption.prototype.init = function(opt){
    if (opt){
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
    }
};

KeyMan.MergeOptionForImport = getClazz(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'import';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForMap = getClazz(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'map';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForKey = getClazz(function(opt){
    KeyMan.MergeOption.apply(this, arguments);
    this.name = 'key';
})
.extend(KeyMan.MergeOption)
.returnFunction();

KeyMan.MergeOptionForOption = getClazz(function(opt){
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
        case KeyMan.TYPE_TYPING:
            return new KeyMan.TypingKeyHandler(keyman, functionKey);
            break;
        case KeyMan.TYPE_COMMAND:
            return new KeyMan.CommandKeyHandler(keyman, functionKey);
            break;
        case KeyMan.TYPE_SHORTCUT:
        default:
            return new KeyMan.ShortcutKeyHandler(keyman, functionKey);
            break;
    }
};

KeyMan.getHandlerTypeByName = function(name){
    switch (name){
        case 'TYPING': return KeyMan.TYPE_TYPING; break;
        case 'COMMAND': return KeyMan.TYPE_COMMAND; break;
        case 'SHORTCUT': default: return KeyMan.TYPE_SHORTCUT; break;
    }
}

KeyMan.getNameByHandlerType = function(type){
    switch (type){
        case KeyMan.TYPE_TYPING: return 'TYPING'; break;
        case KeyMan.TYPE_COMMAND: return 'COMMAND'; break;
        case KeyMan.TYPE_SHORTCUT: default: return 'SHORTCUT'; break;
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



