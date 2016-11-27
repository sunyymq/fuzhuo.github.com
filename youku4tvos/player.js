function playByDataIndex(detail_data, series_data, index) {
    const seriesID = detail_data['showid'];
    const complete = detail_data['completed'];
    var video_id="";
    if (index==-1 || index==-2) {
        let history_str = localStorage.getItem('history');
        var data = null;
        if (typeof history_str === 'undefined') {
            data = {};
        } else {
            data = JSON.parse(history_str);
        }
        var i=0;
        var find=0;
        console.log("complete: "+complete);
        for(var d of series_data) {
            if (data[seriesID] == null) break;
            if (d['videoid'] == data[seriesID]['vid']) {
                console.log("history find at: " + i);
                if (complete) {
                    if(index==-2) index=i+1;
                    else index=i;
                } else {
                    if (index==-2) index=i-1;
                    else index=i;
                }
                find=1;
                break;
            }
            i++;
        }
        if (find==0) {
            if (complete) {
                if (index==-1) index=0;
                else index=1;
            } else {
                if (index==-1) index=series_data.length-1;
                else index=series_data.length-2;
            }
        }
    }
    console.log("final index: "+index);
    if (index<0 || index>series_data.length-1) {
        console.log("该集不存在");
        if (!complete) var text = "下一集并不存在，请等待更新";
        else var text = "下一集不存在，你已看完该剧大结局";
        var alertDoc = createAlertDocument("呃呃", text);
        navigationDocument.pushDocument(alertDoc);
        return;
    }
    var video_id = series_data[index]['videoid'];
    if (detail_data['cats']=='电影') video_id=detail_data['videoid'];
    console.log("play sid:"+seriesID+",vid:"+video_id);
    var loadDoc = createLoadingDocument("尝试解码链接中...");
    navigationDocument.pushDocument(loadDoc);
    if (detail_data['paid']) {
        getYouKuM3U8FromUrl_VIP(`http://v.youku.com/v_show/id_${video_id}.html`, function(m3u8) {
            youku_play(detail_data, series_data, index, m3u8);
            setTimeout(function(){
                console.log("timeout remove loadDoc");
                navigationDocument.removeDocument(loadDoc);
            }, 1000);
        });
    } else {
        getM3U8ByVid(video_id, function(m3u8) {
            console.log("play by local..");
            youku_play(detail_data, series_data, index, m3u8);
            setTimeout(function(){
                console.log("timeout remove loadDoc");
                navigationDocument.removeDocument(loadDoc);
            }, 1000);
        });
    }
}

function youku_play(detail_data, series_data, index, m3u8_url) {
    console.log("play m3u8: "+m3u8_url);
    var video = new MediaItem('video', m3u8_url);
    video.artworkImageURL = series_data[index]['img'];
    video.description = detail_data['desc'];
    video.title = detail_data['title'];
    if (detail_data['cats']=='电影') video.subtitle = series_data[index]['title'];
    else video.subtitle = detail_data['title'];

    var video_id = series_data[index]['videoid'];
    if (detail_data['cats']=='电影') video_id=detail_data['videoid'];
    var progress_str = localStorage.getItem("progress");
    if (typeof progress_str === 'undefined' || progress_str == "undefined") {
        progressData = {};
    } else {
        var progressData = JSON.parse(progress_str);
        if (progressData && progressData[video_id]) {
            video.resumeTime = progressData[video_id];
        }
    }
    var videoList = new Playlist();
    videoList.push(video);
    var myPlayer = new Player();
    myPlayer.playlist = videoList;
    myPlayer.addEventListener('timeDidChange', function(listener,extraInfo) {
                              //console.log('time did changed: interval:'+listener.interval+' time:'+listener.time+' timeStamp:'+listener.timeStamp+' type:'+listener.type);
                              progressData[video_id] = listener.time;
                              },{interval: 1});

    myPlayer.addEventListener('stateDidChange', function(listener, extraInfo) {
                              //console.log("stateDidChange: state:"+listener.state+", oldState:"+listener.oldState+", timeStamp:"+listener.timeStamp);
                              //console.log("progress: "+JSON.stringify(progressData));
                              if (listener.state == 'end') {
                                  console.log('Play end');
                                  localStorage.setItem("progress", JSON.stringify(progressData));
                                  updateHistory(detail_data, series_data, index, m3u8_url);
                              } else if (listener.state == 'paused') {
                                  console.log('Play paused, update history time');
                                  localStorage.setItem("progress", JSON.stringify(progressData));
                                  updateHistory(detail_data, series_data, index, m3u8_url);
                              }
    },{});
    myPlayer.play();
}

