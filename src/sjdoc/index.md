# KeyMan
## ⌨
[![Build Status](https://travis-ci.org/sj-js/keyman.svg?branch=master)](https://travis-ci.org/sj-js/keyman)
[![All Download](https://img.shields.io/github/downloads/sj-js/keyman/total.svg)](https://github.com/sj-js/keyman/releases)
[![Release](https://img.shields.io/github/release/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)
[![License](https://img.shields.io/github/license/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)

- 쉽게 Key Event를 다룰 수 있습니다.
- Source: https://github.com/sj-js/keyman
- Document: https://sj-js.github.io/sj-js/keyman

 
      
## Index
*@* **order** *@*
```
- KeyMan
- Key
- Shortcut
- Command
- Input
- Event
- Functions
- Example
```



## 1. Getting Started

### 1-1. How to use?

1. 스크립트 불러오기
    - Browser
        ```html    
        <script src="https://cdn.jsdelivr.net/gh/sj-js/crossman/dist/js/crossman.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/sj-js/keyman/dist/js/keyman.js"></script>
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
- For convenience, the following code, which loads and creates a Library in the example, is omitted.
    ```html
    <script src="https://cdn.jsdelivr.net/gh/sj-js/crossman/dist/js/crossman.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/sj-js/keyman/dist/js/keyman.js"></script>
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



##### Example with script

1. Test - Shortcut
    *@* *!* *@*
    ```html 
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
    </style>
      
    <script>
        keyman.addShortcut({
            name:'directExecution',
            keys: ['ctrl', 'shift'],
            keydown: function(event){
                document.getElementById('tester').innerHTML = 'KEY ON';            
            },
            keyup: function(event){
                document.getElementById('tester').innerHTML = 'KEY OFF';
            }
        });
    </script>
    
    <body>
        <div tabindex="0" style="width:100%; height:100%;">
            Click here and Test key [Ctrl] + [Shift]
            <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
        </div>
    </body>    
    ```

2. Test - Command    
    *@* *!* *@*
    ```html
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
    </style>
   
    <script>
        window.countSkill = 0;
        function showSkill(skillText){
            document.getElementById('tester').innerHTML = skillText + (((++window.countSkill) % 2) ? '~!' : '');
        }   
   
        keyman.addCommander('1p')
               .addCommandMap({
                    'uppercut': [KeyMan.SHIFT, KeyMan.SHIFT, KeyMan.SHIFT],
                    'rabekku': [KeyMan.SHIFT, KeyMan.SHIFT, KeyMan.A],
                    'dropkick': [KeyMan.CTRL, KeyMan.CTRL, KeyMan.D],        
               })
               .addCommandEventMap({
                    'uppercut': function(){ showSkill('Upper Cut !'); },
                    'dropkick': function(){ showSkill('Drop Kick !!'); },
                    'rabekku': function(){ showSkill('Rabekku !!!'); }
               });            
    </script>
    
    <body>
        <div tabindex="0" style="width:100%; height:100%;">
             Click here and Test key<br/>
             - Direction: ↑:W  ←:A  ↓:S  →:D <br/>
             - Uppercut: →↓↘→  Y  <br/>
             - Dropkick: →→  H  <br/>
             - Rabekku : ←→  T   <br/>
             <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
        </div>
    </body>    
    ```
    
3. Test - Command(defined)    
    *@* *!* *@*
    ```html
    <style>
        * { margin:0; cursor:pointer; }
        div:focus { background-color: Aqua; }
    </style>
   
    <script>    
        window.countSkill = 0;
        function showSkill(skillText){
            document.getElementById('tester').innerHTML = skillText + (((++window.countSkill) % 2) ? '~!' : '');
        }
   
        keyman.addCommander('1p', true).setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d']).setButtonA(['t']).setButtonB(['y']).setButtonC(['g']).setButtonD(['h'])
               .addCommandMap({
                    'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
                    'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
                    'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],        
               })
               .addCommandEventMap({
                    'uppercut': function(){ showSkill('Upper Cut !'); },
                    'dropkick': function(){ showSkill('Drop Kick !!'); },
                    'rabekku': function(){ showSkill('Rabekku !!!'); }
               });            
    </script>
    
    <body>
        <div tabindex="0" style="width:100%; height:100%;">
             Click here and Test key<br/>
             - Direction: ↑:W  ←:A  ↓:S  →:D <br/>
             - Uppercut: →↓↘→  Y  <br/>
             - Dropkick: →→  H  <br/>
             - Rabekku : ←→  T   <br/>
             <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
        </div>
    </body>    
    ```
    