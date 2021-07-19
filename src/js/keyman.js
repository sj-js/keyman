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

    /** DEFAULT **/
    KeyMan.KEYTYPE_DEFAULT = new KeyMan.KeyType(this);

    /** Mode **/
    this.modeLock = false;
    this.targetKeyMapId = '_system_default_fk_map';
    this.targetDomElement = (domElement) ? domElement : document;
    this.selectedKeyType = KeyMan.KEYTYPE_DEFAULT;

    /** Status **/
    this.downedKeyMap = {};
    this.downedDefinedKeyMap = {};
    this.downedKeyCount = 0;
    this.statusTypeable = null;
    this.lastKeyInputTime = new Date().getTime();
    this.runningKeyHandlers = {};

    /** KeyMap Cluster **/
    this.storage = null;
    this.system = null;
    this.group = null;
    this.user = null;
    this.mainClusterList = []; //이거 무슨 의도였지?? 일단 이걸로 지소적인 Sort시키자.
    this.keyMapClusters = {};
    this.length = 0;

    /** Runner **/
    this.runnerPool = null;

    /** KeyType Handler **/
    this.keyTypes = {};

    /** FunctionKey Handler **/
    this.keyHandlers = {};
    this.defaultKeyHandlerType = 'SHORTCUT';

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

KeyMan.KEYTYPE_NAME_HANGUL = 'hangul';
KeyMan.KEYTYPE_NAME_ROME = 'rome';
KeyMan.KEYTYPE_NAME_KANA = 'kana';

KeyMan.TYPE_NONE = 'NONE';
KeyMan.TYPE_SHORTCUT = 'SHORTCUT';
KeyMan.TYPE_COMMAND = 'COMMAND';
KeyMan.TYPE_TYPING = 'TYPING';
KeyMan.TYPE_DEFINED = 'DEFINED';
KeyMan.TYPE_DEFINEDCOMMAND = 'DEFINEDCOMMAND';

KeyMan.EVENT_AFTERDETECT = 'afterdetect';
KeyMan.EVENT_KEYDOWN = 'keydown';
KeyMan.EVENT_KEYUP = 'keyup';
// KeyMan.EVENT_KEYDOWNFORCOMMAND = 'keydownforcommand';
// KeyMan.EVENT_KEYUPFORCOMMAND = 'keyupforcommand';
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
KeyMan.EVENT_ADDEDFUNCTIONMAP = 'addedfunctionmap';
KeyMan.EVENT_ADDEDDEFINEDMAP = 'addeddefinedmap';
KeyMan.EVENT_ADDEDCLUSTER = 'addedcluster';
KeyMan.EVENT_ADDEDKEYHANDLER = 'addedkeyhandler';
KeyMan.EVENT_MODIFIEDKEY = 'modifiedkey';
KeyMan.EVENT_MODIFIEDMAP = 'modifiedmap';
KeyMan.EVENT_MODIFIEDCLUSTER = 'modifiedcluster';
KeyMan.EVENT_REMOVEDKEY = 'removedkey';
KeyMan.EVENT_REMOVEDMAP = 'removedmap';
KeyMan.EVENT_REMOVEDFUNCTIONMAP = 'removedfunctionmap';
KeyMan.EVENT_REMOVEDDEFINEDMAP = 'removeddefinedmap';
KeyMan.EVENT_REMOVEDCLUSTER = 'removedcluster';
KeyMan.EVENT_REMOVEDKEYHANDLER = 'removedkeyhandler';
KeyMan.EVENT_MODIFIEDOPTION = 'modifiedoption';

