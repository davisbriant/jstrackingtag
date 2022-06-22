if (!_pntheon){
    var _pntheon = {
        doTrackEvent : function (_peventName, _peventAttributes) {
            //console.log(_peventAttributes);
            var eventId = _pntheon.getEventId();
            _pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId] = _pntheon._rmulus._rmulusEvents['_rmulus:' + eventId] || {};
            _pntheon.rmulus(_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId], eventId, _peventName, _peventAttributes);
            var callback = _pntheon.messageListener(eventId);
            return callback;
        },
        trackEvent : function (_peventName, _peventAttributes) {
            var check = _pntheon.getScriptURL();
            if (check === 'none' || check === 'manualEvent'){
                _pntheon.doTrackEvent(_peventName, _peventAttributes);
            }
        },
        validateEvent : function (e) {
            //get event object (window.event for IE compatibility)
            var e = window.event || e;
            //get target dom object reference
            //console.log(e);
            var eventName = e.type;
            if (e != null && e != 'undefined' && e != '') {
                var targetDomObject = e.target || e.srcElement;
                //extra checks to make sure object exists
                if ((targetDomObject) && (targetDomObject.classList)) {
                    if (targetDomObject.hasAttributes()) {
                        var attrs = targetDomObject.attributes;
                        var output = {};
                        for(var i = attrs.length - 1; i >= 0; i--) {
                            key = 'elemAtt|' + attrs[i].name;
                            val = attrs[i].value;
                            output[key]= val;
                        }
                    }    
                }  
                _pntheon.doTrackEvent(eventName, output);  
            }     
        },
        doAutoTracking : function (){
            window.addEventListener("click", _pntheon.validateEvent), {once: true};
            window.addEventListener("submit", _pntheon.validateEvent), {once: true};
            window.addEventListener("reset",_pntheon.validateEvent, {once: true});
            window.addEventListener("popstate",_pntheon.validateEvent, {once: true});
            window.addEventListener("hashchange",_pntheon.validateEvent, {once: true});
        },
        getEventId : function () {
                function randomString(length, chars) {
                    var result = '';
                    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                    return result;
                }
                var eventId = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                var unixtstamp = Math.round(+new Date()/1000);
                var eventId = eventId + '-' + unixtstamp;
                return eventId;
                
        },
        getURLParameter : function(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
        },
        getClientIp : function(_rmulus, eventId){
            try {
                if ((_rmulus._pclIp == 'active') || (_rmulus._pclIp != null && _rmulus._clIp != 'undefined' && _rmulus._clIp != '')){
                    //console.log(_rmulus);
                    var xhr = new XMLHttpRequest();
                    var clientIp = _pntheon.getURLParameter('_pclIp');
                    var _pclientId = _rmulus._pclientId;
                    if (clientIp == null || clientIp == 'undefined' || clientIp == ''){
                        var clientIp = _rmulus._pclIp;
                    }
                    if (clientIp != 'active'){
                        xhr.open('GET', "https://lookups.rmulus.com/pntheon/ip/" + _pclientId + "?_pclIp=" + clientIp, true);
                        //xhr.open('GET', "http://dev.rmulus.com/rmulus/phptrackingtag/rmulus/pntheon/ip/" + _pclientId + "", true);
                    } else {
                        xhr.open('GET', "https://lookups.rmulus.com/pntheon/ip/" + _pclientId + "", true);
                        //xhr.open('GET', "http://dev.rmulus.com/rmulus/phptrackingtag/rmulus/pntheon/ip/" + _pclientId + "", true);
                    }
                    xhr.timeout = 5000;
                    xhr.ontimeout = function (e){
                        _pntheon.pushToObject(_rmulus, '_pclIp', '{"request timed out": "not found"}');
                        var callback = _pntheon.doLookups(_rmulus, eventId);
                        return callback; 
                    }
                    try {
                        xhr.send();
                    } catch(e) {
                        console.log("Exception sending XMLHTTPRequest: " + e);
                    }
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4 && xhr.status == 200) { // success or not, run this callback when done.        
                            var response = null;
                            var clientIp = "unavailable";  // something
                            try {
                                response = JSON.parse(xhr.responseText);
                                //console.log(response);
                                if(response) {
                                    clientIp = response; 
                                    //console.log(clientIp); 
                                }
                            } catch(e) {
                                console.log("Exception parsing JSON: " + e);
                            } 
                            if (_rmulus != null || _rmulus != 'undefined' || _rmulus != '') {
                                _pntheon.pushToObject(_rmulus, '_pclIp', clientIp);
                                var callback = _pntheon.doLookups(_rmulus, eventId);
                                return callback; 
                            }
                        }
                    }
                } else {
                    _pntheon.pushToObject(_rmulus, '_pclIp', 'disabled');
                    var callback = _pntheon.doLookups(_rmulus, eventId);
                    return callback; 
                }
            } catch(e) {
                console.log("Unknown error detecting IP mode:" + e);
            }
        },            
        doLookups : function(_rmulus, eventId){
            try {
                if (_rmulus._plkpPrfl == 'active' && (_rmulus._plkpTblId != null && _rmulus._plkpTblId != 'undefined' && _rmulus._plkpTblId != '' && _rmulus._plkpKey != null && _rmulus._plkpKey != 'undefined' && _rmulus._plkpKey != '')){
                    var dataProvider = _rmulus._pclientId;
                    var tableId = _pntheon.getURLParameter('_plkpTblId');
                    if (tableId == null || tableId == 'undefined' || tableId == ''){
                        var tableId = _rmulus._plkpTblId;
                    }
                    var lkpKey = _pntheon.getURLParameter('_plkpPrfl');
                    if (lkpKey == null || lkpKey == 'undefined' || lkpKey == ''){
                        var lkpId = _rmulus._plkpKey;
                        var lkpKeyArray = lkpId.split('.');
                        var iterator = function (obj, array, i){    
                            var key = array[i];
                            var val = obj[key];
                            return  val;
                        }
                        var getLkpKey = function(obj, array, i){
                            var response = iterator(obj, array, i);
                            if (typeof response == 'object'){
                                i++;
                                var response = iterator(response, array, i);
                            }
                            var lkpId = array[i];
                            var lkpKey = response;
                            var lkpObj = {};
                            lkpObj[lkpId] = lkpKey;
                            return lkpObj;
                        }
                        var i = 0;
                        var lkpKeyPair = getLkpKey(_rmulus, lkpKeyArray, i);
                        var lkpId = Object.keys(lkpKeyPair)[0];
                        var lkpKey = lkpKeyPair[lkpId];
                        var lkpIdlwr = lkpId.toLowerCase();
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', "https://lookups.rmulus.com/pntheon/profiles/profiler?_pclientId=" + dataProvider + "&_plkpTblId=" + tableId + "&_plkpKey=" + lkpIdlwr + "&_plkpPrfl=" + lkpKey, true);
                    //xhr.open('GET', "http://dev.rmulus.com/rmulus/phptrackingtag/rmulus/pntheon/profiles/profiler?_pclientId=" + dataProvider + "&_plkpTblId=" + tableId + "&_plkpKey=" + lkpIdlwr + "&_plkpPrfl=" + lkpKey, true);
                    xhr.timeout = 5000;
                    xhr.ontimeout = function (e){
                        _pntheon.pushToObject(_rmulus, '_plkpPrfl', '{"request timed out": "not found"}');
                        var callback = _pntheon.rmulus(_rmulus, eventId);
                        return callback; 
                    }
                    try {
                        xhr.send();
                    } catch(e) {
                        console.log("Exception sending XMLHTTPRequest: " + e);
                    }
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4 && xhr.status == 200) { // success or not, run this callback when done.        
                            var response = null;
                            var obj = "not found";  // something
                            try {
                                response = JSON.parse(xhr.responseText);
                                var profiles = [];
                                if(response) {
                                    var obj = response; 
                                    var cats = Object.keys(obj);
                                    var profile = {};
                                    if (cats != 'not found'){
                                        for (var i = 0; i < cats.length; i++){
                                            profiles.push(obj);
                                        }
                                    } else {
                                        profiles.push(obj);
                                    }
                                }
                            } catch(e) {
                                console.log("Exception parsing JSON: " + e);
                            } 
                            if (_rmulus != null && _rmulus != 'undefined' && _rmulus != '') {
                                var string = JSON.stringify(obj);
                                _pntheon.pushToObject(_rmulus, '_plkpPrfl', string);
                                var callback = _pntheon.rmulus(_rmulus, eventId);
                                return callback; 
                            }
                        }
                    }
                } else {
                    _pntheon.pushToObject(_rmulus, '_plkpPrfl', 'disabled');
                    //console.log('calling rmulus');
                    var callback = _pntheon.rmulus(_rmulus, eventId);
                    return callback; 
                }
            } catch(e) {
                console.log("Unknown error detecting Lookups mode:" + e);
            }   
        },
        pushToObject : function(obj, key, value, callback) {
            obj[key] = value;
        },
        getScriptURL : function(eventId) {
            var scriptPath = '';
            try {
                throw new Error();
            }
            catch(e) {
                var stackLines = e.stack.split('\n');
                if (stackLines[1].indexOf('getScriptURL') != -1){
                    var check2 = stackLines[2];
                    var check3 = stackLines[3];
                    var check4 = stackLines[4];
                    var check5 = stackLines[5];
                } else if (stackLines[1].indexOf('getScriptURL') == -1){
                    var check2 = stackLines[1];
                    var check3 = stackLines[2];
                    var check4 = stackLines[3];
                    var check5 = stackLines[4];
                }
                if ((check5 != null && check5 != 'undefined' && check5 != '') && (check5.indexOf('validateEvent')>= 0)){
                    var eventType = 'autoEvent';
                } else if ((check4 != null && check4 != 'undefined' && check4 != '') && (check4.indexOf('trackEvent') >= 0)){
                    var eventType = 'manualEvent';
                } else if ((check4 != null && check4 != 'undefined' && check4 != '') && (check4.indexOf('validateEvent')>= 0)){
                    var eventType = 'autoEvent';
                } else if ((check2 != null && check2 != 'undefined' && check2 != '') && (check2.indexOf('trackEvent') >= 0)){
                    var eventType = 'manualEvent';
                } else {
                    var eventType = 'initialEvent';
                }
                if (((eventType === 'initialEvent' || eventType === 'autoEvent') && (check4 !== null && check4 !== 'undefined' && check4 !== '')) || ((eventType === 'initialEvent' || eventType === 'autoEvent') && (stackLines[1].indexOf('getScriptURL') == -1))) {
                    var pathParts = check4.match(/(https?:\/\/[^\s]+)/g);
                    if (pathParts !== null && pathParts !== 'undefined' && pathParts !== ''){
                        var scriptURL = pathParts[0].split(":");
                        //console.log(scriptURL);
                        if (pathParts[0].indexOf("_phref") >= 0){
                            scriptURL = scriptURL[0] + ':' + scriptURL[1] + ':' + scriptURL[2];
                        } else {
                            scriptURL = scriptURL[0] + ':' + scriptURL[1];
                        }
                    } else {
                        scriptURL = 'none';
                    }
                } else {
                    scriptURL = eventType;
                }
            }
            this.fullPath = function() {
              return pathParts[1];
            };
            this.path = function() {
              return pathParts[2];
            };
            this.file = function() {
              return pathParts[3];
            };
            this.fileNoExt = function() {
              var parts = this.file().split('.');
              parts.length = parts.length != 1 ? parts.length - 1 : 1;
              return parts.join('.');
            };
            return scriptURL;
        },
        queryStringToJSON : function(URL,obj,source){
            try {
                if (URL.indexOf("?") >= 0){
                    var pairs = URL.split('?')[1].split('&');
                    var a = ['_pclientId', '_pdataSource', '_pgetId', '_peventName', '_pidSource', '_pidName', '_pqStr', '_psqStr', '_pevId']
                    pairs.forEach(function(pair) {
                        pair = pair.split('=');
                        if ((a.indexOf(pair[0]) >= 0) && (source == 'qStr')){
                            console.log(pair[0] + ' is not allowed');
                        } else {
                            //console.log(pair[0]);
                            obj[pair[0]] = decodeURIComponent(pair[1] || '');
                        }
                    });
                }
            } catch(e) {
                console.log("JSON conversion failed:" + e);
            }
        },
        JSONtoQueryString : function(obj, prefix){
            //console.log(obj);
            var str = [];
            for(var p in obj) {
                if (obj.hasOwnProperty(p)){
                    //console.log(p);
                    var k = prefix ? prefix + "=" + p : p, v = obj[p];
                    var pre = prefix ? prefix + ">" : p, v = obj[p];
                    //console.log(v);
                    if (v == null || v == undefined || v == ""){
                        v = "Unavailable";
                    }
                    //console.log(v);
                    str.push(typeof v == "object" ?
                    _pntheon.JSONtoQueryString(v, k) :
                    p + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        },
        doRmulusCookie : function(queryString, eventId, callback){
            try{
                var elem = document.createElement('iframe');
                elem.src = (document.location.protocol == "https:" ? "https://" : "http://") + _pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pidSource + "?" + queryString;
                elem.async = true;
                elem.type = "document";
                elem.width = "1";
                elem.height = "1";
                elem.frameborder = "0";
                elem.style.display = "none";
                elem.id = _pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pevId;
                document.body.appendChild(elem);
                //document.getElementsByTagName('body')[0].appendChild(elem);
                if (callback != null || callback != ""){
                    return callback;
                } else {

                }
            } catch(e) {
                    console.log("Error calling rmulus iframe:" + e);
                }
        },
        getRmulusEvents : function(_pclientId, _peventName, _pdataSource){
            var _pclientId = _pclientId || null;
            var _peventName = _peventName || null;
            var _pdataSource = _pdataSource || null;
            try{
                var events = {};
                var _rmulusEvents = _pntheon._rmulus._rmulusEvents;
                for (var _rmulusEvent in _rmulusEvents){
                    if ((_pclientId != null) && (_peventName != null) && (_pdataSource != null)){
                        if ((_rmulusEvents[_rmulusEvent]['_pclientId'] == _pclientId) && (_rmulusEvents[_rmulusEvent]['_pdataSource'] == _pdataSource) && (_rmulusEvents[_rmulusEvent]['_peventName'] == _peventName)){
                            events[_rmulusEvent] = _rmulusEvents[_rmulusEvent];
                        }
                    } else if ((_pclientId != null) && (_peventName != null) && (_pdataSource == null)){
                        if ((_rmulusEvents[_rmulusEvent]['_pclientId'] == _pclientId) && (_rmulusEvents[_rmulusEvent]['_pdataSource'] != _pdataSource) && (_rmulusEvents[_rmulusEvent]['_peventName'] == _peventName)){
                            events[_rmulusEvent] = _rmulusEvents[_rmulusEvent];
                        }
                    } else if ((_pclientId != null) && (_peventName == null) && (_pdataSource != null)){
                        if ((_rmulusEvents[_rmulusEvent]['_pclientId'] == _pclientId) && (_rmulusEvents[_rmulusEvent]['_pdataSource'] != _pdataSource) && (_rmulusEvents[_rmulusEvent]['_peventName'] != _peventName)){
                            events[_rmulusEvent] = _rmulusEvents[_rmulusEvent];
                        } 
                    } else if ((_pclientId != null) && (_peventName == null) && (_pdataSource == null)){
                        if ((_rmulusEvents[_rmulusEvent]['_pclientId'] == _pclientId) && (_rmulusEvents[_rmulusEvent]['_pdataSource'] != _pdataSource) && (_rmulusEvents[_rmulusEvent]['_peventName'] != _peventName)){
                            events[_rmulusEvent] = _rmulusEvents[_rmulusEvent];
                        }
                    }          
                }
                return events;
            } catch(e) {
                    console.log("Error getting _rmulusEvent:" + e);
                }
        },
        getRmulus : function(_rmulus){
            return _rmulus;
        },
        rmulus : function(_rmulus, eventId, eventName, eventAttributes){
            if (_rmulus == null || _rmulus == 'undefined' || _rmulus == '') {
                var _rmulus = {};
            }
            if (_rmulus._pevId == null || _rmulus._pevId == 'undefined' || _rmulus._pevId == '') {
                var eventId = eventId;
                var docLoc = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
                var docHref = window.location.href;
                var urlFrag = window.location.hash.substr(1);
                if (urlFrag.slice('!')[0] == '!'){
                    urlFrag = urlFrag.substring(1, urlFrag.length);
                } 
                var qStrings = window.location.search;
                var scriptURL = _pntheon.getScriptURL(eventId);
                if (scriptURL !== 'none' && scriptURL !== 'manualEvent'){
                    var scriptLoc = scriptURL.split('?')[0];
                    var scriptQstrings = scriptURL.split('?')[1];
                    if (scriptQstrings === undefined || scriptQstrings === null){
                        scriptQstrings = '';
                    } else {
                       scriptQstrings = '?' + scriptQstrings;
                    }
                    _rmulus._psqStr = scriptQstrings;
                    var pushScriptQstrings = function(){
                        try {
                            if (scriptQstrings != null && scriptQstrings != ""){
                                return _pntheon.queryStringToJSON(scriptQstrings,_rmulus,'sqStr');
                            }
                        } catch(e) {
                                console.log("Unknown error detecting scriptQstrings:" + e);
                        }
                    }
                    pushScriptQstrings();
                }
                _rmulus._pevId = eventId;
                _rmulus._pdLoc = docLoc;
                _rmulus._pdHash = urlFrag;
                _rmulus._pqStr = qStrings;
                var pushQstrings = function(){
                    try {
                        if (_rmulus._pqStr != 'disabled' && qStrings != null && qStrings != ""){
                            return _pntheon.queryStringToJSON(qStrings,_rmulus,'qStr');
                        } else {
                            _rmulus._pqStr == 'disabled';
                        }
                    } catch(e) {
                            console.log("Unknown error detecting qStrings:" + e);
                    }
                }
                pushQstrings();
                //check for autoTrack
                if (_rmulus._pautoTrack == 'true') {
                    _pntheon.doAutoTracking();
                }
                //overwrite eventName if manually set by eventListener
                if (eventName != null && eventName != 'undefined' && eventName != '') {
                    _rmulus._peventName = eventName;
                }
                //console.log(_rmulus._peventName);
                //geteventAttributes
                if (eventAttributes != '' && eventAttributes != undefined && eventAttributes != null){
                    if (typeof Object.assign !== 'function') {
                      Object.assign = function(target) {
                        'use strict';
                        if (target === null) {
                          throw new TypeError('Cannot convert undefined or null to object');
                        }
                        target = Object(target);
                        for (var index = 1; index < arguments.length; index++) {
                          var source = arguments[index];
                          if (source != null) {
                            for (var key in source) {
                              if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                              }
                            }
                          }
                        }
                        return target;
                      }
                    }
                    _rmulus = Object.assign(_rmulus, eventAttributes); 
                }
                //console.log(_rmulus);
                try {
                    if ((_rmulus._pidSource == null || _rmulus._pidSource == undefined || _rmulus._pidSource == "") || (_rmulus._pidName == null || _rmulus._pidName == undefined || _rmulus._pidName == "")){
                        _pntheon.pushToObject(_rmulus,'_pidSource','secure.rmulus.com');
                        _pntheon.pushToObject(_rmulus,'_pidName','rmulusId');
                    }
                } catch(e) {
                    console.log("Error defining _pidSource or _pidName:" + e);
                }
                try {
                    if (_rmulus._phref != null && _rmulus._phref != 'undefined' && _rmulus._phref != '') {
                        /*if (scriptURL.indexOf('_phref=')>=0){
                            var href = scriptURL.slice(scriptURL.indexOf('_phref=')+7,scriptURL.length);
                            _rmulus._phref = href;
                        } else {
                            if (qStrings.indexOf('_phref=')>=0){
                                var displayURL = window.location.href;
                                var href = displayURL.slice(displayURL.indexOf('_phref=')+7,displayURL.length);
                                _rmulus._phref = href;
                            } 
                        }*/
                        delete _rmulus['_phref'];
                    }
                } catch(e) {
                    console.log("Error detecting redirect url:" + e);
                }
                try {
                    if (_rmulus._pclkId != null && _rmulus._pclkId != 'undefined' && _rmulus._pclkId != '' && _rmulus._pclkId != 'active') {
                        function setCookie(name, value, days, domain){
                            var date = new Date();
                            date.setTime(date.getTime() + (days*24*60*60*1000)); 
                            var expires = "; expires=" + date.toGMTString();
                            document.cookie = name + "=" + value + expires + ";path=/;Secure;SameSite=None;domain=" + domain;
                        }
                        var _pclkId = _pntheon.getURLParameter('_pclkId');
                        if(_pclkId){
                            var _pclSrc = _pntheon.getURLParameter('_pclSrc');
                            if(_pclSrc == 'strict'){
                                setCookie('_pclkId', _pclkId, 90, '');
                            } else {
                                var hostname = location.hostname;
                                var position = hostname.split(".").length - 1;
                                var cdomain = "." + hostname.split(".")[position - 1] + "." + hostname.split(".")[position];
                                setCookie('_pclkId', _pclkId, 90, cdomain);
                            }
                        }
                    }
                } catch(e) {
                    console.log("Error setting _pclkId cookie:" + e);
                }
                _pntheon.getClientIp(_rmulus, eventId);
            } else {
                var callback = _pntheon.getRmulus(_rmulus);
                try {
                    if (Object.prototype.hasOwnProperty.call(_rmulus, '_pclientId') && Object.prototype.hasOwnProperty.call(_rmulus, '_peventName') && Object.prototype.hasOwnProperty.call(_rmulus, '_pdataSource')) {
                        try {
                            //console.log(_rmulus);
                            var _rmulus = _pntheon.JSONtoQueryString(_rmulus);
                        } catch(e) {
                            console.log("Tracking Failed: " + e);
                        }
                        var doCookie = _pntheon.doRmulusCookie(_rmulus, eventId);
                        //console.log(_rmulus);
                        return doCookie;                        
                    } else {
                        console.log("One or more required _rmulus properties missing: ['_pclientId', '_pdataSource', '_peventName']");
                    }
                } catch(e) {
                    console.log("Required _rmulus properties missing: " + e);
                }
                return callback;
            }
        },
        messageListener : function(eventId){
            var eventId = eventId;
            if ((_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pidSource != null) && (_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pidSource != undefined) && (_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pidSource != "")){
                //console.log(_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pgetId);
                window.addEventListener("message", 
                    function(e){
                        var getJSONval = function(obj, key){
                            var a = JSON.parse(obj);
                            var val = a[key];
                            return val;
                        };
                        var getJSONkey = function(obj){
                            var a = JSON.parse(obj);
                            var key = Object.keys(a)[0];
                            return key;
                        }
                        var origin = e.origin.split('//')[1];
                        //console.log(origin);
                        if((origin == _pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]['_pidSource']) && (_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pgetId == 'true')){ 
                            if (typeof e.data != 'string'){
                                var obj = JSON.stringify(e.data);
                            } else {
                                var obj = e.data;
                            }
                            var _pidName = getJSONkey(obj);
                            if (_pidName == _pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId]._pidName){
                                var _pclientId = getJSONval(obj, _pidName);
                                var _pidPair = {};
                                //console.log(_pidPair);
                                _pidPair[_pidName] = _pclientId;
                                _pntheon._rmulus._rmulusIds = _pntheon._rmulus['_rmulusIds'] || {};
                                _pntheon._rmulus._rmulusIds[origin] = _pidPair;
                                _pntheon.pushToObject(_pntheon._rmulus._rmulusEvents['_rmulusEventId:' + eventId], '_pclId',_pclientId);
                            } else {
                                //console.log("rmulusIds message not recognized");
                            }
                        }   
                    }, false);
            }         
        }
    }   
}
_pntheon._rmulus = _pntheon._rmulus || {};
_pntheon._rmulus._rmulusEvents = _pntheon._rmulus['_rmulusEvents'] || {};
_pntheon.doTrackEvent();

