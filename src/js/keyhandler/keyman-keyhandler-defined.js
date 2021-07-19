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



/****************************************************************************************************
 *
 *
 * DefinedKeyMapCluster
 *
 *
 ****************************************************************************************************/
KeyMan.DefinedKeyMapCluster = getClazz(function(){
    KeyMan.KeyMapCluster.apply(this, arguments);
    this.id = 'defined';
    this.name = 'defined';
})
.extend(KeyMan.KeyMapCluster)
.returnFunction();

KeyMan.DefinedKeyMapCluster.prototype.newKeyMap = function(keyMap){
    var that = this;
    //- Find DefinedKeyHandler
    var keyHandler = this.keyman.getKeyHandler(KeyMan.DefinedKeyHandler.TYPE);
    if (!keyHandler)
        throw 'Does not exists DefinedKeyHandler.';

    //- Generate default KeyMap
    keyHandler.defaultDefinedKeyMap.traverse(function(fk){
        fk.setType(KeyMan.DefinedKeyHandler.TYPE).setupKeyStepList();
        fk.keys = keyHandler.correctKeys(fk.keys);
    });
    var newKeyMap = KeyMan.KeyMapCluster.prototype.newKeyMap.call(this, keyMap);
    newKeyMap.add(keyHandler.defaultDefinedKeyMap);
    return newKeyMap;

    // keyHandler.defaultDefinedKeyMap.traverse(function(fk){
    //     fk.setType(KeyMan.DefinedKeyHandler.TYPE).setupKeyStepList();
    //     fk.keys = keyHandler.correctKeys(fk.keys);
    // });
    // var extractedData = keyHandler.defaultDefinedKeyMap.extractData()._data;
    // console.error('777', keyHandler.defaultDefinedKeyMap);
    // console.error('77', extractedData);
    // var newKeyMap = KeyMan.KeyMap.copy(extractedData, {});
    // this.add(newKeyMap);
    // return newKeyMap;
};



/****************************************************************************************************
 *
 *
 * DefinedKeyMap
 *
 *
 ****************************************************************************************************/
//TODO: 임시
KeyMan.DefinedKeyMap = getClazz(function(object){
    KeyMan.KeyMap.apply(this, arguments);
    this.keyGroupMan = new KeyMan.KeyGroupMan().setKeyMan(this.keyman);
})
.extend(KeyMan.KeyMap)
.returnFunction();


KeyMan.DefinedKeyMap.prototype.getKeyGroupMan = function(){
    return this.keyGroupMan;
};

KeyMan.DefinedKeyMap.prototype.add = function(definedKey){
    KeyMan.KeyMap.prototype.add.call(this, definedKey);
    this.keyGroupMan.joinGroup(definedKey);
    return this;
};
KeyMan.DefinedKeyMap.prototype.remove = function(definedKey){
    KeyMan.KeyMap.prototype.remove.call(this, definedKey);
    this.keyGroupMan.retireGroup(definedKey);
    return this;
};



/****************************************************************************************************
 *
 *
 * DefinedKey
 *
 *
 ****************************************************************************************************/
KeyMan.DefinedFunctionKey = getClazz(function(object){
    KeyMan.FunctionKey.apply(this, arguments);
    this.type = KeyMan.TYPE_DEFINED;
})
.extend(KeyMan.FunctionKey)
.returnFunction();




/****************************************************************************************************
 *
 *
 * KeyGroup
 *
 *
 ****************************************************************************************************/
