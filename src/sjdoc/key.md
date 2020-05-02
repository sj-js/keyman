# Key



*@* *+prefix* *x* *@* 
```html
<script src="../crossman/crossman.js"></script>
<script src="../keyman/keyman.js"></script>
<script>
     var keyman = new KeyMan();
</script> 
```




## isOnKey(key)
- Key를 누르고 있는지 여부를 알 수 있습니다.
    *@* *!* *@*
    ```html
    <script>
        function run(){
            var textWith = keyman.isOnKey('shift') ? ' with SHIFT' : '';
            document.getElementById('tester').innerHTML = 'Click' +textWith;                                                        
        }             
    </script>
    <body>
        <button onclick="run();">Click with shift</button>
        <br/>
      
        <div id="tester"></div>
    </body>
    ```