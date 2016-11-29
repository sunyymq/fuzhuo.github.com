var pptvSearch = function (index, callback) {
    var tmp = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
    <searchTemplate>
        <searchField>Search</searchField>
        <collectionList>
        </collectionList>
    </searchTemplate>
    </document>`;
    var doc = (new DOMParser).parseFromString(tmp, "application/xml");
    var searchField = doc.getElementsByTagName("searchField").item(0);
    var keyboard = searchField.getFeature("Keyboard");
    keyboard.onTextChange = function() {
        var searchText = keyboard.text;
        pptvUpdateSearch(doc, searchText);
    }
    pptvUpdateSearch(doc, "");
    doc.addEventListener("select", (event)=> {
                         const target = event.target;
                         const attr = target.getAttribute("type");
                         if (attr) {
                         const title = target.getElementsByTagName("title").item(0);
                         console.log("target:"+title.textContent);
                         pptvShowSearchResultsUI(title.textContent);
                         }
                         });
    callback(doc);
}

function pptvUpdateSearch(doc, keyword) {
    if (keyword.length > 0) {
        let url = `${YOUKU_HOST}openapi-wireless/keywords/suggest?${YOUKU_IDS}&keywords=${keyword}`;
        console.log("url: "+url);
        getHTTP(url, function(datastr){
            var data = JSON.parse(datastr);
            var dom = doc.implementation;
            var lsParser = dom.createLSParser(1, null);
            var lsInput = dom.createLSInput();
            var text = `
                <grid>
                    <header>
                        <title>请选择联想关键字</title>
                    </header>`;
                text += `
                    <section>`;
                text += `
                        <lockup type="lockup">
                            <img src="" width="300" height="45"/>
                            <overlay style="padding: 0">
                                <title style="background-color: rgba(0,0,0,0.6); color: #FFFFFF; text-align: center; width: 300">${keyword}</title>
                            </overlay>
                        </lockup>`;
                for (var value of data['results']) {
                text += `
                        <lockup type="lockup">
                            <img src="" width="300" height="45"/>
                            <overlay style="padding: 0">
                                <title style="background-color: rgba(0,0,0,0.6); color: #FFFFFF; text-align: center; width: 300">${value['keyword']}</title>
                            </overlay>
                        </lockup>`;
                }
                text += `
                    </section>`;
                text += `
                </grid>`;
                console.log("text: "+text);
            lsInput.stringData = text;
            lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
        });
    } else {
        let url = `${YOUKU_HOST}openapi-wireless/keywords/recommend?${YOUKU_IDS}`;
        console.log("url: "+url);
        getHTTP(url, function(datastr){
            var data = JSON.parse(datastr);
            var dom = doc.implementation;
            var lsParser = dom.createLSParser(1, null);
            var lsInput = dom.createLSInput();
            var text = `
                <grid>
                    <header>
                        <title>大家都在搜</title>
                    </header>`;
                text += `
                    <section>`;
                for (var value of data['results']) {
                text += `
                        <lockup type="lockup">
                            <img src="" width="300" height="45"/>
                            <overlay style="padding: 0">
                                <title style="background-color: rgba(0,0,0,0.6); color: #FFFFFF; text-align: center; width: 300">${value['title']}</title>
                            </overlay>
                        </lockup>`;
                }
                text += `
                    </section>`;
                text += `
                </grid>`;
                console.log("text: "+text);
            lsInput.stringData = text;
            lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
        });
    }
}

function pptvShowSearchResultsUI(text, pg=1, pz=20, replace=false) {
    var loading = createLoadingDocument('查询中...');
    if (replace) {
        navigationDocument.replaceDocument(loading, getActiveDocument());
    } else {
        navigationDocument.pushDocument(loading);
    }
    pptvShowSearchResults(text, pg, pz, function(doc){
        navigationDocument.replaceDocument(doc, loading);
    });
}

function pptvShowSearchResults(text, pg, pz, callback) {
    pptvSearchWithKeyWords(text, function(results) {
        var docText = `
        <document>
           <stackTemplate>
              <banner>
                <title>『${text}』搜索结果</title>
              </banner>
              <collectionList>
                 <grid>
                    <section>`;
        for(var value of results) {
            docText+= `
                       <lockup onselect="showPPTVSeries('${value['href']}')">
                          <img src="${value['img']}" width="250" height="376" />
                          <title><![CDATA[${value['title']}]]></title>
                       </lockup>`;
        }
        docText += `
                   </section>
                 </grid>
              </collectionList>
           </stackTemplate>
        </document>`;
        console.log("docText: "+docText);
        var doc = new DOMParser().parseFromString(docText, "application/xml");
        callback(doc);
    });
}

function pptvSearchWithKeyWords(keyword, callback) {
    const url = `http://search.pptv.com/s_video?kw=${encodeURI(keyword)}`;
    getHTTP(url, function(content) {
        var result = [];
        let i=0;
        var lines = content.split('\n');
        for (line of lines) {
            var match = line.match(/<a target="_blank" href="(.*)" external_url="(.*)" title="(.*)"><img src="(.*)" alt="(.*)" \/><span class="v-bg"><\/span>/);
            if (match) {
                const href = match[1];
                const title = match[3];
                const img = match[4];
                //console.log("line: " + line);
                //console.log("title: " + title + " href: " + href + " img: " + img);
                result[i++] = {
                    'title': title,
                    'href': href,
                    'img': img
                };
            }
        }
        return callback(result);
    });
}
