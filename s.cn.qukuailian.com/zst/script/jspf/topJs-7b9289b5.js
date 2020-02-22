/*Source: src/main/webapp/resources/script/suggest_1.0.js*/
Array.prototype.unique = function() {
    var d = {}, b = [];
    for (var c = 0, a = this.length; c < a; c++) {
        d[this[c]] = typeof(this[c])
    }
    for (key in d) {
        if (d.hasOwnProperty(key)) {
            b.push((d[key] == "number") ? ~~key : key)
        }
    }
    return b
};
(function() {
    var textSuggest = {
        initialize: function(e, url,ajaxType, options) {
            this.url = url;
            this.ajaxType = ajaxType;
            this.textInput = jQuery(e);
            if (!this.textInput) {
                return false
            }
            jQuery.extend(this, {
                id: "MICSearchSuggest",
                interval: 70,
                periodicalTimer: 0,
                selectedIndex: -1,
                lastRequestString: "",
                lastRequestType: 0,
                oBuffer: [],
                oBufferSize: 99,
                oBufferLiteral: "{str: [],arr: [],ads: []}",
                suggestions: [],
                suggestionsDiv: null,
                suggestionsKeyDiv: null,
                suggestionsCataDiv: null,
                suggestionsCataCount:0,
                handlingRequest: false,
                suggestionAdType: 0,
                suggestionAds: []
            });
            this.options = jQuery.extend({
              suggestOuterDivClassName: "search-menu-wrap",
              suggestCataDivClassName: "search-cata",
              suggestKeyDivClassName: "search-key",
                suggestDivClassName: "text-dropdown",
                selectionHighClassName: "hover",
                selectionNormalClassName: "",
                selectionWordClassName: "spanWord",
                selectionCountClassName: "spanCount",
                matchClassName: "",
                matchTextWidth: true,
                matchAnywhere: true,
                ignoreCase: true,
                count: 10,
                showSuggestionAd: false,
                suggestionAdsDivId: "sugestionAds",
                popularProductsDivId: "popularProducts",
                popularProductsDivClassName: "pp",
                popularProductsText: "popular products",
                suggestAdDivClassName: "suggestionAD",
                suggestAdDivHighClassName: "HighLight",
                suggestAdImgWidth: 40,
                suggestAdImgHeight: 40,
                suggestAdCount: 2
            }, options);
            this.createSuggestionsOuterDiv();
            this.injectSuggestBehavior(this.textInput);
            return this
        },
        createSuggestionsOuterDiv: function() {
            if (!this.suggestionsDiv) {
                this.suggestionsDiv = jQuery("<div></div>").addClass(this.options.suggestOuterDivClassName).addClass(this.options.suggestDivClassName)
            }
        },
        createSuggestionsCataDiv: function() {
            if (!this.suggestionsCataDiv) {
                this.suggestionsCataDiv = jQuery("<ul></ul>").addClass(this.options.suggestCataDivClassName);
            }
        },
        createSuggestionsKeyDiv: function() {
            if (!this.suggestionsKeyDiv) {
                this.suggestionsKeyDiv = jQuery("<ul></ul>").addClass(this.options.suggestKeyDivClassName);
            }
        },
        injectSuggestBehavior: function(formInput) {
            formInput.attr("autoComplete", "off").keydown(this.keyDownHandler).click(this.setIntervalHandler);
            jQuery(document).click(this.documentClickHandler)
        },
        keyDownHandler: function(e) {
            var key = (window.event) ? window.event.keyCode : e.keyCode;
            var objSelf = window.TextSuggest;
            var bHidden = objSelf.isHiddenSuggestionsDiv();
            switch (key) {
                case 27 || ".KEY_ESC":
                    objSelf.clearIntervalHandler(e);
                    return null;
                case 9 || ".KEY_TAB":
                    objSelf.setInputFromSelection();
                    return null;
                case 13 || ".KEY_RETURN":
                    if (!bHidden && objSelf.selectedIndex >= 0) {
                        objSelf.setInputFromSelection();
                        return false
                    } else {
                        objSelf.clearIntervalHandler(e);
                        return true
                    }
                case 38 || ".KEY_UP":
                    if (!bHidden) {
                        objSelf.moveSelectionUp()
                    }
                    clearInterval(objSelf.periodicalTimer);
                    return false;
                case 40 || ".KEY_DOWN":
                    if (!bHidden) {
                        objSelf.moveSelectionDown()
                    }
                    clearInterval(objSelf.periodicalTimer);
                    return false;
                default:
                    objSelf.setIntervalHandler(e);
                    return null
            }
        },
        setIntervalHandler: function(e) {
            var src = jQuery((window.event) ? window.event.srcElement : e.target);
            var objSelf = window.TextSuggest;
            if (objSelf.textInput.index(src) < 0) {
                objSelf.textInput = src
            }
            clearInterval(objSelf.periodicalTimer);
            objSelf.periodicalTimer = setInterval(function() {
                window.TextSuggest.handleTextInput()
            }, objSelf.interval)
        },
        clearIntervalHandler: function(e) {
            var objSelf = window.TextSuggest;
            clearInterval(objSelf.periodicalTimer);
            objSelf.hideSuggestionsDiv()
        },
        documentClickHandler: function(e) {
            var src = jQuery((window.event) ? window.event.srcElement : e.target);
            var objSelf = window.TextSuggest;
            if (!src.is(".text-dropdown,.textsuggest,#InputWord1")) {
                clearInterval(objSelf.periodicalTimer);
                objSelf.hideSuggestionsDiv();
            }else{
                objSelf.showSuggestionsDiv();
            }
        },
        handleTextInput: function() {
            var curRequestType = this.getRequestType();
            if (curRequestType == 2 && "no suggest 4 companies now") {
                return false
            }
            this.lastRequestType = curRequestType;
            var bufferObject = this.getBufferObject();
            var specialPattern = new RegExp("([^-\\w\u4e00-\u9fa5])","g");
            var curRequestString = $.trim(this.textInput.val()).replace(/[\s*|*|\(|\\|\+|\)]/g, "").replace(specialPattern,"");
            
            if (this.options.ignoreCase) {
                curRequestString = curRequestString.toLowerCase()
            }
            this.oldVal = this.lastRequestString;
            if (curRequestString != "") {
                var index = -1;
                var bufferStr = bufferObject.str;
                var bShowSuggestionAd = this.isShowSuggestionAd();
                if ( !! jQuery.each(bufferStr, function(i, n) {
                    if (n == curRequestString) {
                        index = i;
                        return false
                    }
                }) && index >= 0) {
                    this.oldVal = bufferStr[index];
                    var indexSuggestions = bufferObject.arr[index];
                    var indexSuggestionADs = bufferObject.ads[index];
                    var theSameAd = bShowSuggestionAd ? ((this.suggestions == indexSuggestions) && (this.suggestionAds == indexSuggestionADs)) : (this.suggestions == indexSuggestions);
                    if (theSameAd) {
                        this.showSuggestionsDiv();
                        return true
                    }
                    this.suggestions = indexSuggestions;
                    this.suggestionAds = indexSuggestionADs;
                    this.updateSuggestions();
                    return null
                }
                var emptyResult = jQuery.grep(bufferObject.str, function(n, i) {
                    if (bShowSuggestionAd) {
                        return ((bufferObject.arr[i]).length == 0 && (bufferObject.ads[i]).length == 0 && curRequestString.indexOf(n) >= 0)
                    } else {
                        return ((bufferObject.arr[i]).length == 0 && curRequestString.indexOf(n) >= 0)
                    }
                });
                if (emptyResult && emptyResult.length > 0) {
                    this.suggestions = [];
                    return this.updateSuggestionsDiv()
                }
                this.lastRequestString = curRequestString;
                this.sendRequestForSuggestions();
                return true
            }
            this.suggestions = [];
            this.clearIntervalHandler();
            return this.updateSuggestionsDiv()
        },
        sendRequestForSuggestions: function() {
            if ( !! this.handlingRequest) {
                this.pendingRequest = true;
                return
            }
            this.handlingRequest = true;
            this.callAjaxEngine()
        },
        callAjaxEngine: function() {
            var iThis = this;
            try {
              if (this.ajaxType == "jsonp") {
                  $.ajax({
                  type: "GET",
                  url: this.url,
                  dataType: "jsonp",
                  jsonp: "jsonpcallback",
                  data: {
                    param: encodeURIComponent((this.lastRequestString)),
                    kind: this.lastRequestType,
                    ad: (this.isShowSuggestionAd() ? "1" : "0"),
                    id: this.id,
                    count: this.options.count,
                    ignoreCase: this.options.ignoreCase,
                    matchAnywhere: this.options.matchAnywhere,
                    time: new Date().getTime()
                  },
                  success: function(suggestions) {
                    iThis.ajaxUpdate(suggestions)
                  }
                });
              }
              else {
                var myAjax = jQuery.getJSON(this.url, {
                    param: encodeURIComponent((this.lastRequestString)),
                    kind: this.lastRequestType,
                    ad: (this.isShowSuggestionAd() ? "1" : "0"),
                    id: this.id,
                    count: this.options.count,
                    ignoreCase: this.options.ignoreCase,
                    matchAnywhere: this.options.matchAnywhere,
                    time: new Date().getTime()
                }, function(suggestions) {
                    iThis.ajaxUpdate(suggestions)
                })
              }
            } catch (ajaxError) {
                return false
            }
        },
        ajaxUpdate: function(suggestions) {
            if (!this.createSuggestions(suggestions)) {
                return false
            }
            this.updateSuggestions();
            this.handlingRequest = false;
            if ( !! this.pendingRequest) {
                this.handleTextInput()
            }
        },
        createSuggestions: function(suggestions) {
            if (!suggestions) {
                return false
            }
            if (this.isShowSuggestionAd()) {
                if (!suggestions.sug) {
                    return false
                }
                this.suggestions = suggestions.sug;
                this.suggestionAds = suggestions.ads
            } else {
                this.suggestions = suggestions
            }
            var bufferObject = this.getBufferObject();
            bufferObject.str.push(this.lastRequestString);
            bufferObject.arr.push(this.suggestions);
            bufferObject.ads.push(this.suggestionAds);
            this.oldVal = this.lastRequestString;
            return true
        },
        updateSuggestions: function() {
            $("body").append(this.suggestionsDiv);
            if (this.updateSuggestionsDiv()) {
                this.updateSelection(this.selectedIndex);
                this.showSuggestionsDiv()
            }
        },
        updateSuggestionsDiv: function() {
            this.selectedIndex = -1;
            this.suggestionsDiv.empty();
            this.suggestionsCataDiv=null;
            this.suggestionsKeyDiv=null;
            this.suggestionsCataCount=0;
            if (!this.isShowSuggestionAd() && this.suggestions.length <= 0) {
                this.hideSuggestionsDiv();
                return false
            }
            if (this.suggestions.length > 0) {
              //顺序不能变,先构造目录推荐，再构造普通推荐
              var suggestCataLines = this.createSuggestionCataSpans();
              var suggestKeyLines = this.createSuggestionKeySpans();
              if(suggestCataLines!=null && suggestCataLines.length>0){
                this.createSuggestionsCataDiv();
                this.suggestionsDiv.append(this.suggestionsCataDiv);
              }
              if(suggestKeyLines!=null && suggestKeyLines.length>0){
                this.createSuggestionsKeyDiv();
                this.suggestionsDiv.append(this.suggestionsKeyDiv);
              }
              for (var i = 0; i < suggestKeyLines.length; i++) {
                  this.suggestionsKeyDiv.append(suggestKeyLines[i]);
              }
              for (var i = 0; i < suggestCataLines.length; i++) {
                  this.suggestionsCataDiv.append(suggestCataLines[i]);
              }
            }
            if (this.isShowSuggestionAd() && this.suggestionAds.length > 0) {
                this.createSuggestionAdsDiv();
                var suggestionAdsDiv = this.getSuggestionAdsDiv();
                suggestionAdsDiv.empty().append(this.createPopularProductsDiv());
                var suggestAdLines = this.createSuggestionAdSpans();
                for (var i = 0; i < suggestAdLines.length; i++) {
                    suggestionAdsDiv.append(suggestAdLines[i])
                }
            } else {
                this.removeSuggestionAdsDiv()
            }
            return true
        },
        createSuggestionAdsDiv: function() {
            var suggestionAdsDiv = jQuery("<div></div>").attr("id", this.options.suggestionAdsDivId);
            this.suggestionsDiv.append(suggestionAdsDiv)
        },
        getSuggestionAdsDiv: function() {
            return this.suggestionsDiv.find("#" + this.options.suggestionAdsDivId)
        },
        removeSuggestionAdsDiv: function() {
            this.getSuggestionAdsDiv().remove()
        },
        createPopularProductsDiv: function() {
            var popularProductsDiv = jQuery('<li id="' + this.options.popularProductsDivId + '"></li>');
            var popularProductsSpan = jQuery("<span>" + this.options.popularProductsText + "</span>");
            return popularProductsDiv.append(popularProductsSpan)
        },
        getPopularProductsDiv: function() {
            return this.suggestionsDiv.find("#" + this.options.popularProductsDivId)
        },
        getSuggestAdItemDivs: function() {
            return this.getSuggestionAdsDiv().find("." + this.options.suggestAdDivClassName)
        },
        createSuggestionKeySpans: function() {
            var regExpFlags = "g";
            if (this.options.ignoreCase) {
                regExpFlags += "i"
            }
            var startRegExp = "^";
            if (this.options.matchAnywhere) {
                startRegExp = ""
            }
            var suggestionSpans = [];
            for (var i = this.suggestionsCataCount; i < this.suggestions.length; i++) {
              if(i==10){
                break;
              }
                suggestionSpans.push(this.createSuggestionKeySpan(i));
            }
            return suggestionSpans
        },
        createSuggestionCataSpans: function() {
            var regExpFlags = "g";
            if (this.options.ignoreCase) {
                regExpFlags += "i"
            }
            var startRegExp = "^";
            if (this.options.matchAnywhere) {
                startRegExp = ""
            }
            var suggestionSpans = [];
            var delSuggestions = [];
            for (var i = 0; i < this.suggestions.length; i++) {
              var word=this.suggestions[i].word;
              var suggestion = this.suggestions[i];
              if(suggestion['category']!=null){
                    var cata = suggestion['category'].split(":");
                    var cataSpan = this.createSuggestionCataSpan(this.suggestionsCataCount,word,cata[0],cata[1]);
                    if(cataSpan==""){
                      delSuggestions.push(this.suggestionsCataCount);
                    }else{
                      suggestionSpans.push(cataSpan);
                      this.suggestionsCataCount++;
                    }
              }
            }
            if(delSuggestions.length>0){
              var tmpSuggestions = [];
              for (var i = 0; i < this.suggestions.length; i++) {
                var flag = "true";
                for (var j = 0; j < delSuggestions.length; j++){
                  if(i ==delSuggestions[j]){
                    flag = "false";
                    break;
                  }
                }
                if(flag=="true"){
                  tmpSuggestions.push(this.suggestions[i]);
                }
              }
              this.suggestions = tmpSuggestions.slice(0);
              this.oBuffer=[];
              var bufferObject = this.getBufferObject();
              bufferObject.str.push(this.lastRequestString);
              bufferObject.arr.push(this.suggestions);
              bufferObject.ads.push(this.suggestionAds);
              this.oldVal = this.lastRequestString;
            }
            return suggestionSpans
        },
        createSuggestionKeySpan: function(n) {
            var suggestion = this.suggestions[n];
            var qCount = suggestion.count;
            if (qCount > 100) {
                qCount -= qCount % 100;
                qCount = (qCount + "").split("").reverse().join("").replace(/(\d{3})(?=\d)/g, "$1,").split("").reverse().join("")
            } else {
                if (qCount > 10) {
                    qCount -= qCount % 10
                } else {
                    qCount = 10
                }
            }
            var qType = "";
            switch (this.lastRequestType) {
                case 0:
                    qType = "产品";
                    break;
                case 1:
                    qType = "商情";
                    break;
                case 2:
                    qType = "公司";
                    break;
                default:
                    qType = "结果"
            }
            var innerSuggestSpan = this.createSuggestStrongSpan(suggestion.word);
            var wordSpan = jQuery("<li>" + innerSuggestSpan + "</li>");
            wordSpan.mousedown(this.itemSelectHandler).mouseover(this.itemOverHandler);
            return wordSpan
        },
        createSuggestionCataSpan: function(n ,word, cataName ,cataCode) {
            var suggestLimit = this.textInput.attr("suggestLimit");
            if( suggestLimit !=null && (cataName.length+word.length)>suggestLimit){
              return "";
            }
            var innerSuggestSpan = this.createSuggestStrongSpan(word);
            var cataCodeHidden="<input type='hidden' id='cata"+n+"' value='"+cataCode+"' />";
            var wordSpan = jQuery("<li>" + innerSuggestSpan+ ' 在 <span>'+cataName+'</span> 中搜索'+ "</li>");
            wordSpan.mousedown(this.itemSelectHandler).mouseover(this.itemOverHandler);
            return wordSpan.append(cataCodeHidden);
        },
        createSuggestionAdSpans: function() {
            var suggestionAdSpans = [];
            for (var i = 0; i < this.suggestionAds.length; i++) {
                var curAd = this.suggestionAds[i];
                var targetStr = curAd.open ? 'target="_blank"' : "";
                var imgLink = jQuery('<a href="' + curAd.url + '"' + targetStr + "></a>").append(jQuery('<img alt="' + curAd.alt + '" src="' + curAd.img + '"/>').css({
                    width: this.options.suggestAdImgWidth,
                    height: this.options.suggestAdImgHeight
                }));
                var wordLink = jQuery('<a href="' + curAd.url + '"' + targetStr + ">" + curAd.name + "</a>");
                var adTable = jQuery("<table></table>").append(jQuery("<tr></tr>").append(jQuery('<td  width="45"></td>').append(imgLink)).append(jQuery("<td></td>").append(wordLink)));
                var suggestionAdSpan = jQuery('<div class="' + this.options.suggestAdDivClassName + '"></div>').append(adTable).mouseover(this.itemOverHandler);
                suggestionAdSpans.push(suggestionAdSpan)
            }
            return suggestionAdSpans
        },
        createSuggestStrongSpan: function(word){
            var specialPattern = new RegExp("([^-\\w\u4e00-\u9fa5])","g");
            var input = $.trim(this.textInput.val()).replace(/[\s*|*|\(|\\|\+|\)]/g, "").replace(specialPattern,"");
            var s = word.indexOf(input.toLowerCase());
            var preInput="";
            var endInput="";
            var innerSuggestSpan="";
            if(s!=-1){
              preInput = word.substring(0,s);
              endInput = word.substring(s+input.length,word.length);
              if(preInput!=""){
                innerSuggestSpan+="<strong>"+preInput+"</strong>";
              }
              innerSuggestSpan+=input.toLowerCase();
              if(endInput!=""){
                innerSuggestSpan+="<strong>"+endInput+"</strong>";
              }
            }else{
              innerSuggestSpan+=word;
            }
            return innerSuggestSpan;
        },
        itemOverHandler: function(e) {
            var src = jQuery((window.event) ? window.event.srcElement : e.target);
            if (!src.is("li")) {
                src = src.parents("li")
            }
            var objSelf = window.TextSuggest;
            var idx = objSelf.suggestionsDiv.find("li").not(objSelf.getSuggestionAdsDiv()).not(objSelf.getPopularProductsDiv()).index(src);
            if (idx != objSelf.selectedIndex) {
                objSelf.updateSelection(idx)
            }
        },
        itemSelectHandler: function(e) {
            var objSelf = window.TextSuggest;
            objSelf.setInputFromSelection()
        },
        setInputFromSelection: function() {
            var n = this.selectedIndex;
            if (n >= 0) {
                if (this.isShowSuggestionAd()) {
                    var selectItem = this.suggestionsDiv.find("div").not(this.getSuggestionAdsDiv()).not(this.getPopularProductsDiv()).eq(n);
                    if (selectItem && selectItem.hasClass("suggestionAD")) {
                        this.jumpToAd(selectItem)
                    } else {
                        this.submitSearchForm()
                    }
                } else {
                      $("input[name='code']").each(function(i){
                          if($("#cata"+n).val() != null && $("#cata"+n).val() != ""){
                            $(this).val($("#cata"+n).val());
                            $(this).removeAttr("disabled");
                          }else{
                            $(this).val(0);
                          }
                      });
                      this.submitSearchForm()
                }
                return true
            } else {
                this.hideSuggestionsDiv()
            }
            return false
        },
        submitSearchForm: function() {
            this.clearIntervalHandler();
            var originLen = this.textInput.val();
            var suggestion = this.suggestions[this.selectedIndex]["word"];
            this.textInput.val(suggestion).parents("form").append("<input type='hidden' name='suggestFlag' value='true'/>");
            this.textInput.val(suggestion).parents("form").submit();
            this.setTextSelectionRange(originLen, suggestion.length);
            this.selectedIndex = -1
        },
        updateSelection: function(n) {
            this.suggestionsDiv.find("li").not(this.getSuggestionAdsDiv()).not(this.getPopularProductsDiv()).not(this.getSuggestAdItemDivs().removeClass(this.options.suggestAdDivHighClassName)).removeClass(this.options.selectionHighClassName).addClass(this.options.selectionNormalClassName);
            this.selectedIndex = n;
            var length = this.isShowSuggestionAd() ? (this.suggestions.length + this.suggestionAds.length) : this.suggestions.length;
            if (n >= 0 && n < length) {
                var itemDiv = this.suggestionsDiv.find("li").not(this.getSuggestionAdsDiv()).not(this.getPopularProductsDiv()).eq(n);
                if (itemDiv.is("." + this.options.suggestAdDivClassName)) {
                    itemDiv.removeClass(this.options.selectionNormalClassName).addClass(this.options.suggestAdDivHighClassName)
                } else {
                    itemDiv.removeClass(this.options.selectionNormalClassName).addClass(this.options.selectionHighClassName)
                }
            }
        },
        adItemSelectHandler: function(e) {
            var src = jQuery((window.event) ? window.event.srcElement : e.target);
            var objSelf = window.TextSuggest;
            objSelf.jumpToAd(src)
        },
        jumpToAd: function(src) {
            if (!src.is("a")) {
                if (src.is("img")) {
                    src = jQuery(src.parent("a").get(0))
                } else {
                    src = jQuery(src.find("a").get(0))
                }
            }
            var url = "";
            if ( !! src) {
                url = src.attr("href")
            }
            if (url == "") {
                return true
            } else {
                if (src.attr("target") == "_blank") {
                    window.open(url)
                } else {
                    window.location.href = url
                }
            }
            return false
        },
        showSuggestionsDiv: function() {
            var bHidden = this.isShowSuggestionAd() ? (this.suggestions.length <= 0 && this.suggestionAds.length <= 0) : (this.suggestions.length <= 0);
            if (bHidden) {
                clearInterval(this.periodicalTimer);
                this.hideSuggestionsDiv();
                this.selectedIndex = -1;
                this.textInput.focus()
            } else {
                this.positionSuggestionsDiv()
            }
        },
        positionSuggestionsDiv: function() {
            var textPos = this.textInput.offset();
            this.suggestionsDiv.css({
                left: textPos.left-7,
                top: (textPos.top + this.textInput.outerHeight())
            });
            var divWidth = this.textInput.innerWidth();
            this.suggestionsDiv.find("div").each(function(i) {
                var spansWidth = 0;
                jQuery(this).children("span").each(function() {
                    spansWidth += parseInt(this.offsetWidth)
                });
                if (spansWidth > divWidth) {
                    divWidth = spansWidth + 3
                }
            });
            if (this.options.matchTextWidth) {
                this.suggestionsDiv.css({
                    width: divWidth+10
                });
            }
            this.showSuggestionAdsDiv();
            this.suggestionsDiv.show();
        },
        hideSuggestionsDiv: function() {
            this.suggestionsDiv.hide()
        },
        showSuggestionAdsDiv: function() {
            if (this.isShowSuggestionAd() && this.suggestionAds.length > 0) {
                this.getSuggestionAdsDiv().show()
            } else {
                this.getSuggestionAdsDiv().hide()
            }
        },
        isHiddenSuggestionsDiv: function() {
            return ((this.suggestionsDiv.get(0).style.display == "none") ? true : false)
        },
        moveSelectionUp: function() {
            if (this.selectedIndex >= 0) {
                this.updateSelection(this.selectedIndex - 1)
            } else {
                var itemLength = this.isShowSuggestionAd() ? (this.suggestions.length + this.suggestionAds.length - 1) : (this.suggestions.length - 1);
                this.updateSelection(itemLength)
            }
            var n = this.selectedIndex;
            if (n >= 0 && n < this.suggestions.length) {
                this.textInput.val(this.suggestions[n]["word"])
            } else {
                this.textInput.val(this.oldVal)
            }
        },
        moveSelectionDown: function() {
            var canMoveDown = this.isShowSuggestionAd() ? (this.selectedIndex <= (this.suggestions.length + this.suggestionAds.length - 1)) : (this.selectedIndex <= (this.suggestions.length - 1));
            if (canMoveDown) {
                this.updateSelection(this.selectedIndex + 1)
            } else {
                this.updateSelection(0)
            }
            var n = this.selectedIndex;
            if (n >= 0 && n < this.suggestions.length) {
                this.textInput.val(this.suggestions[n]["word"])
            } else {
                this.textInput.val(this.oldVal)
            }
        },
        setTextSelectionRange: function(start, end) {
            var pos = this.textInput.val().length;
            if (!start) {
                var start = pos
            }
            if (!end) {
                var end = pos
            }
            if (this.textInput.setSelectionRange) {
                this.textInput.setSelectionRange(start, end)
            } else {
                if (this.textInput.createTextRange) {
                    var range = this.textInput.createTextRange();
                    range.collapse(true);
                    range.moveEnd("character", end);
                    range.moveStart("character", start);
                    range.select()
                }
            }
        },
        getRequestType: function() {
            var curRequestType = 0;
            var qSelect = this.textInput.attr("searchtype");
            if (qSelect) {
                curRequestType = qSelect - 0
            }
            return curRequestType
        },
        getBufferObject: function() {
            var bufferObject = this.oBuffer[this.lastRequestType];
            if (!bufferObject || bufferObject.str.unique.length > this.oBufferSize) {
                bufferObject = this.oBuffer[this.lastRequestType] = eval("(" + this.oBufferLiteral + ")")
            }
            return bufferObject
        },
        isShowSuggestionAd: function() {
            return this.options.showSuggestionAd && (this.lastRequestType == 0)
        }
    };
    window.TextSuggest = textSuggest
})();;
/*Source: src/main/webapp/resources/script/jquery.placeholder-1.2.1.js*/
/**
 * 输入框提示文字效果
 *
 * @author geliang, xuw
 * @version 1.2.1b3
 */
