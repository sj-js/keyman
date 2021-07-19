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
 * CommandKeyHandler
 *
 *************************/
KeyMan.CommandKeyHandler = getClazz(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
    //Meta
    this.name = KeyMan.CommandKeyHandler.TYPE;
    this.type = KeyMan.CommandKeyHandler.TYPE;

    //Test - Process
    this.keyOrderList = [];
    this.keyStepProcessList = [];
    // this.keyStepIndex = -1;
    this.currentKeyStepProcess = null;

    /** Status **/
    this.lastKey = null;
    this.lastKeySize = null;
    this.lastKeyDownTime = null;
    this.lastDownKey = null;
    this.statusPressed = false;
    // this.timer = null;
})
.extend(KeyMan.KeyHandler)
.returnFunction();

KeyMan.CommandKeyHandler.TYPE = 'COMMAND';
KeyMan.CommandKeyHandler.EVENT_COMMANDKEYDOWN = 'commandkeydown';
KeyMan.CommandKeyHandler.EVENT_COMMANDKEYUP = 'commandkeyup';

KeyMan.CommandKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
};

KeyMan.CommandKeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    return (functionKey.keys instanceof Array && functionKey.keys.length > 0 && functionKey.keys[0] instanceof Array)
        && (functionKey.keyStepList.length > 1)
        ;
};


KeyMan.CommandKeyHandler.prototype.beforeKeydown = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    //Check Pressed - Not allowed
    this.statusPressed = !!this.keyman.downedKeyMap[upperKey];
};
KeyMan.CommandKeyHandler.prototype.keydown = function(eventData){
    var that = this;
    var keyman = this.keyman;

    //Check Pressed - Not allowed
    if (that.statusPressed)
        return false;

    var upperKey = eventData.upperKey;
    this.doKeydown(upperKey)
};
KeyMan.CommandKeyHandler.prototype.beforeKeyup = function(eventData){
    //None
};
KeyMan.CommandKeyHandler.prototype.keyup = function(eventData){
    var that = this;
    var keyman = this.keyman;

    var upperKey = eventData.upperKey;
    this.doKeyup(upperKey);
};



KeyMan.CommandKeyHandler.prototype.doKeydown = function(upperKey){
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
    that.addKeyToCommandChecker(upperKey, connectionTime, downedKeyList);
    that.lastKey = upperKey;
    that.lastKeySize = downedKeySize;
    that.lastKeyDownTime = currentTime;
    that.lastDownKey = upperKey;
    //Run when KeyStep == KeyOrderList == KeyStepProcess
    that.execute(keyman.mainClusterList, that.keyStepProcessList, that.keyOrderList);
    /** Event **/
    keyman.execEventListenerByEventName(KeyMan.CommandKeyHandler.EVENT_COMMANDKEYDOWN, {
        keyStepList: this.keyStepProcessList,
        indexedFunctionKeyBufferMap: this.indexedFunctionKeyBufferMap,
        matchingStartKeyStepIndex: this.matchingStartKeyStepIndex,
        matchingProcessKeyStepIndex: this.matchingProcessKeyStepIndex
    });
};

KeyMan.CommandKeyHandler.prototype.doKeyup = function(upperKey){
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
    keyman.execEventListenerByEventName(KeyMan.CommandKeyHandler.EVENT_COMMANDKEYUP, {
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
    // this.testShow();
};
KeyMan.CommandKeyHandler.prototype.clearDefinedKey = function(){
    this.keyStepProcessList = [];
    this.keyOrderList = [];
    this.lastKey = null;
    this.lastDownKey = null;
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
            inversionIndexedFunctionKeyMapMap = currentKeyCluster.getIndexedKeyMap(this.type);
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
            console.error('COMMAND ?????', fKeyFound.keyStepList.length -1, this.matchingProcessKeyStepIndex, keyStepProcess, keyStepFound);
            if (keyStepProcess.equals(keyStepFound)){
                keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKING);
                var statusAllMatching = fKeyFound.keyStepList.length -1 == this.matchingProcessKeyStepIndex;
                if (statusAllMatching && !fKeyFound.modeLock){
                    this.checkKeyStepList(keyStepProcessList);
                    this.executeFunctionKey(fKeyFound);
                }else{
                    newIndexedFunctionKeyBufferMap.push(fKeyFound); //Collecting next matching KeyStepList
                }
                break;
            }
        }
        if (newIndexedFunctionKeyBufferMap.length == 0)
            this.matchingStartKeyStepIndex = -1;
    }

    this.indexedFunctionKeyBufferMap = newIndexedFunctionKeyBufferMap;
    console.error('buffer', keyStepProcessIndex, newIndexedFunctionKeyBufferMap, indexedFunctionKeyBufferMap.length, 'Next=', this.matchingStartKeyStepIndex);

    console.debug('[Command buffer]', this.indexedFunctionKeyBufferMap);
    return this;
};
KeyMan.CommandKeyHandler.prototype.checkKeyStepList = function(keyStepProcessList){
    for (var i=keyStepProcessList.length -1, KeyStep; i>-1; i--){
        KeyStep = keyStepProcessList[i];
        if (KeyStep.checkStatus(KeyMan.KeyStep.STATUS_CHECKED))
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
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_EXECUTE, {
            keyStepList: this.keyStepProcessList,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Command)] ', functionKey);
};