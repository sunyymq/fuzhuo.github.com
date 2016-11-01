function getAlbumDoc(albumId, callback) {
    var url=`http://mobile.ximalaya.com/mobile/v1/album?albumId=${albumId}&device=iPhone&pageSize=20&source=0`;
    getHTTP(url, function(content){
        var data = JSON.parse(content)['data'];
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
                    <text><![CDATA[${data['user']['nickname']}]]></text>
                </info>
                <info>
                    <header>
                        <title>类型</title>
                    </header>
                    <text><![CDATA[${data['album']['categoryName']}]]></text>
                </info>
                </infoList>
                <stack>
                    <title><![CDATA[${data['album']['title']}]]></title>
                    <row>
                        <text><![CDATA[2016-02-08]]></text>
                            <text>奇幻</text>
                            <text>动作</text>
                            <text>喜剧</text>
                        <text>电影</text>
                        <badge src="resource://cc" class="badge" />
                    </row>
                    <row>
                        <text>豆瓣评分 5.7</text>
                        <text>全7部</text>
                    </row>
                        <description handlesOverflow="true" allowsZooming="true" moreLabel="更多"><![CDATA[${data['album']['intro']}]]></description>
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
                <heroImg src="${data['album']['detailCoverPath']}" />
                </banner>
                <shelf>
                    <header>
                    <title>全7部</title>
                    </header>
                    <section>`;
        for (var j in data['tracks']['list']) {
            docText += `
                        <lockup index="${j}" onselect="ximaPlay('${data['tracks']['list'][j]['playUrl64']}')">
                            <img src="${data['tracks']['list'][j]['smallLogo']}" width="150" height="226" />
                            <title><![CDATA[${data['tracks']['list'][j]['title']}]]></title>
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
}
function showAlbum(albumId) {
    const loadingDocument = createLoadingDocument("Ximalaya加载中..");
    navigationDocument.pushDocument(loadingDocument);
    getAlbumDoc(albumId, function(doc){
        navigationDocument.replaceDocument(doc, loadingDocument);
    });
}
function ximaPlay(url) {
    var audio = new MediaItem('audio', url);
    var audiolist = new Playlist();
    audiolist.push(audio);
    player.stop();
    player.playlist = audiolist;
    player.play();
}
