const YOUKU_HOST="http://tv.api.3g.youku.com/";
const YOUKU_IDS="pid=0ce22bfd5ef5d2c5&guid=12d60728bd267e3e0b6ab4d124d6c5f0&ngdid=357e71ee78debf7340d29408b88c85c4&ver=2.6.0&operator=T-Mobile_310260&network=WIFI&launcher=0";
var mainDoc;

var channels = {
    "data":[
        {"title":"电影", "channel_id":96, "page":1},
        {"title":"电视剧", "channel_id":97, "page":1},
        {"title":"动漫", "channel_id":100, "page":1},
        {"title":"综艺", "channel_id":85, "page":1},
        {"title":"纪录片", "channel_id":84, "page":1},
        //{"title":"教育", "channel_id":87, "page":1},
        {"title":"历史", "channel_id":-1},
        {"title":"搜索", "channel_id":-1}
    ]
};

var getCategoryPageWithChannelID = function(index, callback) {
    let channel_id = channels['data'][index]['channel_id'];
    let page = channels['data'][index]['page'];
    let page_size = 58;
    var url = `${YOUKU_HOST}layout/smarttv/item_list?${YOUKU_IDS}&cid=${channel_id}&pz=${page_size}&pg=${page}&filter=`;
    console.log("url:"+url);
    getHTTP(url, function(content){
        //console.log("content:"+content);
        let data=JSON.parse(content);
        var docText = `
        <document>
           <stackTemplate>
              <banner>
                 <title><![CDATA[${channels['data'][index]['title']}]]></title>
              </banner>
              <collectionList>
                 <grid>
                    <section>`;
        for(var values of data['results']) {
            docText += `
                       <lockup onselect="showSeries('${values['showid']}')">
                          <img src="${values['show_vthumburl_hd']}" width="250" height="376" />
                          <title><![CDATA[${values['showname']}]]></title>`;
            if (values['paid']!=0) {
                docText += `
                          <overlay style="padding: 0">
                              <title style="background-color: rgba(0,0,0,0.6); color: #FFFFFF; text-align: center; width: 300">VIP</title>
                          </overlay>`;
            }
            docText += `
                       </lockup>`;
        }
        if (page>1) {
            docText += `
                        <lockup onselect="replacePageContent(${index},${page-1})">
                          <img src="http://fuzhuo.qiniudn.com/prev.png" width="250" height="376" />
                          <title>第${page-1}页</title>
                        </lockup>`;
        }
        if (page*page_size < parseInt(data['total'])) {
            docText += `
                        <lockup onselect="replacePageContent(${index},${page+1})">
                          <img src="http://fuzhuo.qiniudn.com/next.png" width="250" height="376" />
                          <title>第${page+1}页</title>
                        </lockup>`;
        }
        docText += `
                    </section>
                 </grid>
              </collectionList>
           </stackTemplate>
        </document>`;
        //console.log("docText:"+docText);
        callback((new DOMParser).parseFromString(docText, "application/xml"));
    });
}

var templateFuncs = [
    getCategoryPageWithChannelID,
    getCategoryPageWithChannelID,
    getCategoryPageWithChannelID,
    getCategoryPageWithChannelID,
    getCategoryPageWithChannelID,
    //getCategoryPageWithChannelID,
    history_func,
    search
];

function replacePageContent(index, page) {
    channels['data'][index]['page']=page;
    console.log("replacePageContent: index:"+index+",page:"+page);
    getCategoryPageWithChannelID(index, function(doc) {
            const Elem = mainDoc.getElementsByTagName("menuBar").item(0);
            const childs=Elem.childNodes;
            const menuEle = childs.item(index);
            const feature = menuEle.parentNode.getFeature("MenuBarDocument");
            feature.setDocument(doc, menuEle);
        });
}

var mainmenuUI = function() {
    var tmp = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <menuBarTemplate>
                <menuBar>`;
    let i=0;
    for(var d of channels['data']) {
        tmp+=`
                    <menuItem index="${i}">
                        <title>${d['title']}</title>
                    </menuItem>`;
        i++;
    }
    tmp +=`
                </menuBar>
            </menuBarTemplate>
        </document>`;
    console.log("mainmenu: "+tmp);
    return (new DOMParser).parseFromString(tmp, "application/xml");
}

function showMainMenu() {
    var loading = createLoadingDocument();
    navigationDocument.pushDocument(loading);
    mainDoc = mainmenuUI();
    const Elem = mainDoc.getElementsByTagName("menuBar").item(0);
    Elem.addEventListener("select", (event)=> {
            const target = event.target;
            const index = parseInt(target.getAttribute("index"));
            const ele = event.target.parentNode;
            const feature = ele.getFeature("MenuBarDocument");
            if (!feature.getDocument(event.target)) {
                var loadDoc = createLoadingDocument("加载中...");
                feature.setDocument(loadDoc, event.target);
                templateFuncs[index](index, function(doc, loading) {
                    feature.setDocument(doc, event.target);
                });
            }
        });
    navigationDocument.replaceDocument(mainDoc, loading);
}

function refreshHistory() {
    history_func(5, function(doc, loading) {
            const Elem = mainDoc.getElementsByTagName("menuItem").item(5);
        const feature = Elem.parentNode.getFeature("MenuBarDocument");
        feature.setDocument(doc, Elem);
    });
}
