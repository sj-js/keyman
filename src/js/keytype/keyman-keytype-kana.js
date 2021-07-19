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



KeyMan.KanaKeyType = getClazz(function(keyman){
    KeyMan.KeyType.apply(this, arguments);

    //Meta
    this.type = 'kana';
    this.name = 'kana';
    this.iconText = 'あ';

    //Test - Process
    this.keyman = keyman;
    this.init();
})
.extend(KeyMan.KeyType)
.returnFunction();

// KeyMan.KanaKeyType.tsuMaruOnBing = 'ん';
KeyMan.KanaKeyType.tsuMaruOnBing = 'N';

KeyMan.KanaKeyType.prototype.init = function(){
    //Implements..
};
KeyMan.KanaKeyType.prototype.setup = function(){
    //Implements..
};

KeyMan.KanaKeyType.prototype.convertKeyToKey = function(eventData){
    var convertedKey;
    var key = eventData.key;
    var keyName = eventData.event.key;
    var upperKey = eventData.upperKey;
    var shiftPressed = eventData.event.shiftKey;

    if (upperKey == KeyMan.SPACE){
        convertedKey = " ";
    }else if (key != null && key.length == 1){
        convertedKey = upperKey;
    }
    return convertedKey;
};

KeyMan.KanaKeyType.prototype.assemble = function(convertedKey, currentKeyStepProcess, eventData){
    var shiftPressed = eventData.event.shiftKey;

    var newKeySteps = [];
    var assembledHiraganas;
    var assembledHiraganasSize;

    if (!currentKeyStepProcess || currentKeyStepProcess.getStatusCompleteChar()){
        currentKeyStepProcess = new KeyMan.KeyStep();
        newKeySteps.push(currentKeyStepProcess);
        console.error("체크1", convertedKey);
    }

    if (currentKeyStepProcess){
        var beforeAssembledChar = currentKeyStepProcess.getAssembledChar();
        var afterAssembledChar = '';
        var nextAssembledChar = '';
        var beforeKey = null;
        var beforeBeforeKey = null;
        var currerntKeys = currentKeyStepProcess.add(convertedKey).getKeys();
        var currerntKeysString = currerntKeys.join("");

        var assembledHiraganasString = KeyMan.KanaKeyType.toKana(currerntKeysString, shiftPressed);
        assembledHiraganas = assembledHiraganasString.split("");

        //Compare
        var notMatchedKeyIndex = -1;
        for (var i=0, currentKey, hiragana; i<currerntKeys.length; i++){
            currentKey = currerntKeys[i];
            hiragana = assembledHiraganas[i];
            if (currentKey != hiragana){
                notMatchedKeyIndex = i;
                break;
            }
        }

        //- 변화된 것들을 일단 완성된 상태로 상정한다.
        var newKeyStep;
        if (notMatchedKeyIndex != -1){
            var ii = -1;
            getData(assembledHiraganas).each(function(it){
                // console.error("asdfasdfasdf: ", it);
                if (++ii == 0){
                    //CurrentKeyStep is CompleteChar.
                    currentKeyStepProcess.set(it).setAssembledChar(it).setStatusCompleteChar(true);
                }else{
                    //NewKeyStep is CompleteChar.
                    newKeyStep = new KeyMan.KeyStep().add(it).setAssembledChar(it).setStatusCompleteChar(true);
                    newKeySteps.push(newKeyStep);
                }
            });
        }else{
            currentKeyStepProcess.setAssembledChar(currerntKeysString);
        }

        //- 쯔마루옹빙 N을 보류한다.
        var lastKey = currerntKeys[currerntKeys.length -1];
        var lastBeforeKey = currerntKeys[currerntKeys.length -2];
        var moreChanceToAssembleN = lastKey == 'N' && lastBeforeKey != 'N';
        var moreChanceToAssembleM = lastKey == 'M' && lastBeforeKey != 'M';
        if (moreChanceToAssembleN || moreChanceToAssembleM){
            var originRomaji = moreChanceToAssembleN ? 'N' : 'M';
            console.error("!!! N 이잖어! ", currerntKeys);
            if (newKeyStep != null){
                newKeyStep.set(originRomaji).setAssembledChar(KeyMan.KanaKeyType.tsuMaruOnBing).setStatusCompleteChar(false);
            }else{
                currentKeyStepProcess.set(currerntKeys).setAssembledChar(KeyMan.KanaKeyType.tsuMaruOnBing).setStatusCompleteChar(false);
            }
        }

        //- 새로 추가된게 Alphabet이면 보류한다.
        if (newKeyStep && KeyMan.KanaKeyType.checkAlphabet(newKeyStep.getAssembledChar())){
            console.error("!!! 새로 추가된게 Alphabet 이잖어! ", currerntKeys);
            newKeyStep.setStatusCompleteChar(false);
        }
    }

    return newKeySteps;
};




