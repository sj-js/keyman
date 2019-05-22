# Shortcut
`단축키`를 설정합니다.


*@* *+prefix* *x* *@* 
```html
<script src="../crossman/crossman.js"></script>
<script src="../keyman/keyman.js"></script>
<script>
     var keyman = new KeyMan();
</script> 
```



## addShortcut(options)
- 단축키를 등록합니다.
    *@* *!* *@*
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


## isOn(Shortcut_Name)
- Shortcut을 누르고 있는지 여부를 알 수 있습니다.
    *@* *!* *@*
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
      
        function run(){
            if (keyman.isOn('shortcut-1')){
                document.getElementById('tester').innerHTML = 'Click with shortcut-1';                                                        
            }else{
                document.getElementById('tester').innerHTML = 'Click';              
            }
        }             
    </script>
  
    <body>
        <div style="padding:10px; border:2px dashed #97A1FF;">Click here and Test shortcut</div>
        
        <button onclick="run();">Click with [Ctrl] + [Shift]</button>
        <br/>
      
        <div id="tester"></div>
    </body>
    ```