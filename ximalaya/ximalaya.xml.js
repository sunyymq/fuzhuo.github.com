var ximalayaTabNames;

var getXimalayaMainMenuDoc = function(callback) {
    var url = `http://mobile.ximalaya.com/mobile/discovery/v2/tabs?device=iPhone&version=5.4.45`;
    getHTTP(url, function(content) {
        console.log("content:" + content);
        var data = JSON.parse(content)['tabs']['list'];
        ximalayaTabNames = data;
        var docText = `<?xml version="1.0" encoding="UTF-8" ?>
            <document>
                <menuBarTemplate>
                    <menuBar>`;
        for(var key in data) {
            if (key==0) continue;
            docText +=`
                        <menuItem index="${key}">
                            <title>${data[key]['title']}</title>
                        </menuItem>`;
        }
        docText +=`
                    </menuBar>
                </menuBarTemplate>
            </document>`;
        console.log("docText: " + docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var ximalayaRecommend = function(title, callback) {
    const url = `http://mobile.ximalaya.com/mobile/discovery/v2/recommend/hotAndGuess?code=43_310000_3100&device=iPhone&version=5.4.45`;
    getHTTP(url, function(content) {
        var data = JSON.parse(content);
        var docText = `<?xml version="1.0" encoding="UTF-8" ?>
            <document>
              <head>
                <style>
                .overlay_title {
                    background-color: rgba(0,0,0,0.6);
                    color: #FFFFFF;
                    text-align: center;
                }
                .overlay {
                    padding: 0;
                }
                </style>
              </head>
               <stackTemplate>
                  <banner>
                    <title><![CDATA[${title}]]></title>
                  </banner>
                  <collectionList>`;
        const list = data['hotRecommends']['list'];
        for(var i in list) {
            docText += `
                     <shelf>
                        <header>
                            <title>${list[i]['title']}</title>
                        </header>
                        <section>`;
            for(var j in list[i]['list']) {
                docText += `
                            <lockup onselect="showAlbum('${list[i]['list'][j]['albumId']}')">
                                <img src="${list[i]['list'][j]['coverLarge']}" width="350" height="350" />
                                <title><![CDATA[${list[i]['list'][j]['title']}]]></title>`;
                if (list[i]['list'][j]['isPaid']) {
                    docText += `
                                  <overlay class="overlay">
                                      <title class="overlay_title">付费</title>
                                  </overlay>`;
                }
                docText += `
                            </lockup>`;
            }
            if (list[i]['hasMore']) {
                docText += `
                            <lockup onselect="showCategory(${list[i]['categoryId']},'${list[i]['title']}')">
                                <img src="" width="350" height="350" />
                                <title>更多..</title>
                            </lockup>`;
            }
            docText += `
                        </section>
                     </shelf>`;
        }
        docText += `
                  </collectionList>
               </stackTemplate>
            </document>`;
        console.log("docText: "+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var ximalayaCategories = function(title, callback) {
    const url = `http://mobile.ximalaya.com/mobile/discovery/v2/categories?channel=ios-b1&code=43_310000_3100&device=iPhone&picVersion=13&scale=2&version=5.4.45`;
    getHTTP(url, function(content) {
        var data = JSON.parse(content)['list'];
        var docText = `<?xml version="1.0" encoding="UTF-8" ?>
            <document>
              <head>
                <style>
                .overlay_title {
                    background-color: rgba(0,0,0,0.6);
                    color: #FFFFFF;
                    text-align: center;
                }
                .overlay {
                    padding: 0;
                }
                </style>
              </head>
               <stackTemplate>
                  <banner>
                  <title><![CDATA[${title}]]></title>
                  </banner>
                  <collectionList>
                     <grid>
                        <section>`;
        for (var key in data) {
            if (key==0) continue;
            docText += `
                           <lockup onselect="showCategory(${data[key]['id']},'${data[key]['title']}')">
                             <img src="${data[key]['coverPath']}" width="178" height="178" />
                             <title><![CDATA[${data[key]['title']}]]></title>
                           </lockup>`;
        }
        docText += `
                         </section>
                     </grid>
                  </collectionList>
               </stackTemplate>
            </document>`;
        console.log("docText: "+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var ximalayaRankingList = function(title, callback) {
    var url = `http://mobile.ximalaya.com/mobile/discovery/v2/rankingList/group?channel=ios-b1&device=iPhone&includeActivity=true&includeSpecial=true&scale=2&version=5.4.45`;
    getHTTP(url, function(content) {
        var list = JSON.parse(content)['datas'][0]['list'];
        var docText = `<?xml version="1.0" encoding="UTF-8" ?>
            <document>
              <head>
                <style>
                .overlay_title {
                    background-color: rgba(0,0,0,0.6);
                    color: #FFFFFF;
                    text-align: center;
                }
                .overlay {
                    padding: 0;
                }
                </style>
              </head>
               <stackTemplate>
                  <banner>
                  <title><![CDATA[${title}]]></title>
                  </banner>
                  <collectionList>
                     <grid>
                        <section>`;
        for (var key in list) {
            const rankingListId = list[key]['rankingListId'];
            docText += `
                           <lockup onselect="showRankingList(${rankingListId},0)">
                             <img src="${list[key]['coverPath']}" width="228" height="228" />
                             <title><![CDATA[${list[key]['title']}]]></title>
                             <subtitle><![CDATA[${list[key]['subtitle']}]]></subtitle>
                           </lockup>`;
        }
        docText += `
                         </section>
                     </grid>
                  </collectionList>
               </stackTemplate>
            </document>`;
        console.log("docText: "+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var ximalayaAuthors = function(title, callback) {
    const url = `http://mobile.ximalaya.com/mobile/discovery/v1/anchor/recommend?device=iPhone&version=5.4.45`;
    getHTTP(url, function(content) {
        var data = JSON.parse(content);
        var docText = `<?xml version="1.0" encoding="UTF-8" ?>
            <document>
              <head>
                <style>
                .overlay_title {
                    background-color: rgba(0,0,0,0.6);
                    color: #FFFFFF;
                    text-align: center;
                }
                .overlay {
                    padding: 0;
                }
                </style>
              </head>
               <stackTemplate>
                  <banner>
                    <title><![CDATA[${title}]]></title>
                  </banner>
                  <collectionList>`;
        var list = data['famous'];
        for(var i in list) {
            docText += `
                     <shelf>
                        <header>
                            <title>${list[i]['title']}</title>
                        </header>
                        <section>`;
            for(var j in list[i]['list']) {
                docText += `
                            <lockup onselect="showAuthorDetail(${list[i]['list'][j]['uid']})">
                                <img src="${list[i]['list'][j]['largeLogo']}" width="198" height="198" />
                                <title><![CDATA[${list[i]['list'][j]['nickname']}]]></title>
                                <subtitle><![CDATA[${list[i]['list'][j]['verifyTitle']}]]></subtitle>
                            </lockup>`;
            }
            docText += `
                            <lockup onselect="showAuthors(${list[i]['id']},'${list[i]['title']}')">
                                <img src="" width="200" height="200" />
                                <title>更多..</title>
                            </lockup>`;
            docText += `
                        </section>
                     </shelf>`;
        }
        var list = data['normal'];
        for(var i in list) {
            docText += `
                     <shelf>
                        <header>
                            <title>${list[i]['title']}</title>
                        </header>
                        <section>`;
            for(var j in list[i]['list']) {
                docText += `
                            <lockup onselect="showAuthorDetail(${list[i]['list'][j]['uid']})">
                                <img src="${list[i]['list'][j]['largeLogo']}" width="198" height="198" />
                                <title><![CDATA[${list[i]['list'][j]['nickname']}]]></title>
                                <subtitle><![CDATA[${list[i]['list'][j]['personDescribe']}]]></subtitle>
                            </lockup>`;
            }
                docText += `
                            <lockup onselect="showAuthors(${list[i]['id']},'${list[i]['title']}')">
                                <img src="" width="200" height="200" />
                                <title>更多..</title>
                            </lockup>`;
            docText += `
                        </section>
                     </shelf>`;
        }
        docText += `
                  </collectionList>
               </stackTemplate>
            </document>`;
        console.log("docText: "+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var ximalayaPageFuncs = [
    null,
    ximalayaRecommend,
    ximalayaCategories,
    ximalayaRankingList,
    ximalayaAuthors,
    null
];

var showXimalayaMainMenuDoc = function() {
    var loading = createLoadingDocument();
    navigationDocument.pushDocument(loading);
    getXimalayaMainMenuDoc(function(doc) {
        const Elem = doc.getElementsByTagName("menuBar").item(0);
        Elem.addEventListener("select", (event)=> {
            const target = event.target;
            const index = parseInt(target.getAttribute("index"));
            const ele = event.target.parentNode;
            const feature = ele.getFeature("MenuBarDocument");
            if (!feature.getDocument(event.target)) {
                var loadDoc = createLoadingDocument("加载中...");
                feature.setDocument(loadDoc, event.target);
                ximalayaPageFuncs[index](ximalayaTabNames[index]['title'], function(doc) {
                    feature.setDocument(doc, event.target);
                });
            }
        });
        navigationDocument.replaceDocument(doc, loading);
    });
}