function updateHistory(detail_data, series_data, index, m3u8_url) {
    console.log("update History");
    if (seriesDoc) {
        let ele = seriesDoc.getElementById("history_text");
        let continue_title = seriesDoc.getElementById("continue_play");
        continue_title.textContent = "继续播放";
        let title = ele.getElementsByTagName("text").item(0);
        if (detail_data['cats']!='电影') {
            title.textContent = `上次看到『${series_data[index]['title']}』`;
            var video_id = series_data[index]['videoid'];
        } else {
            title.textContent = `上次看到『${detail_data['title']}』`;
            var video_id = detail_data['videoid'];
        }
        var progress = null;
        var progress_str = localStorage.getItem('progress');
        if (typeof progress_str === 'undefined' || progress_str=='undefined') {
            progress = null;
        } else {
            progress = JSON.parse(progress_str);
        }
        var progress_title = "未观看";
        if (progress && progress[video_id]) {
            progress_title = time2str(progress[video_id]);
            let subtitles = seriesDoc.getElementsByTagName("subtitle");
            if (detail_data['cats']=='电影') {
                subtitles.item(0).textContent = progress_title;
            } else {
                //subtitles.item(index).textContent = progress_title;
            }
        }
    }
    let history_str = localStorage.getItem('history');
    var data = null;
    if (typeof history_str === 'undefined') {
        data = {};
    } else {
        data = JSON.parse(history_str);
    }
    const seriesID = detail_data['showid'];
    if (data[seriesID]) {
        delete data[seriesID];
    }
    data[seriesID] = {};
    data[seriesID]['vid'] = video_id;
    data[seriesID]['img'] = detail_data['img'];
    if (detail_data['cats']!='电影') {
        data[seriesID]['title'] = series_data[index]['title'];
    } else {
        data[seriesID]['title'] = detail_data['title'];
    }
    data[seriesID]['series'] = detail_data['title'];
    console.log("history: "+JSON.stringify(data));
    localStorage.setItem('history', JSON.stringify(data));
    refreshHistory();
}

