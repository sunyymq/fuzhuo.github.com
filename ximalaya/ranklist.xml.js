function getRankingListDoc(rankingListId, subCategoryId, callback) {
    var url;
    if (subCategoryId !=0) {
        url=`http://mobile.ximalaya.com/mobile/discovery/v3/rankingList/track?device=iPhone&pageId=1&pageSize=20&rankingListId=${rankingListId}&scale=3&target=main&version=5.4.45`;
    } else {
        url=`http://mobile.ximalaya.com/mobile/discovery/v3/rankingList/track?device=iPhone&pageId=1&pageSize=20&rankingListId=${rankingListId}&subCategoryId=${subCategoryId}&scale=3&target=main&version=5.4.45`;
    }
    getHTTP(url, function(content){
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
                    <title><![CDATA[${data['title']}]]></title>
                  </banner>
                  <collectionList>
                    <grid>
                        <section>`;
        var list = data['list'];
        for(var i in list) {
            var imgpath=list[i]['coverSmall'];
            docText += `
                            <lockup onselect="showAlbum(${list[i]['albumId']})">
                                <img src="${imgpath}" width="350" height="350" />
                                <title><![CDATA[${list[i]['title']}]]></title>`;
            if (list[i]['isPaid']) {
                docText += `
                                  <overlay class="overlay">
                                      <title class="overlay_title">付费</title>
                                  </overlay>`;
            }
                docText += `
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

function showRankingList(rankingListId, subCategoryId) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getRankingListDoc(rankingListId, subCategoryId, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
