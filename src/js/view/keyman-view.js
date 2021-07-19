/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var KeyMan = require('@sj-js/keyman');
    var ready = crossman.ready,
        getClazz = crossman.getClazz,
        getEl = crossman.getEl,
        newEl = crossman.newEl,
        forEl = crossman.forEl,
        ifEl = crossman.ifEl,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent,
        SjAnimation = crossman.SjAnimation
        ;
}catch(e){}

/****************************************************************************************************
 *
 *
 * View
 *
 *
 ****************************************************************************************************/
KeyMan.View = function(keyman){
    /** Status **/
    this.keyman = keyman;
    this.latestUserInputKeyStepList = null;
    this.currentKeyCluster = null;
    this.currentKeyMap = null;
    this.targetKeyMapContextElement = null;
    this.targetKeyMapToolPanelElement = null;
    this.targetKeyMapViewPanelElement = null;
    this.timerToFadeout = null;

    this.keyInputContextEl = null;
    this.timeForDisplayForKeyInput = 1000

    var that = this;
    keyman
        .addEventListener(KeyMan.EVENT_KEYDOWN, function(eventData){
            clearTimeout(that.timerToFadeout);
            //Check auto fadeout
            that.timerToFadeout = setTimeout(function(){
                that.clearKeyInputView();
            }, that.timeForDisplayForKeyInput);
            //Show keyInputViewer
            if (that.keyInputContextEl){
                that.keyInputContextEl.setStyle("display", "block");
            }
        })
        .addEventListener(KeyMan.EVENT_ADDEDKEY, function(eventData){
            console.error('addedkey!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_MODIFIEDKEY, function(eventData){
            console.error('modifiedkey!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_REMOVEDKEY, function(eventData){
            console.error('removedkey!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_ADDEDMAP, function(eventData){
            console.error('addedmap!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_MODIFIEDOPTION, function(eventData){
            console.error('modifiedoption!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_MODIFIEDMAP, function(eventData){
            console.error('modifiedmap!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_REMOVEDMAP, function(eventData){
            console.error('removedmap!!', eventData);
            that.refresh();
        })
        .addEventListener(KeyMan.EVENT_CHANGEKEYTYPE, function(eventData){
            var keyType = eventData.keyType;
            getEl('keyman-button-keytype').html( keyType.getIconText() );
        })
    ;
};

/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = KeyMan.View;
} catch (e) {}


KeyMan.View.prototype.getCurrentKeyMapCluster = function(){
    return this.currentKeyMapCluster;
};
KeyMan.View.prototype.setCurrentKeyMapCluster = function(keyMapCluster){
    this.currentKeyMapCluster = keyMapCluster;
    return this;
};

KeyMan.View.prototype.getCurrentKeyMap = function(){
    return this.currentKeyMap;
};
KeyMan.View.prototype.setCurrentKeyMap = function(keyMap){
    this.currentKeyMap = keyMap;
    return this;
};

KeyMan.View.prototype.getLatestUserInputKeyStepList = function(){
    return this.latestUserInputKeyStepList;
};
KeyMan.View.prototype.setLatestUserInputKeyStepList = function(latestUserInputKeyStepList){
    this.latestUserInputKeyStepList = latestUserInputKeyStepList;
    return this;
};


/*************************
 *
 * Key
 *
 *************************/
KeyMan.View.generateButtonViewForKey = function(key, parent){
    var keyEl = newEl('kbd').addClass('key').html(key);
    if (parent)
        keyEl.appendTo(parent);
    return keyEl;
};

/*************************
 *
 * KeyStep
 *
 *************************/
KeyMan.View.generateButtonViewForKeyStep = function(keyStep){
    var keySeparator;
    var keyStepEl = newEl('span').addClass('key-step')
        .if(keyStep.status == KeyMan.KeyStep.STATUS_CHECKED, function(it){ it.addClass('checked'); })
        .if(keyStep.status == KeyMan.KeyStep.STATUS_CHECKING, function(it){ it.addClass('checking'); })
        .if(keyStep.status == KeyMan.KeyStep.STATUS_RUN, function(it){ it.addClass('run'); });
    getData(keyStep.keys).each(function(key){
        if (key === null || key === undefined)
            return;
        if (keySeparator)
            newEl('span').html(' + ').addClass('key-step-conjunction').appendTo(keyStepEl);
        keySeparator = KeyMan.View.generateButtonViewForKey(key).appendTo(keyStepEl);
    });
    return keyStepEl;
};

KeyMan.View.generateButtonViewForAssembledKeyStep = function(keyStep){
    var keySeparator;
    var keyStepEl = newEl('span').addClass('key-step')
        .if(keyStep.status == KeyMan.KeyStep.STATUS_CHECKED, function(it){ it.addClass('checked'); })
        .if(keyStep.status == KeyMan.KeyStep.STATUS_CHECKING, function(it){ it.addClass('checking'); })
        .if(keyStep.status == KeyMan.KeyStep.STATUS_RUN, function(it){ it.addClass('run'); });
    var assembledChar = keyStep.getAssembledChar();
    newEl('span').html(' + ').addClass('key-step-conjunction').appendTo(keyStepEl);
    keySeparator = KeyMan.View.generateButtonViewForKey( assembledChar ).appendTo(keyStepEl);
    return keyStepEl;
};

/*************************
 *
 * KeyStepList
 *
 *************************/
KeyMan.View.generateKeyViewForKeyStepList = function(keyStepList, type){
    var keyStepListEl = newEl('span').addClass('key-step-list');
    var keyStepSeparator;
    getData(keyStepList).each(function(keyStep){
        if (keyStepSeparator)
            newEl('span').html(' > ').addClass('key-step-conjunction').appendTo(keyStepListEl);
        keyStepSeparator = KeyMan.View.generateButtonViewForKeyStep(keyStep).appendTo(keyStepListEl);
    });
    if (type == null)
        type = '';
    return keyStepListEl.addClass( type.toLowerCase() );
};

KeyMan.View.generateKeyViewForAssembledKeyStepList = function(keyStepList, type){
    var keyStepSeparator;
    var keyStepListEl = newEl('span').addClass('key-step-list');
    getData(keyStepList).each(function(keyStep){
        if (keyStepSeparator)
            newEl('span').html(' > ').addClass('key-step-conjunction').appendTo(keyStepListEl);
        keyStepSeparator = KeyMan.View.generateButtonViewForAssembledKeyStep(keyStep).appendTo(keyStepListEl);
    });
    if (type == null)
        type = '';
    return keyStepListEl.addClass( type.toLowerCase() );
};


/*************************
 *
 * Toggle - BUTTONS
 *
 *************************/
KeyMan.View.generateRadioSwitch = function(radioName, itemList, indexForChecked, funcForChangeEvent){
    var i = -1;
    return newEl('div').addClass(['switch-field', 'inline-block']).add([
        forEl(itemList, function(v){
            var checked = (indexForChecked == (++i));
            return [
                newEl('input').attr('type', 'radio').attr('name', radioName).attr('id', radioName + v).setValue(v).if(checked, function(it){ it.prop('checked', true); }).addEventListener('click', function(e){
                    funcForChangeEvent(v);
                }),
                newEl('label').attr('for', radioName + v).html(v)
            ]
        }),
    ]);
};

KeyMan.View.generateCheckLockSwitch = function(text, check){
    console.error('[CHECK] created ...', text, check);
    return newEl('div').addClass(['toggle-w', 'inline-block']).add([
        newEl('label').addClass('lock').add([
            newEl('input').attr('type', 'checkbox').if(check, function(it){ it.prop('checked', true) }),
            newEl('span').html(text),
        ])
    ]);
};





KeyMan.View.prototype.generateKeyInputView = function(keyman){
    var that = this;
    var keyInputContextEl = this.keyInputContextEl = newEl('div').addClass('keyman-view-input-context');

    getData(keyman.keyHandlers).each(function(type, keyHandler){
        var typeLower = type.toLowerCase();
        var handlerClassName = 'key-view-' +typeLower;
        var handlerViewEl = newEl('div').addClass(handlerClassName);
        keyInputContextEl.add(handlerViewEl);

        //-
        var funcToApplyToKeyHandlerInputView = null;
        switch (type){
            case KeyMan.TYPE_TYPING: funcToApplyToKeyHandlerInputView = KeyMan.View.applyToTypingInputView; break;
            case KeyMan.TYPE_COMMAND: funcToApplyToKeyHandlerInputView = KeyMan.View.applyToCommandInputView; break;
            case KeyMan.TYPE_SHORTCUT: funcToApplyToKeyHandlerInputView = KeyMan.View.applyToShortcutInputView; break;
            case KeyMan.TYPE_DEFINED: funcToApplyToKeyHandlerInputView = KeyMan.View.applyToDefinedInputView; break;
            case KeyMan.TYPE_DEFINEDCOMMAND: funcToApplyToKeyHandlerInputView = KeyMan.View.applyToDefinedCommandInputView; break;
            default: return; break;
        }
        funcToApplyToKeyHandlerInputView(keyman, handlerViewEl);

        //-
        var adderId = '_input_adder_for_' +typeLower+ 'keyhandler';
        var removerId = '_input_remover_for_' +typeLower+ 'keyhandler';
        var keydownId = '_input-' +typeLower+ 'keydown';
        var eventForAdder = 'added' +typeLower+ 'keyhandler';
        var eventForRemover = 'removed' +typeLower+ 'keyhandler';
        var eventForKeydown = typeLower+ 'keydown';
        keyman.addEventListenerById(adderId, eventForAdder, function(e){
            funcToApplyToKeyHandlerInputView(keyman, handlerViewEl, function(el){
                that.animation = that.animation ? that.animation : KeyMan.View.generateAnimation(keyInputContextEl);
            });
        });
        keyman.addEventListenerById(removerId, eventForRemover, function(e){
            keyman.checkAndDestroyKeyHandler(typeLower);
            keyman.removeEventListenerById(keydownId, eventForKeydown);
        });
    });

    // that.toggleUserKeyInputSystem(it, keyViewerEl);
    // KeyMan.View.generateKeyViewForKeyStepList( KeyMan.parseToKeyStepList(functionKey.keys), functionKey.type );
    return keyInputContextEl;
};
KeyMan.View.prototype.clearKeyInputView = function(keyman){
    this.keyInputContextEl.setStyle("display", "none");
};

KeyMan.View.prototype.destroyKeyInputView = function(keyman){ //TODO: 여기 오는겨?
    keyman.checkAndDestroyAllKeyHandler();
    getData(keyman.keyHandlers).each(function(type, keyHandler){
        var adderId = '_input_adder_for_' +typeLower+ 'keyhandler';
        var removerId = '_input_remover_for_' +typeLower+ 'keyhandler';
        keyman.removeEventListenerById(adderId);
        keyman.removeEventListenerById(removerId);
    });

};


KeyMan.View.applyToTypingInputView = function(keyman, viewEl, callback){
    var keyHandlerType = KeyMan.TYPE_TYPING;
    var typeLower = keyHandlerType.toLowerCase();
    var eventCustomId = '_input-' +typeLower+ 'keydown';
    var eventName = typeLower+ 'keydown';
    keyman.runKeyHandlerForce(keyHandlerType);
    keyman.addEventListenerById(eventCustomId, eventName, function(eventData){
        if (!eventData.keyStepList)
            return;
        //Current User Key
        var currentUserKeyListView = KeyMan.View.generateKeyViewForAssembledKeyStepList(eventData.keyStepList, keyHandlerType);
        getEl(viewEl).html('').add( currentUserKeyListView );
        //Predicted Key
        var predictStartIndex = eventData.matchingProcessKeyStepIndex;
        var predictData = getData(eventData.indexedFunctionKeyBufferMap).getFirst();
        if (predictData && predictData.keyStepList){
            var predicatedKeyList = getData(predictData.keyStepList).range(predictStartIndex +1).returnCloneData();
            var predicatedKeyListView = KeyMan.View.generateKeyViewForAssembledKeyStepList(predicatedKeyList, keyHandlerType).addClass('predicted');
            currentUserKeyListView.add([newEl('span').add(' > ').addClass('key-step-conjunction'), predicatedKeyListView]);
        }
        (callback && callback(viewEl));
    });
};
KeyMan.View.applyToCommandInputView = function(keyman, viewEl, callback){
    var keyHandlerType = KeyMan.TYPE_COMMAND;
    var typeLower = keyHandlerType.toLowerCase();
    var eventCustomId = '_input-' +typeLower+ 'keydown';
    var eventName = typeLower+ 'keydown';
    keyman.runKeyHandlerForce(keyHandlerType);
    keyman.addEventListenerById(eventCustomId, eventName, function(eventData){
        if (!eventData.keyStepList)
            return;
        //Current User Key
        var currentUserKeyListView = KeyMan.View.generateKeyViewForKeyStepList(eventData.keyStepList, keyHandlerType);
        getEl(viewEl).html('').add( currentUserKeyListView );
        //Predicted Key
        var predictStartIndex = eventData.matchingProcessKeyStepIndex;
        var predictData = getData(eventData.indexedFunctionKeyBufferMap).getFirst();
        if (predictData && predictData.keyStepList){
            var predicatedKeyListView = KeyMan.View.generateKeyViewForKeyStepList( getData(predictData.keyStepList).range(predictStartIndex +1).returnCloneData(), keyHandlerType).addClass('predicted')
            currentUserKeyListView.add([newEl('span').add(' > ').addClass('key-step-conjunction'), predicatedKeyListView]);
        }
        (callback && callback(viewEl));
    });
};

KeyMan.View.applyToDefinedInputView = function(keyman, viewEl, callback){
    var keyHandlerType = KeyMan.TYPE_DEFINED;
    var typeLower = keyHandlerType.toLowerCase();
    var eventCustomId = '_input-' +typeLower+ 'keydown';
    var eventName = typeLower+ 'keydown';
    keyman.runKeyHandlerForce(keyHandlerType);
    keyman.addEventListenerById(eventCustomId, eventName, function(eventData){
        if (!eventData.keyStepList)
            return;
        getEl(viewEl).html('').add( KeyMan.View.generateKeyViewForKeyStepList(eventData.keyStepList, keyHandlerType) );
        (callback && callback(viewEl));
    });
};

KeyMan.View.applyToDefinedCommandInputView = function(keyman, viewEl, callback){
    var keyHandlerType = KeyMan.TYPE_DEFINEDCOMMAND;
    var typeLower = keyHandlerType.toLowerCase();
    var eventCustomId = '_input-' +typeLower+ 'keydown';
    var eventName = typeLower+ 'keydown';
    keyman.runKeyHandlerForce(keyHandlerType);
    keyman.addEventListenerById(eventCustomId, eventName, function(eventData){
        if (!eventData.keyStepList)
            return;
        //Current User Key
        var currentUserKeyListView = KeyMan.View.generateKeyViewForKeyStepList(eventData.keyStepList, keyHandlerType);
        getEl(viewEl).html('').add( currentUserKeyListView );
        //Predicted Key
        var predictStartIndex = eventData.matchingProcessKeyStepIndex;
        var predictData = getData(eventData.indexedFunctionKeyBufferMap).getFirst();
        if (predictData && predictData.keyStepList){
            var predicatedKeyListView = KeyMan.View.generateKeyViewForKeyStepList( getData(predictData.keyStepList).range(predictStartIndex +1).returnCloneData(), keyHandlerType).addClass('predicted')
            currentUserKeyListView.add([newEl('span').add(' > ').addClass('key-step-conjunction'), predicatedKeyListView]);
        }
        (callback && callback(viewEl));
    });
};

KeyMan.View.applyToShortcutInputView = function(keyman, viewEl, callback){
    var keyHandlerType = KeyMan.TYPE_SHORTCUT;
    var typeLower = keyHandlerType.toLowerCase();
    var eventCustomId = '_input-' +typeLower+ 'keydown';
    var eventName = typeLower+ 'keydown';
    keyman.runKeyHandlerForce(keyHandlerType);
    keyman.addEventListenerById(eventCustomId, eventName, function(eventData){
        if (!eventData.keyStepList)
            return;
        getEl(viewEl).html('').add( KeyMan.View.generateKeyViewForKeyStepList(eventData.keyStepList, keyHandlerType) );
        (callback && callback(viewEl));
    });
};

KeyMan.View.generateAnimation = function(keyInputContextEl){

};





KeyMan.View.prototype.generateKeyManViewContext = function(keyCluster){
    var that = this;
    if (!that.currentKeyCluster)
        that.setCurrentKeyMapCluster( keyCluster );
    if (!that.currentKeyMap)
        that.setCurrentKeyMap( keyCluster.getFirst() );
    if (!that.targetKeyMapContextElement)
        that.targetKeyMapContextElement = newEl('div').addClass('keyman-view-context');
    return that.targetKeyMapContextElement.add([
        that.generateToolViewForKeyMap( that.getCurrentKeyMapCluster() ),
        that.generateTableViewForKeyMap( that.getCurrentKeyMapCluster(), that.getCurrentKeyMap() )
    ]);
};



/*************************
 *
 * TOOL - BUTTONS
 *
 *************************/
KeyMan.View.prototype.generateToolViewForKeyMap = function(keyMapCluster){
    var that = this;
    var keyman = this.keyman;
    console.error(that.getCurrentKeyMap());
    var currentKeyMapId = (that.getCurrentKeyMap()) ? that.getCurrentKeyMap().id : null;
    var currentKeyMap = keyMapCluster.getKeyMap(currentKeyMapId);
    if (!that.targetKeyMapToolPanelElement)
        that.targetKeyMapToolPanelElement = newEl('div').addClass('keyman-view-tool');
    var titleEl = newEl('span').addClass('title');
    var selectEl = newEl('select');
    var buttonElToModifyKeyMap = newEl('button').html('🔧').addClass(['']);
    var buttonElToNewKeyMap = newEl('button').html('📄').addClass(['']);
    var buttonElToToggleKeyType = newEl('button').attr('id', 'keyman-button-keytype').html( keyman.getCurrentKeyType().getIconText() ).addClass(['']);
    var selectorElOnMultiMapMode = newEl('button').html('✔').addClass(['setup']).addEventListener('click', function(e){
        console.error('!!!', that.checkCurrentKeyMapIsSelected());
        if (!that.checkCurrentKeyMapIsSelected()){
            keyMapCluster.selectKeyMapOnMultiMapMode(that.getCurrentKeyMap().id);
            selectorElOnMultiMapMode.addClass('selected');
            that.refreshView();
        }
    });


    return that.targetKeyMapToolPanelElement.add([
        titleEl.html('⌨'),
        ifEl(keyMapCluster.modeMultiMap, selectorElOnMultiMapMode),
        selectEl
            .addEventListener('change', function(e){
                console.error(selectEl.value(), e);
                var data;
                if (!selectEl.value()){
                    data = {};
                }else{
                    that.setCurrentKeyMap( keyMapCluster.getKeyMap(selectEl.value()) );
                }
                that.refreshView();
                //- Selector for MultiMap
                if (that.checkCurrentKeyMapIsSelected()){
                    selectorElOnMultiMapMode.addClass('selected');
                }else{
                    selectorElOnMultiMapMode.removeClass('selected');
                }
            })
            .add([
                forEl(keyMapCluster.getKeyMaps(), function(k, v){
                    return newEl('option').html(v.title).setValue(v.id);
                })
            ])
            .setValue(currentKeyMapId)
            .trigger('change'),
        buttonElToModifyKeyMap.addEventListener('click', function(e){
            if (!that.getCurrentKeyMap())
                return;
            that.generatePopViewForKeyMapProperties(keyMapCluster, that.getCurrentKeyMap()).appendTo(document.body);
        }),
        buttonElToNewKeyMap.addEventListener('click', function(e){
            that.generatePopViewForKeyMapProperties(keyMapCluster).appendTo(document.body);
        }),
        buttonElToToggleKeyType.addEventListener('click', function(e){
            keyman.toggleKeyType();
        }),
        newEl('span').addClass('gap'),

        ifEl((currentKeyMap && currentKeyMap.modeEditable),
            newEl('button').html('⚙️').addClass(['setup', 'float-right']).addEventListener('click', function(e){
                that.generatePopViewForKeyManSetup(keyMapCluster).appendTo(document.body);
            })
        ),
        ifEl(!keyMapCluster.modeAutoSave,
            newEl('button').html('💾').addClass(['setup', 'float-right']).addEventListener('click', function(e){
                //Popup 하고 Save Yes or No
                if (confirm("Do you like to save?")){
                    keyMapCluster.save()
                    // that.generatePopViewForKeyMapProperties(keyMapCluster).appendTo(document.body);
                }
            })
        ),
    ]);
};

KeyMan.View.prototype.checkCurrentKeyMapIsSelected = function(){
    return (this.getCurrentKeyMap().id == this.getCurrentKeyMapCluster().keyMapSelectedWhenMultiMapMode);
};

KeyMan.View.prototype.refresh = function(){
    var that = this;
    return this.refreshTool().refreshView();
};

KeyMan.View.prototype.refreshTool = function(){
    var that = this;
    console.error('[VIEW - REFRESH] Tool ', that.targetKeyMapToolPanelElement);
    if (!that.targetKeyMapToolPanelElement)
        return this;
    getEl( that.targetKeyMapToolPanelElement ).html('');
    that.generateToolViewForKeyMap( that.getCurrentKeyMapCluster() );
    return this;
};

KeyMan.View.prototype.refreshView = function(){
    var that = this;
    console.error('[VIEW - REFRESH] View ', that.targetKeyMapViewPanelElement);
    if (!that.targetKeyMapViewPanelElement)
        return this;
    getEl( that.targetKeyMapViewPanelElement ).html('');
    that.generateTableViewForKeyMap( that.getCurrentKeyMapCluster(), that.getCurrentKeyMap() );
    return this;
};

/*************************
 *
 * BUTTON - ADD FUNCTIONKEY
 *
 *************************/
KeyMan.View.prototype.generateButtonViewForKeyAdditionButton = function(){
    var that = this;
    var keyAdditionButtonEl = newEl('div').addClass('keyman-key-map-addition-key-button').html('+').addEventListener('click', function(event){
        var currentKeyMap = that.getCurrentKeyMap();
        if (!currentKeyMap)
            return;
        that.generatePopViewForKeyProperties(currentKeyMap).appendTo(document.body);
    });
    return keyAdditionButtonEl;
};

/*************************
 *
 * KEYMAP TABLE LIST
 *
 *************************/
KeyMan.View.prototype.generateTableViewForKeyMap = function(targetKeyMapCluster, targetKeyMap){
    var that = this;
    var keyman = this.keyman;
    if (!that.targetKeyMapViewPanelElement)
        that.targetKeyMapViewPanelElement = newEl('div').addClass('keyman-view-view');
    if (targetKeyMapCluster.modeMultiMap){
        that.targetKeyMapViewPanelElement.if(this.checkCurrentKeyMapIsSelected(),
            function(it){ it.removeClass('unselected').addClass('selected'); },
            function(it){ it.removeClass('selected').addClass('unselected'); }
        )
    }
    return that.targetKeyMapViewPanelElement
        .add([
            KeyMan.View.generateTableViewForKeyMap(targetKeyMap, keyman.getRunnerPool(),
                function(event, keyMap, fKey){
                    that.generatePopViewForKeyProperties(keyMap, fKey.id).appendTo(document.body);
                },
                function(event, keyMap, fKey){
                    that.generatePopViewForKeyPattern(keyMap, fKey.id).appendTo(document.body);
                }
            ),
            that.generateButtonViewForKeyAdditionButton()
        ]);
};

KeyMan.View.generateTableViewForKeyMapTitle = function(targetKeyMap){
    return newEl('div').html(targetKeyMap.title).addClass(['left', 'key-map-title'])
        .if(targetKeyMap.statusDuplicated, function(it){ it.addClass('dup'); })
        .if(targetKeyMap.statusNew, function(it){ it.addClass('new'); })
};
KeyMan.View.generateTableViewForKeyMap = function(targetKeyMap, runnerPool, funcToSetupProperties, funcToSetupKeyPattern){
    if (!targetKeyMap)
        throw 'Does not exists KeyMap: ';
    var keyMapTableEl = newEl('ul').addClass('key-map')
        .if(targetKeyMap.statusDuplicated, function(it){ it.addClass('dup'); })
        .if(targetKeyMap.statusNew, function(it){ it.addClass('new'); })
        .if(targetKeyMap.statusSelectedOnMultiMap, function(it){ it.addClass('selected'); })
        .add([
            forEl(targetKeyMap.getFunctionKeys(), function(key, functionKey){
                var runner = runnerPool.get(functionKey.runner);
                return newEl('li').addClass('').add([

                    //- Make Preview-FunctionKey
                    KeyMan.View.generateTableViewForFunctionKey(functionKey, targetKeyMap, runner, funcToSetupProperties, funcToSetupKeyPattern),
                    ifEl(functionKey.tempCopy, function(){
                        return KeyMan.View.generateTableViewForFunctionKey(functionKey.tempCopy, targetKeyMap, runner, funcToSetupProperties, funcToSetupKeyPattern);
                    })

                ]);
            })
        ]);
    return keyMapTableEl;
};

KeyMan.View.generateTableViewForFunctionKey = function(functionKey, targetKeyMap, runner, funcToSetupProperties, funcToSetupKeyPattern){
    var runnerTitle = runner !== null ? runner.title : '';
    return newEl('table').addClass('key-item')
        .if(functionKey.statusDuplicated, function(it){ it.addClass('dup'); })
        .if(functionKey.statusNew, function(it){ it.addClass('new'); })
        .if(targetKeyMap.modeLock || functionKey.modeLock, function(it){ it.addClass('lock'); })
        .add([
            newEl('tr').add([
                newEl('td').addClass('key-item-title')
                    .addEventListener('click', function(e){
                        (funcToSetupProperties && funcToSetupProperties(e, targetKeyMap, functionKey));
                    })
                    .add([
                        functionKey.title,
                        newEl('br'),
                        newEl('span').addClass('key-item-runner').html(runnerTitle).if(!functionKey.statusSameRunner, function(it){ it.addClass('update'); }),
                        ifEl(functionKey.data, function(){
                            return [
                                ' < ',
                                newEl('span').addClass('key-item-runner-data').html(functionKey.data).if(!functionKey.statusSameRunnerData, function(it){ it.addClass('update'); })
                            ];
                        })
                    ]),
                newEl('td').addClass('key-item-keys')
                    .addEventListener('click', function(e){
                        (funcToSetupKeyPattern && funcToSetupKeyPattern(e, targetKeyMap, functionKey));
                    })
                    .add(
                        KeyMan.View.generateKeyViewForKeyStepList( KeyMan.parseToKeyStepList(functionKey.keys), functionKey.type ).if(!functionKey.statusSameKeyStepList, function(it){ it.addClass('update'); })
                    )
            ])
        ]);
};



/*************************
 *
 * POP - FUNCTIONKEY PROPERITES
 *
 *************************/
KeyMan.View.prototype.generatePopViewForKeyProperties = function(targetKeyMap, targetFunctionKey){
    var that = this;
    var keyman = this.keyman;
    var runnerMap = keyman.getRunnerPool().getRunnerMap();
    targetFunctionKey = targetKeyMap.get(targetFunctionKey);
    console.error('check', targetKeyMap, targetFunctionKey);
    var modeNew = !(!!targetFunctionKey);
    if (modeNew){
        targetFunctionKey = new KeyMan.FunctionKey({});
    }
    var darkSpreadEl = newEl('div').addClass('keyman-view-pop-darkness').setStyle('zIndex', getData().findHighestZIndex(['div']) + 1);
    var popViewEl = newEl('div').addClass('keyman-view-pop-content-box');
    var popViewTitleEl = newEl('div').addClass('keyman-view-pop-title');
    var propertiesViewerEl = newEl('div').addClass('keyman-view-pop-properties-box');
    var inputForTitle = newEl('input').attr('type', 'text');
    var selectForRunner = newEl('select');
    var inputForRunnerData = newEl('input').attr('type', 'text');
    var toggleForUse = KeyMan.View.generateCheckLockSwitch('Use', !targetFunctionKey.modeLock);
    var buttonForDelete = newEl('button');
    popViewEl
        .add([
            popViewTitleEl.add([ifEl(modeNew, 'NEW '), 'KEY']),
            propertiesViewerEl.add([
                newEl('label').html('TITLE'),
                inputForTitle.value(targetFunctionKey.title),

                newEl('label').html('RUNNER'),
                newEl('div').addClass(['inline-block', 'left']).style('width:90%;').add([
                    selectForRunner.add([
                        forEl(runnerMap, function(k, v){
                            return newEl('option').value(k).html(v.title);
                        })
                    ]).setValue(targetFunctionKey.runner).trigger('change'),
                ]),

                newEl('label').html('RUNNER DATA'),
                inputForRunnerData.setValue(targetFunctionKey.data),
                newEl('br'),
                newEl('br'),

                ifEl(!modeNew, [
                    newEl('div').addClass('left').add([
                        toggleForUse
                    ]),
                    newEl('br')
                ]),
            ]),
            // forEl(3, function(){ return newEl('br'); }),

            newEl('div').addClass(['inline-block', 'right']).style('width:99%;').add([
                ifEl(!modeNew && targetFunctionKey.modeRemovable, function(){
                    return [
                        buttonForDelete.addClass(['trash-can', 'float-right']).html('🗑️ Delete').addEventListener('click', function(e){
                            if (confirm('It will be removed')){
                                targetFunctionKey.removeFromKeyMap();
                                darkSpreadEl.trigger('click');
                            }
                        })
                    ];
                })
            ]),

            newEl('button').html('O').addEventListener('click', function(e){
                if (modeNew){
                    targetKeyMap.add({
                        type: KeyMan.TYPE_SHORTCUT,
                        title: inputForTitle.value(),
                        runner: selectForRunner.value(),
                        data: inputForRunnerData.value()
                    });
                }else{
                    targetFunctionKey.modify({
                        title: inputForTitle.value(),
                        runner: selectForRunner.value(),
                        data: inputForRunnerData.value(),
                        modeLock: !toggleForUse.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked')
                    });
                }
                darkSpreadEl.trigger('click');
            }),
            newEl('span').addClass('gap'),
            newEl('button').html('X').addEventListener('click', function(e){
                darkSpreadEl.trigger('click');
            }),
        ])
        .addEventListener('click', function(event){
            event.stopPropagation();
        });
    darkSpreadEl
        .add([
            forEl(1, function(){ return newEl('br'); }),
            popViewEl
        ])
        .addEventListener('click', function(event){
            darkSpreadEl.removeFromParent();
        });
    return darkSpreadEl;
};

/*************************
 *
 * POP - FUNCTIONKEY PATTERN
 *
 *************************/
KeyMan.View.prototype.generatePopViewForKeyPattern = function(targetKeyMap, targetFunctionKey){
    var that = this;
    var keyman = this.keyman;
    var copiedFK = null;
    targetKeyMap = (targetKeyMap) ? targetKeyMap : that.currentKeyMap;
    targetFunctionKey = targetKeyMap.get(targetFunctionKey);
    var modeNew = !(!!targetFunctionKey);
    if (modeNew){
        // copiedFunctionKey = new KeyMan.FunctionKey({})
    }else{
        copiedFK = targetFunctionKey.copy().setKeyMan(keyman);
    }
    var keyHandlerButtonLabels = keyman.getKeyHandlerNames();
    var darkSpreadEl = newEl('div').addClass('keyman-view-pop-darkness').setStyle('zIndex', getData().findHighestZIndex(['div']) + 1);
    var popViewEl = newEl('div').addClass('keyman-view-pop-content-box');
    var popViewTitleEl = newEl('div').addClass('keyman-view-pop-title');
    var keyViewerEl = newEl('div').addClass(['keyman-view-pop-key-box', 'light-keys']);
    var typeableViewerEl = newEl('span');
    console.error('!!!@#asdf', targetFunctionKey, copiedFK);
    var toggleForKeyHandleMode = KeyMan.View.generateRadioSwitch('handler', keyHandlerButtonLabels, 0,function(it){
        var kh = keyman.getKeyHandlerByName(it);
        copiedFK.type = kh.type;
        that.latestUserInputKeyStepList = null;
        KeyMan.View.generateKeyViewForKeyStepList(that.latestUserInputKeyStepList, copiedFK.type).appendTo( keyViewerEl.html('') );
        that.toggleUserKeyInputSystem(kh.type, keyViewerEl);
    });

    var keyHandler = keyman.getKeyHandlerByType(copiedFK.type);
    keyHandler = keyHandler ? keyHandler : keyman.getDefaultKeyHandler();
    var keyHandlerName = keyHandler.name;
    var keyHandlerType = keyHandler.type;
    that.toggleUserKeyInputSystem( keyHandlerType, keyViewerEl );
    if (copiedFK){
        var foundEl = toggleForKeyHandleMode.findChildEl(function(it){ return it.attr('type') == 'radio' && it.value() == keyHandlerName; });
        foundEl.prop('checked', true);
        that.latestUserInputKeyStepList = copiedFK.keyStepList;
        KeyMan.View.generateKeyViewForKeyStepList(that.latestUserInputKeyStepList, copiedFK.type).appendTo( keyViewerEl.html('') );
    }
    popViewEl
        .add([
            popViewTitleEl.html('KEY PATTERN').add( typeableViewerEl.html('●').addClass('sign-typable') ),
            keyViewerEl,
            newEl('br'),
            newEl('div').addClass(['inline-block', 'left']).style('width:95%;').add([
                toggleForKeyHandleMode
            ]),
            forEl(3, function(){ return newEl('br'); }),

            newEl('button').html('O').addEventListener('click', function(e){
                var keys = getData(that.latestUserInputKeyStepList).collect(function(it){ return it.keys });
                if (modeNew){
                    targetKeyMap.add({title:'No Title', type:copiedFK.type, keys:keys});
                }else{
                    targetKeyMap.get(targetFunctionKey).modify({type:copiedFK.type, keys:keys});
                }
                darkSpreadEl.trigger('click');
            }),
            newEl('span').addClass('gap'),
            newEl('button').html('X').addEventListener('click', function(e){
                darkSpreadEl.trigger('click');
            }),
        ])
        .addEventListener('click', function(event){
            event.stopPropagation();
        });
    darkSpreadEl
        .add([
            forEl(1, function(){ return newEl('br'); }),
            popViewEl
        ])
        .addEventListener('click', function(event){
            //- Remove All keydown Event
            var keyHandlerTypes = keyman.getKeyHandlerTypes();
            var keyHandlerLowerEventName;
            var keydownId;
            var keydownEventName;
            getData(keyHandlerTypes).each(function(it){
                keyHandlerLowerEventName = it.toLowerCase();
                keydownId = '_test-' +keyHandlerLowerEventName+ 'keydown';
                keydownEventName = keyHandlerLowerEventName+ 'keydown';
                keyman.removeEventListenerById(keydownId, keydownEventName);
            });

            keyman.removeEventListenerById('_test-untypeable', 'untypeable');
            keyman.removeEventListenerById('_test-typeable', 'typeable');

            keyman.checkAndDestroyAllKeyHandler();

            darkSpreadEl.removeFromParent();
        });
    keyman.addEventListenerById('_test-untypeable', 'untypeable', function(eventData){
        getEl(typeableViewerEl).setStyle('color', 'red');
    });
    keyman.addEventListenerById('_test-typeable', 'typeable', function(eventData){
        getEl(typeableViewerEl).setStyle('color', 'green');
    });
    return darkSpreadEl;
};
KeyMan.View.prototype.toggleUserKeyInputSystem = function(keyHandlerType, showingContextElement){
    var that = this;
    var keyman = this.keyman;
    var keyHandlerTypes = keyman.getKeyHandlerTypes();

    getData(keyHandlerTypes).each(function(it){
        (it == keyHandlerType) ? keyman.runKeyHandlerForce(it) : keyman.checkAndDestroyKeyHandler(it);
    });

    //- Remove All keydown Event
    var keyHandlerLowerEventName;
    var keydownId;
    var keydownEventName;
    getData(keyHandlerTypes).each(function(it){
        keyHandlerLowerEventName = it.toLowerCase();
        keydownId = '_test-' +keyHandlerLowerEventName+ 'keydown';
        keydownEventName = keyHandlerLowerEventName+ 'keydown';
        keyman.removeEventListenerById(keydownId, keydownEventName);
    });

    //- Add only this type Event
    keyHandlerLowerEventName = keyHandlerType.toLowerCase()
    keydownId = '_test-' +keyHandlerLowerEventName+ 'keydown';
    keydownEventName = keyHandlerLowerEventName+ 'keydown';
    console.error('000', keydownId, keydownEventName);
    keyman.addEventListenerById(keydownId, keydownEventName, function(eventData){
        console.error('000', eventData);
        if (!eventData.keyStepList)
            return;
        that.latestUserInputKeyStepList = eventData.keyStepList;
        getEl(showingContextElement).html('').add( KeyMan.View.generateKeyViewForKeyStepList(eventData.keyStepList, keyHandlerType) );
    });
};



/*************************
 *
 * POP - KEYMAP PROPERTIES
 *
 *************************/
KeyMan.View.prototype.generatePopViewForKeyMapProperties = function(targetKeyMapCluster, targetKeyMap){
    var that = this;
    var keyman = this.keyman;
    targetKeyMap = targetKeyMapCluster.getKeyMap(targetKeyMap);
    var modeNew = !(!!targetKeyMap);
    if (modeNew){
        targetKeyMap = new KeyMan.KeyMap({});
    }
    console.error('[POP KEYMAP] ', targetKeyMapCluster, targetKeyMap);
    var darkSpreadEl = newEl('div').addClass('keyman-view-pop-darkness').setStyle('zIndex', getData().findHighestZIndex(['div']) + 1);
    var popViewEl = newEl('div').addClass('keyman-view-pop-content-box');
    var popViewTitleEl = newEl('div').addClass('keyman-view-pop-title');
    var propertiesViewerEl = newEl('div').addClass('keyman-view-pop-properties-box');
    var inputForTitle = newEl('input').attr('type', 'text').setValue(targetKeyMap.title);
    var toggleForUse = KeyMan.View.generateCheckLockSwitch('Use', !targetKeyMap.modeLock);
    var buttonForDelete = newEl('button');
    popViewEl
        .add([
            popViewTitleEl.add([ifEl(modeNew, 'NEW '), 'KEYMAP']),
            propertiesViewerEl.add([
                newEl('label').html('TITLE'),
                inputForTitle,
                newEl('br'),
                newEl('br'),

                ifEl(!modeNew,[
                    newEl('div').addClass('left').add([
                        toggleForUse
                    ]),
                    newEl('br')
                ])
            ]),
            newEl('br'),

            newEl('div').addClass(['inline-block', 'right']).style('width:99%;').add([
                ifEl(!modeNew && targetKeyMap.modeRemovable,
                    buttonForDelete.addClass('float-right').html('🗑️ Delete').addEventListener('click', function(e){
                        if (confirm('It will be removed')){
                            that.currentKeyMap = null;
                            targetKeyMap.removeFromKeyCluster();
                            darkSpreadEl.trigger('click');
                        }
                    })
                )
            ]),

            newEl('button').html('O').addEventListener('click', function(e){
                that.currentKeyMap = targetKeyMap;
                if (modeNew){
                    targetKeyMapCluster.addKeyMap(
                        targetKeyMap.init({
                            title:inputForTitle.value()
                        })
                    );
                }else{
                    targetKeyMap.modify({
                        title: inputForTitle.value(),
                        modeLock: !toggleForUse.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked')
                    });
                }
                darkSpreadEl.trigger('click');
            }),
            newEl('span').addClass('gap'),
            newEl('button').html('X').addEventListener('click', function(e){
                darkSpreadEl.trigger('click');
            }),
        ])
        .addEventListener('click', function(event){
            event.stopPropagation();
        });
    darkSpreadEl
        .add([
            forEl(1, function(){ return newEl('br'); }),
            popViewEl
        ])
        .addEventListener('click', function(event){
            darkSpreadEl.removeFromParent();
        });
    return darkSpreadEl;
};



/*************************
 *
 * POP - KEYMAN - SETUP
 *
 *************************/
KeyMan.View.prototype.generatePopViewForKeyManSetup = function(keyCluster){
    var that = this;
    var keyman = this.keyman;
    var darkSpreadEl = newEl('div').addClass('keyman-view-pop-darkness').setStyle('zIndex', getData().findHighestZIndex(['div']) + 1);
    var popViewEl = newEl('div').addClass('keyman-view-pop-content-box');
    var popViewTitleEl = newEl('div').addClass('keyman-view-pop-title');
    var setupViewerEl = newEl('div').addClass('keyman-view-pop-setup-box');
    var setupDataExportViewerEl = newEl('div').addClass('keyman-view-pop-setup-box');
    var setupDataCodeViewerEl = newEl('div').addClass('keyman-view-pop-setup-box');
    var setupDataImportViewerEl = newEl('div').addClass('keyman-view-pop-setup-box');
    var divViewerForImport = newEl('div').addClass('none').style('width:95%; min-height:300px; border-radius: 5px;');
    // var inputForTitle = newEl('input').attr('type', 'text').setValue(targetKeyMap.title);
    var toggleForAutoSave = KeyMan.View.generateCheckLockSwitch('🤖Auto Save', keyCluster.modeAutoSave);
    var toggleForMultiMap = KeyMan.View.generateCheckLockSwitch('🎛️ Multi Map', keyCluster.modeMultiMap);
    var fileInputForImport = newEl('input').attr('type', 'file').addClass('none');
    var dataInput = newEl('input').attr('type', 'text');
    popViewEl
        .add([
            popViewTitleEl.add([
                'SETUP',
                newEl('a').html('@sj-js/keyman').addClass('float-right').style('font-size:12px;').attr('href', 'https://sj-js.github.io/sj-js/keyman')
            ]),
            setupViewerEl.add([
                newEl('label').html('OPTION').addClass(['title']),
                newEl('div').addClass('left').add([
                    toggleForAutoSave.addEventListener('change', function(e){
                        var checked = toggleForAutoSave.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked');
                        keyCluster.setModeAutoSave(checked).save();
                        that.refreshView();
                    }),
                    newEl('span').addClass('gap'),
                    toggleForMultiMap.addEventListener('change', function(e){
                        var checked = toggleForMultiMap.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked');
                        keyCluster.setModeMultiMap(checked).saveAuto();
                        that.refreshView();
                    }),
                ]),
            ]),
            newEl('br'),
            newEl('br'),

            setupDataExportViewerEl.add([
                newEl('label').html('EXPORT').addClass(['title']),
                newEl('button').html('📤{}').addClass(['menu']).addEventListener('click', function(e){
                    var encodedData = KeyMan.encodeData( keyCluster.extractData() );
                    dataInput.value(encodedData);
                }),
                newEl('button').html('📤🗎').addClass(['menu']).addEventListener('click', function(e){
                    var encodedData = KeyMan.encodeData( keyCluster.extractData() );
                    KeyMan.View.exportAsFile('keyman_cluster.dat', encodedData);
                }),
                newEl('br'),
                newEl('br')
            ]),
            newEl('br'),
            newEl('br'),

            setupDataCodeViewerEl.add([
                newEl('label').html('CODE').addClass(['title']),
                dataInput,
                newEl('br'),
                newEl('br')
            ]),
            newEl('br'),
            newEl('br'),

            setupDataImportViewerEl.add([
                newEl('label').html('IMPORT').addClass(['title']),
                newEl('button').html('📥{}').addClass(['menu']).addEventListener('click', function(e){
                    var importedObjectData = KeyMan.decodeData( dataInput.value() );
                    that.generateViewerForImport(importedObjectData, keyCluster, keyman.getRunnerPool(), divViewerForImport).appendTo( divViewerForImport.html('').removeClass('none').addClass('inline-block') );
                }),
                newEl('button').html('📥🗎').addClass(['menu']).addEventListener('click', function(e){
                    if ('FileReader' in window){
                        fileInputForImport.click();
                    }else{
                        alert('Your browser does not support the HTML5 FileReader.');
                    }
                }),
                fileInputForImport.addEventListener('change', function(event){
                    var fileToLoad = event.target.files[0];
                    if (fileToLoad){
                        var startTime = new Date().getTime();
                        var reader = new FileReader();
                        reader.onload = function(fileLoadedEvent){
                            console.debug('trying import: elapsedTime: ', new Date().getTime() - startTime );
                            var textFromFileLoaded = fileLoadedEvent.target.result;
                            var importedObjectData = KeyMan.decodeData( textFromFileLoaded );
                            that.generateViewerForImport(importedObjectData, keyCluster, keyman.getRunnerPool()).appendTo( divViewerForImport.html('').removeClass('none').addClass('inline-block') );
                        };
                        reader.readAsText(fileToLoad, 'UTF-8');
                    }
                }),
                newEl('br'),
                newEl('br'),

                divViewerForImport
            ]),
            newEl('br'),

            newEl('button').html('X').addEventListener('click', function(e){
                darkSpreadEl.trigger('click');
            }),
        ])
        .addEventListener('click', function(event){
            event.stopPropagation();
        });
    darkSpreadEl
        .add([
            forEl(1, function(){ return newEl('br'); }),
            popViewEl
        ])
        .addEventListener('click', function(event){
            darkSpreadEl.removeFromParent();
        });
    return darkSpreadEl;
};

KeyMan.View.prototype.generateViewerForImport = function(importedObjectData, keyMapCluster, runnerPool){
    var that = this;
    var keyman = this.keyman;
    var dataViewerDiv = newEl('div').style('width:100%; height:300px; overflow:auto; text-align:left; border:2px solid #888888; border-radius:7px');
    var toolViewerDiv = newEl('div').style('width:100%;');
    var divForImportStrategy = newEl('div').addClass('left').attr('data-hidden', false);
    var divForMapStrategy = newEl('div').addClass('left').attr('data-hidden', true);
    var divForKeyStrategy = newEl('div').addClass('left').attr('data-hidden', true);
    var divForOptionStrategy = newEl('div').addClass('left').attr('data-hidden', true);

    var radioForCheckingImport = KeyMan.View.generateRadioSwitch('sss1', ['Overwrite', 'Sync'], 0,function(it){
        switch (it){
            case 'Sync': divForMapStrategy.attr('data-hidden', false); KeyMan.View.showOption([divForMapStrategy, divForKeyStrategy, divForOptionStrategy]); break;
            default: divForMapStrategy.attr('data-hidden', true); KeyMan.View.hidden([divForMapStrategy, divForKeyStrategy, divForOptionStrategy]); break;
        }
        that.makePreviewBeforeImport(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy));
    });
    var radioForCheckingMapTitle = KeyMan.View.generateRadioSwitch('sss2', ['Overwrite', 'New', 'Ignore', 'Sync'], 0,function(it){
        switch (it){
            case 'Sync': divForKeyStrategy.attr('data-hidden', false); KeyMan.View.showOption([divForKeyStrategy, divForOptionStrategy]); break;
            default: divForKeyStrategy.attr('data-hidden', true); KeyMan.View.hidden([divForKeyStrategy, divForOptionStrategy]); break;
        }
        that.makePreviewBeforeImport(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy));
    });
    var radioForCheckingKeyTitle = KeyMan.View.generateRadioSwitch('sss3', ['Overwrite', 'New', 'Ignore', 'Sync'], 0,function(it){
        switch (it){
            case 'Sync': divForOptionStrategy.attr('data-hidden', false); KeyMan.View.showOption([divForOptionStrategy]); break;
            default: divForOptionStrategy.attr('data-hidden', true); KeyMan.View.hidden([divForOptionStrategy]); break;
        }
        that.makePreviewBeforeImport(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy));
    });
    var radioForCheckingOption = KeyMan.View.generateRadioSwitch('sss4', ['Overwrite', 'Ignore'], 0,function(it){
        that.makePreviewBeforeImport(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy));
    });

    KeyMan.View.hidden([divForMapStrategy, divForKeyStrategy, divForOptionStrategy]);
    that.makePreviewBeforeImport(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy));

    return getEl([
        dataViewerDiv,
        toolViewerDiv.add([
            divForImportStrategy.addClass('left').add('Import Strategy').add(radioForCheckingImport),
            divForMapStrategy.addClass('left').add('Map duplication strategy').add(radioForCheckingMapTitle),
            divForKeyStrategy.addClass('left').add('Key duplication strategy').add(radioForCheckingKeyTitle),
            divForOptionStrategy.addClass('left').add('Option strategy').add(radioForCheckingOption),
            newEl('br'),
            newEl('button').html('Import').addClass('menu').addEventListener('click', function(e){
                //- OptionMap for merge
                var optionMapForMerge = KeyMan.View.makeOptionMap(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy);
                //- KeyMan for merge
                var keyManForMerge = KeyMan.View.makeKeyManForMerge(importedObjectData, optionMapForMerge, keyMapCluster);
                //Load
                keyMapCluster.mergeData(keyManForMerge.getUser(), optionMapForMerge);
                // keyman.loadData(importedObjectData);
            })
        ])
    ]);
};

