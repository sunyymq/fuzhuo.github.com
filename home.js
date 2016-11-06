var media_data = {
    "data": [
        {
            "title":"youku",
            "subtitle":"",
            "show": true,
            "index": 0,
            "img":`${baseURL}/icons/youku.png`
        },
        {
            "title":"Tumblr",
            "subtitle":"",
            "show": true,
            "index": 1,
            "img":`${baseURL}/icons/tumblr.png`
        },
        {
            "title":"lava",
            "subtitle":"",
            "show": true,
            "index": 2,
            "img":`${baseURL}/icons/lava.png`
        },
        {
            "title":"NetEaseMusic",
            "subtitle":"",
            "show": true,
            "index": 3,
            "img":`${baseURL}/icons/netease_music.png`
        },
        {
            "title":"Ximalaya",
            "subtitle":"功能基本可用",
            "show": true,
            "index": 4,
            "img":`${baseURL}/icons/ximalaya.png`
        },
        {
            "title":"Ero",
            "subtitle":"Don't Click",
            "show": false,
            "index": 5,
            "img":`${baseURL}/icons/ero.png`
        }
    ]
};

var currentHomeDoc;
var getHomeDoc = function(callback) {
    loadHomeHistory();
    var docText = `
        <document>
           <stackTemplate>
              <identityBanner>
        <banner>
        <title>LazyCat</title>
        </banner>
                  <row>
                      <buttonLockup onselect="showHide()">
                          <badge src="resource://button-rate" />
                          <title>切换项目</title>
                      </buttonLockup>
                  </row>
              </identityBanner>
              <collectionList>
                 <grid>
                    <section>`;
    for (var i in media_data['data']) {
        console.log("media_data["+i+"].show="+media_data['data'][i]['show']);
        if (media_data['data'][i]['show']==true) {
            docText += `
                       <lockup index="${media_data['data'][i]['index']}">
                          <img src="${media_data['data'][i]['img']}" width="400" height="240" />
                          <title>${media_data['data'][i]['title']}</title>
                          <subtitle>${media_data['data'][i]['subtitle']}</subtitle>
                       </lockup>`;
        }
    }
    docText += `
                    </section>
                 </grid>
              </collectionList>
           </stackTemplate>
        </document>`;
    console.log("getHomeDoc: "+docText);
    currentHomeDoc = (new DOMParser).parseFromString(docText, "application/xml");
    callback(currentHomeDoc);
}

function loadHomeHistory() {
    var history = localStorage.getItem('homehistory');
    console.log("load history:"+history);
    if (typeof history === 'undefined') {
        var data = {};
    } else {
        data = JSON.parse(history);
    }
    for (var i in media_data['data']) {
        var title = media_data['data'][i]['title'];
        //console.log("title: " + title + " show: " + data[title]);
        if (data[title]!=null) {
            if (data[title]==false) media_data['data'][i]['show']=false;
            else if (data[title]==true) media_data['data'][i]['show']=true;
        }
    }
}
function saveHomeHistory() {
    var string = localStorage.getItem('homehistory');
    if (typeof history === 'undefined') {
        var data = {};
    } else {
        data = JSON.parse(history);
    }
    for (var md of media_data['data']) {
        var title = md['title'];
        data[title] = md['show'];
    }
    console.log("save home history: " + JSON.stringify(data));
    localStorage.setItem('homehistory', JSON.stringify(data));
}

function switchItem(index) {
    console.log("switch Item at index: " + index);
    media_data['data'][index]['show'] = !media_data['data'][index]['show'];
    navigationDocument.removeDocument(getActiveDocument());
    saveHomeHistory();
    showHomePage();
}

function showHide() {
    var docText = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
            <alertTemplate>
                <title>请选择项目切换显示或隐藏</title>`;
    for (var i in media_data['data']) {
        if (media_data['data'][i]['show']) {
            docText += `
                <button onselect="switchItem(${i})">
                    <text>${media_data['data'][i]['title']}</text>
                    <badge src="resource://button-checkmark" style="margin:0 -20 0 20;" />
                </button>`;
        } else {
            docText += `
                <button onselect="switchItem(${i})">
                    <text>${media_data['data'][i]['title']}</text>
                </button>`;
        }
    }
    docText += `
            </alertTemplate>
        </document>`;
    console.log("docText:" + docText);
    var doc = (new DOMParser).parseFromString(docText, "application/xml");
    navigationDocument.pushDocument(doc);
}

var showHomePage = function() {
    getHomeDoc(function(doc) {
        doc.addEventListener("select", (event)=> {
            const target = event.target;
            const index = parseInt(target.getAttribute("index"));
            console.log("index: " + index);
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
            } else if (index == 5) {
                showEroHome(1, "", false);
            } else {
                return;
            }
        });
        navigationDocument.replaceDocument(doc, getActiveDocument());
    });
}
