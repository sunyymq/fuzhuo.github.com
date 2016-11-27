var pptvMainDoc;

var pptvChannels = {
    "data":[
        {"title":"电影", "type":1, "page":1},
        {"title":"电视剧", "type":2, "page":1},
        {"title":"动漫", "type":3, "page":1},
        {"title":"综艺", "type":4, "page":1},
        {"title":"VIP", "type":75099, "page":1},
        {"title":"音乐", "type":75199, "page":1},
        {"title":"纪实", "type":210548, "page":1}
    ]
};

var pptvSeriesResults;
var pptvSeriesUrl;

var pptvGetCategoryPageWithChannelID = function(index, callback) {
    let type = pptvChannels['data'][index]['type'];
    let page = pptvChannels['data'][index]['page'];
    if (type == 75099) {
        var url = `http://list.pptv.com/channel_list.html?page=${page}&type=${type}&sort=1`;
    } else {
        var url = `http://list.pptv.com/channel_list.html?page=${page}&type=${type}&sort=6`;
    }
    console.log("url:"+url);
    getHTTP(url, function(content){
        //console.log("content:"+content);
        var lines = content.split('\n');
        let idx=-1;
        var results = [];
        for (let i=0; i<lines.length; i++) {
            var link = lines[i].match(/<a class="ui-list-ct".* href=['"](.*)['"].*target=['"](.*)['"].*title="(.*)">/);
            if (link) {
                idx++;
                results[idx]={};
                results[idx]['href'] = link[1];
                results[idx]['title'] = link[3];
            }
            var imgs = lines[i].match(/<img src="(.*)" data-src2="(.*)">/);
            var stats = lines[i].match(/<span class="msk-txt">(.*)<\/span>/);
            if (imgs) {
                results[idx]['img'] = imgs[2];
            }
            if (stats) {
                results[idx]['stats'] = stats[1];
            }
            var vip = lines[i].match(/class="cover ico_4 cf"/);
            if (vip) {
                results[idx]['vip'] = 1;
            }
        }
        //console.log("results:"+JSON.stringify(results));
        var docText = `
        <document>
           <stackTemplate>
              <banner>
                 <title><![CDATA[${pptvChannels['data'][index]['title']}]]></title>
              </banner>
              <collectionList>
                 <grid>
                    <section>`;
        for(var values of results) {
            docText += `
                       <lockup onselect="showPPTVSeries('${values['href']}')">
                          <img src="${values['img']}" width="250" height="376" />
                          <title><![CDATA[${values['title']}]]></title>`;
            if (values['stats']) {
                docText += `
                          <overlay style="padding: 0">
                              <title style="background-color: rgba(0,0,0,0.6); color: #FFFFFF; text-align: center; width: 300">${values['stats']}</title>
                          </overlay>`;
            }
            if (values['vip'] && values['vip']==1) {
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
                        <lockup onselect="pptvReplacePageContent(${index},${page-1})">
                          <img src="http://fuzhuo.qiniudn.com/prev.png" width="250" height="376" />
                          <title>第${page-1}页</title>
                        </lockup>`;
        }
        docText += `
            <lockup onselect="pptvReplacePageContent(${index},${page+1})">
            <img src="http://fuzhuo.qiniudn.com/next.png" width="250" height="376" />
            <title>第${page+1}页</title>
            </lockup>`;
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

var pptvTemplateFuncs = [
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    pptvGetCategoryPageWithChannelID,
    history_func,
    search
];

function pptvReplacePageContent(index, page) {
    pptvChannels['data'][index]['page']=page;
    console.log("pptvReplacePageContent: index:"+index+",page:"+page);
    pptvGetCategoryPageWithChannelID(index, function(doc) {
            const Elem = pptvMainDoc.getElementsByTagName("menuBar").item(0);
            const childs=Elem.childNodes;
            const menuEle = childs.item(index);
            const feature = menuEle.parentNode.getFeature("MenuBarDocument");
            feature.setDocument(doc, menuEle);
        });
}

var pptvMainMenuUI = function() {
    var tmp = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <menuBarTemplate>
                <menuBar>`;
    let i=0;
    for(var d of pptvChannels['data']) {
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

function showPPTVMainMenu() {
    var loading = createLoadingDocument();
    navigationDocument.pushDocument(loading);
    pptvMainDoc = pptvMainMenuUI();
    const Elem = pptvMainDoc.getElementsByTagName("menuBar").item(0);
    Elem.addEventListener("select", (event)=> {
            const target = event.target;
            const index = parseInt(target.getAttribute("index"));
            const ele = event.target.parentNode;
            const feature = ele.getFeature("MenuBarDocument");
            if (!feature.getDocument(event.target)) {
                var loadDoc = createLoadingDocument("加载中...");
                feature.setDocument(loadDoc, event.target);
                pptvTemplateFuncs[index](index, function(doc, loading) {
                    feature.setDocument(doc, event.target);
                });
            }
        });
    navigationDocument.replaceDocument(pptvMainDoc, loading);
}

function pptvRefreshHistory() {
    history_func(5, function(doc, loading) {
        const Elem = pptvMainDoc.getElementsByTagName("menuItem").item(5);
        const feature = Elem.parentNode.getFeature("MenuBarDocument");
        feature.setDocument(doc, Elem);
    });
}

function getPPTVSeriesDoc(url, callback) {
    console.log('url:'+url);
    var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1';
    var content=JSB.httpGet(url, "", userAgent, '');
    pptvSeriesUrl = url;
    console.log('script: ' + content.match(/webcfg =(.*)<\/script>/)[1]);
    var j=JSON.parse(content.match(/webcfg =(.*)<\/script>/)[1]);
    if (j==null || j['errorCode']==1) {
        let alertDoc = createAlertDocument("错误", "页面不包含剧集数据解析失败,目前偶尔部分视频会这样..");
        callback(alertDoc);
        return;
    }
    var results = {};
    results['data']=[];
    if (j) {
        //first find intro index
        let intro_index = -1;
        for (var i in j['result']['modules']) {
            if (j['result']['modules'][i]['tid']=='t_m_intro') {
                intro_index=i;
                break;
            }
        }
        console.log("intro_index: " + intro_index);
        if (intro_index == -1) {
            let alertDoc = createAlertDocument("错误", "页面不完整..");
            callback(alertDoc);
            return;
        }
        results['cat_id']=j['result']['web_config']['cat_id'];
        results['title'] = j['result']['web_config']['title'];
        results['icon'] = j['result']['web_config']['icon'];
        results['director'] = j['result']['modules'][intro_index]['data']['dlist'][0]['title'];
        results['actors'] = j['result']['modules'][intro_index]['data']['dlist'][1]['title'];
        results['type'] = j['result']['modules'][intro_index]['data']['dlist'][2]['title'];
        results['area'] = j['result']['modules'][intro_index]['data']['dlist'][3]['title'];
        results['year'] = j['result']['modules'][intro_index]['data']['dlist'][4]['title'];
        results['desc'] = j['result']['modules'][intro_index]['data']['dlist'][5]['title'];
        results['vip']=0;
        if (j['result']['web_config']['cat_id']==1) {//电影
            results['cid'] = j['result']['web_config']['cid'];
            results['pid'] = j['result']['web_config']['pid'];
        } else if (j['result']['web_config']['cat_id']==75099) {
            results['cid'] = j['result']['web_config']['cid'];
            results['pid'] = j['result']['web_config']['pid'];
            results['vip']=1;
        }
        var num_list_index = -1;
        for (var i in j['result']['modules']) {
            if (j['result']['modules'][i]['tid'] == 't_epi_num_list'
                || j['result']['modules'][i]['tid'] == 't_set_date_list') {
                num_list_index = i;
                break;
            }
        }
        if (num_list_index != -1 && j['result']['modules'][num_list_index]['data']['dlist']
        && j['result']['modules'][num_list_index]['data']['dlist'].length > 0) {
            let idx = 0;
            for (var data of j['result']['modules'][num_list_index]['data']['dlist']) {
                results['data'][idx]={};
                results['data'][idx]['title'] = data['title'];
                results['data'][idx]['id'] = data['id'];
                results['data'][idx]['img'] = data['img'];
                results['data'][idx]['link'] = data['link'];
                results['data'][idx]['pv'] = data['pv'];
                idx++;
            }
        }
    }
    pptvSeriesResults = results;
    console.log(JSON.stringify(results));

    var docText= `
        <document>
        <productTemplate>
        <background>
        </background>
        <banner>
        <infoList>
        <info>
        <header>
        <title>导演</title>
        </header>
            <text><![CDATA[${results['director']}]]></text>
        </info>
        <info>
        <header>
        <title>主演</title>
            </header>
                <text>${results['actors']}</text>
        </info>
        </infoList>
        <stack>
        <title><![CDATA[${results['title']}]]></title>
        <row>
        <text><![CDATA[${results['year']}]]></text>
        <text>${results['type']}</text>
        <badge src="resource://cc" class="badge" />
        </row>
        <description handlesOverflow="true" allowsZooming="true" moreLabel="更多"><![CDATA[${results['desc']}]]></description>
        <row>
        <buttonLockup index="-1">
        <badge src="resource://button-preview" />
        </buttonLockup>`;
    docText += `
        </row>
        </stack>
        <heroImg src="${results['icon']}" />
        </banner>
        <shelf>
        <header>
        <title>${results['title']}</title>
        </header>
        <section>`;
    if (results['data'].length > 0) {
        let i=0;
        for(var value of results['data']) {
            docText +=`
                <lockup index="${i}">
                    <img src="${value['img']}" width="150" height="226" />
                    <title><![CDATA[${value['title']}]]></title>
                </lockup>`;
            i++;
        }
    } else {
        docText +=`
                <lockup index="${results['pid']}">
                    <img src="${results['icon']}" width="150" height="226" />
                    <title><![CDATA[${results['title']}]]></title>
                </lockup>`;
    }
    docText +=`
        </section>
        </shelf>
        </productTemplate>
        </document>`;
    console.log("content:"+docText);
    callback((new DOMParser).parseFromString(docText, "application/xml"));
}

function showPPTVSeries(url) {
    var loadDoc = createLoadingDocument("加载信息中...");
    navigationDocument.pushDocument(loadDoc);
    getPPTVSeriesDoc(url, function(doc) {
        navigationDocument.replaceDocument(doc, loadDoc);
        doc.addEventListener("select", (event)=> {
            var target = event.target;
            if (target.tagName === 'description') {
                const body = target.textContent;
                const alertDocument = createDescriptiveAlertDocument('', body);
                navigationDocument.presentModal(alertDocument);
                return;
            }
            const index = parseInt(target.getAttribute("index"));
            console.log("select index:"+index);
            if (index >= 0) {
                playPPTVWithRid(index);
            }
        });
    });
}

function playPPTVWithRid(index) {
    var loadDoc = createLoadingDocument("加载信息中...");
    navigationDocument.pushDocument(loadDoc);
    var url;
    if (pptvSeriesResults['data'] && pptvSeriesResults['data'].length > 0) {
        url = pptvSeriesResults['data'][index]['link'];
    } else {
        url = pptvSeriesUrl;
    }
    if (pptvSeriesResults['vip']==0 && pptvSeriesResults['cat_id']!=1) {
        var rid = pptvSeriesResults['data'][index]['id'];
        getPPTVM3U8FromRid(rid, function(data) {
            console.log("play: " + data['m3u8']);
            console.log("resolution: " + data['width'] + 'x' + data['height']);
            var media = new MediaItem('video', data['m3u8']);
            media.artworkImageURL = pptvSeriesResults['data'][index]['img'];
            media.description = pptvSeriesResults['data']['desc'];
            media.title = pptvSeriesResults['data']['title'];
            var videoList = new Playlist();
            videoList.push(media);
            player.playlist = videoList;
            player.play();
            setTimeout(function(){
                console.log("timeout remove loadDoc");
                navigationDocument.removeDocument(loadDoc);
            }, 1000);
        });
    } else {
        getPPTVM3U8FromUrl_VIP(url, function(m3u8) {
            var media = new MediaItem('video', m3u8);
            media.artworkImageURL = pptvSeriesResults['data']['icon'];
            media.description = pptvSeriesResults['data']['desc'];
            media.title = pptvSeriesResults['data']['title'];
            var videoList = new Playlist();
            videoList.push(media);
            player.playlist = videoList;
            player.play();
            setTimeout(function(){
                console.log("timeout remove loadDoc");
                navigationDocument.removeDocument(loadDoc);
            }, 1000);
        });
    }
}

function getPPTVM3U8FromRid(rids, callback) {
    var url = `http://play.api.pptv.com/boxplay.api?auth=d410fafad87e7bbf6c6dd62434345818&userLevel=1&content=need_drag&id=${rids}&platform=android3&param=userType%3D1&k_ver=1.1.0.7932&sv=3.6.1&ver=1&type=phone.android&gslbversion=2&cb=json`;
    console.log('url:'+url);
    var time = (new Date()).getTime().toString().substr(0, 10);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.addEventListener("load", function (event) {
        var jdata = /\(([\s\S]*?)\)\;/.exec(xhr.responseText);
        jdata = "info=" + jdata[1];
        jdata = jdata.replace(/mp4/g, "m3u8");
        jdata = jdata.replace(/%26/g, "&");
        eval(jdata);
        var sources = [];
        let sourceIDX = 0;
        var vlen = info.childNodes.length;
        for (var node of info.childNodes) {
            if (node.tagName === "channel") {
                for (var stream of node.childNodes) {
                    if (stream.tagName === "file" || stream.tagName === "stream") {
                        var len = stream.childNodes.length;
                        var Z = stream.childNodes;
                        console.log("le: " + len);
                        for (var v of Z) {
                            //console.log("---------------------------------------------");
                            //console.log("v.width: " + v.width);
                            //console.log("v.height: " + v.height);
                            //console.log("v.ft: " + v.ft);
                            //console.log("v.rid: " + v.rid);
                            //console.log("v.vip: " + v.vip);
                            for (var n of info.childNodes) {
                                if (n.tagName == "dt" && n.ft == v.ft) {
                                    var key = n.childNodes[5].childNodes;
                                    var ip4 = n.childNodes[0].childNodes;
                                    var ip4bp = n.childNodes[4].childNodes;
                                    var url = "http://" + ip4 + "/" + v.rid + "?type=phone.android&k="+key;
                                    var urlbp = "http://" + ip4bp + "/" + v.rid + "?type=phone.android&k="+key;
                                    //console.log("v.key: " + key);
                                    //console.log("v.ip4: " + ip4);
                                    //console.log("v.ip4bp: " + ip4bp);
                                    //console.log("v.url: " + url);
                                    //console.log("v.urlbp: " + urlbp);
                                    sources[sourceIDX]={
                                        "width": v.width,
                                        "height": v.height,
                                        "ft": v.ft,
                                        "vip": v.vip,
                                        "rid": v.rid,
                                        "m3u8": url,
                                        "m3u8_bp": urlbp
                                    };
                                    sourceIDX++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (sources.length == 1) callback(sources[0]);
        else if (sources.length == 2) callback(sources[1]);
        else if (sources.length >= 3) callback(sources[2]);
    }, false);
    xhr.send("null");
}

function getPPTVM3U8FromUrl_VIP(fullurl, callback) {
    var url1 = "http://www.xiguaso.com/api/yun.php?url="+fullurl;
    console.log("get m3u8 from: " + url1);
    var xhr111 = new XMLHttpRequest();
    xhr111.open("GET", url1, true);
    xhr111.addEventListener("load", function (event) {
        var data = /url": "([\s\S]*?)\"/.exec(xhr111.responseText);
        data = data[1].replace("\\\/","/");
        var newurl = "http://www.xiguaso.com/api/api.php?url="+data+"&hd=4";
        var xhr222 = new XMLHttpRequest();
        xhr222.open("GET", newurl, true);
        xhr222.addEventListener("load", function (event) {
            var ipadurl = /CDATA\[([\s\S]*?)\]/.exec(xhr222.responseText); ipadurl = ipadurl[1];
            var m3u8url = ipadurl.replace("mp4","m3u8");var m3u8url = m3u8url.replace("\/w\/","/");
            console.log("ipad url: " + ipadurl);
            console.log("m3u8 url: " + m3u8url);
            callback(ipadurl);
        }, false);
        xhr222.send(null);
    }, false);
    xhr111.send(null);
}