/**************************************************
 *
 * KANA 타이핑 도우미
 *
 **************************************************/
KeyMan.KanaKeyType.checkAlphabet = function(str){
    var letters = /^[A-Za-z]+$/;
    return str.match(letters);
};



KeyMan.KanaKeyType.toKana = (function(){
    var hiraganaMonographs = {
        "あ": "A", "い": "I", "う": "U", "え": "E", "お": "O",
        "か": "KA", "き": "KI", "く": "KU", "け": "KE", "こ": "KO",
        "さ": "SA", "し": "SHI", "す": "SU", "せ": "SE", "そ": "SO",
        "た": "TA", "ち": "CHI", "つ": "TSU", "て": "TE", "と": "TO",
        "な": "NA", "に": "NI", "ぬ": "NU", "ね": "NE", "の": "NO",
        "は": "HA", "ひ": "HI", "ふ": "FU", "へ": "HE", "ほ": "HO",
        "ま": "MA", "み": "MI", "む": "MU", "め": "ME", "も": "MO",
        "や": "YA", "ゆ": "YU", "よ": "YO",
        "ら": "RA", "り": "RI", "る": "RU", "れ": "RE", "ろ": "RO",
        "わ": "WA", "ゐ": "WI", "ゑ": "WE", "を": "WO", "ん": "N'",
        "が": "GA", "ぎ": "GI", "ぐ": "GU", "げ": "GE", "ご": "GO",
        "ざ": "ZA", "じ": "JI", "ず": "ZU", "ぜ": "ZE", "ぞ": "ZO",
        "だ": "DA", "ぢ": "DJI", "づ": "DZU", "で": "DE", "ど": "DO",
        "ば": "BA", "び": "BI", "ぶ": "BU", "べ": "BE", "ぼ": "BO",
        "ぱ": "PA", "ぴ": "PI", "ぷ": "PU", "ぺ": "PE", "ぽ": "PO"
    };

    var hiraganaDigraphs = {
        "きゃ": "KYA", "きゅ": "KYU", "きょ": "KYO",
        "しゃ": "SHA", "しゅ": "SHU", "しょ": "SHO",
        "ちゃ": "CHA", "ちゅ": "CHU", "ちょ": "CHO",
        "にゃ": "NYA", "にゅ": "NYU", "にょ": "NYO",
        "ひゃ": "HYA", "ひゅ": "HYU", "ひょ": "HYO",
        "みゃ": "MYA", "みゅ": "MYU", "みょ": "MYO",
        "りゃ": "RYA", "りゅ": "RYU", "りょ": "RYO",
        "ぎゃ": "GYA", "ぎゅ": "GYU", "ぎょ": "GYO",
        "じゃ": "JA", "じゅ": "JU", "じょ": "JO",
        "びゃ": "BYA", "びゅ": "BYU", "びょ": "BYO",
        "ぴゃ": "PYA", "ぴゅ": "PYU", "ぴょ": "PYO"
    };

    // For use with toHiragana
    var hiraganaMap = {};

    Object.keys(hiraganaMonographs).forEach(function(key) {
        var value = hiraganaMonographs[key];
        if (!(value in hiraganaMap)) {
            hiraganaMap[value] = key;
        }
    });

    Object.keys(hiraganaDigraphs).forEach(function(key) {
        var value = hiraganaDigraphs[key];
        if (!(value in hiraganaMap)) {
            hiraganaMap[value] = key;
        }
    });

    var hiraganaRegex = new RegExp(Object.keys(hiraganaMap).sort(function(a, b) {
        return b.length - a.length;
    }).join("|"), "g");




    var katakanaMonographs = {
        "ア": "A", "イ": "I", "ウ": "U", "エ": "E", "オ": "O",
        "カ": "KA", "キ": "KI", "ク": "KU", "ケ": "KE", "コ": "KO",
        "サ": "SA", "シ": "SHI", "ス": "SU", "セ": "SE", "ソ": "SO",
        "タ": "TA", "チ": "CHI", "ツ": "TSU", "テ": "TE", "ト": "TO",
        "ナ": "NA", "ニ": "NI", "ヌ": "NU", "ネ": "NE", "ノ": "NO",
        "ハ": "HA", "ヒ": "HI", "フ": "FU", "ヘ": "HE", "ホ": "HO",
        "マ": "MA", "ミ": "MI", "ム": "MU", "メ": "ME", "モ": "MO",
        "ヤ": "YA", "ユ": "YU", "ヨ": "YO",
        "ラ": "RA", "リ": "RI", "ル": "RU", "レ": "RE", "ロ": "RO",
        "ワ": "WA", "ヰ": "WI", "ヱ": "WE",  "ヲ": "WO", "ン": "N",
        "ガ": "GA", "ギ": "GI", "グ": "GU", "ゲ": "GE", "ゴ": "GO",
        "ザ": "ZA", "ジ": "JI", "ズ": "ZU", "ゼ": "ZE", "ゾ": "ZO",
        "ダ": "DA", "ヂ": "DJI", "ヅ": "DZU", "デ": "DE", "ド": "DO",
        "バ": "BA", "ビ": "BI", "ブ": "BU", "ベ": "BE", "ボ": "BO",
        "パ": "PA", "ピ": "PI", "プ": "PU", "ペ": "PE", "ポ": "PO"
    };

    var katakanaDigraphs = {
        // "アー": "Ā", "イー": "Ī", "ウー": "Ū", "エー": "Ē", "オー": "Ō",
        // "カー": "KĀ", "キー": "KĪ", "クー": "KŪ", "ケー": "KĒ", "コー": "KŌ",
        // "サー": "SĀ", "シー": "SHĪ", "スー": "SŪ", "セー": "SĒ", "ソー": "SŌ",
        // "ター": "TĀ", "チー": "CHĪ", "ツー": "TSŪ", "テー": "TĒ", "トー": "TŌ",
        // "ナー": "NĀ", "ニー": "NĪ", "ヌー": "NŪ", "ネー": "NĒ", "ノー": "NŌ",
        // "ハー": "HĀ", "ヒー": "HĪ", "フー": "FŪ", "ヘー": "HĒ", "ホー": "HŌ",
        // "マー": "MĀ", "ミー": "MĪ", "ムー": "MŪ", "メー": "MĒ", "モー": "MŌ",
        // "ヤー": "YĀ", "ユー": "YŪ", "ヨー": "YŌ",
        // "ラー": "RĀ", "リー": "RĪ", "ルー": "RŪ", "レー": "RĒ", "ロー": "RŌ",
        // "ワー": "WĀ", "ヰー": "WĪ", "ヱー": "WĒ",  "ヲー": "WŌ", "ンー": "N",
        // "ガー": "GĀ", "ギー": "GĪ", "グー": "GŪ", "ゲー": "GĒ", "ゴー": "GŌ",
        // "ザー": "ZĀ", "ジー": "JĪ", "ズー": "ZŪ", "ゼー": "ZĒ", "ゾー": "ZŌ",
        // "ダー": "DĀ", "ヂー": "DJĪ", "ヅー": "DZŪ", "デー": "DĒ", "ドー": "DŌ",
        // "バー": "BĀ", "ビー": "BĪ", "ブー": "BŪ", "ベー": "BĒ", "ボー": "BŌ",
        // "パー": "PĀ", "ピー": "PĪ", "プー": "PŪ", "ペー": "PĒ", "ポー": "PŌ",
        "キャ": "KYA", "キュ": "KYU", "キョ": "KYO",
        "シャ": "SHA", "シュ": "SHU", "ショ": "SHO",
        "チャ": "CHA", "チュ": "CHU", "チョ": "CHO",
        "ニャ": "NYA", "ニュ": "NYU", "ニョ": "NYO",
        "ヒャ": "HYA", "ヒュ": "HYU", "ヒョ": "HYO",
        "ミャ": "MYA", "ミュ": "MYU", "ミョ": "MYO",
        "リャ": "RYA", "リュ": "RYU", "リョ": "RYO",
        "ギャ": "GYA", "ギュ": "GYU", "ギョ": "GYO",
        "ジャ": "JA", "ジュ": "JU", "ジョ": "JO",
        "ビャ": "BYA", "ビュ": "BYU", "ビョ": "BYO",
        "ピャ": "PYA", "ピュ": "PYU", "ピョ": "PYO",
        "クヮ": "KWA", "クィ": "KWI", "クェ": "KWE", "クォ": "KWO",
        "グヮ": "GWA", "スィ": "SI",  "シェ": "SHE", "ズィ": "ZI", "ジェ": "JE",
        "ティ": "TI",  "トゥ": "TU",  "テュ": "TYU", "チェ": "CHE",
        "ツァ": "TSA", "ツィ": "TSI", "ツェ": "TSE", "ツォ": "TSO",
        "ディ": "DI" , "ドゥ": "DU",  "デュ": "DYU", "ホゥ": "HU",
        "ファ": "FA",  "フィ": "FI",  "フェ": "FE",  "フォ": "FO", "フュ": "FYU",
        "イィ": "YI",  "イェ": "YE",
        "ウィ": "WI",  "ウゥ": "WU", 	"ウェ": "WE",  "ウォ": "WO",
        "ヴァ": "VA",  "ヴィ": "VI",    "ヴ": "VU",  "ヴェ": "VE", "ヴォ": "VO", "ヴュ": "VYU"
    };

    var katakanaTrigraphs = {
        // "キャー": "KYĀ", "キュー": "KYŪ", "キョー": "KYŌ",
        // "シャー": "SHĀ", "シュー": "SHŪ", "ショー": "SHŌ",
        // "チャー": "CHĀ", "チュー": "CHŪ", "チョー": "CHŌ",
        // "ニャー": "NYĀ", "ニュー": "NYŪ", "ニョー": "NYŌ",
        // "ヒャー": "HYĀ", "ヒュー": "HYŪ", "ヒョー": "HYŌ",
        // "ミャー": "MYĀ", "ミュー": "MYŪ", "ミョー": "MYŌ",
        // "リャー": "RYĀ", "リュー": "RYŪ", "リョー": "RYŌ",
        // "ギャー": "GYĀ", "ギュー": "GYŪ", "ギョー": "GYŌ",
        // "ジャー": "JĀ", "ジュー": "JŪ", "ジョー": "JŌ",
        // "ビャー": "BYĀ", "ビュー": "BYŪ", "ビョー": "BYŌ",
        // "ピャー": "PYĀ", "ピュー": "PYŪ", "ピョー": "PYŌ"
    };

    // For use with toKatakana
    var katakanaMap = {};

    Object.keys(katakanaMonographs).forEach(function(key) {
        var value = katakanaMonographs[key];
        if (!(value in katakanaMap)) {
            katakanaMap[value] = key;
        }
    });

    Object.keys(katakanaDigraphs).forEach(function(key) {
        var value = katakanaDigraphs[key];
        if (!(value in katakanaMap)) {
            katakanaMap[value] = key;
        }
    });

    Object.keys(katakanaTrigraphs).forEach(function(key) {
        var value = katakanaTrigraphs[key];
        if (!(value in katakanaMap)) {
            katakanaMap[value] = key;
        }
    });

    var katakanaRegex = new RegExp(Object.keys(katakanaMap).sort(function(a, b) {
        return b.length - a.length;
    }).join("|"), "g");


    function bulkReplace(str, regex, map) {
        if (arguments.length === 2) {
            map = regex;
            regex = new RegExp(Object.keys(map).join("|"), "ig");
        }

        return str.replace(regex, function (all){
            if (all in map) {
                return map[all];
            }

            return all;
        });
    }

    return function(str, shiftPressed){
        if (shiftPressed){
            // All conversion is done in upper-case
            str = str.toUpperCase();

            // Correct use of sokuon
            str = str.replace(/TC/g, "ッC");
            str = str.replace(/([^AEIOUN])\1/g, "ッ$1");

            // Transliteration
            str = bulkReplace(str, katakanaRegex, katakanaMap);

            // Fix any remaining N/M usage (that isn't a N' usage)
            str = str.replace(/NN|MM/g, "ン");//TODO: 이렇게 표기법이 되어있잖어~
            str = str.replace(/N|M/g, "ン");
            return str;
        }else{
            // All conversion is done in upper-case
            str = str.toUpperCase();

            // Correct use of sokuon
            str = str.replace(/TC/g, "っC");
            str = str.replace(/([^AEIOUN])\1/g, "っ$1");

            // Transliteration
            str = bulkReplace(str, hiraganaRegex, hiraganaMap);

            // Fix any remaining N/M usage (that isn't a N' usage)
            // str = str.replace(/N|M/g, "ん");
            str = str.replace(/NN|MM/g, "ん");//TODO: 이렇게 표기법이 되어있잖어~
            str = str.replace(/N|M/g, "ん");
            return str;
        }
    };
})();
