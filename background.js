//    This file is part of Block Misspelled Websites Chrome Extension.
//
//    Block Misspelled Websites Chrome Extension is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    Block Misspelled Websites Chrome Extension is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Block Misspelled Websites Chrome Extension.  If not, see <http://www.gnu.org/licenses/>.
// 
//    Send bug reports and feedback to: dmn001 [at] gmail.com


var whitelist = new Array();
whitelist[0] = 'steamcommunity.com';
whitelist[1] = 'sourceop.com';
whitelist[2] = 'tf2outpost.com';
whitelist[3] = 'dotaoutpost.com';

function checkUrl(url) {
	var parsed_url_hostname = parse_url(url).host;
	var domain_part = parsed_url_hostname.replace(/^www\./,'');


	for (var i = 0; i < whitelist.length; i++) {
		if (domain_part.indexOf(whitelist[i]) != -1){
			return false;
		}
	}

	var cust_threshold = Math.ceil(domain_part.length/4);
	var dist_threshold = Math.min(cust_threshold,5);

	for (var i = 0; i < whitelist.length; i++) {
	    var dist = levenshteinenator(domain_part,whitelist[i]);
		if (dist == 0){
			return false;
		}
		else if (dist <= dist_threshold){
			return true;
		}
	}
	return false;
};

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = details.url;
        if (checkUrl(url)){
            var warningPage = chrome.extension.getURL('blocked.html?url='+url);
            return {redirectUrl : warningPage };
        }
        else{
            return {cancel : false};
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);



levenshteinenator = function(a,b) {
	var cost;
	
	// get values
	var m = a.length;
	var n = b.length;
	
	// make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
	if (m < n) {
		var c=a;a=b;b=c;
		var o=m;m=n;n=o;
	}
	
	var r = new Array();
	r[0] = new Array();
	for (var c = 0; c < n+1; c++) {
		r[0][c] = c;
	}
	
	for (var i = 1; i < m+1; i++) {
		r[i] = new Array();
		r[i][0] = i;
		for (var j = 1; j < n+1; j++) {
			cost = (a.charAt(i-1) == b.charAt(j-1))? 0: 1;
			r[i][j] = minimator(r[i-1][j]+1,r[i][j-1]+1,r[i-1][j-1]+cost);
		}
	}
	
	return r[m][n];
}

// return the smallest of the three values passed in
minimator = function(x,y,z) {
	if (x < y && x < z) return x;
	if (y < x && y < z) return y;
	return z;
}


//http://phpjs.org/functions/parse_url/
function parse_url (str, component) {
  // http://kevin.vanzonneveld.net
  // +      original by: Steven Levithan (http://blog.stevenlevithan.com)
  // + reimplemented by: Brett Zamir (http://brett-zamir.me)
  // + input by: Lorenzo Pisani
  // + input by: Tony
  // + improved by: Brett Zamir (http://brett-zamir.me)
  // %          note: Based on http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
  // %          note: blog post at http://blog.stevenlevithan.com/archives/parseuri
  // %          note: demo at http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
  // %          note: Does not replace invalid characters with '_' as in PHP, nor does it return false with
  // %          note: a seriously malformed URL.
  // %          note: Besides function name, is essentially the same as parseUri as well as our allowing
  // %          note: an extra slash after the scheme/protocol (to allow file:/// as in PHP)
  // *     example 1: parse_url('http://username:password@hostname/path?arg=value#anchor');
  // *     returns 1: {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
  var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
            'relative', 'path', 'directory', 'file', 'query', 'fragment'],
    ini = (this.php_js && this.php_js.ini) || {},
    mode = (ini['phpjs.parse_url.mode'] &&
      ini['phpjs.parse_url.mode'].local_value) || 'php',
    parser = {
      php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
    };

  var m = parser[mode].exec(str),
    uri = {},
    i = 14;
  while (i--) {
    if (m[i]) {
      uri[key[i]] = m[i];
    }
  }

  if (component) {
    return uri[component.replace('PHP_URL_', '').toLowerCase()];
  }
  if (mode !== 'php') {
    var name = (ini['phpjs.parse_url.queryKey'] &&
        ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
    parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
    uri[name] = {};
    query = uri[key[12]] || '';
    query.replace(parser, function ($0, $1, $2) {
      if ($1) {uri[name][$1] = $2;}
    });
  }
  delete uri.source;
  return uri;
}