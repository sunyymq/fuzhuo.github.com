function getSubjectDoc(categoryId, title, callback) {
    var url=`http://mobile.ximalaya.com/mobile/discovery/v2/category/subjects?categoryId=${categoryId}&device=iPhone&page=1&per_page=20&scale=3`;
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
        for(var i in list) {//the only value is specialId
            var imgpath=list[i]['coverPathBig'];
            docText += `
                            <lockup onselect="showSpecial(${list[i]['specialId']})">
                                <img src="${imgpath}" width="350" height="350" />
                                <title><![CDATA[${list[i]['title']}]]></title>
                                <subtitle><![CDATA[${list[i]['subtitle']}]]></subtitle>`;
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

function showSubject(categoryId, title) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getSubjectDoc(categoryId, title, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