KeyMan.KeyGroup = function(){
    this.keyman;
    this.name = null;
    this.modeWorkOnlyHighestPriority = false;
    this.modeWorkWhenKeyUp = false;
    this.dicisionTime = 0;
    this.functionKeyByNameMap = {};
    this.lastPressedTopPriorityFunctionKey = null;
    this.lastPressedTopPriorityFunctionKeySequence = 99999;

    this.bufferPressedFunctionKeyMap = {};
    this.lastKeyupFunctionKeys = [];
};
KeyMan.KeyGroup.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyGroup.prototype.setName = function(name){
    this.name = name;
    return this;
};
KeyMan.KeyGroup.prototype.setModeWorkOnlyHighestPriority = function(mode){
    this.modeWorkOnlyHighestPriority = mode;
    return this;
};
KeyMan.KeyGroup.prototype.setModeWorkWhenKeyUp = function(mode){
    this.modeWorkWhenKeyUp = mode;
    return this;
};
KeyMan.KeyGroup.prototype.checkModeWorkOnlyHighestPriority = function(){
    return this.modeWorkOnlyHighestPriority;
};
KeyMan.KeyGroup.prototype.checkModeWorkWhenKeyUp = function(){
    return this.modeWorkWhenKeyUp;
};

KeyMan.KeyGroup.prototype.setDecisionTime = function(dicisionTime){
    this.dicisionTime = dicisionTime;
    return this;
};
KeyMan.KeyGroup.prototype.getDecisionTime = function(){
    return this.dicisionTime;
};

KeyMan.KeyGroup.prototype.equals = function(otherKeyGroup){
    if (otherKeyGroup == null)
        return false;
    return otherKeyGroup.name == this.name;
};

KeyMan.KeyGroup.prototype.get = function(name){
    if (name == null)
        return null;
    return this.functionKeyByNameMap[name];
};
KeyMan.KeyGroup.prototype.has = function(group){
    return !!this.get(group);
};
KeyMan.KeyGroup.prototype.add = function(fk){
    return this.addDefinedKey(fk);
};
KeyMan.KeyGroup.prototype.set = function(fk){
    if (fk.sequence = -1){
        fk.sequence = Object.keys(this.functionKeyByNameMap).length;
    }
    this.functionKeyByNameMap[fk.name] = fk;
    return this;
};

KeyMan.KeyGroup.prototype.addDefinedKey = function(fk){
    if (fk instanceof Array){
        for (var i=0; i<fk.length; i++){
            this.addDefinedKey(fk[i]);
        }
        return this;
    }
    if (this.has(fk.name))
        return;
    this.set(fk);
    // fk.setParent();
    // fk.setup(this.keyman)
    return this;
};


KeyMan.KeyGroup.prototype.containsKey = function(fk){
    var name = null;
    if (fk instanceof KeyMan.FunctionKey){
        name = fk.name;
    }else{
        name = fk;
    }
    var item = this.functionKeyByNameMap[name];
    // console.error(' - zzzz',name, this.functionKeyByNameMap, item);
    return !!item;
};

