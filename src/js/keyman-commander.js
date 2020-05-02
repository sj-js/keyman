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
 * Commander
 * //TODO: More work
 *
 *
 ****************************************************************************************************/
KeyMan.Commander = function KeyManCommander(commanderName){
    this.parent = null;
    this.commanderName = commanderName;
    this.commandMap = {};
    this.commandEventMap = {};
    this.funcEventWhenCommand = null;
    this.timeForContinuousInspection = 300;
    this.timeForJudgmentSimultaneousKeyPress = 20;

    //Test - Process
    this.standardDefinedKeyOrderList = [];
    this.keyOrderList = [];
    this.keyStepProcessList = [];
    this.keyStepIndex = -1;

    /** Defined Control **/
    this.downedDefinedKeyMap = {};
    this.definedKeyMap = {};
    this.definedKeydownFuncMap = {};
    this.definedKeyupFuncMap = {};

    /** Status **/
    this.isReversed = false;
    this.lastDirection = null;
    this.lastBtn = null;
    this.lastKeyTime = 0;
    this.timer = null;

    /*************************
     *
     * Commander
     *
     *************************/
    this.addCommand = function(commandName, keyList){
        this.commandMap[commandName] = keyList;
        return this;
    };
    this.addCommandEvent = function(commandName, func){
        this.commandEventMap[commandName] = func;
        return this;
    };
    this.addCommandMap = function(commandMapParam){
        for (var commandName in commandMapParam){
            this.addCommand(commandName, commandMapParam[commandName])
        }
        return this;
    };
    this.addCommandEventMap = function(commandEventMapParam){
        for (var commandName in commandEventMapParam){
            this.addCommandEvent(commandName, commandEventMapParam[commandName])
        }
        return this;
    };
    this.setReverse = function(flag){
        this.isReversed = flag;
        return this;
    };
    //TODO:Test to show
    this.testShow = function(){
        var that = this;
        var log = '';
        var keyStepProcess;
        for (var i=0; i<that.keyStepProcessList.length; i++){
            keyStepProcess = that.keyStepProcessList[i];
            log += JSON.stringify(keyStepProcess.keys) + ' ';
        }
        console.log('DownedKey', that.keyOrderList, log);
    };

    this.handleKeydown = function(){
        var that = this;
        return function (eventData){
            var key = eventData.key;
            //Check Pressed - Not allowed
            var statusPress = !!that.downedDefinedKeyMap[key];
            if (statusPress)
                return;
            //Check Time - Decision 'Continue' and 'Reset'
            var currentTime = new Date().getTime();
            var connectionTime = currentTime - that.lastKeyTime;
            if (that.timeForContinuousInspection < connectionTime)
                that.clearDefinedKey();
            //Check Key
            that.downedDefinedKeyMap[key] = true;
            var downedKeyList = Object.keys(that.downedDefinedKeyMap);
            var keySize = downedKeyList.length;
            var isSameKey = (that.lastKey == key);
            //Save Key
            that.addKeyToCommandChecker(key, connectionTime, downedKeyList);
            that.lastKey = key;
            that.lastKeySize = keySize;
            that.lastKeyTime = currentTime;
            //Event
            (that.funcEventWhenCommand && that.funcEventWhenCommand(that.standardDefinedKeyOrderList));
            that.checkSkill();
            // that.checkTimer();
        };
    };
    this.handleKeyup = function(){
        var that = this;
        return function (eventData){
            var key = eventData.key;
            delete that.downedDefinedKeyMap[key];
            that.lastKey = null;
            //Event
            (that.funcEventWhenCommand && that.funcEventWhenCommand(that.standardDefinedKeyOrderList));
        };
    };
    this.addKeyToCommandChecker = function(key, connectionTime, downedKeyList){
        //- Make KeyStepList
        this.keyOrderList.push(key);
        //- Make KeyStepList
        this.standardDefinedKeyOrderList.push(key);
        //- Make KeyStepList
        var keyStepProcess;
        if (connectionTime < this.timeForJudgmentSimultaneousKeyPress && this.lastKey != key){
            keyStepProcess = this.keyStepProcessList[this.keyStepProcessList.length -1];
            keyStepProcess.add(key);
        }else{
            console.error(connectionTime);
            keyStepProcess = new KeyMan.KeyStep( downedKeyList );
            this.keyStepProcessList.push(keyStepProcess);
        }
        this.testShow();
    };
    this.checkSkill = function(){
        var skillNm = this.getMatchedCommand(this.keyOrderList);
        if (skillNm){
            this.executeSkill(skillNm);
            // this.resetCommandChecker();
            this.clearDefinedKey();
        }
    };
    this.checkTimer = function(){
        var that = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            that.clearDefinedKey(that);
        }, this.timeForContinuousInspection);
    };
    this.getMatchedCommand = function(standardDefinedKeyOrderList){
        var matchedPattern = {};
        var selectedSkillNm = '';
        var orderStr = JSON.stringify(standardDefinedKeyOrderList);
        for (var skillNm in this.commandMap){
            var pattern = JSON.stringify(this.commandMap[skillNm]);
            pattern = pattern.substring(1, pattern.length-1);
            // console.log('[Compare]',  orderStr, pattern);
            if (orderStr.indexOf(pattern) != -1)
                matchedPattern[skillNm] = pattern;
        }

        var matchedSkills = Object.keys(matchedPattern);
        if (1 == matchedSkills.length){
            selectedSkillNm = matchedSkills[0];
        }else if (1 < matchedSkills.length){
            var longger = 0;
            for (var pNm in matchedPattern){
                if (longger < matchedPattern[pNm].length){
                    longger = matchedPattern[pNm].length;
                    selectedSkillNm = pNm;
                }
            }
        }
        return selectedSkillNm;
    };
    this.clearDefinedKey = function(){
        this.downedDefinedKeyMap = {};
        this.keyStepProcessList = [];
        this.keyOrderList = [];
        this.standardDefinedKeyOrderList = [];
        this.lastKey = null;

        this.lastDirection = null;
        this.lastBtn = null;
        console.log('DownedKey (Clean)', this.downedDefinedKeyMap, this.standardDefinedKeyOrderList);
    };
    this.executeSkill = function(skillNm){
        console.debug(skillNm);
        var skillFunc = this.commandEventMap[skillNm];
        (skillFunc && skillFunc());
    };


    /*************************
     *
     * Defined Commander
     *
     *************************/
    this.defineKey = function(definedKeyName, key, keydownFunc, keyupFunc){
        var that = this;
        if (!keydownFunc)
            keydownFunc = function(){};
        if (!keyupFunc)
            keyupFunc = function(){};
        this.definedKeydownFuncMap[definedKeyName] = function(){
            that.downedDefinedKeyMap[definedKeyName] = true;
            keydownFunc();
        };
        this.definedKeyupFuncMap[definedKeyName] = function(){
            delete that.downedDefinedKeyMap[definedKeyName];
            keyupFunc();
        };
        if (key instanceof Array){
            for (var i=0; i<key.length; i++){
                var keyName = key[i];
                keyName = keyName.toUpperCase();
                this.definedKeyMap[keyName] = definedKeyName;
            }
        }else{
            var keyName = key;
            keyName = keyName.toUpperCase();
            this.definedKeyMap[keyName] = definedKeyName;
        }
    };
    this.getType = function(definedKeyName){
        return (typeof definedKeyName == 'string') ? 'btn' : 'direction';
    };
    this.setUp = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.UP, key, keydownFunc ,keyupFunc); return this; };
    this.setDown = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.DOWN, key, keydownFunc ,keyupFunc); return this; };
    this.setLeft = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.LEFT, key, keydownFunc ,keyupFunc); return this; };
    this.setRight = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.RIGHT, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonA = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.A, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonB = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.B, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonC = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.C, key, keydownFunc ,keyupFunc); return this; };
    this.setButtonD = function(key, keydownFunc, keyupFunc){ this.defineKey(KeyMan.D, key, keydownFunc ,keyupFunc); return this; };

    this.handleDefinedKeydown = function(){
        var that = this;
        return function (eventData) {
            var key = eventData.key;
            var definedKeyName = that.definedKeyMap[key];
            var func = that.definedKeydownFuncMap[definedKeyName];
            (func && func());
            that.handleSaveDefinedKey(definedKeyName);
        };
    };
    this.handleDefinedKeyup = function(){
        var that = this;
        return function (eventData){
            var key = eventData.key;
            var definedKeyName = that.definedKeyMap[key];
            var func = that.definedKeyupFuncMap[definedKeyName];
            (func && func());
            that.handleSaveDefinedKey(definedKeyName);
        };
    };
    this.handleSaveDefinedKey = function(definedKeyName){
        var that = this;
        // 변하면 입력
        var directionKeyCode;
        var buttonKeyCode;
        var isSameDirectionKey;
        var isSameButtonKey;
        var downedDefinedKeyMap = this.downedDefinedKeyMap;
        //Key - Direction
        directionKeyCode = this.getDirectionCodeFromDownKeys(downedDefinedKeyMap, 8);
        isSameDirectionKey = (this.lastDirection == directionKeyCode);
        this.lastDirection = directionKeyCode;
        if ( !isSameDirectionKey && directionKeyCode != 0 ){
            this.keyOrderList.push(directionKeyCode);
            if (this.isReversed)
                directionKeyCode = this.getReversedDirectionCodeList(directionKeyCode);
            this.standardDefinedKeyOrderList.push(directionKeyCode);
        }
        //Key - Button
        buttonKeyCode = this.getBtnCodeFromDownKeys(downedDefinedKeyMap);
        isSameButtonKey = (this.lastBtn == buttonKeyCode);
        this.lastBtn = buttonKeyCode;
        if ( !isSameButtonKey && buttonKeyCode != 0 ){
            this.keyOrderList.push(buttonKeyCode);
            this.standardDefinedKeyOrderList.push(buttonKeyCode);
            // this.parent.execEventListenerByEventName('keydown', this.standardDefinedKeyOrderList);
        }
        //Event
        (this.funcEventWhenCommand && this.funcEventWhenCommand(this.standardDefinedKeyOrderList));
        if (directionKeyCode != 0 || buttonKeyCode !=0){
            console.log('DownedDefinedKey', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
            //Do Skill
            var skillNm = this.getMatchedCommand(this.standardDefinedKeyOrderList);
            if (skillNm){
                this.executeSkill(skillNm);
                this.keyOrderList = [];
                this.standardDefinedKeyOrderList = [];
            }
            //Clear Timer And Restart Timer
            clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                that.clearDefinedKey(that);
                console.log('DownedDefinedKey (Clean)', that.downedDefinedKeyMap, that.standardDefinedKeyOrderList);
            }, 300);
        }
    };


    /** 방향 코드 얻기 **/
    this.getDirectionCodeFromDownKeys = function(downKeys, howManyWay){
        if (howManyWay == 4 || howManyWay === undefined) {
            if (downKeys[KeyMan.RIGHT]) return KeyMan.RIGHT;
            else if(downKeys[KeyMan.LEFT]) return KeyMan.LEFT;
            else if(downKeys[KeyMan.UP]) return KeyMan.UP;
            else if(downKeys[KeyMan.DOWN]) return KeyMan.DOWN
            else return 0;
        }else if (howManyWay == 8){
            if (downKeys[KeyMan.DOWN] && downKeys[KeyMan.RIGHT]) return KeyMan.DOWNRIGHT;
            else if(downKeys[KeyMan.UP] && downKeys[KeyMan.RIGHT]) return KeyMan.UPRIGHT;
            else if(downKeys[KeyMan.DOWN] && downKeys[KeyMan.LEFT]) return KeyMan.DOWNLEFT;
            else if(downKeys[KeyMan.UP] && downKeys[KeyMan.LEFT]) return KeyMan.UPLEFT;
            else if(downKeys[KeyMan.RIGHT]) return KeyMan.RIGHT;
            else if(downKeys[KeyMan.LEFT]) return KeyMan.LEFT;
            else if(downKeys[KeyMan.UP]) return KeyMan.UP;
            else if(downKeys[KeyMan.DOWN]) return KeyMan.DOWN;
            else return 0;
        }
    };
    /** 방향 코드 좌우 반전시키기 **/
    this.getReversedDirectionCodeList = function(key){
        if (key==4) return 6;
        else if (key==6) return 4;
        else if (key==7) return 9;
        else if (key==9) return 7;
        else if (key==1) return 3;
        else if (key==3) return 1;
        return key;
    };
    /** 방향 코드 얻기 **/
    this.getBtnCodeFromDownKeys = function(downKeys){
        if (downKeys[KeyMan.A]) return KeyMan.A;
        else if(downKeys[KeyMan.B]) return KeyMan.B;
        else if(downKeys[KeyMan.C]) return KeyMan.C;
        else if(downKeys[KeyMan.D]) return KeyMan.D;
        else return 0;
    };

}

/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = KeyMan.Commander;
} catch (e) {}
