var assert = require("assert"); //nodejs에서 제공하는 aseert 모듈
var jsdom = require('mocha-jsdom');

global.document = jsdom( {url: "http://localhost"});


function assertArray(a, b){
    for (var i=0, aa, bb; i<a.length; i++){
        aa = a[i];
        bb = b[i];
        if (aa instanceof Array && bb instanceof Array)
            assertArray(aa, bb);
        else if (aa != bb)
            throw 'Not Equals Index: ' + i;
    }
    return true;
}

describe('Array 테스트', function() {
    it('Test KeyMan.parseToKeyStepList', function(done){
        var KeyMan = require("../");
        let keyStepList;

        keyStepList = KeyMan.parseToKeyStepList(['a', 'b', 'c']);
        assert.equal(1, keyStepList.length);

        keyStepList = KeyMan.parseToKeyStepList(['a', 'b', 'c', 'd']);
        assert.equal(1, keyStepList.length);
        assertArray(['A', 'B', 'C', 'D'], keyStepList[0].stepList);

        keyStepList = KeyMan.parseToKeyStepList(['a', 'b', ['c']]);
        assert.equal(1, keyStepList.length);
        assertArray(['A', 'B', 'C'], keyStepList[0].stepList);

        keyStepList = KeyMan.parseToKeyStepList(['a', 'b', ['c'], ['d']]);
        assert.equal(2, keyStepList.length);
        assertArray(
            [['A', 'B', 'C'], ['A', 'B', 'D']],
            [keyStepList[0].stepList, keyStepList[1].stepList]
        );

        keyStepList = KeyMan.parseToKeyStepList(['a', 'b', ['c', 'e', ['1', ['2']]], ['d']]);
        assert.equal(2, keyStepList.length);
        assertArray(
            [['A', 'B', 'C', 'E', '1', '2'], ['A', 'B', 'D']],
            [keyStepList[0].stepList, keyStepList[1].stepList]
        );

        keyStepList = KeyMan.parseToKeyStepList(['a', ['b'], ['c', ['e'], ['1'], ['2']], ['d']]);
        assert.equal(5, keyStepList.length);
        assertArray(
            [['A', 'B'], ['A', 'C', 'E'], ['A', 'C', '1'], ['A', 'C', '2'], ['A', 'D']],
            [keyStepList[0].stepList, keyStepList[1].stepList, keyStepList[2].stepList, keyStepList[3].stepList, keyStepList[4].stepList]
        );

        keyStepList = KeyMan.parseToKeyStepList('a + b + c');
        assertArray(['A', 'B', 'C'], keyStepList[0].stepList);

        keyStepList = KeyMan.parseToKeyStepList(['a + b + c', 'd', 'e']);
        assertArray(
            [['A', 'B', 'C'], ['D', 'E']],
            [keyStepList[0].stepList, keyStepList[1].stepList]
        );

        keyStepList = KeyMan.parseToKeyStepList(['a + b + c', 'd + e', 'f']);
        assertArray(
            [['A', 'B', 'C'], ['D', 'E'], ['F']],
            [keyStepList[0].stepList, keyStepList[1].stepList, keyStepList[2].stepList]
        );

        done();
    });
});

//
// describe('mocha tests', function () {
//     it('has document', function (done) {
//
//         var div = document.createElement('div');
//         assert.equal(true, div != null);
//         // expect(div.nodeName).eql('DIV')
//         done();
//     })
// });
//
//
// describe('나의 테스트', function() {
//     this.timeout(3000); // A very long environment setup.
//     it('그냥 있냐', function (done) {
//         var window = document.defaultView;
//         var { getEl, getData } = require('../index');
//         assert.equal(true, getData([1,2,3,4,5]).any(function(it){ return it == 5; }));
//         assert.equal(false, getData([1,2,3,4,5]).any(function(it){ return it == 6; }));
//         done();
//     });
// });