KeyMan.KeyGroup.prototype.keyup = function(upperKey){
    var functionKey, existing = false;
    for (var key in this.bufferPressedFunctionKeyMap){
        functionKey = this.bufferPressedFunctionKeyMap[key];
        if (functionKey.hasKey(upperKey)){
            //Collecting
            this.lastKeyupFunctionKeys.push(functionKey);
            //Trigger
            if (functionKey.isPressed()){
                functionKey.unpress().triggerKeyup();
            }
            existing = true;
        }
    }
    return existing;
};
KeyMan.KeyGroup.prototype.getPriorityInBuffer = function(){
    return this.lastPressedTopPriorityFunctionKey;
};
KeyMan.KeyGroup.prototype.getAllInBuffer = function(){
    var result = [];
    for (var name in this.bufferPressedFunctionKeyMap){
        result.push( this.bufferPressedFunctionKeyMap[name] );
    }
    return result;
};
KeyMan.KeyGroup.prototype.popLastKeyupFunctionKeys = function(){
    var result = this.lastKeyupFunctionKeys;
    for (var i=0, fk; i<this.lastKeyupFunctionKeys.length; i++){
        fk = this.lastKeyupFunctionKeys[i];
        delete this.bufferPressedFunctionKeyMap[fk.name];
    }
    //Clear
    this.lastKeyupFunctionKeys = [];
    //Find TopPriority
    var topPriorityFk = null;
    var topPriorityDefinedFk = null;
    var fkNames = Object.keys(this.bufferPressedFunctionKeyMap);
    for (var i=0; i<fkNames.length; i++){
        var fkName = fkNames[i];
        var fkInBuffer = this.bufferPressedFunctionKeyMap[fkName];
        var definedFkInBuffer = this.get(fkInBuffer.name);
        console.error(this.lastPressedTopPriorityFunctionKeySequence, fkInBuffer.name, definedFkInBuffer);
        if (topPriorityDefinedFk === null || topPriorityDefinedFk.sequence > definedFkInBuffer.sequence){
            topPriorityDefinedFk = definedFkInBuffer;
            topPriorityFk = fkInBuffer;
        }
    }
    if (topPriorityDefinedFk){
        this.lastPressedTopPriorityFunctionKeySequence = topPriorityDefinedFk.sequence;
        this.lastPressedTopPriorityFunctionKey = topPriorityFk;
        console.error(this.lastPressedTopPriorityFunctionKeySequence, this.lastPressedTopPriorityFunctionKey);
    }else{
        this.lastPressedTopPriorityFunctionKeySequence = 9999;
        this.lastPressedTopPriorityFunctionKey = null;
        console.error(this.lastPressedTopPriorityFunctionKeySequence, this.lastPressedTopPriorityFunctionKey);
    }
    return result;
};
KeyMan.KeyGroup.prototype.press = function(fk){
    this.bufferPressedFunctionKeyMap[fk.name] = fk;
    var pressedDefinedFk = this.get(fk.name);
    console.error('SQ =>', pressedDefinedFk.sequence, pressedDefinedFk.name);

    if (this.lastPressedTopPriorityFunctionKey === null || this.lastPressedTopPriorityFunctionKey === undefined){
        this.lastPressedTopPriorityFunctionKey = fk;
    }else if (this.lastPressedTopPriorityFunctionKeySequence > pressedDefinedFk.sequence){
        this.lastPressedTopPriorityFunctionKeySequence = pressedDefinedFk.sequence;
        this.lastPressedTopPriorityFunctionKey = fk;
    }
    return this;
};
KeyMan.KeyGroup.prototype.hasKeyInBuffer = function(){
    return Object.keys(this.bufferPressedFunctionKeyMap).length > 0;
};
KeyMan.KeyGroup.prototype.popPressedKeys = function(){
    var popedObject = this.bufferPressedFunctionKeyMap;
    this.bufferPressedFunctionKeyMap = {};
    this.lastPressedTopPriorityFunctionKey = null;
    return popedObject;
};
KeyMan.KeyGroup.prototype.getPressedAllInGroupExcept = function(exceptionFk){
    var result = [];
    var item;
    for (var name in this.bufferPressedFunctionKeyMap){
        item = this.bufferPressedFunctionKeyMap[name];
        if (name == exceptionFk.name){
            //Except
        }else{
            result.push(item);
        }
    }
    return result;
};
KeyMan.KeyGroup.prototype.getAllInBufferGroup = function(){
    var result = [];
    var item;
    for (var name in this.bufferPressedFunctionKeyMap){
        item = this.bufferPressedFunctionKeyMap[name];
        result.push(item);
    }
    return result;
};
KeyMan.KeyGroup.prototype.traverse = function(callback){
    getData(this.functionKeyByNameMap).any(function(name, fk){
        return callback(fk);
    });
    return this;
};

