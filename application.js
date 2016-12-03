/*
 * zfu github.com/fuzhuo
 * https://fuzhuo.me
 */
//The global player for lava and netease music
var player = new Player();
player.addEventListener('stateDidChange', function(listener, extraInfo) {
    if (listener.state == 'end' || listener.state == 'paused') {
        console.log("Enable auto sleep");
        JSB.enableAutoSleep();
    } else {
        console.log("disable auto sleep");
        JSB.disableAutoSleep();
    }
},{});

var baseURL;
var currentVersion;

App.onLaunch = function(options) {
    var l = options.location;
    baseURL = l.substr(0,l.lastIndexOf('/')+1);
    appStart(baseURL);
}

var lan = Settings.language;
function appStart(baseURL) {
    console.log("Base URL is " + baseURL);
    const scripts = [
        "home",
        "youku4tvos/search",
        "youku4tvos/history",
        "youku4tvos/mainmenu",
        "youku4tvos/series",
        "youku4tvos/player",
        "TumblrBrowser/post.xml",
        "TumblrBrowser/tumblr.xml",
        "lava/home.xml",
        "lava/channel.xml",
        "netease_music_tvos/main_page.xml",
        "netease_music_tvos/music_list.xml",
        "ximalaya/ximalaya.xml",
        "ximalaya/category.xml",
        "ximalaya/category_albums.xml",
        "ximalaya/subject.xml",
        "ximalaya/speciallist.xml",
        "ximalaya/ranklist.xml",
        "ximalaya/authors.xml",
        "ximalaya/album.xml",
        "tv/tv.xml",
        "pptv/pptvSearch.xml",
        "pptv/pptvHome.xml",
        "ero/home.xml"
    ].map(
        moduleName => `${baseURL}${moduleName}.js`
    );
    getHTTP('version.json', function(data){
        let j = JSON.parse(data);
        currentVersion = j['version'];
        console.log("current version: " + currentVersion);
    });

    const loadingDocument = createLoadingDocument((lan=='en')?"Loading...":"加载中..");
    navigationDocument.pushDocument(loadingDocument);

    for (let a of scripts) {
        console.log("scripts[]:"+a);
    }
    evaluateScripts(scripts, function(scriptsAreLoaded) {
        if (scriptsAreLoaded) {
            console.log("scripts are loaded");
            showHomePage();
        } else {
            const alertDocument = createEvalErrorAlertDocument();
            navigationDocument.replaceDocument(alertDocument, loadingDocument);
            throw new EvalError("TVML application.js unable to evaluate scripts");
        }
    });
}

App.onWillEnterForeground = function() {
    console.log("app will enter foreground");
    getHTTP('version.json', function(data){
        const j = JSON.parse(data);
        const version = j['version'];
        if (version != currentVersion) {
            const msg = j['message'];
            console.log("find new version " + version + " current version: " + currentVersion);
            console.log("What's new: " + msg);
            const docText = `<?xml version="1.0" encoding="UTF-8" ?>
                <document>
                   <alertTemplate>
                      <title>有可用更新</title>
                      <description>从${currentVersion}更新至${version},更新日志:${msg}</description>
                      <button onselect="updateVersion()">
                         <text>点击更新并重载</text>
                      </button>
                   </alertTemplate>
                </document>`;
            var doc = (new DOMParser).parseFromString(docText, "application/xml");
            navigationDocument.pushDocument(doc);
        } else {
            console.log("version on server is: " + version);
        }
    });
}

function updateVersion() {
    console.log("update version");
    navigationDocument.clear();
    appStart(`${baseURL}`);
}

function getHTTP(url_, callback) {
    var url = url_;
    if (url.match(/^http/) == null) {
        url = `${baseURL}${url_}`;
    }
    console.log("getHTTP:"+url);
    var templateXHR = new XMLHttpRequest();
    templateXHR.responseType = "document";
    templateXHR.timeout = 10000;
    templateXHR.addEventListener("load", function() {
        callback(templateXHR.responseText);
    }, false);
    templateXHR.addEventListener("timeout", function() {
        const alertDocument = createAlertDocument("请求超时", `<![CDATA[未能成功拉取:${url}]]>`);
        navigationDocument.pushDocument(alertDocument);
    }, false);
    templateXHR.addEventListener("error", function(e) {
        const alertDocument = createAlertDocument("请求错误", `<![CDATA[未能成功拉取:${url}]]>`);
        navigationDocument.pushDocument(alertDocument);
    }, false);
    templateXHR.open("GET", url, true);
    templateXHR.send();
}

function postHTTP(url, postData, callback) {
    var templateXHR = new XMLHttpRequest();
    console.log("getHTTP:"+url);
    templateXHR.responseType = "document";
    templateXHR.timeout = 10000;
    templateXHR.addEventListener("load", function() {
        callback(templateXHR.responseText);
    }, false);
    templateXHR.addEventListener("timeout", function() {
        const alertDocument = createAlertDocument("请求超时", `<![CDATA[未能成功拉取:${url}]]>`);
        navigationDocument.pushDocument(alertDocument);
    }, false);
    templateXHR.addEventListener("error", function(e) {
        const alertDocument = createAlertDocument("请求错误", `<![CDATA[未能成功拉取:${url}]]>`);
        navigationDocument.pushDocument(alertDocument);
    }, false);
    templateXHR.open("POST", url, true);
    templateXHR.send(postData);
}

/**
 * Convenience function to create a TVML loading document with a specified title.
 */
function createLoadingDocument(title) {
    // If no title has been specified, fall back to "Loading...".
    title = title || "LazyCat加载中...";

    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <loadingTemplate>
                <activityIndicator>
                    <title>${title}</title>
                </activityIndicator>
            </loadingTemplate>
        </document>
    `;
    return new DOMParser().parseFromString(template, "application/xml");
}

/**
 * Convenience function to create a TVML alert document with a title and description.
 */
function createAlertDocument(title, description) {
    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <alertTemplate>
                <title>${title}</title>
                <description>${description}</description>
            </alertTemplate>
        </document>
    `;
    return new DOMParser().parseFromString(template, "application/xml");
}

/**
 * Convenience function to create a TVML alert document with a title and description.
 */
function createDescriptiveAlertDocument(title, description) {
    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <descriptiveAlertTemplate>
                <title>${title}</title>
                <description>${description}</description>
            </descriptiveAlertTemplate>
        </document>
    `;
    return new DOMParser().parseFromString(template, "application/xml");
}

/**
 * Convenience function to create a TVML alert for failed evaluateScripts.
 */
function createEvalErrorAlertDocument() {
    const title = "Evaluate Scripts Error";
    const description = [
        "There was an error attempting to evaluate the external JavaScript files.",
        "Please check your network connection and try again later."
    ].join("\n\n");
    return createAlertDocument(title, description);
}

/**
 * Convenience function to create a TVML alert for a failed XMLHttpRequest.
 */
function createLoadErrorAlertDocument(url, xhr) {
    const title = (xhr.status) ? `Fetch Error ${xhr.status}` : "Fetch Error";
    const description = `Could not load document:\n${url}\n(${xhr.statusText})`;
    return createAlertDocument(title, description);
}

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

function time2str(time) {
    var a = parseInt(time);
    var h = parseInt(a/60/60);
    a-=h*60*60;
    var m = parseInt(a/60);
    a-=m*60;
    var s = a;
    if (h>0) return ''+padLeft(h,2)+":"+padLeft(m,2)+":"+padLeft(s,2);
    else return ''+padLeft(m,2)+":"+padLeft(s,2);
}

function printDoc(doc) {
    console.log(new XMLSerializer().serializeToString(doc));
}
