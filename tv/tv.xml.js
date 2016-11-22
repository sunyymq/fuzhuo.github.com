var data;
function getTVHomeDoc(callback) {
    var url = baseURL+'tv/tvos_m3u8.json';
    getHTTP(url, function(c){
        console.log("m3u8: " + c);
        data = JSON.parse(c)['content'];
        var docText = `
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
                    margin: 0;
                }
                </style>
              </head>
               <catalogTemplate>
                  <banner>
                     <title>TV源</title>
                  </banner>
                  <list>
                     <section>`;
        let i=0;
        for(var value of data) {
            docText += `
                        <listItemLockup>
                           <title><![CDATA[${value['category']}]]></title>
                           <decorationLabel>${value['content'].length}</decorationLabel>
                           <relatedContent>
                              <grid>
                                 <section>`;
            let j=0;
            for(var channel of value['content']) {
                docText += `
                                    <lockup onselect="playTVM3U8(${i},${j})">
                                        <img src="" width="300" height="34" />
                                        <overlay class="overlay">
                                            <title class="overlay_title">${channel['name']}</title>
                                        </overlay>
                                    </lockup>`;
                j++;
            }
            docText += `
                                 </section>
                              </grid>
                           </relatedContent>
                        </listItemLockup>`;
            i++;
        }
        docText += `
                     </section>
                  </list>
               </catalogTemplate>
            </document>`;
        console.log("doc: "+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

function showTVHome(replace=0) {
    const loadingDocument = createLoadingDocument("TV加载中..");
    if (replace) {
        navigationDocument.replaceDocument(loadingDocument, getActiveDocument());
    } else {
        navigationDocument.pushDocument(loadingDocument);
    }
    getTVHomeDoc(function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}

function playTVM3U8(i,j) {
    console.log("i:"+i+",j:"+j);
    var url = data[i]['content'][j]['m3u8'];
    console.log("play url:" + url);
    var media = new MediaItem('video', url);
    var videoList = new Playlist();
    videoList.push(media);
    player.playlist = videoList;
    player.play();
}