(function($) {
    "use strict";

    $.support.placeholder = "placeholder" in document.createElement("input");

    // 覆盖jQuery的val方法
    var originalVal = $.fn.val;
    if (!$.support.placeholder) {
        $.fn.val = function(value) {
            var ret = originalVal.apply(this, arguments);
            if (value === undefined) {
                // getter?
                var values = ret;
                if ($.isArray(values)) {
                    for (var i = 0; i < values.length; i++) {
                        if ($(this[i]).hasClass("placeholder")) {
                            values[i] = "";
                        }
                    }
                }
                else {
                    if ($(this).hasClass("placeholder")) {
                        ret = "";
                    }
                }
            }
            else {
                // setter
                $(this).removeClass("placeholder");

                if (value === "") {
                    var ph = $(this).attr("placeholder");
                    if (ph) {
                        $(this).addClass("placeholder");
                        ret = originalVal.apply(this, [ph]);
                    }
                }
            }

            return ret;
        };

        // 提交表单前清理placeholder
        $("form").submit(function() {
            // 兼容jQuery Validate
            if (typeof $(this).valid === "function" && $(this).valid() || $(this).hasClass("placeholder-clear")) {
                // 还原jQuery的val方法
                $.fn.val = originalVal;

                $(this).find(".placeholder").each(function() {
                    originalVal.apply($(this), [""]);
                });
            }
        });
    }

    $.fn.placeholder = function() {
        this.filter(function(index) {
            if ($(this).is("textarea")) {
                // HTML placeholder不支持多行，如果遇到textarea带多行的，不使用原生实现
                return $(this).attr("placeholder").indexOf("\n") > 0 || !$.support.placeholder;
            }
            else {
                // 不支持原生placeholder
                return !$.support.placeholder;
            }
        }).each(function() {
            $(this).each(function() {
                var input = $(this);
                var ph = input.attr("placeholder");
                if (ph) {
                    if ($.trim(input.val()) === "" || $.trim(input.val()) === ph ||
                        input.val().replace(/\n/g, "") === ph.replace(/\r\n/g, "")) {
                        input.val(ph);
                        input.addClass("placeholder");
                    }
                }
            });
            $(this).focus(function() {
                if ($(this).hasClass("placeholder")) {
                	//$(this).removeClass("placeholder").val("");
                   $(this).removeClass("placeholder");
                   $(this)[0].value='';
                }
            }).blur(function() {
                if ($.trim($(this).val()) === "") {
                    $(this).val($(this).attr("placeholder")).addClass("placeholder");
                }
            });

        });
    };
    //默认找到页面上所有有placeholder属性的文本框
    $(function() {
        $(":text[placeholder],textarea[placeholder]").placeholder();
    });
})(jQuery);
;
/*Source: src/main/webapp/resources/script/jquery.validate.min.js*/
/*! jQuery Validation Plugin - v1.11.1 - 3/22/2013\n* https://github.com/jzaefferer/jquery-validation
* Copyright (c) 2013 J枚rn Zaefferer; Licensed MIT */(function(t){t.extend(t.fn,{validate:function(e){if(!this.length)return e&&e.debug&&window.console&&console.warn("Nothing selected, can't validate, returning nothing."),void 0;var i=t.data(this[0],"validator");return i?i:(this.attr("novalidate","novalidate"),i=new t.validator(e,this[0]),t.data(this[0],"validator",i),i.settings.onsubmit&&(this.validateDelegate(":submit","click",function(e){i.settings.submitHandler&&(i.submitButton=e.target),t(e.target).hasClass("cancel")&&(i.cancelSubmit=!0),void 0!==t(e.target).attr("formnovalidate")&&(i.cancelSubmit=!0)}),this.submit(function(e){function s(){var s;return i.settings.submitHandler?(i.submitButton&&(s=t("<input type='hidden'/>").attr("name",i.submitButton.name).val(t(i.submitButton).val()).appendTo(i.currentForm)),i.settings.submitHandler.call(i,i.currentForm,e),i.submitButton&&s.remove(),!1):!0}return i.settings.debug&&e.preventDefault(),i.cancelSubmit?(i.cancelSubmit=!1,s()):i.form()?i.pendingRequest?(i.formSubmitted=!0,!1):s():(i.focusInvalid(),!1)})),i)},valid:function(){if(t(this[0]).is("form"))return this.validate().form();var e=!0,i=t(this[0].form).validate();return this.each(function(){e=e&&i.element(this)}),e},removeAttrs:function(e){var i={},s=this;return t.each(e.split(/\s/),function(t,e){i[e]=s.attr(e),s.removeAttr(e)}),i},rules:function(e,i){var s=this[0];if(e){var r=t.data(s.form,"validator").settings,n=r.rules,a=t.validator.staticRules(s);switch(e){case"add":t.extend(a,t.validator.normalizeRule(i)),delete a.messages,n[s.name]=a,i.messages&&(r.messages[s.name]=t.extend(r.messages[s.name],i.messages));break;case"remove":if(!i)return delete n[s.name],a;var u={};return t.each(i.split(/\s/),function(t,e){u[e]=a[e],delete a[e]}),u}}var o=t.validator.normalizeRules(t.extend({},t.validator.classRules(s),t.validator.attributeRules(s),t.validator.dataRules(s),t.validator.staticRules(s)),s);if(o.required){var l=o.required;delete o.required,o=t.extend({required:l},o)}return o}}),t.extend(t.expr[":"],{blank:function(e){return!t.trim(""+t(e).val())},filled:function(e){return!!t.trim(""+t(e).val())},unchecked:function(e){return!t(e).prop("checked")}}),t.validator=function(e,i){this.settings=t.extend(!0,{},t.validator.defaults,e),this.currentForm=i,this.init()},t.validator.format=function(e,i){return 1===arguments.length?function(){var i=t.makeArray(arguments);return i.unshift(e),t.validator.format.apply(this,i)}:(arguments.length>2&&i.constructor!==Array&&(i=t.makeArray(arguments).slice(1)),i.constructor!==Array&&(i=[i]),t.each(i,function(t,i){e=e.replace(RegExp("\\{"+t+"\\}","g"),function(){return i})}),e)},t.extend(t.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:!0,errorContainer:t([]),errorLabelContainer:t([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(t){this.lastActive=t,this.settings.focusCleanup&&!this.blockFocusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,t,this.settings.errorClass,this.settings.validClass),this.addWrapper(this.errorsFor(t)).hide())},onfocusout:function(t){this.checkable(t)||!(t.name in this.submitted)&&this.optional(t)||this.element(t)},onkeyup:function(t,e){(9!==e.which||""!==this.elementValue(t))&&(t.name in this.submitted||t===this.lastElement)&&this.element(t)},onclick:function(t){t.name in this.submitted?this.element(t):t.parentNode.name in this.submitted&&this.element(t.parentNode)},highlight:function(e,i,s){"radio"https://s.cn.made-in-china.com/zst/script/jspf/===e.type?this.findByName(e.name).addClass(i).removeClass(s):t(e).addClass(i).removeClass(s)},unhighlight:function(e,i,s){"radio"https://s.cn.made-in-china.com/zst/script/jspf/===e.type?this.findByName(e.name).removeClass(i).addClass(s):t(e).removeClass(i).addClass(s)}},setDefaults:function(e){t.extend(t.validator.defaults,e)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",maxlength:t.validator.format("Please enter no more than {0} characters."),minlength:t.validator.format("Please enter at least {0} characters."),rangelength:t.validator.format("Please enter a value between {0} and {1} characters long."),range:t.validator.format("Please enter a value between {0} and {1}."),max:t.validator.format("Please enter a value less than or equal to {0}."),min:t.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:!1,prototype:{init:function(){function e(e){var i=t.data(this[0].form,"validator"),s="on"+e.type.replace(/^validate/,"");i.settings[s]&&i.settings[s].call(i,this[0],e)}this.labelContainer=t(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||t(this.currentForm),this.containers=t(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var i=this.groups={};t.each(this.settings.groups,function(e,s){"string"==typeof s&&(s=s.split(/\s/)),t.each(s,function(t,s){i[s]=e})});var s=this.settings.rules;t.each(s,function(e,i){s[e]=t.validator.normalizeRule(i)}),t(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ","focusin focusout keyup",e).validateDelegate("[type='radio'], [type='checkbox'], select, option","click",e),this.settings.invalidHandler&&t(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)},form:function(){return this.checkForm(),t.extend(this.submitted,this.errorMap),this.invalid=t.extend({},this.errorMap),this.valid()||t(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var t=0,e=this.currentElements=this.elements();e[t];t++)this.check(e[t]);return this.valid()},element:function(e){e=this.validationTargetFor(this.clean(e)),this.lastElement=e,this.prepareElement(e),this.currentElements=t(e);var i=this.check(e)!==!1;return i?delete this.invalid[e.name]:this.invalid[e.name]=!0,this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),i},showErrors:function(e){if(e){t.extend(this.errorMap,e),this.errorList=[];for(var i in e)this.errorList.push({message:e[i],element:this.findByName(i)[0]});this.successList=t.grep(this.successList,function(t){return!(t.name in e)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){t.fn.resetForm&&t(this.currentForm).resetForm(),this.submitted={},this.lastElement=null,this.prepareForm(),this.hideErrors(),this.elements().removeClass(this.settings.errorClass).removeData("previousValue")},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(t){var e=0;for(var i in t)e++;return e},hideErrors:function(){this.addWrapper(this.toHide).hide()},valid:function(){return 0===this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{t(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(e){}},findLastActive:function(){var e=this.lastActive;return e&&1===t.grep(this.errorList,function(t){return t.element.name===e.name}).length&&e},elements:function(){var e=this,i={};return t(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){return!this.name&&e.settings.debug&&window.console&&console.error("%o has no name assigned",this),this.name in i||!e.objectLength(t(this).rules())?!1:(i[this.name]=!0,!0)})},clean:function(e){return t(e)[0]},errors:function(){var e=this.settings.errorClass.replace(" ",".");return t(this.settings.errorElement+"."+e,this.errorContext)},reset:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=t([]),this.toHide=t([]),this.currentElements=t([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(t){this.reset(),this.toHide=this.errorsFor(t)},elementValue:function(e){var i=t(e).attr("type"),s=t(e).val();return"radio"===i||"checkbox"===i?t("input[name='"+t(e).attr("name")+"']:checked").val():"string"==typeof s?s.replace(/\r/g,""):s},check:function(e){e=this.validationTargetFor(this.clean(e));var i,s=t(e).rules(),r=!1,n=this.elementValue(e);for(var a in s){var u={method:a,parameters:s[a]};try{if(i=t.validator.methods[a].call(this,n,e,u.parameters),"dependency-mismatch"===i){r=!0;continue}if(r=!1,"pending"===i)return this.toHide=this.toHide.not(this.errorsFor(e)),void 0;if(!i)return this.formatAndAdd(e,u),!1}catch(o){throw this.settings.debug&&window.console&&console.log("Exception occurred when checking element "+e.id+", check the '"+u.method+"' method.",o),o}}return r?void 0:(this.objectLength(s)&&this.successList.push(e),!0)},customDataMessage:function(e,i){return t(e).data("msg-"+i.toLowerCase())||e.attributes&&t(e).attr("data-msg-"+i.toLowerCase())},customMessage:function(t,e){var i=this.settings.messages[t];return i&&(i.constructor===String?i:i[e])},findDefined:function(){for(var t=0;arguments.length>t;t++)if(void 0!==arguments[t])return arguments[t];return void 0},defaultMessage:function(e,i){return this.findDefined(this.customMessage(e.name,i),this.customDataMessage(e,i),!this.settings.ignoreTitle&&e.title||void 0,t.validator.messages[i],"<strong>Warning: No message defined for "+e.name+"</strong>")},formatAndAdd:function(e,i){var s=this.defaultMessage(e,i.method),r=/\$?\{(\d+)\}/g;"function"==typeof s?s=s.call(this,i.parameters,e):r.test(s)&&(s=t.validator.format(s.replace(r,"{$1}"),i.parameters)),this.errorList.push({message:s,element:e}),this.errorMap[e.name]=s,this.submitted[e.name]=s},addWrapper:function(t){return this.settings.wrapper&&(t=t.add(t.parent(this.settings.wrapper))),t},defaultShowErrors:function(){var t,e;for(t=0;this.errorList[t];t++){var i=this.errorList[t];this.settings.highlight&&this.settings.highlight.call(this,i.element,this.settings.errorClass,this.settings.validClass),this.showLabel(i.element,i.message)}if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(t=0;this.successList[t];t++)this.showLabel(this.successList[t]);if(this.settings.unhighlight)for(t=0,e=this.validElements();e[t];t++)this.settings.unhighlight.call(this,e[t],this.settings.errorClass,this.settings.validClass);this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return t(this.errorList).map(function(){return this.element})},showLabel:function(e,i){var s=this.errorsFor(e);s.length?(s.removeClass(this.settings.validClass).addClass(this.settings.errorClass),s.html(i)):(s=t("<"+this.settings.errorElement+">").attr("for",this.idOrName(e)).addClass(this.settings.errorClass).html(i||""),this.settings.wrapper&&(s=s.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.append(s).length||(this.settings.errorPlacement?this.settings.errorPlacement(s,t(e)):s.insertAfter(e))),!i&&this.settings.success&&(s.text(""),"string"==typeof this.settings.success?s.addClass(this.settings.success):this.settings.success(s,e)),this.toShow=this.toShow.add(s)},errorsFor:function(e){var i=this.idOrName(e);return this.errors().filter(function(){return t(this).attr("for")===i})},idOrName:function(t){return this.groups[t.name]||(this.checkable(t)?t.name:t.id||t.name)},validationTargetFor:function(t){return this.checkable(t)&&(t=this.findByName(t.name).not(this.settings.ignore)[0]),t},checkable:function(t){return/radio|checkbox/i.test(t.type)},findByName:function(e){return t(this.currentForm).find("[name='"+e+"']")},getLength:function(e,i){switch(i.nodeName.toLowerCase()){case"select":return t("option:selected",i).length;case"input":if(this.checkable(i))return this.findByName(i.name).filter(":checked").length}return e.length},depend:function(t,e){return this.dependTypes[typeof t]?this.dependTypes[typeof t](t,e):!0},dependTypes:{"boolean":function(t){return t},string:function(e,i){return!!t(e,i.form).length},"function":function(t,e){return t(e)}},optional:function(e){var i=this.elementValue(e);return!t.validator.methods.required.call(this,i,e)&&"dependency-mismatch"},startRequest:function(t){this.pending[t.name]||(this.pendingRequest++,this.pending[t.name]=!0)},stopRequest:function(e,i){this.pendingRequest--,0>this.pendingRequest&&(this.pendingRequest=0),delete this.pending[e.name],i&&0===this.pendingRequest&&this.formSubmitted&&this.form()?(t(this.currentForm).submit(),this.formSubmitted=!1):!i&&0===this.pendingRequest&&this.formSubmitted&&(t(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(e){return t.data(e,"previousValue")||t.data(e,"previousValue",{old:null,valid:!0,message:this.defaultMessage(e,"remote")})}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},number:{number:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(e,i){e.constructor===String?this.classRuleSettings[e]=i:t.extend(this.classRuleSettings,e)},classRules:function(e){var i={},s=t(e).attr("class");return s&&t.each(s.split(" "),function(){this in t.validator.classRuleSettings&&t.extend(i,t.validator.classRuleSettings[this])}),i},attributeRules:function(e){var i={},s=t(e),r=s[0].getAttribute("type");for(var n in t.validator.methods){var a;"required"===n?(a=s.get(0).getAttribute(n),""===a&&(a=!0),a=!!a):a=s.attr(n),/min|max/.test(n)&&(null===r||/number|range|text/.test(r))&&(a=Number(a)),a?i[n]=a:r===n&&"range"!==r&&(i[n]=!0)}return i.maxlength&&/-1|2147483647|524288/.test(i.maxlength)&&delete i.maxlength,i},dataRules:function(e){var i,s,r={},n=t(e);for(i in t.validator.methods)s=n.data("rule-"+i.toLowerCase()),void 0!==s&&(r[i]=s);return r},staticRules:function(e){var i={},s=t.data(e.form,"validator");return s.settings.rules&&(i=t.validator.normalizeRule(s.settings.rules[e.name])||{}),i},normalizeRules:function(e,i){return t.each(e,function(s,r){if(r===!1)return delete e[s],void 0;if(r.param||r.depends){var n=!0;switch(typeof r.depends){case"string":n=!!t(r.depends,i.form).length;break;case"function":n=r.depends.call(i,i)}n?e[s]=void 0!==r.param?r.param:!0:delete e[s]}}),t.each(e,function(s,r){e[s]=t.isFunction(r)?r(i):r}),t.each(["minlength","maxlength"],function(){e[this]&&(e[this]=Number(e[this]))}),t.each(["rangelength","range"],function(){var i;e[this]&&(t.isArray(e[this])?e[this]=[Number(e[this][0]),Number(e[this][1])]:"string"==typeof e[this]&&(i=e[this].split(/[\s,]+/),e[this]=[Number(i[0]),Number(i[1])]))}),t.validator.autoCreateRanges&&(e.min&&e.max&&(e.range=[e.min,e.max],delete e.min,delete e.max),e.minlength&&e.maxlength&&(e.rangelength=[e.minlength,e.maxlength],delete e.minlength,delete e.maxlength)),e},normalizeRule:function(e){if("string"==typeof e){var i={};t.each(e.split(/\s/),function(){i[this]=!0}),e=i}return e},addMethod:function(e,i,s){t.validator.methods[e]=i,t.validator.messages[e]=void 0!==s?s:t.validator.messages[e],3>i.length&&t.validator.addClassRules(e,t.validator.normalizeRule(e))},methods:{required:function(e,i,s){if(!this.depend(s,i))return"dependency-mismatch";if("select"===i.nodeName.toLowerCase()){var r=t(i).val();return r&&r.length>0}return this.checkable(i)?this.getLength(e,i)>0:t.trim(e).length>0},email:function(t,e){return this.optional(e)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(t)},url:function(t,e){return this.optional(e)||/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(t)},date:function(t,e){return this.optional(e)||!/Invalid|NaN/.test(""+new Date(t))},dateISO:function(t,e){return this.optional(e)||/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(t)},number:function(t,e){return this.optional(e)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(t)},digits:function(t,e){return this.optional(e)||/^\d+$/.test(t)},creditcard:function(t,e){if(this.optional(e))return"dependency-mismatch";if(/[^0-9 \-]+/.test(t))return!1;var i=0,s=0,r=!1;t=t.replace(/\D/g,"");for(var n=t.length-1;n>=0;n--){var a=t.charAt(n);s=parseInt(a,10),r&&(s*=2)>9&&(s-=9),i+=s,r=!r}return 0===i%10},minlength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||r>=s},maxlength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||s>=r},rangelength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||r>=s[0]&&s[1]>=r},min:function(t,e,i){return this.optional(e)||t>=i},max:function(t,e,i){return this.optional(e)||i>=t},range:function(t,e,i){return this.optional(e)||t>=i[0]&&i[1]>=t},equalTo:function(e,i,s){var r=t(s);return this.settings.onfocusout&&r.unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){t(i).valid()}),e===r.val()},remote:function(e,i,s){if(this.optional(i))return"dependency-mismatch";var r=this.previousValue(i);if(this.settings.messages[i.name]||(this.settings.messages[i.name]={}),r.originalMessage=this.settings.messages[i.name].remote,this.settings.messages[i.name].remote=r.message,s="string"==typeof s&&{url:s}||s,r.old===e)return r.valid;r.old=e;var n=this;this.startRequest(i);var a={};return a[i.name]=e,t.ajax(t.extend(!0,{url:s,mode:"abort",port:"validate"+i.name,dataType:"json",data:a,success:function(s){n.settings.messages[i.name].remote=r.originalMessage;var a=s===!0||"true"===s;if(a){var u=n.formSubmitted;n.prepareElement(i),n.formSubmitted=u,n.successList.push(i),delete n.invalid[i.name],n.showErrors()}else{var o={},l=s||n.defaultMessage(i,"remote");o[i.name]=r.message=t.isFunction(l)?l(e):l,n.invalid[i.name]=!0,n.showErrors(o)}r.valid=a,n.stopRequest(i,a)}},s)),"pending"}}}),t.format=t.validator.format})(jQuery),function(t){var e={};if(t.ajaxPrefilter)t.ajaxPrefilter(function(t,i,s){var r=t.port;"abort"===t.mode&&(e[r]&&e[r].abort(),e[r]=s)});else{var i=t.ajax;t.ajax=function(s){var r=("mode"in s?s:t.ajaxSettings).mode,n=("port"in s?s:t.ajaxSettings).port;return"abort"===r?(e[n]&&e[n].abort(),e[n]=i.apply(this,arguments),e[n]):i.apply(this,arguments)}}}(jQuery),function(t){t.extend(t.fn,{validateDelegate:function(e,i,s){return this.bind(i,function(i){var r=t(i.target);return r.is(e)?s.apply(r,arguments):void 0})}})}(jQuery);;
/*Source: src/main/webapp/resources/script/jquery.validate.extend.js*/
/**
 * validate extend
 * @author yuyangyang
 * Date: 14-6-19
 * Time: 涓婂崍11:36
 */


MIC_REGEXP = {
	LOGUSERNAME: /^[0-9a-zA-Z\-]{6,20}$/,
	PASSWORD: /^([^\u4E00-\u9FA5\s])*$/,
    EMAIL: /^[a-zA-Z0-9][\w\.\-]*@[a-zA-Z0-9][\w\.\-]*\.[a-zA-Z][a-zA-Z\.]*$/,
    COMNAME: /.*[^\u0000-\u00ff]+.*/,
    TELEPHONE: /^[0-9\-]+$/,
    NUMBER: /^[0-9]{1,4}$/,
    MOBILE: /^[0-9]{1,11}$/,
    PWDSTRENGTH: [new RegExp('\\d'), new RegExp('[a-z]'), new RegExp('[A-Z]')],
    YAHOOEMAIL: /(\S+@yahoo\.cn$)|(\S+@yahoo\.com\.cn$)/
}


$.validator.addMethod("mic.logusername", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.LOGUSERNAME.test(value);
});


$.validator.addMethod("mic.password", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.PASSWORD.test(value);
});


$.validator.addMethod("mic.email", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.EMAIL.test(value);
});


$.validator.addMethod("mic.comname", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.COMNAME.test(value);
});


