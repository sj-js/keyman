# Input
사용자지정 단축키를 만들 때 사용할 수 있는 기능입니다. 

*@* *+prefix* *x* *@* 
```html
<script src="../crossman/crossman.js"></script>
<script src="../keyman/keyman.js"></script>
<script>
     var keyman = new KeyMan();
</script> 
```
      
  

## Shortcut Input 
- 사용자로부터 단축키를 입력받을 수 있습니다.
    *@* *!* *@*
    ```html
    <script>
         keyman.detect();     
    </script>
    <body>
        <input id="shortcut1" data-shortcut-input  style="width:200px; height:30px;" />
        <button onclick="document.getElementById('tester').innerHTML = keyman.getShortcutInputById('shortcut1');">CHECK</button>
        <br/>
      
        <input id="shortcut2" data-shortcut-input  style="width:200px; height:30px;" />
        <button onclick="document.getElementById('tester').innerHTML = keyman.getShortcutInputById('shortcut2');">CHECK</button>
        <br/>
      
        <input id="shortcut3" data-shortcut-input  style="width:200px; height:30px;" />
        <button onclick="document.getElementById('tester').innerHTML = keyman.getShortcutInputById('shortcut3');">CHECK</button>
        <br/>
      
        <div id="tester"></div>
    </body>
    ```

- getShortcutInputValue(ID)
- setShortcutInputValue(Element, keyList, seperator)
