function changeCategory(ccd) {
    var eroCategory = [
        {"title":"All", "ccd":""},
        {"title":"Hentai", "ccd":"eroanime"},
        {"title":"Big", "ccd":"kyonyu"},
        {"title":"Amateur", "ccd":"shirouto"},
        {"title":"MILF", "ccd":"hitozuma"},
        {"title":"Pretty", "ccd":"bisyojo"},
        {"title":"Office", "ccd":"ol"},
        {"title":"Uniforms", "ccd":"seihuku"},
        {"title":"Voyeur", "ccd":"tousatsu"},
        {"title":"Molester", "ccd":"chikan"},
        {"title":"Outdoor", "ccd":"roshutsu"},
        {"title":"Fetish", "ccd":"fechi"},
        {"title":"SM", "ccd":"sm"},
        {"title":"Scat", "ccd":"sukatoro"},
        {"title":"Rough", "ccd":"baiorensu"},
        {"title":"Lesbian", "ccd":"rezu"},
        {"title":"Gay", "ccd":"gei"},
        {"title":"Gros", "ccd":"guro"},
        {"title":"Western", "ccd":"youmono"},
        {"title":"Gal", "ccd":"gal"},
        {"title":"Interesting", "ccd":"omoshirokei"},
        {"title":"Happening", "ccd":"hapuningukei"},
        {"title":"Gonzo", "ccd":"jigadori"},
        {"title":"Blow", "ccd":"fellatio"},
        {"title":"Groupsex", "ccd":"ran"},
        {"title":"Idol", "ccd":"Idol"},
        {"title":"filming", "ccd":"hame"},
        {"title":"anal", "ccd":"ana"},
        {"title":"cumshot", "ccd":"bukkake"},
        {"title":"cream", "ccd":"naka"},
        {"title":"adult", "ccd":"douga"},
        {"title":"female", "ccd":"chijo"},
        {"title":"webcam", "ccd":"webcam"}];
    var docText = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
            <alertTemplate>
                <title>请选择分类</title>`;
    for (var i in eroCategory) {
        if (eroCategory[i]['ccd']==ccd) {
            docText += `
                <button>
                    <text>${eroCategory[i]['title']}</text>
                    <badge src="resource://button-checkmark" style="margin:0 -20 0 20;" />
                </button>`;
        } else {
            docText += `
                <button onselect="showEroHome(1, '${eroCategory[i]['ccd']}', true)">
                    <text>${eroCategory[i]['title']}</text>
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

function getEroHomeDoc(page, ccd, callback) {
    var url;
    if (ccd.length ==0) url=`http://ero-video.net/?page=${page}`;
    else url=`http://ero-video.net/?page=${page}&ccd=${ccd}`;
    console.log("getHTTP: " + url);
    var referer='http://ero-video.net';
    var userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1';
    var content = JSB.httpGet(url, referer, userAgent, '');
    var url_strs=content.match(/class="photo" href="(.*)" moviecode="(.*)"/g)
    var photo_strs=content.match(/<img src="(.*200x148.*)" alt="(.*)">/g);
    console.log("total url: " + url_strs.length + "total url: " + photo_strs.length);
    if (url_strs.length != photo_strs.length) {
        console.log("total not match, something wrong");
        return;
    }
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
              <identityBanner>
                  <title><![CDATA[ero-video.net]]></title>
                  <row>`;
    if (page > 1) {
        docText += `
                      <buttonLockup onselect="showEroHome(${page-1}, '${ccd}')">
                          <badge src="resource://button-rate" />
                          <title>第${page-1}页</title>
                      </buttonLockup>`;
    }
    docText += `
                      <buttonLockup onselect="showEroHome(${page+1}, '${ccd}')">
                          <badge src="resource://button-rate" />
                          <title>第${page+1}页</title>
                      </buttonLockup>
                      <buttonLockup onselect="changeCategory('${ccd}')">
                      <badge src="resource://button-more" />
                          <title>选择分类</title>
                      </buttonLockup>`;
    docText += `
                  </row>
              </identityBanner>
              <collectionList>
                <grid>
                    <section>`;
    for (var i in url_strs) {
        var url_result = url_strs[i].match(/class="photo" href="(.*)" moviecode="(.*)"/);
        var url = url_result[1];
        var photo_result = photo_strs[i].match(/<img src="(.*200x148.*)" alt="(.*)">/);
        var img = photo_result[1];
        var title = photo_result[2];
        console.log("url: "+url + " ,title: "+title + " ,img: " + img);
        docText += `
                        <lockup onselect="playEroVideo('${url}')">
                            <img src="${img}" width="350" height="350" />
                            <title><![CDATA[${title}]]></title>
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
}

function showEroHome(page, ccd="", replace=false) {
    const loadingDocument = createLoadingDocument("ero加载中..");
    if (replace) {
        navigationDocument.replaceDocument(loadingDocument, getActiveDocument());
    } else {
        navigationDocument.pushDocument(loadingDocument);
    }
    getEroHomeDoc(page, ccd, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}

function playEroVideo(url) {
    const loadingDocument = createLoadingDocument("尝试解码中..");
    navigationDocument.pushDocument(loadingDocument);
    console.log("playEroVideo: " + url);
    var referer='http://ero-video.net'
    var userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1';
    var content = JSB.httpGet(url, referer, userAgent, '');
    var result = content.match(/NMA.video.url = '(.*)';/);
    if (result == null) {
        var alertdoc = createAlertDocument('抱歉', '此视频未能抓到播放链接');
        navigationDocument.replaceDocument(alertdoc, loadingDocument);
        return;
    }
    var m3u8 = result[1];
    console.log("m3u8: " + m3u8);
    var media = new MediaItem('video', m3u8);
    var videoList = new Playlist();
    videoList.push(media);
    player.playlist = videoList;
    player.play();
    setTimeout(function(){
        console.log("timeout remove loadDoc");
        navigationDocument.removeDocument(loadingDocument);
    }, 1000);
}