KeyMan.KeyGroup.prototype.setup = function(keyman){
    if (this.keyman){
        console.error('[KeyGroup] setup... Already Setuped !!', this);
        return this;
    }
    if (!keyman)
        return this;
    console.error('[KeyGroup] setup...', this);
    this.setKeyMan(keyman);
    // var fk;
    // for (var name in this.functionKeyByNameMap){
    //     fk = this.functionKeyByNameMap[name];
    //     fk.setup(keyman);
    // }
    return this;
};
KeyMan.KeyGroup.prototype.unsetup = function(){
    console.error('[KeyGroup] unsetup...', this);
    var fk;
    for (var name in this.functionKeyByNameMap){
        fk = this.functionKeyByNameMap[name];
        fk.unsetup();
    }
    return this;
};





/****************************************************************************************************
 *
 *
 * KeyGroupMan
 *
 *
 ****************************************************************************************************/
KeyMan.KeyGroupMan = function(){
    this.keyman;
    this.groupMap = {};
    this.groupForNull = new KeyMan.KeyGroup();
    this.groupByKeyNameMap = {};
    this.lastKeyupGroups = [];
};
KeyMan.KeyGroupMan.prototype.setKeyMan = function(keyman){
    this.keyman = keyman;
    return this;
};
KeyMan.KeyGroupMan.prototype.joinGroup = function(fk){
    var group = fk.group;
    if (group == null)
        return null;
    var keyGroup = this.getKeyGroup(group);
    if (keyGroup == null)
        keyGroup = this.newKeyGroup(group);
    if (!keyGroup.containsKey(fk))
        keyGroup.add(fk);
    this.groupByKeyNameMap[fk.name] = keyGroup;
    return this;
};
KeyMan.KeyGroupMan.prototype.retireGroup = function(fk){
    var group = fk.group;
    if (group != null){
        var keyGroup = this.getKeyGroup(group);
        if (keyGroup != null){
            keyGroup.remove(fk);
            delete this.groupByKeyNameMap[fk.name];
        }
    }
    return this;
};
KeyMan.KeyGroupMan.prototype.getKeyGroup = function(group){
    if (group == null)
        return this.groupForNull;
    return this.groupMap[group];
};
KeyMan.KeyGroupMan.prototype.getKeyGroupByKeyName = function(keyName){
    return this.groupByKeyNameMap[keyName];
};
KeyMan.KeyGroupMan.prototype.hasKeyGroup = function(group){
    return !!this.getKeyGroup(group);
};
KeyMan.KeyGroupMan.prototype.addKeyGroup = function(group){
    if (group instanceof Array){
        for (var i=0; i<group.length; i++){
            this.addKeyGroup(group[i]);
        }
        return this;
    }
    if (this.hasKeyGroup(group.name))
        return this;
    this.groupMap[group.name] = group;
    if (!this.keyman)
        return this;
    group.setup(this.keyman);
    return this;
};
KeyMan.KeyGroupMan.prototype.newKeyGroup = function(groupName){
    var keyGroup = new KeyMan.KeyGroup().setName(groupName);
    this.addKeyGroup( keyGroup );
    return keyGroup;
};


KeyMan.KeyGroupMan.prototype.press = function(fk){
    var keyGroup = this.getKeyGroup(fk.group);
    keyGroup.press(fk);
    return this;
};
KeyMan.KeyGroupMan.prototype.getGroupsInBufferPressed = function(){
    var result = [], group;
    for (var name in this.groupMap){
        group = this.groupMap[name];
        if (group.hasKeyInBuffer())
            result.push(group);
    }
    return result;
};

KeyMan.KeyGroupMan.prototype.keyup = function(upperKey){
    var group, exsting = false;
    for (var name in this.groupMap){
        group = this.groupMap[name];
        if (group.keyup(upperKey)){
            this.lastKeyupGroups.push(group);
            exsting = true;
        }
    }
    return exsting;
};
KeyMan.KeyGroupMan.prototype.popLastKeyupGroups = function(){
    var result = this.lastKeyupGroups;
    this.lastKeyupGroups = [];
    return result;
};
KeyMan.KeyGroupMan.prototype.popLastKeyupFunctionKeys = function(){
    var result = [], group, popedLastKeyupFunctionKeys;
    for (var i=0; i<this.lastKeyupGroups.length; i++){
        group = this.lastKeyupGroups[i];
        popedLastKeyupFunctionKeys = group.popLastKeyupFunctionKeys();
        for (var j=0; j<popedLastKeyupFunctionKeys.length; j++){
            result.push( popedLastKeyupFunctionKeys[j] );
        }
    }
    return result;
};