KeyMan.View.makeOptionMap = function(radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy){
    var mergeOptionList = [
        new KeyMan.MergeOptionForImport(radioForCheckingImport),
        new KeyMan.MergeOptionForMap(divForMapStrategy),
        new KeyMan.MergeOptionForKey(divForKeyStrategy),
        new KeyMan.MergeOptionForOption(divForOptionStrategy)
    ];
    return getData(mergeOptionList).collectMap(function(it){ return {key:it.name, value:it.code}; });
};

KeyMan.View.prototype.makePreviewBeforeImport = function(importedObjectData, keyMapCluster, runnerPool, dataViewerDiv, optionMapForMerge){
    dataViewerDiv.html('');
    //- Clone Data
    var keyManForMerge = KeyMan.View.makeKeyManForMerge(importedObjectData, optionMapForMerge, keyMapCluster);

    //- Make view
    keyManForMerge.getUser().traverse(function(toKeyMap){
        dataViewerDiv
            .removeClass(['merge-import-0', 'merge-import-1', 'merge-import-2', 'merge-import-3', 'merge-import-4'])
            .removeClass(['merge-map-0', 'merge-map-1', 'merge-map-2', 'merge-map-3', 'merge-map-4'])
            .removeClass(['merge-key-0', 'merge-key-1', 'merge-key-2', 'merge-key-3', 'merge-key-4'])
            .removeClass(['merge-option-0', 'merge-option-1', 'merge-option-2', 'merge-option-3', 'merge-option-4'])
            .addClass([
                'merge-import-' + optionMapForMerge['import'],
                'merge-map-' + optionMapForMerge['map'],
                'merge-key-' + optionMapForMerge['key'],
                'merge-option-' + optionMapForMerge['option']
            ]);
        //- Make Preview-KeyMap
        KeyMan.View.generateTableViewForKeyMapTitle(toKeyMap).appendTo(dataViewerDiv);
        if (toKeyMap.tempCopy){
            KeyMan.View.generateTableViewForKeyMapTitle(toKeyMap.tempCopy).appendTo(dataViewerDiv);
            KeyMan.View.generateTableViewForKeyMap(toKeyMap.tempCopy, runnerPool).appendTo( dataViewerDiv );
        }else{
            KeyMan.View.generateTableViewForKeyMap(toKeyMap, runnerPool).appendTo( dataViewerDiv );
        }
    });
};

