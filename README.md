# KeyMan

[![Build Status](https://travis-ci.org/sj-js/keyman.svg?branch=master)](https://travis-ci.org/sj-js/keyman)
[![All Download](https://img.shields.io/github/downloads/sj-js/keyman/total.svg)](https://github.com/sj-js/keyman/releases)
[![Release](https://img.shields.io/github/release/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)
[![License](https://img.shields.io/github/license/sj-js/keyman.svg)](https://github.com/sj-js/keyman/releases)
(Detail: https://sj-js.github.io/sj-js/keyman)



## Getting Started

1. Script
    ```html
    <script src="https://cdn.jsdelivr.net/gh/sj-js/keyman/dist/js/keyman.js"></script>
    <script>
         var keyman = new KeyMan();
    </script>
    ```  
    
2. Add shortcut     
    ```html
    <script>
        keyman.addShortcut({
            name:'shortcut-1',
            keys:['control','shift'],
            keydown:function(){
                document.getElementById('tester').innerHTML = 'shortcut-1 ON';                                                        
            },
            keyup:function(){
                document.getElementById('tester').innerHTML = 'shortcut-1 OFF';
            }
        });
      
        keyman.addShortcut({
            name:'shortcut-2',
            keys:['shift','1'],
            keydown:function(){
                document.getElementById('tester').innerHTML = 'shortcut-2 ON';                                                        
            },
            keyup:function(){
                document.getElementById('tester').innerHTML = 'shortcut-2 OFF';
            }
        });           
    </script>
  
    <body>
        <div style="padding:10px; border:2px dashed #97A1FF;">Click here and Test shortcut</div>
        - shortcut-1: [Ctrl] + [Shift]<br/>
        - shortcut-2: [Shift] + [1]<br/>
        <div id="tester"></div>
    </body> 
    ```
    
