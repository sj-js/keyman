/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var KeyMan = require('@sj-js/keyman');
    var ready = crossman.ready,
        getClass = crossman.getClass,
        getEl = crossman.getEl,
        newEl = crossman.newEl,
        forEl = crossman.forEl,
        ifEl = crossman.ifEl,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent
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
    this.keyman = keyman;
    this.latestUserInputKeyStepList = null;
    this.currentKeyMap = null;
};

/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = KeyMan.View;
} catch (e) {}



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
KeyMan.View.generateButtonViewForKeyStep = function(keyStep, parent){
    var keySeparator;
    var keyStepEl = newEl('span').addClass('key-step');
    getData(keyStep.keys).each(function(key){
        if (keySeparator)
            newEl('span').html(' + ').addClass('key-step-conjuction').appendTo(keyStepEl);
        keySeparator = KeyMan.View.generateButtonViewForKey(key).appendTo(keyStepEl);
    });
    if (parent)
        keyStepEl.appendTo(parent);
    return keyStepEl;
};

/*************************
 *
 * KeyStepList
 *
 *************************/
KeyMan.View.generateCommandViewForKeyStepList = function(keyStepList){
    var keyStepSeparator;
    var keyStepListEl = newEl('span').addClass('key-step-list');
    getData(keyStepList).each(function(keyStep){
        if (keyStepSeparator)
            newEl('span').html(' > ').addClass('key-step-conjuction').appendTo(keyStepListEl);
        keyStepSeparator = KeyMan.View.generateButtonViewForKeyStep(keyStep).appendTo(keyStepListEl);
    });
    return keyStepListEl;
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
    return newEl('div').addClass(['toggle-w', 'inline-block']).add([
        newEl('label').addClass('lock').add([
            newEl('input').attr('type', 'checkbox').if(check, function(it){ it.prop('checked', true) }),
            newEl('span').html(text),
        ])
    ]);
};


/*************************
 *
 * TOOL - BUTTONS
 *
 *************************/