KeyMan.View.makeKeyManForMerge = function(importedObjectData, optionMapForMerge, keyMapCluster){
    var clonedImportedObjectData = getData(importedObjectData).returnCloneData();
    console.error(optionMapForMerge);
    console.error(importedObjectData);
    console.error(clonedImportedObjectData);

    var testKeyMan = new KeyMan();
    testKeyMan.getUser().loadData(clonedImportedObjectData).traverse(function(toKeyMap){
        var compareKeyMap = keyMapCluster.getKeyMapByTitle(toKeyMap.title);
        toKeyMap.statusDuplicated = !!compareKeyMap;
        console.error('Map? ', toKeyMap, compareKeyMap);
        if (optionMapForMerge['map'] == KeyMan.MergeOption.TYPE_NEW){
            if (toKeyMap.statusDuplicated){
                // toKeyMap.tempCopy = KeyMan.KeyMap.copy(toKeyMap, clonedImportedObjectData);
                toKeyMap.tempCopy = toKeyMap.copy();
                toKeyMap.tempCopy.statusDuplicated = false;
                toKeyMap.tempCopy.statusNew = true;
            }

        }else{
            toKeyMap.traverse(function(toKeyObject){
                var compareFunctionKey = (compareKeyMap) ? compareKeyMap.getByTitle(toKeyObject.title) : null;
                toKeyObject.statusDuplicated = !!compareFunctionKey;
                console.error('KEY? ', toKeyObject, compareFunctionKey);

                if (optionMapForMerge['key'] == KeyMan.MergeOption.TYPE_NEW){
                    if (toKeyObject.statusDuplicated){
                        // toKeyObject.tempCopy = KeyMan.FunctionKey.copy(toKeyObject, toKeyMap.functionKeyMap);
                        toKeyObject.tempCopy = toKeyObject.copy();
                        toKeyObject.tempCopy.statusDuplicated = false;
                        toKeyObject.tempCopy.statusNew = true;
                    }

                }else{
                    /** Import Option **/
                    if (toKeyObject.statusDuplicated){
                        toKeyObject.statusSameRunner = toKeyObject.runner == compareFunctionKey.runner;
                        toKeyObject.statusSameData = toKeyObject.data == compareFunctionKey.data;
                        toKeyObject.statusSameKeyStepList = KeyMan.FunctionKey.equalsKeyStepList(
                            KeyMan.parseToKeyStepList(toKeyObject.keys),
                            compareFunctionKey.keyStepList
                        );
                    }
                    if (optionMapForMerge['option'] == KeyMan.MergeOption.TYPE_OVERWRITE){

                    }
                    if (optionMapForMerge['option'] == KeyMan.MergeOption.TYPE_IGNORE){

                    }
                }
            });
        }
    });
    console.error('__', testKeyMan);
    return testKeyMan;
};