$.validator.addMethod("mic.telephone", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.TELEPHONE.test(value);
});


$.validator.addMethod("mic.mobile", function (value, element, param) {
    return this.optional(element) || MIC_REGEXP.MOBILE.test(value);
});


$.validator.addMethod("mic.yahooemail", function (value, element, param) {
    if (this.optional(element)) {
        return true;
    } else {
        if (MIC_REGEXP.YAHOOEMAIL.test(value)) {
            return false;
        } else {
            return true;
        }
    }
});


$.validator.addMethod("https://s.cn.made-in-china.com/zst/script/jspf/mic.strict.pwd", function (value, element, param) {
    if (this.optional(element)) {
        return true;
    } else {

        var isContinue = true;
        if (/^[a-zA-Z\d]+$/.test(value)) {
            var charDisArr = [];
            for (var i = value.length - 1; i > 0; i--) {
                var charCode = value.charCodeAt(i);
                var prevCharCode = value.charCodeAt(i - 1);
                charDisArr.push(charCode - prevCharCode);
            }
            charDisArr = $.unique(charDisArr);
            if (charDisArr.length > 1 || (charDisArr[0] != 1 && charDisArr[0] != -1)) {
                isContinue = false;
            }
        } else {
            isContinue = false;
        }
        return !(isContinue || /^([a-zA-Z\d])\1+$/.test(value));
    }
});

