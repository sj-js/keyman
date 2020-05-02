/*************************
 *
 * CommandKeyHandler
 *
 *************************/
KeyMan.CommandKeyHandler = getClazz(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
    //Test - Process
    this.keyOrderList = [];
    this.keyStepProcessList = [];
    // this.keyStepIndex = -1;
    this.currentKeyStepProcess = null;

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
    this.setKeydownEventHandler(function(eventData){
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
    var downedKeySize = downedKeyList.length;
    //Save Key
    that.addKeyToCommandChecker(key, connectionTime, downedKeyList);
    that.lastKey = key;
    that.lastKeySize = downedKeySize;
    that.lastKeyDownTime = currentTime;
    //Run when KeyStep == KeyOrderList == KeyStepProcess
    that.execute(keyman.mainClusterList, that.keyStepProcessList, that.keyOrderList);
    // that.checkTimer();
    /** Event **/
    keyman.execEventListenerByEventName('commandkeydown', {
        keyStepList: this.keyStepProcessList,
        indexedFunctionKeyBufferMap: this.indexedFunctionKeyBufferMap,
        matchingStartKeyStepIndex: this.matchingStartKeyStepIndex,
        matchingProcessKeyStepIndex: this.matchingProcessKeyStepIndex
    });
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
    this.matchingStartKeyStepIndex = -1;
    this.matchingProcessKeyStepIndex = -1;
    console.debug('DownedKey (Clean)', this.keyOrderList);
};
KeyMan.CommandKeyHandler.prototype.execute = function(keyClusterList, keyStepProcessList, keyOrderList){
    var newIndexedFunctionKeyBufferMap = [];
    var keyStepLength = keyStepProcessList.length;
    var keyStepProcessIndex = keyStepLength -1;
    var keyStepProcess = keyStepProcessList[keyStepProcessIndex];
    var indexedFunctionKeyBufferMap = this.indexedFunctionKeyBufferMap;
    if (this.matchingStartKeyStepIndex == -1){ //1
        var inversionIndexedFunctionKeyMapMap;
        for (var k=0, currentKeyCluster; k<keyClusterList.length; k++){
            currentKeyCluster = keyClusterList[k];
            inversionIndexedFunctionKeyMapMap = currentKeyCluster.getIndexedCommandKeyMap();
            var keys = keyStepProcess.keys;
            var keyMap, fKeyFound;
            for (var i=0, key; i<keys.length; i++){
                key = keys[i];
                keyMap = inversionIndexedFunctionKeyMapMap[key];
                console.error('asdf',keyMap);
                if (keyMap){
                    this.matchingProcessKeyStepIndex = 0;
                    //Run - System
                    for (var fKeyId in keyMap){
                        fKeyFound = keyMap[fKeyId];
                        keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKING);
                        if (fKeyFound.keyStepList.length == 1){
                            if (!fKeyFound.modeLock){
                                this.checkKeyStepList(keyStepProcessList);
                                this.executeFunctionKey(fKeyFound);
                            }
                        }else if (fKeyFound.keyStepList.length > 1){
                            this.matchingStartKeyStepIndex = keyStepProcessIndex;
                            newIndexedFunctionKeyBufferMap.push(fKeyFound); //Collecting next matching KeyStepList
                        }
                    }
                }
            }
        }

    }else{ //2...
        this.matchingProcessKeyStepIndex = keyStepProcessIndex - this.matchingStartKeyStepIndex;
        for (var i=0, fKeyFound, keyStepFound; i<indexedFunctionKeyBufferMap.length; i++){
            fKeyFound = indexedFunctionKeyBufferMap[i];
            keyStepFound = fKeyFound.keyStepList[this.matchingProcessKeyStepIndex];
            if (keyStepProcess.equals(keyStepFound)){
                keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKING);
                if (fKeyFound.keyStepList.length -1 == this.matchingProcessKeyStepIndex){
                    if (!fKeyFound.modeLock){
                        this.checkKeyStepList(keyStepProcessList);
                        this.executeFunctionKey(fKeyFound);
                    }
                }else{
                    newIndexedFunctionKeyBufferMap.push(fKeyFound); //Collecting next matching KeyStepList
                }
            }else{
                this.matchingStartKeyStepIndex = -1;
            }
        }
    }

    this.indexedFunctionKeyBufferMap = newIndexedFunctionKeyBufferMap;
    console.debug('[Command buffer]', this.indexedFunctionKeyBufferMap);
    return this;
};
KeyMan.CommandKeyHandler.prototype.checkKeyStepList = function(keyStepProcessList){
    for (var i=keyStepProcessList.length -1, KeyStep; i>-1; i--){
        KeyStep = keyStepProcessList[i];
        if (KeyStep.checkStatus(KeyMan.KeyStep.STATUS_CHECKING))
            KeyStep.setStatus(KeyMan.KeyStep.STATUS_RUN);
        else
            break;
    }
};
KeyMan.CommandKeyHandler.prototype.executeFunctionKey = function(functionKey, keyCluster){
    if (!keyCluster)
        keyCluster = functionKey.parent.parent;
    if (keyCluster && keyCluster.modeMultiMap){
        if (functionKey.parent.id != keyCluster.keyMapSelectedWhenMultiMapMode)
            return;
    }
    functionKey.execute();
    if (this.keyman){
        this.keyman.execEventListenerByEventName('execute', {
            keyStepList: this.keyStepProcessList,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Command)] ', functionKey);
};