KeyMan.View.showOption = function(args){
    KeyMan.View.show(args, function(it){ return it.attr('data-hidden') == 'false'; });
};

KeyMan.View.show = function(args, funcCondition){
    for (var i=0, node; i<args.length; i++){
        node = args[i];
        if (!funcCondition || funcCondition(node)){
            node.addClass('block').removeClass('none');
        }
    }
};

KeyMan.View.hidden = function(args, funcCondition){
    for (var i=0, node; i<args.length; i++){
        node = args[i];
        if (!funcCondition || funcCondition(node)){
            node.removeClass('block').addClass('none');
        }
    }
};


var _browserState = 'unknown';
(function checkBrowser() {
    var agent = navigator.userAgent.toLowerCase();
    if (agent.indexOf("chrome") != -1) {
        _browserState = "Chrome";
    } else if (agent.indexOf("safari") != -1) {
        _browserState = "safari";
    } else if (agent.indexOf("firefox") != -1) {
        _browserState = "firefox";
    } else if (agent.indexOf("msie") != -1 || agent.indexOf('trident') != -1) {
        _browserState = "IE"
    }

    for (let i = 0; i < 5; i++) {
        console.warn("connected Browser is " + _browserState);
    }
})();

// Extension Download reProduction Code
KeyMan.View.exportAsFile = function (filename, contents){
    if (_browserState.toLowerCase() === 'chrome'){
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

    }else{ //not in Chrome
        var a = document.createElement("a"), file = new Blob([contents], {type: "text/plain;charset=utf-8"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else{ // Others
            var url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
};