/****************************************************************************************************
 *
 *
 * DefinedKeyHandler
 *
 *
 ****************************************************************************************************/
KeyMan.DefinedKeyHandler = getClazz(function(){
    KeyMan.KeyHandler.apply(this, arguments);
    //Meta
    this.name = KeyMan.DefinedKeyHandler.TYPE;
    this.type = KeyMan.DefinedKeyHandler.TYPE;

    //TODO: 성질 정하자
    //- 서로 다른 그룹의 키와는 동시에 누를 수 있다!
    //- 하지만, 같은 그룹의 키는 설정에 따라 작동!
    //  - modeWorkOnlyHighestPriority - 가장 높은 우선순위 1개만 실행
    //  - modeWorkWhenKeyUp - 키를 Up할 때 다시 체크할지
    this.selectedKeyMapClusterId = '_user';
    this.selectedKeyMapCluster = null;
    this.defaultDefinedKeyMap = new KeyMan.DefinedKeyMap();
})
.extend(KeyMan.ShortcutKeyHandler)
.returnFunction();

KeyMan.DefinedKeyHandler.TYPE = 'DEFINED';
KeyMan.DefinedKeyHandler.EVENT_DEFINEDKEYDOWN = 'definedkeydown';
KeyMan.DefinedKeyHandler.EVENT_DEFINEDKEYUP = 'definedkeyup';

KeyMan.DefinedKeyHandler.prototype.correctKeys = function(keys){
    if (keys && keys.length == 1 && keys[0] instanceof Array){
        keys = keys[0];
    }
    return keys;
};

KeyMan.DefinedKeyHandler.prototype.setup = function(keyman){
    var that = this;
    this.keyman = keyman;
    this.selectKeyMapCluster();
    // this.defaultDefinedKeyMap.setParent(keyman).setup(keyman);
};
KeyMan.DefinedKeyHandler.prototype.unsetup = function(){
    // var keyMap;
    // for (var keyMapId in this.keyMaps){
    //     keyMap = this.keyMaps[keyMapId];
    //     keyMap.unsetup();
    // }
    // this.defaultDefinedKeyMap.unsetup();
    this.keyman = null;
    return this;
};

KeyMan.DefinedKeyHandler.prototype.getKeyGroupMan = function(){
      return this.defaultDefinedKeyMap.getKeyGroupMan();
};

KeyMan.DefinedKeyHandler.prototype.selectKeyMapCluster = function(keyMapCluster){
    var keyman = this.keyman;
    if (keyMapCluster !== null && keyMapCluster !== undefined){
        if (keyMapCluster instanceof KeyMan.KeyMapCluster){
            this.selectedKeyMapCluster = keyMapCluster;
            this.selectedKeyMapClusterId = keyMapCluster.id;
            return this;
        }else{
            this.selectedKeyMapClusterId = keyMapCluster;
        }
    }
    if (keyman){
        this.selectedKeyMapCluster = keyman.getCluster(this.selectedKeyMapClusterId);
    }
    return this;
};
KeyMan.DefinedKeyHandler.prototype.getSelectedKeyMapCluster = function(keyMapCluster){
    return this.selectedKeyMapCluster;
};
KeyMan.DefinedKeyHandler.prototype.checkMyTypeByFunctionKey = function(functionKey){
    return false;
};
KeyMan.DefinedKeyHandler.prototype.cloneDefaultDefinedKeyMap = function(definedKey){
    return this.defaultDefinedKeyMap.clone(definedKey);
};