KeyMan.View.prototype.generateToolViewForKeyMap = function(keyCluster, targetKeyMapViewElement){
    var that = this;
    var keyman = this.keyman;
    console.error('hihihihihihi', that.currentKeyMap);
    if (!that.currentKeyMap)
        that.currentKeyMap = keyCluster.getFirst();
    var currentKeyMapId = (that.currentKeyMap) ? that.currentKeyMap.id : null;
    var currentKeyMap = keyCluster.get(currentKeyMapId);
    var toolPanelForKeyMap = newEl('div').addClass('keyman-view-tool');
    var titleEl = newEl('span').addClass('title')
    var selectEl = newEl('select');
    toolPanelForKeyMap.add([
        titleEl.html('KEYMAP'),
        selectEl
            .addEventListener('change', function(e){
                console.error(selectEl.value(), e);
                var data;
                if (!selectEl.value()){
                    data = {};
                }else{
                    that.setCurrentKeyMap( keyCluster.get(selectEl.value()) );
                }
                getEl(targetKeyMapViewElement).html('').add([
                    that.generateTableViewForKeyMap( that.getCurrentKeyMap() ),
                    that.generateButtonViewForKeyAdditionButton()
                ]);
            })
            .add([
                forEl(keyCluster.getFunctionKeyMaps(), function(k, v){
                    return newEl('option').html(v.title).setValue(v.id);
                })
            ])
            .setValue(currentKeyMapId)
            .trigger('change'),
        newEl('button').html('🔧').addClass(['']).addEventListener('click', function(e){
            if (!that.currentKeyMap)
                return;
            that.generatePopViewForKeyMapProperties(keyCluster, that.currentKeyMap).appendTo(document.body);
        }),
        newEl('button').html('📄').addClass(['']).addEventListener('click', function(e){
            that.generatePopViewForKeyMapProperties(keyCluster).appendTo(document.body);
        }),
        ifEl(keyCluster.modeMultiMap,
            newEl('button').html('✔').addClass(['setup']).addEventListener('click', function(e){
                that.generatePopViewForKeyMapProperties(keyCluster).appendTo(document.body);
            })
        ),
        newEl('span').addClass('gap'),

        ifEl((currentKeyMap && currentKeyMap.modeEditable),
            newEl('button').html('⚙️').addClass(['setup', 'float-right']).addEventListener('click', function(e){
                that.generatePopViewForKeyManSetup(keyCluster).appendTo(document.body);
            })
        ),
        ifEl(!keyCluster.modeAutoSave,
            newEl('button').html('💾').addClass(['setup', 'float-right']).addEventListener('click', function(e){
                that.generatePopViewForKeyMapProperties(keyCluster).appendTo(document.body);
            })
        ),
    ]);
    return toolPanelForKeyMap;
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
KeyMan.View.prototype.generateTableViewForKeyMap = function(targetKeyMap){
    var that = this;
    var keyman = this.keyman;
    return KeyMan.View.generateTableViewForKeyMap(targetKeyMap, keyman.getRunnerPool(),
        function(event, keyMap, fKey){
            that.generatePopViewForKeyProperties(keyMap, fKey.id).appendTo(document.body);
        },
        function(event, keyMap, fKey){
            that.generatePopViewForKeyPattern(keyMap, fKey.id).appendTo(document.body);
        }
    );
};
KeyMan.View.generateTableViewForKeyMapTitle = function(targetKeyMap){
    return newEl('div').html(targetKeyMap.title).addClass(['left', 'key-map-title'])
        .if(targetKeyMap.statusDuplicated, function(it){ it.addClass('dup'); })
        .if(targetKeyMap.statusNew, function(it){ it.addClass('new'); })
};
KeyMan.View.generateTableViewForKeyMap = function(targetKeyMap, runnerPool, funcToSetupProperties, funcToSetupKeyPattern){
    var keyMapTableEl = newEl('ul').addClass('key-map')
        .if(targetKeyMap.statusDuplicated, function(it){ it.addClass('dup'); })
        .if(targetKeyMap.statusNew, function(it){ it.addClass('new'); })
        .add([
            forEl(targetKeyMap.functionKeyMap, function(key, functionKey){
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
                        KeyMan.View.generateCommandViewForKeyStepList( KeyMan.parseToKeyStepList(functionKey.keys) ).if(!functionKey.statusSameKeyStepList, function(it){ it.addClass('update'); })
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
    targetKeyMap = (targetKeyMap) ? targetKeyMap : that.currentKeyMap;
    targetFunctionKey = targetKeyMap.get(targetFunctionKey);
    var modeNew = !(!!targetFunctionKey);
    if (modeNew){
        // targetFunctionKey = new KeyMan.FunctionKey({})
    }
    var darkSpreadEl = newEl('div').addClass('keyman-view-pop-darkness').setStyle('zIndex', getData().findHighestZIndex(['div']) + 1);
    var popViewEl = newEl('div').addClass('keyman-view-pop-content-box');
    var popViewTitleEl = newEl('div').addClass('keyman-view-pop-title');
    var keyViewerEl = newEl('div').addClass(['keyman-view-pop-key-box', 'light-keys']);
    var typeableViewerEl = newEl('span');
    var toggleForKeyHandleMode = KeyMan.View.generateRadioSwitch('handler', ['SHORTCUT', 'COMMAND'], 0,function(it){
        that.toggleUserKeyInputSystem(it, keyViewerEl);
    });
    that.toggleUserKeyInputSystem( KeyMan.getNameByHandlerType(targetFunctionKey.type), keyViewerEl );
    if (targetFunctionKey){
        toggleForKeyHandleMode.findChildEl(function(it){ return it.attr('type') == 'radio' && it.value() == KeyMan.getNameByHandlerType(targetFunctionKey.type); }).prop('checked', true);
        that.latestUserInputKeyStepList = targetFunctionKey.keyStepList;
        KeyMan.View.generateCommandViewForKeyStepList(targetFunctionKey.keyStepList).appendTo( keyViewerEl.html('') );
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
                    targetKeyMap.add({title:'No Title', keys: keys});
                }else{
                    targetKeyMap.get(targetFunctionKey).modify({keys: keys});
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
            keyman.removeEventListenerById('_test-shortcutkeydown','shortcutkeydown');
            keyman.removeEventListenerById('_test-commandkeydown', 'commandkeydown');
            keyman.removeEventListenerById('_test-untypeable', 'untypeable');
            keyman.removeEventListenerById('_test-typeable', 'typeable');
            keyman.checkAndDestroyShortcutKeyHandler();
            keyman.checkAndDestroyCommandKeyHandler();
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
KeyMan.View.prototype.toggleUserKeyInputSystem = function(toggleValue, showingContextElement){
    var that = this;
    switch (toggleValue){
        case 'COMMAND':
            this.setupCommandViewAndEvent(showingContextElement);
            break;
        case 'SHORTCUT':
        default:
            this.setupShortcutViewAndEvent(showingContextElement);
            break;
    }
};
KeyMan.View.prototype.setupShortcutViewAndEvent = function(showingContextElement){
    var that = this;
    var keyman = this.keyman;
    keyman.checkAndDestroyCommandKeyHandler();
    keyman.makeShortcutKeyHandlerForce();
    keyman.removeEventListenerById('_test-shortcutkeydown','shortcutkeydown');
    keyman.removeEventListenerById('_test-commandkeydown', 'commandkeydown');
    keyman.addEventListenerById('_test-shortcutkeydown', 'shortcutkeydown', function(eventData){
        if (!eventData.keyStepList)
            return;
        //Shortcut
        that.latestUserInputKeyStepList = eventData.keyStepList;
        getEl(showingContextElement).html('');
        // KeyMan.View.generateShortcutViewForKeyStepList(keyStepList).appendTo('div-show-command');
        KeyMan.View.generateCommandViewForKeyStepList(eventData.keyStepList).appendTo(showingContextElement);
    });
};
KeyMan.View.prototype.setupCommandViewAndEvent = function(showingContextElement){
    var that = this;
    var keyman = this.keyman;
    keyman.checkAndDestroyShortcutKeyHandler();
    keyman.makeCommandKeyHandlerForce();
    keyman.removeEventListenerById('_test-shortcutkeydown','shortcutkeydown');
    keyman.removeEventListenerById('_test-commandkeydown', 'commandkeydown');
    keyman.addEventListenerById('_test-commandkeydown', 'commandkeydown', function(eventData){
        if (!eventData.keyStepList)
            return;
        //Command
        that.latestUserInputKeyStepList = eventData.keyStepList;
        getEl(showingContextElement).html('');
        KeyMan.View.generateCommandViewForKeyStepList(eventData.keyStepList).appendTo(showingContextElement);
    });
};

/*************************
 *
 * POP - KEYMAP PROPERTIES
 *
 *************************/
KeyMan.View.prototype.generatePopViewForKeyMapProperties = function(targetKeyCluster, targetKeyMap){
    var that = this;
    var keyman = this.keyman;
    targetKeyMap = targetKeyCluster.get(targetKeyMap);
    var modeNew = !(!!targetKeyMap);
    if (modeNew){
        targetKeyMap = new KeyMan.KeyMap({});
    }
    console.error('[POP KEYMAP] ', targetKeyCluster, targetKeyMap);
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
                    buttonForDelete.addClass('float-right').html('Delete').addEventListener('click', function(e){
                        if (confirm('It will be removed')){
                            that.currentKeyMap = null;
                            targetKeyMap.removeFromKeyCluster()
                            darkSpreadEl.trigger('click');
                        }
                    })
                )
            ]),

            newEl('button').html('O').addEventListener('click', function(e){
                that.currentKeyMap = targetKeyMap;
                if (modeNew){
                    targetKeyCluster.add(
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
            popViewTitleEl.add('SETUP'),
            setupViewerEl.add([
                newEl('label').html('OPTION').addClass(['title']),
                newEl('div').addClass('left').add([
                    toggleForAutoSave.addEventListener('change', function(e){
                        var checked = toggleForAutoSave.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked');
                        keyCluster.modeAutoSave = checked;
                    }),
                    newEl('span').addClass('gap'),
                    toggleForMultiMap.addEventListener('change', function(e){
                        var checked = toggleForMultiMap.findChildEl(function(it){ return it.attr('type') == 'checkbox'; }).prop('checked');
                        keyCluster.modeMultiMap = checked;
                    }),
                ]),
            ]),
            newEl('br'),
            newEl('br'),

            setupDataExportViewerEl.add([
                newEl('label').html('EXPORT').addClass(['title']),
                newEl('button').html('📤{}').addClass(['menu']).addEventListener('click', function(e){
                    var encodedData = KeyMan.encodeData( keyman.getUser().extractData() );
                    dataInput.value(encodedData);
                }),
                newEl('button').html('📤🗎').addClass(['menu']).addEventListener('click', function(e){
                    var encodedData = KeyMan.encodeData( keyman.getUser().extractData() );
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

KeyMan.View.prototype.generateViewerForImport = function(importedObjectData, keyCluster, runnerPool){
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
        that.makePreviewBeforeImport(importedObjectData, keyCluster, runnerPool, dataViewerDiv, [new KeyMan.MergeOptionForImport(radioForCheckingImport), new KeyMan.MergeOptionForMap(divForMapStrategy), new KeyMan.MergeOptionForKey(divForKeyStrategy), new KeyMan.MergeOptionForOption(divForOptionStrategy)]);
    });
    var radioForCheckingMapTitle = KeyMan.View.generateRadioSwitch('sss2', ['Overwrite', 'New', 'Ignore', 'Sync'], 0,function(it){
        switch (it){
            case 'Sync': divForKeyStrategy.attr('data-hidden', false); KeyMan.View.showOption([divForKeyStrategy, divForOptionStrategy]); break;
            default: divForKeyStrategy.attr('data-hidden', true); KeyMan.View.hidden([divForKeyStrategy, divForOptionStrategy]); break;
        }
        that.makePreviewBeforeImport(importedObjectData, keyCluster, runnerPool, dataViewerDiv, [new KeyMan.MergeOptionForImport(radioForCheckingImport), new KeyMan.MergeOptionForMap(divForMapStrategy), new KeyMan.MergeOptionForKey(divForKeyStrategy), new KeyMan.MergeOptionForOption(divForOptionStrategy)]);
    });
    var radioForCheckingKeyTitle = KeyMan.View.generateRadioSwitch('sss3', ['Overwrite', 'New', 'Ignore', 'Sync'], 0,function(it){
        switch (it){
            case 'Sync': divForOptionStrategy.attr('data-hidden', false); KeyMan.View.showOption([divForOptionStrategy]); break;
            default: divForOptionStrategy.attr('data-hidden', true); KeyMan.View.hidden([divForOptionStrategy]); break;
        }
        that.makePreviewBeforeImport(importedObjectData, keyCluster, runnerPool, dataViewerDiv, [new KeyMan.MergeOptionForImport(radioForCheckingImport), new KeyMan.MergeOptionForMap(divForMapStrategy), new KeyMan.MergeOptionForKey(divForKeyStrategy), new KeyMan.MergeOptionForOption(divForOptionStrategy)]);
    });
    var radioForCheckingOption = KeyMan.View.generateRadioSwitch('sss4', ['Overwrite', 'Ignore'], 0,function(it){
        that.makePreviewBeforeImport(importedObjectData, keyCluster, runnerPool, dataViewerDiv, [new KeyMan.MergeOptionForImport(radioForCheckingImport), new KeyMan.MergeOptionForMap(divForMapStrategy), new KeyMan.MergeOptionForKey(divForKeyStrategy), new KeyMan.MergeOptionForOption(divForOptionStrategy)]);
    });

    KeyMan.View.hidden([divForMapStrategy, divForKeyStrategy, divForOptionStrategy]);
    that.makePreviewBeforeImport(importedObjectData, keyCluster, runnerPool, dataViewerDiv, [new KeyMan.MergeOptionForImport(radioForCheckingImport), new KeyMan.MergeOptionForMap(divForMapStrategy), new KeyMan.MergeOptionForKey(divForKeyStrategy), new KeyMan.MergeOptionForOption(divForOptionStrategy)]);

    return getEl([
        dataViewerDiv,
        toolViewerDiv.add([
            divForImportStrategy.addClass('left').add('Import Strategy').add(radioForCheckingImport),
            divForMapStrategy.addClass('left').add('Map duplication strategy').add(radioForCheckingMapTitle),
            divForKeyStrategy.addClass('left').add('Key duplication strategy').add(radioForCheckingKeyTitle),
            divForOptionStrategy.addClass('left').add('Option strategy').add(radioForCheckingOption),
            newEl('br'),
            newEl('button').html('Import').addClass('menu').addEventListener('click', function(e){
                //분석 => 옵션
                [radioForCheckingImport, divForMapStrategy, divForKeyStrategy, divForOptionStrategy]
                //Load
                keyman.loadData(importedObjectData);
            })
        ])
    ]);
};

KeyMan.View.prototype.makePreviewBeforeImport = function(importedObjectData, keyCluster, runnerPool, dataViewerDiv, mergeOptionList){
    dataViewerDiv.html('');
    //- Options
    var optionMap = getData(mergeOptionList).collectMap(function(it){ return {key:it.name, value:it.code}; });
    // for (var i=0, mergeOption; i<mergeOptionList.length; i++){
    //     mergeOption = mergeOptionList[i];
    //     optionMap[mergeOption.name] = mergeOption.code;
    // }
    //- Clone Data
    var clonedImportedObjectData = getData(importedObjectData).returnCloneData();
    console.error(optionMap);
    console.error(importedObjectData);
    console.error(clonedImportedObjectData);

    //- Make data
    /** Import Cluster **/
    // if (optionMap['import'] == KeyMan.MergeOption.TYPE_SYNC){
        /** Import KeyMap **/
        for (var keyMapId in clonedImportedObjectData){
            var importedKeyMap = clonedImportedObjectData[keyMapId];
            var compareKeyMap = keyCluster.getByTitle(importedKeyMap.title);
            importedKeyMap.statusDuplicated = !!compareKeyMap;
            console.error('Map? ', importedKeyMap, compareKeyMap);

            if (optionMap['map'] == KeyMan.MergeOption.TYPE_NEW){
                if (importedKeyMap.statusDuplicated){
                    importedKeyMap.tempCopy = KeyMan.KeyMap.copy(importedKeyMap, clonedImportedObjectData);
                    importedKeyMap.tempCopy.statusDuplicated = false;
                    importedKeyMap.tempCopy.statusNew = true;
                }

            }else{
                /** Import Key **/
                for (var fKeyId in importedKeyMap.functionKeyMap){
                    var importedFunctionKey = importedKeyMap.functionKeyMap[fKeyId];
                    var compareFunctionKey = compareKeyMap.getByTitle(importedFunctionKey.title);
                    importedFunctionKey.statusDuplicated = !!compareFunctionKey;
                    console.error('KEY? ', importedFunctionKey, compareFunctionKey);

                    if (optionMap['key'] == KeyMan.MergeOption.TYPE_NEW){
                        if (importedFunctionKey.statusDuplicated){
                            importedFunctionKey.tempCopy = KeyMan.FunctionKey.copy(importedFunctionKey, importedKeyMap.functionKeyMap);
                            importedFunctionKey.tempCopy.statusDuplicated = false;
                            importedFunctionKey.tempCopy.statusNew = true;
                        }

                    }else{
                        /** Import Option **/
                        if (importedFunctionKey.statusDuplicated){
                            importedFunctionKey.statusSameRunner = importedFunctionKey.runner == compareFunctionKey.runner;
                            importedFunctionKey.statusSameData = importedFunctionKey.data == compareFunctionKey.data;
                            importedFunctionKey.statusSameKeyStepList = KeyMan.FunctionKey.equalsKeyStepList(
                                KeyMan.parseToKeyStepList(importedFunctionKey.keys),
                                compareFunctionKey.keyStepList
                            );
                        }
                        if (optionMap['option'] == KeyMan.MergeOption.TYPE_OVERWRITE){

                        }
                        if (optionMap['option'] == KeyMan.MergeOption.TYPE_IGNORE){

                        }
                    }

                }
            }
        }
    // }

    //- Make view
    var importedKeyMap;
    for (var id in clonedImportedObjectData){
        importedKeyMap = clonedImportedObjectData[id];
        dataViewerDiv
            .removeClass(['merge-import-0', 'merge-import-1', 'merge-import-2', 'merge-import-3', 'merge-import-4'])
            .removeClass(['merge-map-0', 'merge-map-1', 'merge-map-2', 'merge-map-3', 'merge-map-4'])
            .removeClass(['merge-key-0', 'merge-key-1', 'merge-key-2', 'merge-key-3', 'merge-key-4'])
            .removeClass(['merge-option-0', 'merge-option-1', 'merge-option-2', 'merge-option-3', 'merge-option-4'])
            .addClass([
                'merge-import-' + optionMap['import'],
                'merge-map-' + optionMap['map'],
                'merge-key-' + optionMap['key'],
                'merge-option-' + optionMap['option']
            ]);
        //- Make Preview-KeyMap
        KeyMan.View.generateTableViewForKeyMapTitle(importedKeyMap).appendTo(dataViewerDiv);
        if (importedKeyMap.tempCopy){
            KeyMan.View.generateTableViewForKeyMapTitle(importedKeyMap.tempCopy).appendTo(dataViewerDiv);
            KeyMan.View.generateTableViewForKeyMap(importedKeyMap.tempCopy, runnerPool).appendTo( dataViewerDiv );
        }else{
            KeyMan.View.generateTableViewForKeyMap(importedKeyMap, runnerPool).appendTo( dataViewerDiv );
        }
    }
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
}

