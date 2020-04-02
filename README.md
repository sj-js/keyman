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



## Getting Started

0. Load
    - Browser
        ```html    
        <script src="https://cdn.jsdelivr.net/npm/@sj-js/crossman/dist/js/crossman.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@sj-js/keyman/dist/js/keyman.min.js"></script>
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

2. Simple Example
    ```html 
    <!DOCTYPE html>
    <HTML>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/@sj-js/crossman/dist/js/crossman.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@sj-js/keyman/dist/js/keyman.min.js"></script>
            <script>
                var keyman = new KeyMan();
            </script>
            <style>
                * { margin:0; cursor:pointer; }
                div:focus { background-color: Aqua; }
            </style>
        </head>
    
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
            <div tabindex="0" style="width:500px; height:500px; border:1px solid black;">
                Click here and Test key [Ctrl] + [Shift]
                <div id="tester" style="color:#FF832C; font-weight:bold;"></div>
            </div>
        </body>
    </HTML>
    ```
    
