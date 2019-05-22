# Command
`순차적 명령키`를 설정합니다.


*@* *+prefix* *x* *@* 
```html
<script src="../crossman/crossman.js"></script>
<script src="../keyman/keyman.js"></script>
<script>
     var keyman = new KeyMan();
</script> 
```



## addCommand(options)
- 명령키를 등록합니다.
    *@* *!* *@*
    ```html
    <script>    
        function showSkill(skillText){
            if (!window.countSkill)
               window.countSkill = 0;
            var prefix = ((++window.countSkill) % 2) ? '! ' : '';
            document.getElementById('tester').innerHTML = prefix + skillText;        
        }   
     
        keyman.addCommander('1p').setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d']).setButtonA(['t']).setButtonB(['y']).setButtonC(['g']).setButtonD(['h']).addCommandMap({
            'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
            'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
            'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],        
        }).addCommandEventMap({
            'uppercut': function(){
                showSkill('Upper Cut !');
            },
            'dropkick': function(){             
                showSkill('Drop Kick !!');
            },
            'rabekku': function(){                
                showSkill('Rabekku !!!');             
            }
        });            
    </script>
    
    <body>
        <div style="padding:10px; border:2px dashed #97A1FF;">Click here and Test command</div>
        - Direction: ↑:W  ←:A  ↓:S  →:D <br/>
        - Uppercut: →↓↘→  Y  <br/>
        - Dropkick: →→  H  <br/>
        - Rabekku : ←→  T   <br/>
       <br/>
       <div id="tester" style="color:#FF832C; font-weight:bold;"></div>        
    </body>    
    ```