$.validator.addMethod("mic.mobile.length", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }
    else {
        var countCode = $('[name=comTelephoneCountryCode]').val();
        if ('86' === countCode && 11 !== value.length) {
            return false;
        }
        else {
            return true;
        }
    }
});

$.validator.addMethod("https://s.cn.made-in-china.com/zst/script/jspf/mic.mobile.top", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }
    else {
        var countCode = $('[name=comTelephoneCountryCode]').val();
        if ('86' === countCode) {
            if ('13' === value.substring(0, 2)) {
                return true;
            }
            else if ('14' === value.substring(0, 2)) {
                return true;
            }
            else if ('15' === value.substring(0, 2)) {
                return true;
            }
            else if ('17' === value.substring(0, 2)) {
                return true;
            }
            else if ('18' === value.substring(0, 2)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
});

$.validator.addMethod("mic.mobile.other", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }
    else {
        var countCode = $('[name=comTelephoneCountryCode]').val();
        if ('886' === countCode && 10 !== value.length) {
            return false;
        }
        else if (('852' === countCode || '853' === countCode) && 8 !== value.length) {
            return false;
        }
        else {
            return true;
        }
    }
});
$.validator.addMethod("mic.tmmobile.length", function (value, element, param) {
	if (this.optional(element)) {
        return true;
    } else {
    	if( 11 !== value.length){
    		return false;
    	}else{
    		return true;
    	}
    }
});

