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



KeyMan.TypingKeyHandler = getClazz(function(keyman){
    KeyMan.KeyHandler.apply(this, arguments);
    //Meta
    this.name = KeyMan.TypingKeyHandler.TYPE;
    this.type = KeyMan.TypingKeyHandler.TYPE;

    //Test - Process
    this.keyOrderList = [];
    this.keyStepProcessList = [];
    this.keyStepCursorIndex = 0;
    this.currentKeyStepProcess = null;

    /** Status **/
    this.statusPressed = false;
})
.extend(KeyMan.KeyHandler)
.returnFunction();

KeyMan.TypingKeyHandler.TYPE = 'TYPING';
KeyMan.TypingKeyHandler.EVENT_TYPINGKEYDOWN = 'typingkeydown';
KeyMan.TypingKeyHandler.EVENT_TYPINGKEYUP = 'typingkeyup';

KeyMan.TypingKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
};

KeyMan.TypingKeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    return (typeof functionKey.keyStepList == 'string');
};



KeyMan.TypingKeyHandler.prototype.beforeKeydown = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    //Check Pressed - Not allowed
    this.statusPressed = !!this.keyman.downedKeyMap[upperKey];
};
KeyMan.TypingKeyHandler.prototype.keydown = function(eventData){
    //Check Pressed - Not allowed
    if (this.statusPressed)
        return false;

    var key = eventData.key;
    var upperKey = eventData.upperKey;
    var shiftPressed = eventData.event.shiftKey;
    this.doKeydown(upperKey, eventData)
};
KeyMan.TypingKeyHandler.prototype.beforeKeyup = function(eventData){
    //Implements..
};
KeyMan.TypingKeyHandler.prototype.keyup = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    var shiftPressed = eventData.event.shiftKey;
    this.doKeyup(upperKey)
};



KeyMan.TypingKeyHandler.prototype.doKeydown = function(upperKey, eventData){
    var that = this;
    var keyman = this.keyman;

    //Check Time - Decision 'Continue' and 'Reset'
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    if (that.timeForContinuousInspection < connectionTime){
        that.clearDefinedKey();
    }

    //Save Key
    var modeDeleteFront = upperKey == KeyMan.BACKSPACE;
    var modeDeleteNext = upperKey == KeyMan.DELELTE;
    var convertedKey = keyman.convertKeyToKey(eventData);

    that.lastKey = convertedKey;
    that.lastKeyDownTime = currentTime;

    if (modeDeleteFront || modeDeleteNext){
        //None
    }else if (!convertedKey){
        console.error("What the ignored key!!!??:", convertedKey, eventData);
        return;
    }else{
        //- Make KeyOrderList
        this.keyOrderList.push(convertedKey);
    }

    //- Make KeyStepList
    if (connectionTime < this.timeForJudgmentSimultaneousKeyPress && this.lastKey != convertedKey){
        if (this.currentKeyStepProcess)
            this.currentKeyStepProcess.add(convertedKey);
        console.error("!@#!@# 체크!!@#!@#!@", this.currentKeyStepProcess);
    }else{
        console.error('!!!!!!:', connectionTime, this.currentKeyStepProcess, eventData);
        var cursorIndex = this.getTypingCursorIndex();
        var moveCursorIndex = 0;

        if (modeDeleteFront){ // Like [BACKSPACE]
            moveCursorIndex = this.deleteFront(cursorIndex);
        }else if (modeDeleteNext) { // Like [DELETE]
            moveCursorIndex = this.deleteNext(cursorIndex);
        }else{
            moveCursorIndex = this.insert(convertedKey, cursorIndex, eventData);
        }
        this.setTypingCursorIndex(cursorIndex + moveCursorIndex);
        console.error("[cursorIndex] ", cursorIndex, moveCursorIndex, this.keyStepCursorIndex, this.currentKeyStepProcess, this.keyStepProcessList);
    }

    //Run when KeyStep == KeyOrderList == KeyStepProcess
    if (!modeDeleteFront && !modeDeleteNext)
        that.execute(keyman.mainClusterList, that.keyStepProcessList, that.keyOrderList);

    /** Event **/
    keyman.execEventListenerByEventName(KeyMan.TypingKeyHandler.EVENT_TYPINGKEYDOWN, {
        keyStepList: this.keyStepProcessList,
        keyOrderList: this.keyOrderList,
        indexedFunctionKeyBufferMap: this.indexedFunctionKeyBufferMap,
        matchingStartKeyStepIndex: this.matchingStartKeyStepIndex,
        matchingProcessKeyStepIndex: this.matchingProcessKeyStepIndex
    });
};
KeyMan.TypingKeyHandler.prototype.doKeyup = function(eventData){
    var that = this;
    var keyman = this.keyman;
    /** Event **/
    keyman.execEventListenerByEventName(KeyMan.TypingKeyHandler.EVENT_TYPINGKEYUP, {
        keyStepList: that.keyStepProcessList
    });
};



