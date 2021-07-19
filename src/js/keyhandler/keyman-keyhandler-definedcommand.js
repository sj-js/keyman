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
KeyMan.DefinedCommandKeyHandler = getClazz(function(keyman){
    KeyMan.CommandKeyHandler.apply(this, arguments);
    //Meta
    this.name = KeyMan.DefinedCommandKeyHandler.TYPE;
    this.type = KeyMan.DefinedCommandKeyHandler.TYPE;
})
.extend(KeyMan.CommandKeyHandler)
.returnFunction();

KeyMan.DefinedCommandKeyHandler.TYPE = 'DEFINEDCOMMAND';
KeyMan.DefinedCommandKeyHandler.EVENT_DEFINEDCOMMANDKEYDOWN = 'definedcommandkeydown';
KeyMan.DefinedCommandKeyHandler.EVENT_DEFINEDCOMMANDKEYUP = 'definedcommandkeyup';

KeyMan.DefinedCommandKeyHandler.prototype.setup = function(){
    var that = this;
    var keyman = this.keyman;
};

KeyMan.DefinedCommandKeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    return false;
};



KeyMan.DefinedCommandKeyHandler.prototype.beforeKeydown = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    //Check Pressed - Not allowed
    this.statusPressed = !!this.keyman.downedKeyMap[upperKey];
    // that.statusPressed = !!keyman.downedDefinedKeyMap[upperKey];
};
KeyMan.DefinedCommandKeyHandler.prototype.keydown = function(eventData){
    var that = this;
    var keyman = this.keyman;

    //Check Pressed - Not allowed
    if (that.statusPressed)
        return false;

    /** KeyDown **/
    if (eventData.definedKeydown !== null && eventData.definedKeydown !== undefined && eventData.definedKeydown.length > 0){
        var definedKeydown = eventData.definedKeydown[0];
        var keyGroupMan = eventData.keyGroupMan;

        //Check Pressed - Not allowed
        var statusPressedDefinedKey = (this.lastKey == definedKeydown);
        if (statusPressedDefinedKey)
            return;

        this.doKeydown(definedKeydown, keyGroupMan);
    }
};
KeyMan.DefinedCommandKeyHandler.prototype.beforeKeyup = function(eventData){
    //Implements..
};
KeyMan.DefinedCommandKeyHandler.prototype.keyup = function(eventData){
    var that = this;
    var keyman = this.keyman;

    /** KeyDown **/
    if (eventData.definedKeydown !== null && eventData.definedKeydown !== undefined && eventData.definedKeydown.length > 0){
        var definedKeydown = eventData.definedKeydown[0];
        var keyGroupMan = eventData.keyGroupMan;
        this.doKeydown(definedKeydown, keyGroupMan);
    }

    /** KeyUp **/
    if (eventData.definedKeyup !== null && eventData.definedKeyup !== undefined && eventData.definedKeyup.length > 0){
        var definedKeyup = eventData.definedKeyup[0];
        var keyGroupMan = eventData.keyGroupMan;
        this.doKeyup(definedKeyup, keyGroupMan);
    }
};



KeyMan.DefinedCommandKeyHandler.prototype.doKeydown = function(key, keyGroupMan){
    var that = this;
    var keyman = this.keyman;

    //Check Time - Decision 'Continue' and 'Reset'
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    if (that.timeForContinuousInspection < connectionTime)
        that.clearDefinedKey();

    //Check Key
    var downedKeyList = Object.keys(keyman.downedDefinedKeyMap);
    var downedKeySize = downedKeyList.length;
    //Save Key
    console.error('>>>', key, connectionTime, downedKeyList);
    that.addKeyToCommandChecker(key, connectionTime, downedKeyList, keyGroupMan);
    that.lastKey = key;
    that.lastKeySize = downedKeySize;
    that.lastKeyDownTime = currentTime;
    that.lastDownKey = key;
    //Run when KeyStep == KeyOrderList == KeyStepProcess
    that.execute(keyman.mainClusterList, that.keyStepProcessList, that.keyOrderList);

    /** Event **/
    keyman.execEventListenerByEventName(KeyMan.DefinedCommandKeyHandler.EVENT_DEFINEDCOMMANDKEYDOWN, {
        keyStepList: this.keyStepProcessList,
        indexedFunctionKeyBufferMap: this.indexedFunctionKeyBufferMap,
        matchingStartKeyStepIndex: this.matchingStartKeyStepIndex,
        matchingProcessKeyStepIndex: this.matchingProcessKeyStepIndex
    });
};