function getM3U8ByVid(vid, callback) {
    console.log("vid:"+vid);
    var time = (new Date()).getTime().toString().substr(0,10);
    console.log("time:"+time);
    var playurl = "http://play.youku.com/play/get.json?vid=" + vid +"&ct=12";
    var show_url = "http://openapi.youku.com/v2/videos/show.json?video_id=" + vid + "&client_id=5a0c663f5e98bc74";
    console.log("playurl: " + playurl);
    console.log("show_url: " + show_url);
    var xmlhttp_show = new XMLHttpRequest();
    xmlhttp_show.open("GET", show_url, true);
    xmlhttp_show.addEventListener("load", function(event) {
        var cmd = "stream=" + xmlhttp_show.responseText;
        eval(cmd);
        var type = stream.streamtypes;
        var t=type[type.length-1];
        console.log("type:"+type);
        if (t=='hd') t='mp4';
        console.log("auto choose type:"+t);
        /*
        var xmlhttp_play = new XMLHttpRequest();
        xmlhttp_play.open("GET", playurl, true);
        xmlhttp_play.addEventListener("load", function(event) {
            cmd = "infoss="+xmlhttp_play.responseText;
        */
        /*
        cmd = "infoss="+JSB.httpGet(playurl, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36','http://static.youku.com', '__ysuid='+((new Date()).getTime()/1000).toString().substr(0,13));
            eval(cmd);
            if (!infoss || !infoss.data || !infoss.data.security
                || !infoss.data.security.ip || !infoss.data.security.encrypt_string) {
                    const alertDoc = createAlertDocument("错误", "获取信息不完整，请重试");
                    navigationDocument.replaceDocument(alertDoc, getActiveDocument());
                    return;
            }
            const oip = infoss.data.security.ip;
            const ep = infoss.data.security.encrypt_string;
            const from = "online";
            console.log("oip: "+oip+" ,ep: "+ep);
            cmd = "info=" + ssencode(vid, ep, oip, from);
            console.log(cmd);
            eval(cmd);
            var murl = "http://pl.youku.com/playlist/m3u8?vid=" + vid + "&keyframe=1&ts=" + time + "&type=" + t + "&ep="+info.fff + "&oip=" + oip + "&ctype=12&ev=1&token="+info.token+"&sid="+info.sid;
        */
            var murl = "http://ilools.sinaapp.com/youkufull.php?vid=" + vid + "&qua=" + t;
            console.log(murl);
            callback(murl);
        /*
        }, false);
        xmlhttp_play.setRequestHeader('refer', 'http://play.youku.com');
        xmlhttp_play.send(null);
        */
    }, false);
    xmlhttp_show.send(null);
}
function ssencode(vid, ep, oip, from) {
    //alert(data.location);
    if (from === "youkulive") {
        var euserCachea1 = "u";
        var euserCachea2 = "0";
        var bmka3 = "fteo";
        var bmka4 = "ze4l";
        var ddd = "4em";
        var eee = "mal";
        var cook = "-0";
    } else if (from === "acfun") {
        var euserCachea1 = "v";
        var euserCachea2 = "b";
        var bmka3 = "1z4i";
        var bmka4 = "86rv";
        var ddd = "ogb"
        var eee = "ail";
        var cook = "";
    } else {
        var euserCachea1 = "4";
        var euserCachea2 = "1";
        var bmka3 = "b4et";
        var bmka4 = "boa4";
        var ddd = "o0b"
        var eee = "poz";
        var cook = "";
    }
    var E = function(a, c) {
        for (var b = [], f = 0, i, e = "", h = 0; 256 > h; h++)
            b[h] = h;
        for (h = 0; 256 > h; h++)
            f = (f + b[h] + a.charCodeAt(h % a.length)) % 256, i = b[h], b[h] = b[f], b[f] = i;
        for (var q = f = h = 0; q < c.length; q++)
            h = (h + 1) % 256, f = (f + b[h]) % 256, i = b[h], b[h] = b[f], b[f] = i, e += String.fromCharCode(c.charCodeAt(q) ^ b[(b[h] + b[f]) % 256]);
        return e
    };
    var F = function(a, c) {
        for (var b = [], f = 0; f < a.length; f++) {
            for (var i = 0, i = "a" <= a[f] && "z" >= a[f] ? a[f].charCodeAt(0) - 97 : a[f] - 0 + 26, e = 0; 36 > e; e++)
                if (c[e] == i) {
                    i = e;
                    break
                }
            b[f] = 25 < i ? i - 26 : String.fromCharCode(i + 97)
        }
        return b.join("")
    };
    var D = function(a) {
        if (!a)
            return "";
        var a = a.toString(),
            b, d, f, e, g, h;
        f = a.length;
        d = 0;
        for (b = ""; d < f;) {
            e = a.charCodeAt(d++) & 255;
            if (d == f) {
                b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
                b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4);
                b += "==";
                break
            }
            g = a.charCodeAt(d++);
            if (d == f) {
                b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
                b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4 | (g & 240) >> 4);
                b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((g &
                    15) << 2);
                b += "=";
                break
            }
            h = a.charCodeAt(d++);
            b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
            b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4 | (g & 240) >> 4);
            b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((g & 15) << 2 | (h & 192) >> 6);
            b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h & 63)
        }
        return b
    };
    function decode64(t) {
        if (!t)
            return "";
        t = t.toString();
        var e,
            n,
            i,
            r,
            o,
            a,
            s,
            u = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
        for (a = t.length, o = 0, s = ""; a > o;) {
            do e = u[255 & t.charCodeAt(o++)];
            while (a > o && -1 == e);
            if (-1 == e)
                break;
            do n = u[255 & t.charCodeAt(o++)];
            while (a > o && -1 == n);
            if (-1 == n)
                break;
            s += String.fromCharCode(e << 2 | (48 & n) >> 4);
            do {
                if (i = 255 & t.charCodeAt(o++), 61 == i)
                    return s;
                i = u[i]
            } while (a > o && -1 == i);
            if (-1 == i)
                break;
            s += String.fromCharCode((15 & n) << 4 | (60 & i) >> 2);
            do {
                if (r = 255 & t.charCodeAt(o++), 61 == r)
                    return s;
                r = u[r]
            } while (a > o && -1 == r);
            if (-1 == r)
                break;
            s += String.fromCharCode((3 & i) << 6 | r)
        }
        return s
    }
    var decodeep = decode64(ep);
    var c = E(F(bmka3 + ddd + euserCachea1, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), decodeep);
    var sid = c.split("_")[0];
    // console.log(euserCachesid+euserCachetoken);
    var token = c.split("_")[1];
    var fff = encodeURIComponent(D(E(F(bmka4 + eee + euserCachea2, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), sid + "_" + vid + "_" + token + cook)));
    var sssd = '{"sid":"' + sid + '","token":"' + token + '","fff":"' + fff + '"}';
    return sssd;
}

function getYouKuM3U8FromUrl_VIP(fullurl, callback) {
    var url1 = "http://www.xiguaso.com/api/yun.php?url="+fullurl;
    //console.log("get m3u8 from: " + url1);
    var xhr111 = new XMLHttpRequest();
    xhr111.open("GET", url1, true);
    xhr111.addEventListener("load", function (event) {
        var data = /url": "([\s\S]*?)\"/.exec(xhr111.responseText);
        data = data[1].replace("\\\/","/");
        var newurl = "http://www.xiguaso.com/api/api.php?url="+data+"&hd=4";
        //console.log("get m3u8 from: " + newurl);
        var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1';
        var text=JSB.httpGet(newurl, userAgent, "", '');
        //console.log("text: " + text);
        var ipadurl = /CDATA\[([\s\S]*?)\]/.exec(text);
        ipadurl = ipadurl[1];
        console.log("ipad url: " + ipadurl);
        callback(ipadurl);
    }, false);
    xhr111.send(null);
}
