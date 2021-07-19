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



/*************************
 *
 * ShortcutKeyHandler
 *
 *************************/
KeyMan.ShortcutKeyHandler = getClazz(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
    //Meta
    this.name = KeyMan.ShortcutKeyHandler.TYPE;
    this.type = KeyMan.ShortcutKeyHandler.TYPE;
})
.extend(KeyMan.KeyHandler)
.returnFunction();

KeyMan.ShortcutKeyHandler.TYPE = 'SHORTCUT';
KeyMan.ShortcutKeyHandler.EVENT_SHORTCUTKEYDOWN = 'shortcutkeydown';
KeyMan.ShortcutKeyHandler.EVENT_SHORTCUTKEYUP = 'shortcutkeyup';

KeyMan.ShortcutKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
};

KeyMan.ShortcutKeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    return (functionKey.keys instanceof Array && functionKey.keys.length > 0)
        && (functionKey.keyStepList.length == 1)
        ;
};
KeyMan.ShortcutKeyHandler.prototype.correctKeys = function(keys){
    if (keys && keys.length == 1 && keys[0] instanceof Array){
        keys = keys[0];
    }
    return keys;
};



KeyMan.ShortcutKeyHandler.prototype.beforeKeydown = function(eventData){
    //Implements..
};
KeyMan.ShortcutKeyHandler.prototype.keydown = function(eventData){
    var upperKey = eventData.upperKey;
    this.doKeydown(upperKey);
};
KeyMan.ShortcutKeyHandler.prototype.beforeKeyup = function(eventData){
    //Implements..
};
KeyMan.ShortcutKeyHandler.prototype.keyup = function(eventData){
    var upperKey = eventData.upperKey;
    this.doKeyup(upperKey);
};



KeyMan.ShortcutKeyHandler.prototype.doKeydown = function(upperKey){
    var that = this;
    var keyman = this.keyman;
    //Check Time
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    //Check Key
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var keySize = downedKeyList.length;
    that.lastKey = upperKey;
    that.lastKeySize = keySize;
    that.lastKeyDownTime = currentTime;
    /** Event **/
    keyman.execEventListenerByEventName(KeyMan.ShortcutKeyHandler.EVENT_SHORTCUTKEYDOWN, {
        keyStepList: [new KeyMan.KeyStep(downedKeyList)]
    });
    that.execute(keyman.mainClusterList, upperKey);
};
KeyMan.ShortcutKeyHandler.prototype.doKeyup = function(upperKey){
    var that = this;
    var keyman = this.keyman;

    //Check Keyup
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var nowKeySize = downedKeyList.length;
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
    keyman.execEventListenerByEventName(KeyMan.ShortcutKeyHandler.EVENT_SHORTCUTKEYUP, {
        keyStepList: that.keyStepProcessList
    });
};



KeyMan.ShortcutKeyHandler.prototype.execute = function(keyMapClusterList, upperKey){
    var keyman = this.keyman;
    for (var i=0, keyMapCluster; i<keyMapClusterList.length ;i++){
        keyMapCluster = keyMapClusterList[i];
        if (keyMapCluster.modeLock)
            return;
        var indexedFunctionKeyMap = keyMapCluster.getIndexedKeyMap(this.type);
        var functionKeyMap = indexedFunctionKeyMap[upperKey];
        var fk;
        for (var keyId in functionKeyMap){
            fk = functionKeyMap[keyId];
            if (!keyman.isOnKeys(fk)){
                fk.unpress();
                continue;
            }
            //Run Shortcut
            if (!fk.modeLock && !fk.isPressed()){
                fk.press();
                this.executeFunctionKey(fk, keyMapCluster);
                this.indexedFunctionKeyBufferMap.push(fk);
            }
        }
    }
};
KeyMan.ShortcutKeyHandler.prototype.executeFunctionKey = function(functionKey, keyMapCluster){
    if (!keyMapCluster)
        keyMapCluster = functionKey.parent.parent;
    if (keyMapCluster && keyMapCluster.modeMultiMap){
        if (functionKey.parent.id != keyMapCluster.keyMapSelectedWhenMultiMapMode)
            return;
    }
    functionKey.execute();
    if (this.keyman){
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_EXECUTE, {
            keyStepList: null,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Shortcut)] ', functionKey);
};



