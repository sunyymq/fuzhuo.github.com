//global seriesDoc for change history dinamiclly
var seriesDoc;

function createSeriesDoc(serieID, callback) {
    var url = `${YOUKU_HOST}layout/smarttv/play/detail?${YOUKU_IDS}&id=${serieID}`;
    var series_url = `${YOUKU_HOST}layout/smarttv/shows/${serieID}/series?${YOUKU_IDS}`;
    console.log("url: " + url);
    getHTTP(url, function(detail_data) {
        getHTTP(series_url, function(series_data) {
            console.log("detail raw data:"+detail_data);
            console.log("series raw data:"+series_data);
            const detail = JSON.parse(detail_data)['detail'];
            const series = JSON.parse(series_data)['results'];
            if (!detail || !series) {
                createAlertDocument("错误", "数据拉取失败或不合规");
            }
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
                </header>`;
            if (detail['director'] && detail['director'][0]) {
                docText += `
                    <text><![CDATA[${detail['director'][0]}]]></text>`;
            }
            docText += `
                </info>
                <info>
                <header>
                <title>主演</title>
                </header>`;
            if(detail['performer']) {
                for(var value of detail['performer']) {
                    docText += `
                        <text>${value}</text>`;
                }
            }
            docText += `
                </info>
                </infoList>
                <stack>
                <title><![CDATA[${detail['title']}]]></title>
                <row>
                <text><![CDATA[${detail['showdate']}]]></text>`;
            for(var value of detail['genre']) {
                docText += `
                    <text>${value}</text>`;
            }
            docText += `
                <text>${detail['cats']}</text>`;
            if (detail['paid']) {
                docText += `
                    <text>VIP</text>`;
            }
            history = localStorage.getItem('history');
            docText += `
                <badge src="resource://cc" class="badge" />
                </row>
                <row>
                <text>豆瓣评分 ${detail['douban_rating']}</text>
                <text>${detail['stripe_bottom']}</text>
                </row>
                <description handlesOverflow="true" allowsZooming="true" moreLabel="更多"><![CDATA[${detail['desc']}]]></description>
                <row>
                <buttonLockup index="-1">
                <badge src="resource://button-preview" />`;
            var data;
            if (typeof history === 'undefined') {
                docText += `
                    <title id="continue_play">播放</title>`;
            } else {
                console.log("history: "+history);
                data = JSON.parse(history);
                if (data[serieID]) {
                    docText += `
                        <title id="continue_play">继续播放</title>`;
                } else {
                    docText += `
                        <title id="continue_play">播放首集</title>`;
                }
            }
            docText += `
                </buttonLockup>`;

            if (detail['cats']!='电影') {
                docText += `
                <buttonLockup index="-2">
                    <badge src="resource://button-preview" />
                    <title>播放下一集</title>
                </buttonLockup>`;
            }
            docText += `
                </row>
                <row id="history_text">`;
            if (typeof history === 'undefined') {
                docText += `
                    <text>无播放历史</text>`;
            } else {
                console.log("history: "+history);
                data = JSON.parse(history);
                if (data[serieID]) {
                    docText += `
                        <badge src="resource://button-checkmark" class="badge" />
                        <text>上次看到『${data[serieID]['title']}』</text>`;
                } else {
                    docText += `
                        <text>无播放历史</text>`;
                }
            }
            docText += `
                </row>
                </stack>
                <heroImg src="${detail['img']}" />
                </banner>
                <shelf>
                <header>
                <title>${detail['stripe_bottom']}</title>
                </header>
                <section>`;
            const progress_str = localStorage.getItem('progress');
            var progress = null;
            if (typeof progress_str === 'undefined' || progress_str=='undefined') {
                progress = null;
            } else {
                progress = JSON.parse(progress_str);
            }
            if (detail['cats']=='电影') {
                var progress_title = "上次未观看";
                if (progress && progress[detail['videoid']]) {
                    progress_title = time2str(progress[detail['videoid']]);
                }
                docText +=`
                    <lockup index="0">
                    <img src="${detail['img']}" width="150" height="226" />
                    <title><![CDATA[${detail['title']}]]></title>
                    <subtitle><![CDATA[${progress_title}]]></subtitle>
                    </lockup>`;
            } else {
                let i=0;
                for(var value of series) {
                    var progress_title = "上次未观看";
                    if (progress && progress[value['videoid']]) {
                        progress_title = time2str(progress[value['videoid']]);
                    }
                    docText +=`
                        <lockup index="${i}">
                        <img src="${value['img']}" width="150" height="226" />
                        <title><![CDATA[${value['title']}]]></title>
                        <subtitle><![CDATA[${progress_title}]]></subtitle>
                        </lockup>`;
                    i++;
                }
            }
            docText +=`
                </section>
                </shelf>
                </productTemplate>
                </document>`;
            console.log("content:"+docText);
            callback((new DOMParser).parseFromString(docText, "application/xml"), detail, series);
        });
    });
}

function showSeries(serieID) {
    console.log("showseries:"+serieID);
    var loadDoc = createLoadingDocument("优酷加载剧集信息中...");
    navigationDocument.pushDocument(loadDoc);
    createSeriesDoc(serieID, function(doc, detailData, serieData){
        seriesDoc = doc;
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
            playByDataIndex(detailData, serieData, index);
        });
        navigationDocument.replaceDocument(doc, loadDoc);
    });
}