KeyMan.TypingKeyHandler.prototype.addKeyToTypingChecker = function(convertedKey, connectionTime, eventData){
    var that = this;
    var keyman = this.keyman;
    var key = eventData.key;
    var upperKey = eventData.upperKey;
};
KeyMan.TypingKeyHandler.prototype.insert = function(convertedKey, cursorIndex, eventData){
    var that = this;
    var keyman = this.keyman;
    var moveCursorIndex = 0;

    var cursorKeyStep = this.getTypingCursorKeyStep( cursorIndex );
    var newKeySteps = keyman.assemble(convertedKey, cursorKeyStep, eventData);
    // console.error("히히히히", cursorIndex, cursorKeyStep, newKeySteps);

    var lastNewKeyStep;
    if (cursorKeyStep){
        moveCursorIndex = (cursorKeyStep.getStatusCompleteChar()) ? 1 : 0;
        // console.error("헤헤헿", moveCursorIndex);
    }

    if (newKeySteps != null && 0 < newKeySteps.length){
        this.addKeyStep(newKeySteps);
        lastNewKeyStep = newKeySteps[newKeySteps.length -1];
        moveCursorIndex += ( lastNewKeyStep.getStatusCompleteChar() ? newKeySteps.length : newKeySteps.length -1 );
        // console.error("ㅋㅋ!! - ", newKeySteps, key, moveCursorIndex, lastNewKeyStep.getStatusCompleteChar());
    }

    return moveCursorIndex;
};
KeyMan.TypingKeyHandler.prototype.deleteFront = function(cursorIndex){
    if (cursorIndex == 0)
        return 0;
    var moveCursorIndex = 0;
    var currentIndex = cursorIndex;
    var beforeIndex = cursorIndex -1;
    var nowCursorKeyStep = this.keyStepProcessList[currentIndex];
    if (!nowCursorKeyStep){
        this.removeKeyStep(beforeIndex);
        moveCursorIndex = -1;
    }else if (nowCursorKeyStep.getStatusCompleteChar()){
        if (-1 < beforeIndex){
            this.removeKeyStep(beforeIndex);
            moveCursorIndex = -1;
        }
    }else{
        nowCursorKeyStep.pop();
        if (0 == nowCursorKeyStep.countKeys()){
            this.removeKeyStep(currentIndex);
        }else{
            nowCursorKeyStep.popProgress();
        }
        moveCursorIndex = 0;
    }
    return moveCursorIndex;
};

KeyMan.TypingKeyHandler.prototype.deleteNext = function(cursorIndex){
    if (this.keyStepProcessList.length -1 < cursorIndex)
        return 0;
    var moveCursorIndex = 0;
    var currentIndex = cursorIndex;
    var beforeIndex = cursorIndex -1;
    var nowCursorKeyStep = this.keyStepProcessList[currentIndex];
    if (!nowCursorKeyStep){
        //None
    }else if (nowCursorKeyStep.getStatusCompleteChar()){
        this.removeKeyStep(currentIndex);
    }else{
        nowCursorKeyStep.pop();
        if (0 == nowCursorKeyStep.countKeys()){
            this.removeKeyStep(currentIndex);
        }else{
            nowCursorKeyStep.popProgress();
        }
    }
    return moveCursorIndex;
};

KeyMan.TypingKeyHandler.prototype.getTypingCursorIndex = function(){
    return this.keyStepCursorIndex;
};
KeyMan.TypingKeyHandler.prototype.setTypingCursorIndex = function(curosrIndex){
    this.keyStepCursorIndex = curosrIndex;
    this.currentKeyStepProcess = this.keyStepProcessList[curosrIndex];
    // console.log("[ "+this.keyStepCursorIndex+" ]", this.currentKeyStepProcess);
    return this;
};
KeyMan.TypingKeyHandler.prototype.addTypingCursorIndex = function(additionalCurosrIndex){
    this.setTypingCursorIndex( this.getTypingCursorIndex() + additionalCurosrIndex );
    return this;
};

KeyMan.TypingKeyHandler.prototype.getTypingCursorKeyStep = function(cursorIndex){
    var keyStep = this.keyStepProcessList[cursorIndex];
    return keyStep;
};

    

KeyMan.TypingKeyHandler.prototype.clearDefinedKey = function(){
    this.currentKeyStepProcess = null;
    this.keyStepCursorIndex = 0;
    this.keyStepProcessList = [];
    this.keyOrderList = [];
    this.lastKey = null;
    this.indexedFunctionKeyBufferMap = [];
    this.matchingStartKeyStepIndex = -1;
    this.matchingProcessKeyStepIndex = -1;
    console.debug('DownedKey (Clean)', this.keyOrderList);
};
KeyMan.TypingKeyHandler.prototype.execute = function(keyClusterList, keyStepProcessList, keyOrderList){
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
                if (keyMap){
                    this.matchingProcessKeyStepIndex = 0;
                    //Run - System
                    for (var fKeyId in keyMap){
                        fKeyFound = keyMap[fKeyId];
                        keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKED);
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
            console.error('TYPING ?????', fKeyFound.keyStepList.length -1, this.matchingProcessKeyStepIndex, keyStepProcess, keyStepFound);
            if (keyStepProcess.equals(keyStepFound)){
                keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKED);
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
    console.debug('[Command buffer]', this.indexedFunctionKeyBufferMap);
    return this;
};
KeyMan.TypingKeyHandler.prototype.checkKeyStepList = function(keyStepProcessList){
    for (var i=keyStepProcessList.length -1, KeyStep; i>-1; i--){
        KeyStep = keyStepProcessList[i];
        if (KeyStep.checkStatus(KeyMan.KeyStep.STATUS_CHECKED))
            KeyStep.setStatus(KeyMan.KeyStep.STATUS_RUN);
        else
            break;
    }
};
KeyMan.TypingKeyHandler.prototype.executeFunctionKey = function(functionKey, keyCluster){
    if (!keyCluster)
        keyCluster = functionKey.parent.parent;
    if (keyCluster && keyCluster.modeMultiMap){
        if (functionKey.parent.id != keyCluster.keyMapSelectedWhenMultiMapMode)
            return;
    }
    //Run
    functionKey.execute();
    if (this.keyman){
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_EXECUTE, {
            keyStepList: this.keyStepProcessList,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Command)] ', functionKey);
};