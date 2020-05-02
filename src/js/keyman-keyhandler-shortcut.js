/*************************
 *
 * ShortcutKeyHandler
 *
 *************************/
KeyMan.ShortcutKeyHandler = getClazz(function(keyman){
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
    that.execute(keyman.mainClusterList, key);
};
KeyMan.ShortcutKeyHandler.prototype.keyup = function(key){
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
    keyman.execEventListenerByEventName('shortcutkeyup', {
        keyStepList: that.keyStepProcessList
    });
};
KeyMan.ShortcutKeyHandler.prototype.execute = function(keyMapClusterList, key){
    for (var i=0, keyMapCluster; i<keyMapClusterList.length ;i++){
        keyMapCluster = keyMapClusterList[i];
        if (keyMapCluster.modeLock)
            return;
        var indexedFunctionKeyMap = keyMapCluster.getIndexdShortcutKeyMap();
        var functionKeyMap = indexedFunctionKeyMap[key];
        var fk;
        for (var keyId in functionKeyMap){
            fk = functionKeyMap[keyId];
            if (!this.keyman.isOnKeys(fk)){
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
        this.keyman.execEventListenerByEventName('execute', {
            keyStepList: null,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Shortcut)] ', functionKey);
};



