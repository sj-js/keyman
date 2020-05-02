# KeyMan
## ⌨
[![Build Status](https://travis-ci.org/sj-js/keyman.svg?branch=master)](https://travis-ci.org/sj-js/keyman)
[![Coverage Status](https://coveralls.io/repos/github/sj-js/keyman/badge.svg)](https://coveralls.io/github/sj-js/keyman)
[![All Download](https://img.shields.io/github/downloads/sj-js/keyman/total.svg)](https://github.com/sj-js/keyman/releases)
[![Release](https://img.shields.io/github/release/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)
[![License](https://img.shields.io/github/license/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)

- 쉽게 Key Event를 다룰 수 있습니다.
- 동시에 1개 이상의 키를 누를 때 발생하는 `Shorcut`와 순차적으로 키를 누를 때 발생하는 `Command`로 나뉩니다.
- ✨ Source: https://github.com/sj-js/keyman
- ✨ Document: https://sj-js.github.io/sj-js/keyman

 
      
## Index
*@* **order** *@*
```
- KeyMan
- Add / Remove
- Shortcut
- Command
- KeyMan Expression
- Runner
- Storage/System/User
- View
- Event
- Functions
- Example
```



## 1. Getting Started

### 1-1. How to load?
- Browser
    ```html    
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/crossman/dist/js/crossman.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/keyman/dist/js/keyman.min.js"></script>
    <script>
        var keyman = new KeyMan();
    </script>
    ```
    *@* *+prefix* *x* *@* 
    ```html
    <script src="../crossman/crossman.js"></script>
    <script src="../keyman/keyman.js"></script>
    <script>
        var keyman = new KeyMan();
    </script> 
    ```  
- ES6+ 
    ```bash
    npm i @sj-js/keyman
    ```
    ```js
    const KeyMan = require('@sj-js/keyman');
    const keyman = new KeyMan();
    ```
   
    

### 1-2. Simple Example
For convenience, 1-1 code, which loads and creates a Library in the example, is omitted.

##### Example - Shortcut
1. Shortcut 등록
    ```js
    keyman.addShortcut({   
        name:'develop-tool',
        keys: ['ctrl', 'shift'],
        keydown: function(event){
            //Something to do when shorcut keys are down             
        },
        keyup: function(event){
            //Something to do when shorcut keys are up
        }
    });
    ```

2. 👨‍💻
    *@* *!* *@*
    ```html 
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
    </style>
      
    <script>
        keyman.addShortcut({
            name:'develop-tool',
            keys: ['ctrl', 'shift'],
            keydown: function(event){
                document.getElementById('tester').innerHTML = 'KEY ON';            
            },
            keyup: function(event){
                document.getElementById('tester').innerHTML = 'KEY OFF';
            }
        });
   
        keyman.addShortcut({
            name:'copy-then',
            keys: ['ctrl', 'c'],
            keydown: function(event){
                document.getElementById('tester').innerHTML = 'COPY ON';            
            },
            keyup: function(event){
                document.getElementById('tester').innerHTML = 'COPY AND..';
            }
        });
    </script>
    
    <body>
        <div tabindex="0" style="width:100%; min-height:100%;">
            Click here and Test key [Ctrl] + [Shift]
            <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
        </div>
    </body>    
    ```



##### Example - Command
1. Commander를 등록합니다.
    ```js
    var commander = keyman.addCommander('1P');
    ```
2. `addCommandMap({Commands..})`으로 Command명과 Command Key를 정의합니다.
    ```js
    commander.addCommandMap({
        'develop-pop': [KeyMan.SHIFT, 'shift'],
        'hello': ['S', 'J', 'J', 'S']
    });
    ```
3. `addCommandEventMap({Command Functions..})`으로 Command명과 Command Function을 정의합니다.
    ```js
    commander.addCommandEventMap({
        'develop-pop': function(){ showSkill('Upper Cut !'); },
        'hello': function(){ showSkill('SJ JS so Good!!'); }
    });   
    ```
4. 👨‍💻    
    *@* *!* *@*
    ```html
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
        td { border: 1px solid black }
        .cmd-map {background:black; color:white;}
    </style>
   
    <script>
        window.countSkill = 0;
        function showSkill(skillText){
            document.getElementById('tester').innerHTML = skillText + (((++window.countSkill) % 2) ? '~!' : '');
        }   
   
        keyman.addCommander('1P')
               .addCommandMap({
                    'develop-pop': [KeyMan.SHIFT, KeyMan.SHIFT],
                    'hello': ['S', 'J', 'J', 'S']
               })
               .addCommandEventMap({
                    'develop-pop': function(){ showSkill('Did you like [SHIFT]?'); },
                    'hello': function(){ showSkill('SJ JS so Good!!'); },
               });   
    </script>
    
    <body>
        <div tabindex="0" style="width:100%; min-height:100%;">
            1. Click here and Test key <br/>
            <div id="tester" style="color:#FF832C; font-weight:bold;"></div>
            2. Command Map
            <table>
                <tr><td>develop-pop</td><td class="cmd-map">[SHIFT] [SHIFT]</td></tr>
                <tr><td>hello</td><td class="cmd-map">[S] [J] [J] [S]</td></tr>
            </table>
        </div>
    </body>    
    ```
   
   

##### Example - Defined Key Command
1. Commander등록과 함께 특정 키를 정의합니다.
    ```js
    var commander = keyman.addCommander('1P', true)
                          .setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d'])
                          .setButtonA(['t']).setButtonB(['y']).setButtonC(['g']).setButtonD(['h']);
    ```
2. `addCommandMap({Commands..})`으로 Command명과 Command Key를 정의합니다.
    ```js
    commander.addCommandMap({
        'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.A],
        'uppercut strong': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
        'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
        'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],
    });
    ```
3. `addCommandEventMap({Command Functions..})`으로 Command명과 Command Function을 정의합니다.
    ```js
    commander.addCommandEventMap({
        'uppercut': function(){ /* Do something */ },
        'uppercut strong': function(){ /* Do something */ },
        'dropkick': function(){ /* Do something */ },
        'rabekku': function(){ /* Do something */ }
    });   
    ```
4. 👨‍💻
    *@* *!* *@*
    ```html
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
        td { border: 1px solid black }
        .dir {background:green; color:white;}
        .btn {background:red; color:white;}
        .cmd-map {background:black; color:white;}
    </style>
   
    <script>    
        window.countSkill = 0;
        function showSkill(skillText){
            document.getElementById('tester').innerHTML = skillText + (((++window.countSkill) % 2) ? '~!' : '');
        }
   
        keyman.addCommander('1p', true)
               .setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d'])
               .setButtonA(['t']).setButtonB(['y']).setButtonC(['g']).setButtonD(['h'])
               .addCommandMap({
                    'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.A],
                    'uppercut strong': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
                    'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
                    'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],        
               })
               .addCommandEventMap({
                    'uppercut': function(){ showSkill('Upper Cut !'); },
                    'uppercut strong': function(){ showSkill('Upper Cut !!!!!!!'); },
                    'dropkick': function(){ showSkill('Drop Kick !!'); },
                    'rabekku': function(){ showSkill('Rabekku !!!'); }
               });            
    </script>
   
    <body>
        <div tabindex="0" style="width:100%; min-height:100%;">
             1. Click here and Test key <br/>
             <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
             2. Key Map
             <table>
                 <tr>
                     <td class="dir">⬆ ️</td><td>W</td>
                     <td class="dir">⬅ ️</td><td>A</td>
                     <td class="dir">⬇ ️</td><td>S</td>
                     <td class="dir">➡ ️</td><td>D</td>
                     <td class="btn">ⓐ</td><td>T</td>
                     <td class="btn">ⓑ</td><td>Y</td>  
                     <td class="btn">ⓒ</td><td>G</td>  
                     <td class="btn">ⓓ</td><td>H</td>
                 </tr>  
             </table>
             3. Command Map
             <table>
                 <tr><td>Uppercut</td><td class="cmd-map">➡ ️⬇ ️↘ ️➡ ️ⓐ</td></tr>
                 <tr><td>Uppercut Strong</td><td class="cmd-map">➡ ️⬇ ️↘️➡ ️ⓑ</td></tr>
                 <tr><td>Dropkick</td><td class="cmd-map">➡ ️➡ ️ⓓ</td></tr>
                 <tr><td>Rabekku</td><td class="cmd-map">⬅ ️➡ ️ⓐ</td></tr>
             </table>
        </div>      
    </body>
    ```
    