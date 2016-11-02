function getSpecialDoc(specialId, callback) {
    var url=`http://mobile.ximalaya.com/m/subject_detail`;
    var postData=`id=${specialId}`;
    postHTTP(url, postData, function(content){
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
                    <title><![CDATA[${data['info']['title']}]]></title>
                  </banner>
                  <collectionList>
                    <grid>
                        <section>`;
        var list = data['list'];
        for(var i in list) {//the only value is specialId
            var imgpath=list[i]['albumCoverUrl290'];
            docText += `
                            <lockup onselect="showAlbum(${list[i]['albumId']})">
                                <img src="${imgpath}" width="350" height="350" />
                                <title><![CDATA[${list[i]['title']}]]></title>
                                <subtitle><![CDATA[${list[i]['intro']}]]></subtitle>`;
            if (list[i]['priceTypeId']!=0) {
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

function showSpecial(specialId) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getSpecialDoc(specialId, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
