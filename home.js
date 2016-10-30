var medias = `{
    "data": [
        {
            "title":"youku",
            "img":"${baseURL}/icons/youku.png"
        },
        {
            "title":"Tumblr",
            "img":"${baseURL}/icons/tumblr.png"
        },
        {
            "title":"lava",
            "img":"${baseURL}/icons/lava.png"
        },
        {
            "title":"NetEaseMusic",
            "img":"${baseURL}/icons/netease_music.png"
        },
        {
            "title":"Ximalaya",
            "img":"${baseURL}/icons/netease_music.png"
        }
    ]
}`;

var getHomeDoc = function(callback) {
    console.log("medias: "+medias);
    var media_data = JSON.parse(medias);
    var docText = `
        <document>
           <stackTemplate>
              <banner>
                 <title>LazyCat</title>
              </banner>
              <collectionList>
                 <grid>
                    <section>`;
    for (let i=0; i<media_data['data'].length; i++) {
        docText += `
                       <lockup index="${i}">
                          <img src="${media_data['data'][i]['img']}" width="400" height="240" />
                          <title>${media_data['data'][i]['title']}</title>
                       </lockup>`;
    }
    docText += `
                    </section>
                 </grid>
              </collectionList>
           </stackTemplate>
        </document>`;
    console.log("getHomeDoc: "+docText);
    callback((new DOMParser).parseFromString(docText, "application/xml"));
}

var showHomePage = function() {
    getHomeDoc(function(doc) {
        doc.addEventListener("select", (event)=> {
            const target = event.target;
            const index = parseInt(target.getAttribute("index"));
            console.log("index: " + index);
            var loading = createLoadingDocument();
            navigationDocument.pushDocument(loading);
            if (index==0) {
                showMainMenu();
            } else if (index == 1) {
                showTumblrMainPage();
            } else if (index == 2) {
                showLavaHome();
            } else if (index == 3) {
                showNetEaseMusicMainPage();
            } else if (index == 4) {
                showXimalayaMainMenuDoc();
            }
        });
        navigationDocument.replaceDocument(doc, getActiveDocument());
    });
}
