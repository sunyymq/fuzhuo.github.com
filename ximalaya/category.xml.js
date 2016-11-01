function getCategoryDoc(categoryID, title, callback) {
    var url = `http://mobile.ximalaya.com/mobile/discovery/v3/category/recommends?categoryId=${categoryID}&contentType=album&device=iPhone&version=5.4.45`;
    getHTTP(url, function(content){
        var data = JSON.parse(content)['categoryContents']['list'];
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
        const list = data;
        for(var i in list) {
            docText += `
                     <shelf>
                        <header>
                            <title>${list[i]['title']}</title>
                        </header>
                        <section>`;
            for(var j in list[i]['list']) {
                var imgpath='undefined'
                if (list[i]['list'][j]['coverLarge']) imgpath = list[i]['list'][j]['coverLarge'];
                else if (list[i]['list'][j]['coverPath']) imgpath = list[i]['list'][j]['coverPath'];
                else if (list[i]['list'][j]['coverPathBig']) imgpath = list[i]['list'][j]['coverPathBig'];
                else imgpath = list[i]['list'][j]['coverPathSmall'];
                docText += `
                            <lockup onselect="showAlbum(${list[i]['list'][j]['albumId']})">
                                <img src="${imgpath}" width="350" height="350" />
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
            if (list[i]['hasMore']==true) {
                docText += `
                            <lockup onselect="showCategoryAlbums(${categoryID},'${list[i]['title']}')">
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

function showCategory(categoryID, title) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getCategoryDoc(categoryID, title, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