KeyMan.EVENT_CHANGEKEYTYPE = 'changekeytype';
KeyMan.EVENT_EXECUTE = 'execute';

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
        var validKey = (key != null);
        var upperKey = validKey ? key.toUpperCase() : null;
        var eventData = {event:event, key:key, upperKey:upperKey};
        that.turnOnAvailableLight(eventData);
        that.eachKeyHandlers(function(keyHandler){
            keyHandler.beforeKeydown(eventData);
            // that.execEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, eventData);
        });
        that.pressKey(upperKey);
        that.eachKeyHandlers(function(keyHandler){
            keyHandler.keydown(eventData);
            // that.execEventListenerByEventName(KeyMan.EVENT_KEYDOWN, eventData);
        });

        // that.execEventListenerByEventName(KeyMan.EVENT_KEYDOWNFORCOMMAND, eventData);
        // that.execEventListenerByEventName(KeyMan.EVENT_PUSHSHORTCUT, eventData);
        // that.execEventListenerByEventName('pushcommand', event);
        return true;
    });
    domElement.addEventListener(KeyMan.EVENT_KEYUP, function(event){
        var key = that.getKeyFromEvent(event);
        var validKey = (key != null);
        var upperKey = validKey ? key.toUpperCase() : null;
        var eventData = {event:event, key:key, upperKey:upperKey};
        that.eachKeyHandlers(function(keyHandler){
            keyHandler.beforeKeyup(eventData);
            // that.execEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, eventData);
        });
        that.releaseKey(upperKey);
        that.eachKeyHandlers(function(keyHandler){
            keyHandler.keyup(eventData);
            // that.execEventListenerByEventName(KeyMan.EVENT_KEYUP, eventData);
        });
        // that.execEventListenerByEventName(KeyMan.EVENT_KEYUPFORCOMMAND, eventData);
        // that.execEventListenerByEventName(KeyMan.EVENT_PUSHSHORTCUT, eventData);
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
        .addEventListener(KeyMan.EVENT_ADDEDDEFINEDMAP, function(data){
            // that.storage.addDefinedKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_ADDEDCLUSTER, function(data){
            that.storage.addKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_REMOVEDMAP, function(data){
            that.storage.removeKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_REMOVEDDEFINEDMAP, function(data){
            // that.storage.removeDefinedKeyMap(data);
        })
        .addEventListener(KeyMan.EVENT_REMOVEDCLUSTER, function(data){
            that.storage.removeKeyMap(data);
        })
        ;

    //- Setup KeyMapCluster for Default
    this.system = new KeyMan.FunctionKeyMapCluster().setId('_system').setTitle('SYSTEM').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId(this.targetKeyMapId).setTitle('SYSTEM_DEFALUT_MAP')
    );
    this.group = new KeyMan.FunctionKeyMapCluster().setId('_group').setTitle('GROUP').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId('_group_default_fk_map').setTitle('GROUP_DEFAULT_MAP')
    );
    this.user = new KeyMan.FunctionKeyMapCluster().setId('_user').setTitle('USER').setKeyMap(
        new KeyMan.KeyMap({modeRemovable:false}).setId('_user_default_fk_map').setTitle('USER_DEFAULT_MAP')
    );
    this.mainClusterList = [
        this.user,
        this.group,
        this.system
    ];
    this.addCluster(this.mainClusterList);
    return this;
};

KeyMan.prototype.pressKey = function(upperKey){
    if (upperKey)
        this.downedKeyMap[upperKey] = true;
};
KeyMan.prototype.releaseKey = function(upperKey){
    if (upperKey)
        delete this.downedKeyMap[upperKey];
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
KeyMan.prototype.convertKeyToKey = function(eventData){
    var convertedKey = this.selectedKeyType.convertKeyToKey(eventData);
    return convertedKey;
};

KeyMan.prototype.assemble = function(convertedKey, currentKeyStepProcess, eventData){
    var newKeySteps = this.selectedKeyType.assemble(convertedKey, currentKeyStepProcess, eventData);
    return newKeySteps;
};



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

KeyMan.prototype.getCurrentKeyType = function(){
    return this.selectedKeyType;
};
KeyMan.prototype.getKeyType = function(keyType){
    var keyType = this.keyTypes[keyType];
    return keyType;
};
KeyMan.prototype.setKeyType = function(keyType){
    this.selectedKeyType = keyType;
    return this;
};
KeyMan.prototype.toggleKeyType = function(){
    if (this.selectedKeyType){
        if (this.selectedKeyType.name == KeyMan.KEYTYPE_NAME_HANGUL)
            this.selectedKeyType = this.getKeyType(KeyMan.KEYTYPE_NAME_KANA);
        else if (this.selectedKeyType.name == KeyMan.KEYTYPE_NAME_KANA)
            this.selectedKeyType = this.getKeyType(KeyMan.KEYTYPE_NAME_ROME);
        else if (this.selectedKeyType.name == KeyMan.KEYTYPE_NAME_ROME)
            this.selectedKeyType = this.getKeyType(KeyMan.KEYTYPE_NAME_HANGUL);
        // this.selectedKeyType = KeyMan.KEYTYPE_DEFAULT;
        console.log('[KEYTYPE]' + this.selectedKeyType.name, this.selectedKeyType);
    }else{
        //???
    }
    this.execEventListenerByEventName(KeyMan.EVENT_CHANGEKEYTYPE, {
        keyType: this.selectedKeyType
    });
    return this;
};

KeyMan.prototype.add = function(functionKey){
    if (functionKey instanceof Array){
        for (var i=0; i<functionKey.length; i++){
            this.add(functionKey[i]);
        }
        return this;
    }
    if (functionKey instanceof KeyMan.KeyMapCluster){
        this.addCluster(functionKey);
    }else if (functionKey instanceof KeyMan.KeyMap){
        this.addKeyMap(functionKey);
    }else if (functionKey instanceof KeyMan.FunctionKey){
        this.addFunctionKey(functionKey);
    }else{
        this.addFunctionKey(functionKey);
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
    return this.getTargetFunctionKeyMap();
};
KeyMan.prototype.setTargetKeyMap = function(targetFunctionKeyMap){
    return this.setTargetFunctionKeyMap(targetFunctionKeyMap);
};
KeyMan.prototype.getTargetFunctionKeyMap = function(){
    return this.getStorage().getKeyMap(this.targetKeyMapId);
};
KeyMan.prototype.setTargetFunctionKeyMap = function(targetFunctionKeyMap){
    if (!targetFunctionKeyMap)
        return;
    if (targetFunctionKeyMap instanceof KeyMan.KeyMap)
        targetFunctionKeyMap = targetFunctionKeyMap.id;
    if (typeof targetFunctionKeyMap == 'string')
        this.targetKeyMapId = targetFunctionKeyMap;
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


KeyMan.prototype.addKeyType = function(param){
    var that = this;
    getData(param).each(function(keyType){
        keyType.setKeyMan(that);
        that.keyTypes[keyType.type] = keyType;
        console.debug('[KeyType] ADDED !', keyType.type, keyType);
    });
    return this;
};


KeyMan.prototype.addKeyHandler = function(param){
    var that = this;
    if ( !(param instanceof Array))
        param = [param];

    getData(param).each(function(kh){
        if (that.hasKeyHandler(kh)){
            console.error(kh, " on ", param);
            throw 'Already exists KeyHandler. [(' +kh+ ')' +kh.name+ ']';
        }
        if (kh instanceof KeyMan.KeyHandler){
            kh.setKeyMan(that).setParent(that);
            that.keyHandlers[kh.type] = kh;
            /** Setup **/
            // keyHandler.setup(that);
            /** Event **/
            that.execEventListenerByEventName(KeyMan.EVENT_ADDEDKEYHANDLER, kh);
            console.debug('[KeyHandler] added ' +kh.name, kh.type, kh);
        }else{
            //- Error
        }
    });
    // getData(param).sort(function(a, b){
    //     return a - b;
    // });
    return this;
};
KeyMan.prototype.getKeyHandler = function(keyHandler){
    if (!keyHandler)
        return null;
    return this.keyHandlers[keyHandler];
};
KeyMan.prototype.getKeyHandlers = function(){
    return this.keyHandlers;
};
KeyMan.prototype.hasKeyHandler = function(keyHandler){
    return !!this.getKeyHandler(keyHandler);
};
KeyMan.prototype.removeKeyHandler = function(param){
    var that = this;
    getData(param).each(function(keyHandler){
        if (!that.hasCluster(keyHandler))
            return;
        //Unsetup all keyMap
        keyHandler.unsetup();
        //Remove keyMapCluster
        delete that.keyHandlers[keyHandler.type];
        /** Check Event **/
        this.execEventListenerByEventName(KeyMan.EVENT_REMOVEDKEYHANDLER, keyHandler);
        /** Save Auto **/
        //- None
        /** null **/
        keyHandler.setParent(null).setKeyMan(null);
        console.debug('[KeyHandler] REMOVED !', keyHandler.type);
    });
    return this;
};


KeyMan.prototype.addKeyMap = function(keyMap){
    this.getStorage().addKeyMap(keyMap);
    return this;
};
KeyMan.prototype.removeKeyMap = function(keyMap){
    this.getStorage().removeKeyMap(keyMap);
    return this;
};


KeyMan.prototype.addFunctionKey = function(functionKey){
    var keyMap = this.getTargetKeyMap();
    if (!keyMap && !this.storage.hasAnyKeyMap()){
        keyMap = this.system.newKeyMap({id:this.targetKeyMapId});
    }
    keyMap.add(functionKey);
    return this;
};
KeyMan.prototype.removeFunctionKey = function(functionKey){
    this.getTargetKeyMap().remove(functionKey);
    return this;
};





KeyMan.prototype.setupKeyHandler = function(functionKey){
    var functionKeyType = functionKey.type;
    if (functionKeyType === null || functionKeyType === undefined){
        console.warn('['+functionKey.name+'] ' + 'No Type Error (해당 키에 해당하는 적절한 핸들러가 존재하지 않습니다 )');
        return;
    }

    var indexedKeyCount = this.getIndexedKeyCount(functionKeyType);
    var keyHandler = this.getRunningKeyHandler(functionKeyType);
    if (keyHandler){
        if (indexedKeyCount == 0){
            this.stopKeyHandlerForce(functionKeyType);
        }
    }else{
        if (indexedKeyCount > 0){
            this.runKeyHandlerForce(functionKeyType);
        }
    }
};

KeyMan.prototype.runKeyHandlerForce = function(type){
    if (this.checkRunningKeyHandler(type))
        return false;
    var notRunningKeyHandler = this.getKeyHandler(type);
    if (!notRunningKeyHandler)
        return false;
    // notRunningKeyHandler.setKeyMan(this);
    this.runKeyHandler(notRunningKeyHandler);
    return true;
};
KeyMan.prototype.stopKeyHandlerForce = function(type){
    if (!this.checkRunningKeyHandler(type))
        return;
    var runningKeyHandler = this.getRunningKeyHandler(type);
    this.stopKeyHandler(runningKeyHandler);
};
KeyMan.prototype.checkAndDestroyKeyHandler = function(type){
    var indexedKeyCount = this.getIndexedKeyCount(type);
    if (indexedKeyCount == 0)
        this.stopKeyHandlerForce(type);
};
KeyMan.prototype.checkAndDestroyAllKeyHandler = function(){
    var that = this;
    getData(this.getKeyHandlerTypes()).each(function(it){
        that.checkAndDestroyKeyHandler(it);
    });
};

KeyMan.prototype.checkRunningKeyHandler = function(type){
    return !!this.getRunningKeyHandler(type);
};
KeyMan.prototype.getRunningKeyHandler = function(type){
    return this.runningKeyHandlers[type];
};



KeyMan.prototype.runKeyHandler = function(keyHandler){
    if (this.checkRunningKeyHandler(keyHandler.type)){
        console.debug('[KeyHandler] Already ADDED !', keyHandler);
        return;
    }
    var notRunningKeyHandler = keyHandler;
    notRunningKeyHandler.setup(this);
    // this.addEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, notRunningKeyHandler.getBeforeKeydownEventHandler());
    // this.addEventListenerByEventName(KeyMan.EVENT_KEYDOWN, notRunningKeyHandler.getKeydownEventHandler());
    // this.addEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, notRunningKeyHandler.getBeforeKeyupEventHandler());
    // this.addEventListenerByEventName(KeyMan.EVENT_KEYUP, notRunningKeyHandler.getKeyupEventHandler());
    console.debug('[KeyHandler] run ' +notRunningKeyHandler.name, notRunningKeyHandler);
    var type = notRunningKeyHandler.type;
    this.runningKeyHandlers[type] = notRunningKeyHandler;
    //TODO: sort
    // getData(this.runningKeyHandlers).sort(function(a, b){
    //    return a - b;
    // });
};
KeyMan.prototype.stopKeyHandler = function(keyHandler){
    if (!this.checkRunningKeyHandler(keyHandler.type)){
        console.debug('[KeyHandler] Already REMOVED !', keyHandler);
        return;
    }
    var runningKeyHandler = keyHandler;
    // this.removeEventListenerByEventName(KeyMan.EVENT_BEFOREKEYDOWN, runningKeyHandler.getBeforeKeydownEventHandler());
    // this.removeEventListenerByEventName(KeyMan.EVENT_KEYDOWN, runningKeyHandler.getKeydownEventHandler());
    // this.removeEventListenerByEventName(KeyMan.EVENT_BEFOREKEYUP, runningKeyHandler.getBeforeKeyupEventHandler());
    // this.removeEventListenerByEventName(KeyMan.EVENT_KEYUP, runningKeyHandler.getKeyupEventHandler());
    console.debug('[KeyHandler] REMOVED !', runningKeyHandler);
    var type = runningKeyHandler.type;
    delete this.runningKeyHandlers[type];
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
    // console.log("으디:", keyCode, keyName);
    if (keyCode == 32) //SPACE
        return KeyMan.SPACE;
    if (keyCode == 229) //Something bad..
        return null;
    if (keyName){
        if (keyCode && 48 <= keyCode && keyCode <= 57){
            key = this.convertToKeyFromKeyCode(keyCode);
        }else{
            // key = keyName.toUpperCase();
            key = keyName;
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


KeyMan.prototype.eachKeyHandlers = function(closure){
    getData(this.keyHandlers).each(function(id, kh){
        closure(kh);
    })
    return this;
};
KeyMan.prototype.eachRunningKeyHandlers = function(closure){
    getData(this.runningKeyHandlers).each(function(id, kh){
        closure(kh);
    })
    return this;
};
KeyMan.prototype.eachKey = function(closure){
    this.eachKeyMap(function(fkMap){
        for (var fk in fkMap){
            closure(fk);
        }
    })
    return this;
};
KeyMan.prototype.eachKeyMap = function(closure){
    for (var keyMap in this.keyMaps){
        closure(keyMap);
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


KeyMan.prototype.getIndexedKeyCount = function(functionKeyType){
    // return this.system.getIndexedKeyCount(functionKeyType) + this.user.getIndexedKeyCount(functionKeyType);
    return getData(this.keyMapClusters).sum(function(id, cluster){
        return cluster.getIndexedKeyCount(functionKeyType);
    });
};
// KeyMan.prototype.getIndexedShortcutKeyCount = function(){
//     return this.system.getIndexedShortcutKeyCount() + this.user.getIndexedShortcutKeyCount();;
// };
// KeyMan.prototype.getIndexedCommandKeyCount = function(){
//     return this.system.getIndexedCommandKeyCount() + this.user.getIndexedCommandKeyCount();
// };
// KeyMan.prototype.getIndexedTypingKeyCount = function(){
//     return this.system.getIndexedTypingKeyCount() + this.user.getIndexedTypingKeyCount();
// };

KeyMan.prototype.clearKeyDownedMap = function(){
    for (var upperKey in this.downedKeyMap){
        delete this.downedKeyMap[upperKey];
    }
};


KeyMan.prototype.judgeKeyHandlerType = function(functionKey){
    var resultKeyHandlerType;
    var keyHandler;
    for (var keyHandlerName in this.keyHandlers){
        keyHandler = this.keyHandlers[keyHandlerName];
        if (keyHandler.checkMyTypeByFunctionKey(functionKey)){
            resultKeyHandlerType = keyHandler.type;
            break;
        }
    }
    return resultKeyHandlerType;
};
KeyMan.prototype.correctKeys = function(keys, type){
    var correctedKeys = keys;
    var keyHandler = this.getKeyHandler(type);
    if (keyHandler){
        correctedKeys = keyHandler.correctKeys(keys);
    }
    return correctedKeys;
};











/****************************************************************************************************
 *
 *
 * FunctionKey
 *
 *
 ****************************************************************************************************/
KeyMan.FunctionKey = function(object){
    // SjEvent.apply(this, arguments);
    this._id = getData().createUUID();
    this.id;
    this.name;
    this.title = 'No Title';
    this.type = KeyMan.TYPE_NONE;
    this.group = null;
    this.icon = null;
    this.sequence = -1;

    this.modeLock = false;
    this.modeEditable = true;
    this.modeRemovable = true;
    this.runner = null; //Event Code or Function or Runner
    this.data = ''; //User set parameter for runner
    this.keys = null; //KeyMan Expression
    this.keydown = null; //Event Function
    this.keypress = null; //Event Function
    this.keyup = null; //Event Function
    // this.execute = null;

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
    var keyman = this.keyman;
    this.originKeys = this.keys;
    var keys = this.keys = KeyMan.convertToRightKeyFromKeys(this.originKeys);
    // var keyCodes = this.convertToKeyCodesFrom(keys);
    this.keyStepList = (keys) ? KeyMan.parseToKeyStepList(keys) : [];

    /** EventHandler **/
    // console.error('////////////////////////', this.type, this.keys, this.keyStepList);
    if (this.type === null || this.type === undefined || this.type === KeyMan.TYPE_NONE){
        if (keyman !== null && keyman !== undefined)
            this.type = keyman.judgeKeyHandlerType(this);
    }
    // console.error('////////////////////////', this.type);
    if (this.type !== null && this.type !== undefined){
        if (keyman !== null && keyman !== undefined)
            this.keys = keyman.correctKeys(this.keys, this.type);
    }
    return this;
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
KeyMan.FunctionKey.prototype.setType = function(type){
    this.type = type;
    return this;
};
KeyMan.FunctionKey.prototype.setIcon = function(icon){
    this.icon = icon;
    return this;
};
KeyMan.FunctionKey.prototype.setGroup = function(group){
    this.group = group;
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
    this.type = _data.type;
    this.group = _data.group;
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
            group: this.group,
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
        this.parent.getFunctionKeys()
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
KeyMan.FunctionKey.prototype.hasKey = function(checkKey){
    var keys = this.keys;
    for (var i=0, key; i<keys.length; i++){
        // keyStep = keys[i];
        // if (keyStep.hasKey(checkKey))
        //     return true;
        key = keys[i];
        if (key == checkKey)
            return true;
    }
    return false;
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
    checkNumber = (checkNumber) ? checkNumber : 0;
    //- Make new title
    var oldTitle = _data.title;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    //- Naver duplicated title
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.FunctionKey.copy(_data, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('[FunctionKey] Copy', newTitle, parentRepoMap);
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
    this.order = -1;
    this.modeLock = false;
    this.modeEditable = true;
    this.modeRemovable = true;

    //_
    this.functionKeys = {};
    this.parent; //KeyMapCluster
    this.keyman; //KeyMan

    //_
    this.tempCopy;
    this.statusDuplicated;
    this.statusNew;
    this.statusSelectedOnMultiMap;
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
    getData(_data.functionKeys).each(function(fKeyId, fKeyData){
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
            functionKeys: getData(this.getFunctionKeys()).collectMap(function(fKeyId, fKey){
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
        this.parent.getKeyMaps()
    );
};
KeyMan.KeyMap.prototype.traverse = function(callback){
    getData(this.getFunctionKeys()).any(function(keyObjectId, keyObject){
        callback(keyObject);
    });
    return this;
};


KeyMan.KeyMap.prototype.isOn = function(shortcutFunctionKeyId){
    var functionKey = this.get(shortcutFunctionKeyId);
    return (functionKey !== null && functionKey !== undefined) ? functionKey.isPressed() : false;
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
    if (functionKey instanceof KeyMan.KeyMap){
        var that = this;
        var keyMap = functionKey;
        keyMap.traverse(function(fk){
            that.add(fk);
        });
        return this;
    }
    if ( !(functionKey instanceof KeyMan.FunctionKey) )
        functionKey = new KeyMan.FunctionKey(functionKey);
    if (this.has(functionKey))
        throw 'Already exists function-key.';
    this.set(functionKey);
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
        // functionKeyId = getData(this.functionKeys).find(functionKey);
        functionKeyId = getEl(this.getFunctionKeys()).findAll(functionKey);
        if (functionKeyId.length > 0){
            functionKeyId = functionKeyId[0].id;
        }else{
            return null;
        }
    }
    return this.functionKeys[functionKeyId];
};
KeyMan.KeyMap.prototype.getByTitle = function(functionKey){
    if (!functionKey)
        return;
    var keyTitle = '';
    if (typeof functionKey == 'string')
        keyTitle = functionKey;
    else if (functionKey instanceof KeyMan.FunctionKey)
        keyTitle = functionKey.title;
    else
        keyTitle = functionKey.title;
    var result = null;
    var fk;
    var functionKeys = this.getFunctionKeys();
    for (var fKeyId in functionKeys){
        fk = functionKeys[fKeyId];
        if (keyTitle == fk.title){
            result = fk;
            break;
        }
    }
    return result;
};
KeyMan.KeyMap.prototype.getFunctionKeys = function(){
    return this.functionKeys;
};
KeyMan.KeyMap.prototype.set = function(functionKey){
    this.functionKeys[functionKey.id] = functionKey;
    return this;
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
    delete this.functionKeys[functionKey.id];
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
    var keyMap = this.getKeys();
    for (var keyId in keyMap){
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
    var functionKeys = this.getFunctionKeys();
    console.error('7777', functionKeys);
    for (var keyId in functionKeys){
        keyObject = functionKeys[keyId];
        keyObject.setup(keyman);
    }
    return this;
};
KeyMan.KeyMap.prototype.unsetup = function(){
    console.error('[KeyMap] unsetup...', this);
    var keyObject;
    var functionKeys = this.getFunctionKeys();
    for (var keyId in functionKeys){
        keyObject = functionKeys[keyId];
        keyObject.unsetup();
    }
    return this;
};

KeyMan.KeyMap.copy = function(_data, parentRepoMap, checkNumber){
    checkNumber = (checkNumber) ? checkNumber : 0;
    //- Make new title
    var oldTitle = _data.title;
    var newTitle = (checkNumber) ? oldTitle + '_' + checkNumber : oldTitle;
    //- Naver duplicated title
    for (var id in parentRepoMap){
        var item = parentRepoMap[id];
        if (item.title == newTitle)
            return KeyMan.KeyMap.copy(_data, parentRepoMap, checkNumber +1);
    }
    //- Clone
    console.error('COPY!! title=', newTitle, parentRepoMap);
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
    this.order = -1;
    this.modeLock = false;
    this.modeAutoSave = false;
    this.modeMultiMap = false;
    this.keyMapSelectedWhenMultiMapMode = null;
    this.storagePath = 'keyman';

    /** _FunctionKey **/
    this.keyMaps = {};
    this.targetKeyMapId = getData().createUUID();
    this.orderedKeyMaps = []; //TODO: 이거 뭐야?
    //_
    this.parent = null; //KeyMan
    this.keyman = null; //KeyMan
    this.length = 0;
    //_Index
    this.inversionIndexedFunctionKeyIdMapMapMap = {};

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

KeyMan.KeyMapCluster.prototype.setup = function(keyman){
    if (this.keyman){
        console.error('[KeyMapCluster] setup... Already Setuped !!', this);
        return this;
    }
    if (!keyman)
        return this;
    console.error('[KeyMapCluster] setup... ', this);
    this.setKeyMan(keyman);
    var keyMaps = this.getKeyMaps();
    var keyMap;
    for (var keyMapId in keyMaps){
        keyMap = keyMaps[keyMapId];
        keyMap.setup(keyman);
    }
    return this;
};
KeyMan.KeyMapCluster.prototype.unsetup = function(){
    var keyMaps = this.getKeyMaps();
    var keyMap;
    for (var keyMapId in keyMaps){
        keyMap = keyMaps[keyMapId];
        keyMap.unsetup();
    }
    return this;
};

KeyMan.KeyMapCluster.prototype.setId = function(id){
    this.id = id
    if (this.targetKeyMapId == null){
        this.targetKeyMapId = id + '_default_fk';
    }
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
    if (getData(_data.keyMaps).isEmpty()){
        this.newKeyMap();
    }else{
        getData(_data.keyMaps).each(function(keyMapId, keyMapData){
            that.addKeyMap( new KeyMan.KeyMap().loadData(keyMapData) );
        });
    }
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
            keyMaps: getData(this.keyMaps).collectMap(function(k, v){
                return {
                    key: k,
                    value: v.extractData()
                };
            })
        }
    };
};
KeyMan.KeyMapCluster.prototype.extractMetaData = function(){
    return {
        keyMapNameList: getData(this.keyMaps).collect(function(k, v){
            return k;
        }),
        modeLock: this.modeLock
    };
};
KeyMan.KeyMapCluster.prototype.importData = function(dataObject){
    var that = this;
    this.clearKeyMaps();
    if (dataObject.objectType == 'keymap-cluster'){
        getData(dataObject._data.keyMaps).each(function(keyMapId, keyMapData){
            var keyMap = new KeyMap({id:keyMapId});
            that.addKeyMap( keyMap.importData(keyMapData) );
        });
    }
};

KeyMan.KeyMapCluster.prototype.traverse = function(callback){
    getData(this.keyMaps).any(function(keyMapId, keyMap){
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
    if (keyObject instanceof KeyMan.KeyMap){
        this.addKeyMap(keyObject);
    }else if (keyObject instanceof KeyMan.FunctionKey){
        this.getTargetKeyMap().add(keyObject);
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
    var keyMaps = this.getKeyMaps();
    for (var keyMapId in keyMaps){
        this.remove(keyMapId);
    }
    return this;
};


KeyMan.KeyMapCluster.prototype.getKeyMap = function(keyMap){
    if (!keyMap)
        return;
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else
        id = keyMap;
    return this.keyMaps[id];
};
KeyMan.KeyMapCluster.prototype.getFirst = function(){
    var keyMaps = this.getKeyMaps();
    var keyMapIdList = Object.keys(keyMaps);
    return this.getKeyMap(keyMapIdList[0]);
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
    for (var kmId in this.keyMaps){
        km = this.keyMaps[kmId];
        if (keyMapTitle == km.title){
            result = km;
            break;
        }
    }
    return result;
};
KeyMan.KeyMapCluster.prototype.getKeyMaps = function(){
    return this.keyMaps;
};
KeyMan.KeyMapCluster.prototype.getTargetKeyMap = function(){
    var keyMap = this.getKeyMap(this.targetKeyMapId);
    if (keyMap === null || keyMap === undefined){
        if (this.targetKeyMapId === null || this.targetKeyMapId === undefined){
            if (this.hasAnyKeyMap()){
                keyMap = this.getFirst();
                console.debug('[KeyMapCluster:' +this.id+ '] Targeting automatically. ', keyMap);
            }else{
                keyMap = this.newKeyMap();
                console.debug('[KeyMapCluster:' +this.id+ '] Generated automatically. ', keyMap);
            }
            this.setTargetKeyMap(keyMap);
        }else{
            keyMap = this.newKeyMap({id:this.targetKeyMapId});
            console.debug('[KeyMap:' +this.id+ '] Generated automatically. ', keyMap);
        }
    }
    return keyMap;
};
KeyMan.KeyMapCluster.prototype.setKeyMap = function(keyMap){
    this.clearKeyMaps();
    this.addKeyMap(keyMap);
    //Setup targetKeyMapId
    var targetKeyMapId = null;
    var keyMaps = this.getKeyMaps();
    var keyMapLength = Object.keys(keyMaps).length;
    if (keyMapLength > 0){
        for (var keyMapId in keyMaps){
            targetKeyMapId = keyMapId;
            break;
        }
    }
    this.targetKeyMapId = targetKeyMapId;
    return this;
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
KeyMan.KeyMapCluster.prototype.newKeyMap = function(object){
    var newKeyMap = new KeyMan.KeyMap(object);
    this.addKeyMap( newKeyMap );
    return newKeyMap;
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
        for (var keyMapId in cluster.keyMaps){
            this.addKeyMap(cluster.keyMaps[keyMapId]);
        }
        return this;
    }else if (keyMap instanceof KeyMan.KeyMap){
        if (this.hasKeyMap(keyMap))
            return this;
        if (this.keyMaps == null)
            this.keyMaps = {};
        this.keyMaps[keyMap.id] = keyMap;
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
        this.newKeyMap({id:keyMap});
        return this;
    }else{
        throw KeyMan.KeyMapCluster.ERROR_001;
    }
    /** Check Indexing **/
    // this.addIndex(keyMap);
    /** Save Auto **/
    this.saveAuto();
    console.debug('[KeyMap] added ' +keyMap.title, keyMap, this.keyMaps, this.parent);
    return this;
};
KeyMan.KeyMapCluster.prototype.hasKeyMap = function(keyMap){
    return !!this.getKeyMap(keyMap);
};
KeyMan.KeyMapCluster.prototype.hasAnyKeyMap = function(){
    return (this.keyMaps !== null) && Object.keys(this.keyMaps).length > 0;
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
    delete this.keyMaps[id];
    this.length--;
    /** Check selected map **/
    if (this.length == 0)
        this.selectKeyMapOnMultiMapMode(null);
    /** Event **/
    if (this.parent)
        this.parent.execEventListenerByEventName(KeyMan.EVENT_REMOVEDMAP, keyMap);
    /** Save Auto **/
    this.saveAuto();
    /** null **/
    keyMap.setParent(null).setKeyMan(null);
    return this;
};
KeyMan.KeyMapCluster.prototype.clearKeyMaps = function(){
    var keyMaps = this.getKeyMaps();
    for (var keyMapId in keyMaps){
        this.removeKeyMap(keyMapId);
    }
    return this;
};

KeyMan.KeyMapCluster.prototype.getIndexedKeyMap = function(type){
    var inversionIndexedFunctionKeyIdMapMap = this.inversionIndexedFunctionKeyIdMapMapMap[type];
    if (!inversionIndexedFunctionKeyIdMapMap){
        inversionIndexedFunctionKeyIdMapMap = this.inversionIndexedFunctionKeyIdMapMapMap[type] = {};
    }
    return inversionIndexedFunctionKeyIdMapMap;
};
KeyMan.KeyMapCluster.prototype.getIndexedKeyCount = function(type){
    var inversionIndexedFunctionKeyIdMapMap = this.getIndexedKeyMap(type)
    var inversionIndexedFunctionKeyIdMap = Object.keys(inversionIndexedFunctionKeyIdMapMap);
    var length = inversionIndexedFunctionKeyIdMap.length
    return length;
};

KeyMan.KeyMapCluster.prototype.addIndex = function(functionKey){
    if (functionKey instanceof KeyMan.KeyMap){
        var keyMap = functionKey;
        for (var functionKeyId in keyMap.keyMap){
            this.addIndex(keyMap.keyMap[functionKeyId]);
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
        for (var functionKeyId in keyMap.keyMap){
            this.removeIndex(keyMap.keyMap[functionKeyId]);
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
            var keyMap = inversionIndexedSomeFunctionKeyIdMapMap[key];
            delete keyMap[functionKey.id];
            if (Object.keys(keyMap).length == 0)
                delete inversionIndexedSomeFunctionKeyIdMapMap[key];
        }
    }
    return this;
};

KeyMan.KeyMapCluster.prototype.isOn = function(downedShortcutKeyId){ //TODO: 조금 이상하다!? 다시 확인 필요.
    var keyMap;
    for (var keyMapId in this.keyMaps){
        keyMap = this.keyMaps[keyMapId];
        if (keyMap.isOn(downedShortcutKeyId)){
            return true;
        }
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



/****************************************************************************************************
 *
 *
 * FunctionKeyMapCluster
 *
 *
 ****************************************************************************************************/
KeyMan.FunctionKeyMapCluster = getClazz(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
    this.id = 'function';
    this.name = 'function';
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();



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
    if (keyMap instanceof KeyMan.KeyMapCluster){
        var cluster = keyMap;
        for (var keyMapId in cluster.keyMaps){
            this.addFunctionKeyMap(cluster.keyMaps[keyMapId]);
        }
        return this;
    }
    this.addFunctionKeyMap(keyMap);
    return this;
};
KeyMan.Storage.prototype.removeKeyMap = function(keyMap){ //- Just unstore
    this.removeFunctionKeyMap(keyMap);
    return this;
};

KeyMan.Storage.prototype.addFunctionKeyMap = function(keyMap){ //- Just store
    if (keyMap instanceof Array){
        for (var i=0; i<keyMap.length; i++){
            this.addKeyMap(keyMap[i]);
        }
        return this;
    }
    if (this.hasKeyMap(keyMap))
        return this;
    //Add keyMap
    if (this.keyMaps == null)
        this.keyMaps = {};
    this.keyMaps[keyMap.id] = keyMap;
    this.length++;
    return this;
};
KeyMan.Storage.prototype.removeFunctionKeyMap = function(keyMap){ //- Just unstore
    var id = null;
    if (keyMap instanceof KeyMan.KeyMap)
        id = keyMap.id;
    else{
        id = keyMap;
        keyMap = this.getKeyMap(id);
    }
    if (!this.hasKeyMap(keyMap))
        return this;
    //Remove keyMap
    delete this.keyMaps[id];
    this.length--;
    return this;
};



/****************************************************************************************************
 *
 *
 * KeyType
 *
 *
 ****************************************************************************************************/
KeyMan.KeyType = function(keyman){
    this.name = 'rome';
    this.type = 'rome';
    this.iconText = 'A';

    this.keyman = keyman;
    this.init();
};
KeyMan.KeyType.prototype.init = function(){
    //Implements..
};
KeyMan.KeyType.prototype.setup = function(){
    //Implements..
};
KeyMan.KeyType.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyType.prototype.getIconText = function(){
    return this.iconText;
};
KeyMan.KeyType.prototype.convertKeyToKey = function(eventData){
    var convertedKey;
    var key = eventData.key;
    var keyName = eventData.event.key;
    var upperKey = eventData.upperKey;
    var shiftPressed = eventData.event.shiftKey;

    if (upperKey == KeyMan.SPACE){
        convertedKey = " ";
    }else if (key != null && key.length == 1){
        convertedKey = keyName;
    }
    return convertedKey;
};
KeyMan.KeyType.prototype.assemble = function(convertedKey, currentKeyStepProcess, eventData){
    var newKeySteps = [
        new KeyMan.KeyStep()
                .add(convertedKey)
                .setAssembledChar(convertedKey)
                .setStatusCompleteChar(true)
    ];
    return newKeySteps;
};




/****************************************************************************************************
 *
 *
 * KeyHandler
 *
 *
 ****************************************************************************************************/
KeyMan.KeyHandler = function(object){
    this.name = 'No Name';
    this.type = 'No Type';

    this.order = -1;
    this.keyman;
    // this.timeForContinuousInspection = 300;
    this.timeForContinuousInspection = 1000;
    this.timeForJudgmentSimultaneousKeyPress = 100;
    this.indexedFunctionKeyBufferMap = [];
    this.matchingStartKeyStepIndex = -1;
    this.matchingProcessKeyStepIndex = -1;
    //Event Handler
    this.beforeKeydownEventHandler = null;
    this.keydownEventHandler = null;
    this.beforeKeyupEventHandler = null;
    this.keyupEventHandler = null;

    //TODO: 추후

    this.init();
};
KeyMan.KeyHandler.prototype.init = function(){
    //Implements..
};
KeyMan.KeyHandler.prototype.setup = function(keyman){
    this.keyman = keyman;
    //Implements..
    return this;
};
KeyMan.KeyHandler.prototype.unsetup = function(){
    this.keyman = null;
    //Implements..
    return this;
};
KeyMan.KeyHandler.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyHandler.prototype.setParent = function(parent){
    this.parent = parent;
    return this;
};

KeyMan.KeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    //Implements..
    return false;
};
KeyMan.KeyHandler.prototype.correctKeys = function(keys){
    //Implements..
    return keys;
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

KeyMan.KeyHandler.prototype.keydown = function(eventData){
    //Implements..
};
KeyMan.KeyHandler.prototype.beforeKeydown = function(eventData){
    //Implements..
};
KeyMan.KeyHandler.prototype.keyup = function(eventData){
    //Implements..
};
KeyMan.KeyHandler.prototype.beforeKeyup = function(eventData){
    //Implements..
};


KeyMan.KeyHandler.prototype.addKeyStep = function(keyStep){
    if (keyStep instanceof Array){
        for (var i=0; i<keyStep.length; i++){
            this.addKeyStep(keyStep[i]);
        }
        return;
    }
    this.keyStepProcessList.push(keyStep);
};
KeyMan.KeyHandler.prototype.removeKeyStep = function(keyStep){
    if (keyStep instanceof Array){
        for (var i=0; i<keyStep.length; i++){
            this.removeKeyStep(keyStep[i]);
        }
        return;
    }
    var index;
    if (keyStep instanceof KeyMan.KeyStep){
        index = this.keyStepProcessList.indexOf(keyStep);
    }else{
        index = keyStep;
    }
    this.keyStepProcessList.splice(index, 1);
};



/****************************************************************************************************
 *
 *
 * KeyStep
 *
 *
 ****************************************************************************************************/
KeyMan.KeyStep = function(keys){
    this.assembledChar = '';
    this.keys = keys ? keys : [];
    this.length = keys ? keys.length : 0;
    this.status = KeyMan.KeyStep.STATUS_NONE;
    this.statusCompleteChar = false;

    this.makingAssembledCharProgress = [];
};
KeyMan.KeyStep.STATUS_NONE = 0;
KeyMan.KeyStep.STATUS_CHECKING = 1;
KeyMan.KeyStep.STATUS_CHECKED = 2;
KeyMan.KeyStep.STATUS_RUN = 3;

KeyMan.KeyStep.prototype.setStatus = function(status){
    this.status = status;
    return this;
};
KeyMan.KeyStep.prototype.checkStatus = function(status){
    return this.status == status;
};
KeyMan.KeyStep.prototype.getStatusCompleteChar = function(){
    return this.statusCompleteChar;
};
KeyMan.KeyStep.prototype.setStatusCompleteChar = function(statusCompleteChar){
    this.statusCompleteChar = statusCompleteChar
    return this;
};

KeyMan.KeyStep.prototype.add = function(key){
    this.keys.push(key);
    this.length += 1;
    return this;
};
KeyMan.KeyStep.prototype.set = function(key){
    if (key instanceof Array){
        this.keys = key;
    }else{
        this.keys = [key];
    }
    this.countKeys();
    return this;
};
KeyMan.KeyStep.prototype.pop = function(){
    if (this.length == 0)
        return null;
    var key = this.keys.pop();
    this.length -= 1;
    return key;
};
KeyMan.KeyStep.prototype.get = function(index){
    return this.keys[index];
};
KeyMan.KeyStep.prototype.getKeys = function(){
    return this.keys;
};
KeyMan.KeyStep.prototype.countKeys = function(){
    this.length = this.keys.length;
    return this.length;
};
KeyMan.KeyStep.prototype.hasKey = function(checkKey){
    for (var i=0; i<this.keys.length; i++){
        if (checkKey == this.keys[i])
            return true;
    }
    return false;
};


KeyMan.KeyStep.prototype.getAssembledChar = function(){
    return this.assembledChar;
};
KeyMan.KeyStep.prototype.setAssembledChar = function(assembledChar){
    this.assembledChar = assembledChar;
    return this;
};
KeyMan.KeyStep.prototype.saveProgress = function(){
    var assembledChar = this.getAssembledChar();
    if (this.makingAssembledCharProgress.length == 0){
        this.makingAssembledCharProgress.push(assembledChar);
    }else{
        var lastIndex = this.makingAssembledCharProgress.length -1;
        var lastAssembledChar = this.makingAssembledCharProgress[lastIndex];
        if (lastAssembledChar != assembledChar){
            this.makingAssembledCharProgress.push(assembledChar);
        }
    }
    return this;
};
KeyMan.KeyStep.prototype.popProgress = function(){
    var popedAssembledChar = this.makingAssembledCharProgress.pop();
    if (this.makingAssembledCharProgress.length == 0){
        //None
    }else{
        var lastIndex = this.makingAssembledCharProgress.length -1;
        var lastAssembledChar = this.makingAssembledCharProgress[lastIndex];
        this.setAssembledChar(lastAssembledChar);
    }
    return popedAssembledChar;
};

KeyMan.KeyStep.prototype.equals = function(keyStep){
    if (!keyStep || keyStep.length != this.length)
        return false;
    for (var i=0; i<keyStep.length; i++){
        if (keyStep.get(i) != this.get(i))
            return false;
    }
    return true;
};
KeyMan.KeyStep.prototype.in = function(keyStep, number){
    if (!keyStep || keyStep.length < this.length)
        return false;
    for (var i=0, matchedCount=0; i<keyStep.length; i++){
        if (keyStep.get(i) == this.get(i)){
            if (++matchedCount == number)
                return true;
        }
    }
    return false;
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


KeyMan.prototype.getDefaultKeyHandler = function(){
    return this.getKeyHandlerByType(this.defaultKeyHandlerType);
};

KeyMan.prototype.getKeyHandlerNames = function(){
    return getData(this.keyHandlers).collect(function(type, keyHandler){ return keyHandler.name; });
};

KeyMan.prototype.getKeyHandlerTypes = function(){
    return getData(this.keyHandlers).collect(function(type, keyHandler){ return keyHandler.type; });
};

KeyMan.prototype.getKeyHandlerByType = function(findingType){
    return this.keyHandlers[findingType];
};

KeyMan.prototype.getKeyHandlerByName = function(findingName){
    return getData(this.keyHandlers).find(function(type, keyHandler){ return keyHandler.name == findingName; });
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



