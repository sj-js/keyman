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



KeyMan.RomeKeyType = getClazz(function(keyman){
    KeyMan.KeyType.apply(this, arguments);

    //Meta
    this.type = 'rome';
    this.name = 'rome';
    this.iconText = 'A';

    //Test - Process
    this.keyman = keyman;
    this.init();
})
.extend(KeyMan.KeyType)
.returnFunction();

KeyMan.RomeKeyType.prototype.init = function(){
    //Implements..
};
KeyMan.RomeKeyType.prototype.setup = function(){
    //Implements..
};

// KeyMan.RomeKeyType.prototype.convertKeyToKey = function(eventData){
//     //None
// };

// KeyMan.RomeKeyType.prototype.assemble = function(convertedKey, currentKeyStepProcess, eventData){
//     //None
// };
