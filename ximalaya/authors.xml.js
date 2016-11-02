function getAuthorsDoc(categoryID, title, callback) {
    var url=`http://mobile.ximalaya.com/mobile/discovery/v1/anchor/famous?category_id=${categoryID}&device=iPhone&page=1&per_page=20`;
    getHTTP(url, function(content){
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
        var list = data;
        for(var i in list) {
            var imgpath=list[i]['largeLogo'];
            var subtitle = list[i]['personDescribe'] || list[i]['verifyTitle'];
            docText += `
                            <lockup onselect="showAuthorDetail(${list[i]['uid']})">
                                <img src="${imgpath}" width="350" height="350" />
                                <title><![CDATA[${list[i]['nickname']}]]></title>
                                <subtitle><![CDATA[${subtitle}]]></subtitle>
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

function showAuthors(categoryID, title) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getAuthorsDoc(categoryID, title, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}

//show author detail and album
function getAuthorDetailDoc(uid, callback) {
    var author_detail_url = `http://mobile.ximalaya.com/mobile/v1/artist/intro?device=iPhone&toUid=${uid}`;
    var author_album_url = `http://mobile.ximalaya.com/mobile/v1/artist/albums?device=iPhone&pageId=1&pageSize=2&toUid=${uid}`;
    getHTTP(author_detail_url, function(detail_content){
        getHTTP(author_album_url, function(album_content){
            var detail_data = JSON.parse(detail_content);
            var album_data = JSON.parse(album_content);
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
                        <title><![CDATA[${detail_data['nickname']}]]></title>
                      </banner>
                      <collectionList>
                        <grid>
                            <section>`;
            var list = album_data['list'];
            for(var i in list) {
                var imgpath=list[i]['coverLarge'];
                var subtitle = list[i]['intro'];
                docText += `
                                <lockup onselect="showAlbum(${list[i]['albumId']})">
                                    <img src="${imgpath}" width="350" height="350" />
                                    <title><![CDATA[${list[i]['title']}]]></title>
                                    <subtitle><![CDATA[${subtitle}]]></subtitle>
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
    });
}

function showAuthorDetail(uid) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getAuthorDetailDoc(uid, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
