function replace_text() {
  //alert(document.URL);
  //alert(document.body.innerHTML);
  var str = document.URL;
  var blocked_url = str.match(/=(.*)/)[1];
  document.body.innerHTML = document.body.innerHTML.replace('replace_this',blocked_url);

}
document.addEventListener('DOMContentLoaded', replace_text);