KeyMan.DefinedKeyHandler.prototype.addKeyGroup = function(keyGroup){
    if (keyGroup instanceof Array){
        for (var i=0; i<keyGroup.length; i++){
            this.addKeyGroup(keyGroup[i]);
        }
        return this;
    }
    var that = this;
    this.defaultDefinedKeyMap.keyGroupMan.addKeyGroup(keyGroup);
    keyGroup.traverse(function(fk){
        fk.setGroup(keyGroup.name);
        that.addDefinedKey(fk);
    });
    return this;
};
KeyMan.DefinedKeyHandler.prototype.addDefinedKey = function(definedKey){
    console.error('#####, ', definedKey, definedKey.group);
    this.defaultDefinedKeyMap.add(definedKey);
    return this;
};
KeyMan.DefinedKeyHandler.prototype.removeDefinedKey = function(definedKey){
    this.defaultDefinedKeyMap.remove(definedKey);
    return this;
};


KeyMan.DefinedKeyHandler.prototype.beforeKeydown = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    //Check Pressed - Not allowed
    this.statusPressed = !!this.keyman.downedKeyMap[upperKey];
    // that.statusPressed = !!keyman.downedDefinedKeyMap[upperKey];
};
KeyMan.DefinedKeyHandler.prototype.keydown = function(eventData){
    //Check Pressed - Not allowed
    if (this.statusPressed)
        return false;
    var upperKey = eventData.upperKey;
    this.doKeydown(upperKey, eventData);
};
KeyMan.DefinedKeyHandler.prototype.beforeKeyup = function(eventData){
    var key = eventData.key;
    var upperKey = eventData.upperKey;
    //Check Pressed - Not allowed
    this.statusPressed = !!this.keyman.downedKeyMap[upperKey];
};
KeyMan.DefinedKeyHandler.prototype.keyup = function(eventData){
    var upperKey = eventData.upperKey;
    this.doKeyup(upperKey, eventData);
};



