<script>
function set_nosee(d){
  document.getElementById('noseeframe').style.display=d;
  }
</script>
<form action='save.php' method='POST' target='nosee'>
<p>
Email address: this will create a directory (if it does not already exist) for
storing and viewing your images.  It can be simplified by<br/>
<tt><ul>
<li>foo@mit.edu --&gt; foo</li>
<li>foo@bar.mit.edu --&gt; foo@bar</li>
<li>foo@gmail.com --&gt; foo@gmail.com</tt> (ful address)</li>
</ul>
We use email addresses to give credit to the creator and so someone who might
like to collaborate with you can get in touch.
</p>
<p>
<input type="text" size=50 name="email"/>
</p>
<hr/>

<p>
Filename: here, just use the base name, no extension.  The file will be
a 2048x1024 <tt>.png</tt> file when stored.
</p>
<p>
<input type="text" size=50 name="filename"/>
</p>
<hr/>
<input type='checkbox' name="mailme"> Send the <tt>.png</tt> to me (not working yet...).
<hr/>
<input type='submit' name='choice' value='Cancel/Close'
    onclick="modal(null);return false"/>
    &nbsp;&nbsp;&nbsp;
<input type='submit' name='choice' value='OK' onclick="set_nosee('block')"/>
</form>
<div id="noseeframe" style="display:none" width="800" height="100">
<iframe name="nosee" width="800"></iframe>
<button onclick="set_nosee('none');modal(null)">Close</button>
</div>
