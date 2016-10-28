var search = function (index, callback) {
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
        updateSearch(doc, searchText);
    }
    updateSearch(doc, "");
    doc.addEventListener("select", (event)=> {
                         const target = event.target;
                         const attr = target.getAttribute("type");
                         if (attr) {
                         const title = target.getElementsByTagName("title").item(0);
                         console.log("target:"+title.textContent);
                         showSearchResultsUI(title.textContent);
                         }
                         });
    callback(doc);
}

function updateSearch(doc, keyword) {
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

function showSearchResultsUI(text, pg=1, pz=20, replace=false) {
    var loading = createLoadingDocument('查询中...');
    if (replace) {
        navigationDocument.replaceDocument(loading, getActiveDocument());
    } else {
        navigationDocument.pushDocument(loading);
    }
    showSearchResults(text, pg, pz, function(doc){
        navigationDocument.replaceDocument(doc, loading);
    });
}

function showSearchResults(text, pg, pz, callback) {
    var url = `${YOUKU_HOST}layout/smarttv/showsearch?copyright_status=1&video_type=1&keyword=${encodeURI(text)}&${YOUKU_IDS}`;
    var video_url = `${YOUKU_HOST}openapi-wireless/videos/search/${encodeURI(text)}?${YOUKU_IDS}&pg=${pg}&pz=${pz}`;
    console.log("series url: "+url);
    console.log("video url: "+video_url);
    getHTTP(url, function(datastr){
        getHTTP(video_url, function(videostr){
        console.log("docText:"+datastr);
        const data = JSON.parse(datastr);
        const video_data = JSON.parse(videostr);
        var docText = `
        <document>
           <stackTemplate>
              <banner>
                <title>『${text}』搜索结果</title>
              </banner>
              <collectionList>`;
        if (pg==1 && data['results'].length > 0) {
        docText += `
              <separator style="margin: 40 0 20">
                 <title>剧集</title>
              </separator>`;
        docText+= `
                 <grid>
                    <section>`;
            for( var value of data['results']) {
        docText+= `
                       <lockup onselect="showSeries('${value['showid']}')">
                          <img src="${value['show_vthumburl_hd']}" width="250" height="376" />
                          <title><![CDATA[${value['showname']}]]></title>
                       </lockup>`;
            }
        docText += `
                    </section>
                 </grid>`;
        }
        let total = video_data['total'];
        docText += `
              <separator style="margin: 40 0 20">
                <title>视频(共${total}个结果)</title>
              </separator>`;
        docText+= `
                 <grid>
                    <section>`;
        let idx = 0;
        for( var value of video_data['results']) {
        docText+= `
                       <lockup idx="${idx}">
                          <img src="${value['img']}" width="250" height="376" />
                          <title><![CDATA[${value['title']}]]></title>
                       </lockup>`;
            idx++;
        }
        if (total>0 && pg>1) {
        docText+= `
                       <lockup idx="-2">
                          <img src="http://fuzhuo.qiniudn.com/prev.png" width="250" height="376" />
                          <title>上一页</title>
                       </lockup>`;
        }
        if (total>0 && pg*pz<total) {
        docText+= `
                       <lockup idx="-1">
                          <img src="http://fuzhuo.qiniudn.com/next.png" width="250" height="376" />
                          <title>下一页</title>
                       </lockup>`;
        }
        docText += `
                    </section>
                 </grid>`;
        docText += `
              </collectionList>
           </stackTemplate>
        </document>`;
        console.log("docText: "+docText);
        var doc = (new DOMParser).parseFromString(docText, "application/xml")
        doc.addEventListener("select", (event)=> {
                             const target = event.target;
                             const idx = target.getAttribute("idx");
                             if (idx >=0) {
                             playSearchVideo(video_data, idx);
                             } else if (idx == -2) {
                             showSearchResultsUI(text, pg-1, 20, true);
                             } else if (idx == -1) {
                             showSearchResultsUI(text, pg+1, 20, true);
                             }
                             });
        callback(doc);
    })
    });
}

function playSearchVideo(data, index) {
    var video_id = data['results'][index]['videoid'];
    console.log("playsearch video: "+index+" ,videoid:"+video_id);
    var loadDoc = createLoadingDocument("尝试解码链接中...");
    navigationDocument.pushDocument(loadDoc);
    getM3U8ByVid(video_id, function(m3u8) {
        console.log("play by local..");
        playSearchVideoWithM3U8(data, index, m3u8);
        setTimeout(function(){
            console.log("timeout remove loadDoc");
            navigationDocument.removeDocument(loadDoc);
        }, 800);
    });
}

function playSearchVideoWithM3U8(data, index, m3u8) {
    console.log("request m3u8 by url: " + m3u8);
    var vid = data['results'][index]['videoid'];
    var video = new MediaItem('video', m3u8);
    var progress_str = sessionStorage.getItem("progress");
    if (typeof progress_str === 'undefined' || progress_str == "undefined") {
        progressData = {};
    } else {
        var progressData = JSON.parse(progress_str);
        if (progressData && progressData[vid]) {
            video.resumeTime = progressData[vid];
        }
    }
    video.artworkImageURL = data['results'][index]['img'];
    video.title = data['results'][index]['title'];
    var videoList = new Playlist();
    videoList.push(video);
    var myPlayer = new Player();
    myPlayer.playlist = videoList;
    myPlayer.addEventListener('timeDidChange', function(listener,extraInfo) {
                              progressData[vid] = listener.time;
                              },{interval: 1});
    myPlayer.addEventListener('stateDidChange', function(listener, extraInfo) {
                              console.log("progress: "+JSON.stringify(progressData));
                              if (listener.state == 'end') {
                                  console.log('Play end');
                                  sessionStorage.setItem("progress", JSON.stringify(progressData));
                              } else if (listener.state == 'paused') {
                                  console.log('Play paused, update history time');
                                  sessionStorage.setItem("progress", JSON.stringify(progressData));
                              }
    },{});
    myPlayer.play();
}
