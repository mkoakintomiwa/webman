//<![CDATA[

    var isMobile = mobileAndTabletcheck();



    function wrs_urlencode(clearString) {
        var output = '';
        var x = 0;
        clearString = clearString.toString();
        var regex = /(^[a-zA-Z0-9_.]*)/;
        
        var clearString_length = ((typeof clearString.length) == 'function') ? clearString.length() : clearString.length;
    
        while (x < clearString_length) {
            var match = regex.exec(clearString.substr(x));
            if (match != null && match.length > 1 && match[1] != '') {
                output += match[1];
                x += match[1].length;
            }
            else {
                var charCode = clearString.charCodeAt(x);
                var hexVal = charCode.toString(16);
                output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
                ++x;
            }
        }
        
        return output;
    }
    
    function wrs_mathmlEntities(mathml) {
        var toReturn = '';
        
        for (var i = 0; i < mathml.length; ++i) {
            //parsing > 128 characters
            if (mathml.charCodeAt(i) > 128) {
                toReturn += '&#' + mathml.charCodeAt(i) + ';';
            }
            else {
                toReturn += mathml.charAt(i);
            }
        }
    
        return toReturn;
    }
    
    function openResource(url, mathml) {
        wnd = window.open(url + '?mml=' + wrs_urlencode(wrs_mathmlEntities(mathml)) + '&backgroundColor=%23fff',"new_window","width=350,height=200,location=0,status=0,toolbar=0,top=100,left=500");
        wnd.focus();
    }
    
    
    function setLanguage() {
        var i, str;
        str=""+location;
        i=str.lastIndexOf("/index.html",i);
        if (str[i-3]=="/") {
            // .../xx/demo.html
            str = str.substring(i-2,i)
            setCookie("lang",str,1);
        }
    
    }
    
    function changeLanguage(lang, page) {
        if (lang.length>0) {
            location.href="../"+lang+"/"+page;
        }
    }
    
    function getMathML(latex) {
        var req = new XMLHttpRequest();
        req.open("POST",js_path+"/latex2mathml", false);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var params = "latex="+encodeURIComponent(latex);
        req.send(params);
        if (req.status != 200)  {
            return "Error generating MathML.";
        }
        return req.responseText;
    }
    
    function getLaTeX(mathml, callback) {
        var req = new XMLHttpRequest();
        req.open("POST",js_path+"/mathml2latex", false);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var params = "mml="+encodeURIComponent(mathml);
    
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status != 200)  {
                    callback("Error generating LaTeX.");
                }
                else {
                    callback(req.responseText);
                }
            }
        }
    
        req.send(params);
    }
    
    function getAccessible(mathml, callback, lang) {
        var req = new XMLHttpRequest();
        req.open("POST",js_path+"/mathml2accessible", true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var params = "mml="+encodeURIComponent(mathml)+"&lang="+lang;
    
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status != 200)  {
                    callback("Error generating accessible text.");
                }
                else {
                    callback(req.responseText);
                }
            }
        }
    
        req.send(params);
    }
    
    function getMathMLFromAccessible(accessible) {
        var req = new XMLHttpRequest();
        req.open("POST",js_path+"/accessible2mathml", false);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var params = "accessible="+encodeURIComponent(accessible) + '&lang=en';
    
        req.send(params);
        if (req.status != 200)  {
            return "Error generating MathML.";
        }
        return req.responseText;
    }
    
    function getParameter(param, deft)
    {
        var i, str;
        str=""+location;
        i=str.indexOf(param+"=");
        if (i>=0)
        {
            str=str.substr(i+param.length+1);
            i=str.indexOf("&");
            if (i>=0) str=str.substring(0,i);
            str=str.replace(/\+/g," ");
            return decodeURIComponent(str);
        }
        else
        {
            return deft;
        }
    }
    function getCookie(c_name)
    {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
    }
    function setCookie(c_name,value,exdays,path)
    {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        c_value += ";path=/";
        document.cookie=c_name + "=" + c_value;
    }
    function changeToolbar(toolbar, instance)
    {
        com.wiris.jsEditor.JsEditor.getInstance(document.getElementById(instance)).setParams({'toolbar': toolbar});
    }
    
    function disablePARCCButtons() {
        var parcbuttons = document.getElementsByClassName("wrs_css_active");
        for(var i = 0; i < parcbuttons.length; i++) {
            var parcbutton = parcbuttons[i];
            parcbutton.className = parcbutton.className.replace(' wrs_css_active', ' ');
        }
    }
    
    
    function mobileAndTabletcheck() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
    
    
    function swicthHandPalette() {
        var buttons = document.getElementsByClassName('wrs_handWrapper');
        for (var i = 0; i < buttons.length; ++i) buttons[i].lastChild.click();
    }
    
    //]]>