KeyMan.DefinedKeyHandler.prototype.doKeydown = function(upperKey, eventData){
    var that = this;
    var keyman = this.keyman;

    // console.error('[ ~ KEY-DOWN ~ ]' + upperKey, keyman.downedDefinedKeyMap);

    //Check Time
    var currentTime = new Date().getTime();
    var connectionTime = currentTime - that.lastKeyDownTime;
    //Check Key
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var keySize = downedKeyList.length;
    that.lastKey = upperKey;
    that.lastKeySize = keySize;
    that.lastKeyDownTime = currentTime;

    var singleTargetCluster = this.getSelectedKeyMapCluster();
    // console.error(singleTargetCluster.getIndexedKeyMap(this.type));
    var resultFunctionKeys = that.execute(singleTargetCluster, upperKey);
    // console.error('[ ~ KEY-DOWN ~ ]' + upperKey, keyman.downedDefinedKeyMap);

    /** Add - metadata **/
    eventData.keyGroupMan = this.getKeyGroupMan();
    eventData.definedKeydown = getData(resultFunctionKeys).collect(function(fk){ return fk.name; });

    /** Event **/
    if (resultFunctionKeys.length > 0){
        var downedDefinedKeyList = Object.keys(keyman.downedDefinedKeyMap);
        keyman.execEventListenerByEventName(KeyMan.DefinedKeyHandler.EVENT_DEFINEDKEYDOWN, {
            keyStepList: [new KeyMan.KeyStep(downedDefinedKeyList)]
        });
    }
};
KeyMan.DefinedKeyHandler.prototype.doKeyup = function(upperKey, eventData){
    var that = this;
    var keyman = this.keyman;

    // console.error('[ ~ KEY-UP ~ ]' + upperKey, keyman.downedDefinedKeyMap);

    //Check Keyup
    var downedKeyList = Object.keys(keyman.downedKeyMap);
    var nowKeySize = downedKeyList.length;
    /** Status **/
    that.lastKey = null;
    /** Event **/
    var fk;
    var keyupFk, keepGoingFk, priorityFk, keyGroup;
    var keyupFks = [];
    var keepGoingFks = [];
    var keepGoingGroups = [];
    // var beforeSize = that.indexedFunctionKeyBufferMap.length;
    var keyGroupMan = this.getKeyGroupMan();
    keyGroupMan.keyup(upperKey);
    keyupFks = keyGroupMan.popLastKeyupFunctionKeys();
    keepGoingGroups = keyGroupMan.popLastKeyupGroups();

    if (keyupFks.length > 0){
        //- Release DefinedKey
        this.releaseDefinedKeys(keyupFks);

        /** modeWorkWhenKeyUp **/
        //- Checking Not yet keyup functionKeys
        var resultFunctionKeys = [];
        for (var j=keepGoingGroups.length -1, keepGoingGroup; j>-1; j--){
            keepGoingGroup = keepGoingGroups[j];
            if (keepGoingGroup.hasKeyInBuffer() && keepGoingGroup.checkModeWorkWhenKeyUp()){
                /** modeWorkOnlyHighestPriority **/
                chagnedFunction = true;
                if (keepGoingGroup.checkModeWorkOnlyHighestPriority()){
                    priorityFk = keepGoingGroup.getPriorityInBuffer();
                    resultFunctionKeys.push(priorityFk);
                    if (priorityFk !== null)
                        this.executeFunctionKey(priorityFk);
                    console.debug('priority', resultFunctionKeys);
                }else{
                    resultFunctionKeys = keepGoingGroup.getAllInBuffer();
                    this.executeFunctionKeys(resultFunctionKeys);
                    console.debug('all', resultFunctionKeys);
                }
            }
        }

        if (resultFunctionKeys.length > 0){
            /** Add - metadata **/
            eventData.keyGroupMan = this.getKeyGroupMan();
            eventData.definedKeydown = getData(resultFunctionKeys).collect(function(fk){ return fk.name; });
            /** Event **/
            var downedDefinedKeyList = Object.keys(keyman.downedDefinedKeyMap);
            console.error('[ ~~~~~~down ]', downedDefinedKeyList);
            keyman.execEventListenerByEventName(KeyMan.DefinedKeyHandler.EVENT_DEFINEDKEYDOWN, {
                keyStepList: [new KeyMan.KeyStep(downedDefinedKeyList)]
            });
        }
    }

    if (keyupFks.length > 0){
        /** Add - metadata **/
        eventData.keyGroupMan = this.getKeyGroupMan();
        eventData.definedKeyup = getData(keyupFks).collect(function(fk){ return fk.name; });
        /** Event **/
        var downedDefinedKeyList = Object.keys(keyman.downedDefinedKeyMap);
        console.error('[ ~~~~~~up ]', downedDefinedKeyList);
        keyman.execEventListenerByEventName(KeyMan.DefinedKeyHandler.EVENT_DEFINEDKEYUP, {
            keyStepList: [new KeyMan.KeyStep(downedDefinedKeyList)]
        });
    }
};