KeyMan.DefinedCommandKeyHandler.prototype.doKeyup = function(key, keyGroupMan){
    var that = this;
    var keyman = this.keyman;

    //Check Keyup
    var downedKeyList = Object.keys(keyman.downedDefinedKeyMap);
    var nowKeySize = downedKeyList.length;
    /** Check - For Example, One button keyup from two button keydown status **/
    if (1 < that.lastKeySize && nowKeySize < that.lastKeySize){
        setTimeout(function(){
            var downedKeyList = Object.keys(keyman.downedDefinedKeyMap);
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
    keyman.execEventListenerByEventName(KeyMan.DefinedCommandKeyHandler.EVENT_DEFINEDCOMMANDKEYUP, {
        keyStepList: that.keyStepProcessList
    });
};


KeyMan.DefinedCommandKeyHandler.prototype.addKeyToCommandChecker = function(currentKey, connectionTime, downedKeyList, keyGroupMan){
    //- Make KeyStepList
    this.keyOrderList.push(currentKey);
    //- Detection for same time keys
    if (this.currentKeyStepProcess && this.lastDownKey !== null){
        var inTime = (connectionTime < this.timeForJudgmentSimultaneousKeyPress);
        console.error('CHECK CHECK - ' + currentKey, inTime);
        if (inTime){
            // console.error(22222, this.lastKey);
            var lastKeyGroup = keyGroupMan.getKeyGroupByKeyName(this.lastDownKey);
            var currentKeyGroup = keyGroupMan.getKeyGroupByKeyName(currentKey);
            var containsSameGroup = getData(this.currentKeyStepProcess.keys).any(function(keyName){
                return currentKey != keyName && currentKeyGroup.containsKey(keyName);
            });
            var concatable = !containsSameGroup || (containsSameGroup && !lastKeyGroup.checkModeWorkOnlyHighestPriority());
            if (concatable){
                console.error('  - CONCATABLE - ' + currentKey, containsSameGroup);
                this.currentKeyStepProcess.add(currentKey);
                return;
            }else{
                //- 잽싸게 눌린키가(inTime) 1.마지막과 같은 그룹인데, 2.keyup한 적 없고, 3.추가로 눌렀음.
                var sameGroup = lastKeyGroup.containsKey(currentKey);
                console.error('  - 헐랭 - ' + currentKey, lastKeyGroup, currentKeyGroup, sameGroup);
                if (sameGroup){
                    if (currentKeyGroup.getDecisionTime() > 0){
                        var poped = this.currentKeyStepProcess.pop();
                        this.currentKeyStepProcess.add(currentKey);
                        console.error('  - 잽싸게! - ' + currentKey, poped, containsSameGroup);
                        return;
                    }
                }else{
                }
                console.error('  - 왜!!!! - ' + currentKey, currentKeyGroup.getDecisionTime() > 0);

            }
        }else{
            // console.error(33333, this.lastKey);
            // var lastKeyGroup = keyGroupMan.getKeyGroupByKeyName(this.lastKey);
            // var currentKeyGroup = keyGroupMan.getKeyGroupByKeyName(currentKey);
            // var containsSameGroup = getData(this.currentKeyStepProcess.keys).any(function(keyName){ return currentKey != keyName && currentKeyGroup.containsKey(keyName); });
            // var concatable = !containsSameGroup || (containsSameGroup && !lastKeyGroup.checkModeWorkOnlyHighestPriority());
            // if (concatable){
            //     this.currentKeyStepProcess.add(currentKey);
            //     return;
            // }
        }
    }else{
        console.error(101010, '!@#!#!!!')
    }
    //- Detection for additional key
    console.debug(connectionTime);
    this.currentKeyStepProcess = new KeyMan.KeyStep( downedKeyList );
    this.keyStepProcessList.push( this.currentKeyStepProcess );
};


KeyMan.DefinedCommandKeyHandler.prototype.execute = function(keyClusterList, keyStepProcessList, keyOrderList){
    var newIndexedFunctionKeyBufferMap = [];
    var keyStepLength = keyStepProcessList.length;
    var keyStepProcessIndex = keyStepLength -1;
    var keyStepProcess = keyStepProcessList[keyStepProcessIndex];
    var keyStepProcessKeysPlusLength = keyStepProcess.length -1;
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
            console.error('COMMAND...', keyStepProcessIndex, keyStepProcess, keyStepFound, keyStepProcess.equals(keyStepFound));
            if (keyStepProcess.in(keyStepFound, keyStepProcess.length)){
                var statusLastKeyStep = fKeyFound.keyStepList.length -1 == this.matchingProcessKeyStepIndex;
                var statusKeyStepAllMatching;
                if (keyStepFound.length == keyStepProcess.length){
                    keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKED);
                    statusKeyStepAllMatching = true;
                }else{
                    keyStepProcess.setStatus(KeyMan.KeyStep.STATUS_CHECKING);
                    statusKeyStepAllMatching = false;
                }
                console.error('COMMAND>>>', keyStepProcessIndex, fKeyFound.keyStepList.length -1, this.matchingProcessKeyStepIndex, keyStepProcess, keyStepFound);
                if (statusLastKeyStep && statusKeyStepAllMatching && !fKeyFound.modeLock){
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

    console.debug('[DefinedCommand buffer]', this.indexedFunctionKeyBufferMap);
    return this;
};
KeyMan.DefinedCommandKeyHandler.prototype.checkKeyStepList = function(keyStepProcessList){
    for (var i=keyStepProcessList.length -1, KeyStep; i>-1; i--){
        KeyStep = keyStepProcessList[i];
        if (KeyStep.checkStatus(KeyMan.KeyStep.STATUS_CHECKED))
            KeyStep.setStatus(KeyMan.KeyStep.STATUS_RUN);
        else
            break;
    }
};
KeyMan.DefinedCommandKeyHandler.prototype.executeFunctionKey = function(functionKey, keyCluster){
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
    console.debug('[Execute FunctionKey(DefinedCommand)] ', functionKey);
};