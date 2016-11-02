var track_data;
var playedAlbumId;
var playedIndex;
function getAlbumDoc(albumId, callback) {
    var detail_url=`http://mobile.ximalaya.com/mobile/v1/album/detail?albumId=${albumId}&device=iPhone`;
    var track_url=`http://mobile.ximalaya.com/mobile/v1/album/track?albumId=${albumId}&device=iPhone&isAsc=true&pageId=1&pageSize=200`;
    var album_url=`http://mobile.ximalaya.com/mobile/v1/album?albumId=${albumId}&device=iPhone&pageSize=20&source=0`;
    getHTTP(detail_url, function(detail_content){
        getHTTP(track_url, function(track_content){
            getHTTP(album_url, function(album_content){
                var album_data = JSON.parse(album_content)['data'];
                var detail_data = JSON.parse(detail_content)['data'];
                track_data = JSON.parse(track_content)['data'];
                var author = (album_data && album_data['album']) ? album_data['album']['nickname'] : detail_data['user']['nickname'];
                var style = (album_data && album_data['album']) ? album_data['album']['categoryName'] : detail_data['detail']['tags'];
                var title = (album_data && album_data['album']) ? album_data['album']['title'] : "标题";
                var intro = (album_data && album_data['album']) ? album_data['album']['intro'] : detail_data['detail']['intro'];
                var star = (album_data && album_data['album'] && album_data['album']['score']) ? album_data['album']['score'] : "无评分";
                var cover = (album_data && album_data['album']) ? album_data['album']['coverWebLarge']:detail_data['user']['smallLogo'];
                var tags = (album_data && album_data['album']) ? album_data['album']['tags'] : detail_data['detail']['tags'];
                var docText= `<?xml version="1.0" encoding="UTF-8" ?>
                    <document>
                        <productTemplate>
                            <background>
                            </background>
                            <banner>
                                <infoList>
                                <info>
                                <header>
                                <title>作者</title>
                                </header>
                                    <text><![CDATA[${author}]]></text>
                                </info>
                                <info>
                                    <header>
                                        <title>风格</title>
                                    </header>
                                    <text><![CDATA[${style}]]></text>
                                </info>
                                </infoList>
                                <stack>
                                    <title><![CDATA[${title}]]></title>
                                    <row>
                                        <text><![CDATA[${tags}]]></text>
                                        <badge src="resource://cc" class="badge" />
                                    </row>
                                    <row>
                                        <text><![CDATA[评分: ${star}]]></text>
                                    </row>
                                    <description handlesOverflow="true" allowsZooming="true" moreLabel="更多"><![CDATA[${intro}]]></description>
                                    <row>
                                        <buttonLockup index="-1">
                                        <badge src="resource://button-preview" />
                                                <title id="continue_play">播放首集</title>
                                        </buttonLockup>
                                    </row>
                                    <row id="history_text">
                                            <text>无播放历史</text>
                                    </row>
                                </stack>
                                <heroImg src="${cover}" />
                            </banner>
                            <shelf>
                                <section>`;
                var list = track_data['list'];
                for (var j in list) {
                    docText += `
                                    <lockup index="${j}" onselect="ximaPlay(${albumId},'${j}')">
                                        <img src="${list[j]['coverMiddle']}" width="150" height="226" />
                                        <title><![CDATA[${list[j]['title']}]]></title>
                                    </lockup>`;
                }
                docText += `
                                </section>
                            </shelf>
                        </productTemplate>
                        </document>`;
                console.log("docText: "+docText);
                callback((new DOMParser).parseFromString(docText, "application/xml"));
            });
        });
    });
}

function showAlbum(albumId) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getAlbumDoc(albumId, function(doc){
        doc.addEventListener("select", (event)=> {
            var target = event.target;
            if (target.tagName == "description") {
                const body = target.textContent;
                const alertDocument = createDescriptiveAlertDocument('', body);
                navigationDocument.presentModal(alertDocument);
            }
        });
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}

function ximaPlay(albumId, index) {
    if (player.currentMediaItem && albumId == playedAlbumId) {
        player.present();
        if (index != playedIndex) {
            player.changeToMediaAtIndex(index);
            playedIndex = index;
            return;
        }
    } else {
        var item_list = track_data['list'];
        var audiolist = new Playlist();
        for (var item of item_list) {
            var audio = new MediaItem('audio', item['playUrl64']);
            audio.artworkImageURL = item['coverLarge'];
            audio.description = `播放次数: item['playtimes']`;
            audio.title = item['title'];
            audio.subtitle = item['displayPrice'];
            audiolist.push(audio);
        }
        player.stop();
        player.playlist = audiolist;
        player.play();
        player.changeToMediaAtIndex(index);
        playedAlbumId = albumId;
        playedIndex = index;
    }
}