$.validator.addMethod("https://s.cn.made-in-china.com/zst/script/jspf/mic.tmmobile.top", function (value, element, param) {
	if (this.optional(element)) {
        return true;
    } else {
		if('13' === value.substring(0,2)){
			return true;
		} else if ('14' === value.substring(0,2)){
			return true;
		} else if ('15' === value.substring(0,2)){
			return true;
		} else if ('17' === value.substring(0,2)){
			return true;
		} else if ('18' === value.substring(0,2)){
			return true;
		} else {
			return false;
		}
    }
});

$.validator.addMethod("mic.tmmobile.other", function (value, element, param) {
	if (this.optional(element)) {
        return true;
    } else {
    	var countCode = $('#tmComTelephoneCountryCode').val();
    	if('886' === countCode && 10 !== value.length){
    		return false;
    	} else if(('852' === countCode || '853' === countCode) && 8 !== value.length) {
    		return false;
    	} else {
    		return true;
    	}
    }
});;
/*Source: src/main/webapp/resources/script/top.js*/
/** 设置下拉搜索 **/
$(function() {


});
$(function () {

    $(".industry-h").hover(function () {
        $(this).addClass("industry-h-on");
    }, function () {
        $(this).removeClass("industry-h-on");
    });
    $('#InputWord1').each(function() {
        window.TextSuggest.initialize(this, $('#domain').attr('href')+'/suggest',"jsonp");
    });
});
function setDefaultValue(id, defaultValue) {
    document.getElementById(id).style.color = "#000000";
    if (document.getElementById(id).value == defaultValue) {
        document.getElementById(id).value = "";
    } else if (document.getElementById(id).value.replace(/^( )*|( )*$/ig, "") == "") {
        document.getElementById(id).style.color = "#999999";
        document.getElementById(id).value = defaultValue;
    }
}