KeyMan.DefinedKeyHandler.prototype.execute = function(keyMapCluster, upperKey){
    var resultFunctionKeys = [];
    var keyman = this.keyman;
    var keyGroupMan = this.getKeyGroupMan();
    if (keyMapCluster.modeLock)
        return resultFunctionKeys;
    var indexedFunctionKeyMap = keyMapCluster.getIndexedKeyMap(this.type);
    // console.error('#####',this.type,indexedFunctionKeyMap);
    var functionKeyMap = indexedFunctionKeyMap[upperKey];
    var fk, result, priorityFk, keyGroup;
    for (var keyId in functionKeyMap){
        fk = functionKeyMap[keyId];
        // if (fk.type != KeyMan.TYPE_DEFINED) //TODO: 임시로 이렇게 필터
        //     continue;
        if (!keyman.isOnKeys(fk)){
            console.error('X', fk.type, fk.name);
            fk.unpress();
            // this.releaseDefinedKey(fk);
            continue;
        }
        if (fk.modeLock)
            continue;

        //Run Shortcut
        // if (priorityFk == null)
        //     priorityFk = fk;
        if (fk.isPressed()) {
            console.error('-', fk.name);
            // return true;
        }else{
            console.error('O', fk.name);
            // this.indexedFunctionKeyBufferMap.push(fk);
            keyGroupMan.press(fk);
        }
    }

    /** modeWorkOnlyHighestPriority **/
    var groupsInBuffer = keyGroupMan.getGroupsInBufferPressed();
    if (groupsInBuffer.length > 0){
        for (var j=groupsInBuffer.length -1; j>-1; j--){
            keyGroup = groupsInBuffer[j];
            if (keyGroup.checkModeWorkOnlyHighestPriority()){
                priorityFk = keyGroup.getPriorityInBuffer();
                resultFunctionKeys.push(priorityFk);
                var keysToBeReleased = keyGroup.getPressedAllInGroupExcept(priorityFk);
                this.releaseDefinedKeys(keysToBeReleased);
                this.executeFunctionKey(priorityFk, keyMapCluster);
                console.debug('!!! priority ==>', priorityFk, keysToBeReleased, keyman.downedDefinedKeyMap);
            }else{
                resultFunctionKeys = keyGroup.getAllInBufferGroup();
                this.executeFunctionKeys(resultFunctionKeys, keyMapCluster);
                console.debug('!!! all ==>', keyGroup, keyman.downedDefinedKeyMap);
            }
        }
    }

    return resultFunctionKeys;
};
KeyMan.DefinedKeyHandler.prototype.executeFunctionKey = function(functionKey, keyMapCluster){
    //Check MultiMap
    if (!keyMapCluster)
        keyMapCluster = functionKey.parent.parent;
    if (keyMapCluster && keyMapCluster.modeMultiMap){
        if (functionKey.parent.id != keyMapCluster.keyMapSelectedWhenMultiMapMode)
            return false;
    }
    //Down
    this.pressDefinedKey(functionKey);
    //Execute
    (functionKey.execute && functionKey.execute());
    //Check Event
    if (this.keyman){
        this.keyman.execEventListenerByEventName(KeyMan.EVENT_EXECUTE, {
            keyStepList: null,
            functionKey: functionKey,
        });
    }
    console.debug('[Execute FunctionKey(Defined)] ', functionKey);
    return true;
};
KeyMan.DefinedKeyHandler.prototype.executeFunctionKeys = function(functionKeys, keyMapCluster){
    for (var name in functionKeys){
        this.executeFunctionKey(functionKeys[name], keyMapCluster);
    }
    return this;
};

KeyMan.DefinedKeyHandler.prototype.pressDefinedKey = function(functionKey){
    var keyman = this.keyman;
    //Down
    functionKey.press().triggerKeydown();
    keyman.downedDefinedKeyMap[functionKey.name] = true;
    return this;
};

KeyMan.DefinedKeyHandler.prototype.releaseDefinedKey = function(functionKey){
    var keyman = this.keyman;
    //Up
    // functionKey.unpress().triggerKeyup();
    delete keyman.downedDefinedKeyMap[functionKey.name];
    // var foundIndex = this.indexedFunctionKeyBufferMap.indexOf(functionKey);
    // if (foundIndex != -1)
    //     this.indexedFunctionKeyBufferMap.splice(foundIndex, 1);
    return this;
};
KeyMan.DefinedKeyHandler.prototype.releaseDefinedKeys = function(functionKeys){
    for (var name in functionKeys){
        this.releaseDefinedKey(functionKeys[name]);
    }
    return this;
};