function checkSearchForm() {
    if (null != document.getElementById("InputWord1")) {
        keyWord = document.getElementById("InputWord1").value.replace(/^( )*|( )*$/ig, "");
        if (keyWord == "" || keyWord == "请输入产品名称") {
            window.alert("请输入关键词");
            return false;
        } else {
            return true;
        }
    }
}

function searchAll(){
    var $form = $('#SearchForm1');
    $form.find('.js-disabled').each(function(){
        $(this).attr('disabled', false);
    });
    $('#SearchForm1').find('[name=userName]').attr('disabled', true);
    $('#SearchForm1').find('[name=showType]').attr('disabled', true);
    $form.attr("action", $('#domain').attr('href')+'/productdirectory.do');
    $form.submit();
}
function searchSelf(){
    var $form = $('#SearchForm1');
    $form.find('.js-disabled').each(function(){
        $(this).attr('disabled', true);
    });
    $('#SearchForm1').find('[name=userName]').attr('disabled', false);
    $('#SearchForm1').find('[name=showType]').attr('disabled', false);
   // $('#SearchForm1').find('[name=word]').val(encodeURIComponent($('#SearchForm1').find('[name=word]').val()));
    $form.attr("action", $('#domain').attr('href')+'/showroom/prodList.do');
    $form.submit();
};
/*Source: src/main/webapp/resources/script/nav.js*/

/** 设置下拉搜索 **/
$(function() {

    jQuery('#InputWord1').each(function() {
        window.TextSuggest.initialize(this, '${cmd.cnDomain}/suggest', "jsonp");
    });

  //2019-24版本新增需求，隐藏电话号码，增加查看联系方式按钮，统计按钮点击次数   
    var comId= $('#hidden_remote_user_info').data("comid");
    var reg = /http(s)?:\/\/\w+.cn.made-in-china.com\/$/;
    var url = location.href;
    var source = '';
	$('.js-view-tel-btn').on('click',function(){
        	$(this).hide();
        	$(this).closest('.js-parent').find('.js-view-tel').fadeIn();
        	var position = $(this).data("position");			
        	
        	if(url.indexOf('contact') >= 0){
        		source = "contact"
        	}else if(url.indexOf('gongying') >= 0){
        		source = "detail"
        	}else if(reg.test(url)){
        		source = "home"
        	}else{
        		source = "other"
        	}
        	$.get('https://cn.made-in-china.com/to_vo/static/bi/?type=zstCountViewContact',{source:source,comId:comId,position:position});
        	
    });
	
	//详情页与其它页面规则不一样
	$('.js-view-tel-btns').on('click',function(){
    	$(this).hide();
    	$('.js-paren').removeClass('filter-blur');
    	var positions = "page";
    	var sources = "detail";
    	$.get('https://cn.made-in-china.com/to_vo/static/bi/?type=zstCountViewContact',{source:sources,comId:comId,position:positions});
	});

	//产品大图页统计“查看联系方式”
	var bigPicViewContactCount = 1;
	$('.js-hover').on('hover',function(){
		var sources = "bigPic";
		if(bigPicViewContactCount == 1){
			$.get('https://cn.made-in-china.com/to_vo/static/bi/?type=zstCountViewContact',{source:sources,comId:comId});
		}
		bigPicViewContactCount++;
	});
	
});
$(function() {
    $(".industry-h").hover(function() {
        $(this).addClass("industry-h-on")
    }, function() {
        $(this).removeClass("industry-h-on")
    })
})
function setDefaultValue(id, defaultValue) {
    document.getElementById(id).style.color = "#000000";
    if (document.getElementById(id).value == defaultValue) {
        document.getElementById(id).value = "";
    } else if (document.getElementById(id).value.replace(/^( )*|( )*$/ig, "") == "") {
        document.getElementById(id).style.color = "#999999";
        document.getElementById(id).value = defaultValue;
    }
}

function checkSearchForm() {
    if (null != document.getElementById("InputWord1")) {
        keyWord = document.getElementById("InputWord1").value.replace(/^( )*|( )*$/ig, "");
        if (keyWord == "" || keyWord == "请输入产品名称") {
            window.alert("请输入关键词");
            return false;
        } else {
            return true;
        }
    }
}

function searchAll() {
    $('#SearchForm1').find('[name=subaction]').attr('disabled', false);
    $('#SearchForm1').find('[name=style]').attr('disabled', false);
    $('#SearchForm1').find('[name=mode]').attr('disabled', false);
    $('#SearchForm1').find('[name=code]').attr('disabled', false);
    $('#SearchForm1').find('[name=comProvince]').attr('disabled', false);
    $('#SearchForm1').find('[name=order]').attr('disabled', false);
    $('#SearchForm1').find('[name=userName]').attr('disabled', true);
    $('#SearchForm1').find('[name=showType]').attr('disabled', true);
    $('#SearchForm1').attr("action", $('#domain').attr('href') + '/productdirectory.do');
    $('#SearchForm1').submit();
}
function searchSelf() {
    $('#SearchForm1').find('[name=subaction]').attr('disabled', true);
    $('#SearchForm1').find('[name=style]').attr('disabled', true);
    $('#SearchForm1').find('[name=mode]').attr('disabled', true);
    $('#SearchForm1').find('[name=code]').attr('disabled', true);
    $('#SearchForm1').find('[name=comProvince]').attr('disabled', true);
    $('#SearchForm1').find('[name=order]').attr('disabled', true);
    $('#SearchForm1').find('[name=userName]').attr('disabled', false);
    $('#SearchForm1').find('[name=showType]').attr('disabled', false);
    $('#SearchForm1').attr("action", $('#domain').attr('href') + '/showroom/prodList.do');
    $('#SearchForm1').submit();
}