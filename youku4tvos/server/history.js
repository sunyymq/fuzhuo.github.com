function history_func(index, callback) {
    console.log("history");
    let history = localStorage.getItem('history');
    if (typeof history === 'undefined') {
        var data = {};
    } else {
        data = JSON.parse(history);
    }
    var rdata = [];
    for(var key in data) {
        rdata.push(key);
    }

    var docText = `
    <document>
       <stackTemplate>
          <banner>
             <title>${channels['data'][index]['title']}</title>
          </banner>
          <collectionList>
             <grid>
                <section>`;
    for(var i=rdata.length-1; i>=0; i--) {
        key = rdata[i];
        docText += `
                   <lockup onselect="showSeries('${key}')" onholdselect="removeHistory('${key}')">
                      <img src="${data[key]['img']}" width="250" height="376" />
                      <title><![CDATA[${data[key]['series']}]]></title>
                      <subtitle><![CDATA[${data[key]['title']}]]></subtitle>
                   </lockup>`;
    }
    docText += `
                   <lockup onselect="clearHistory()">
                      <img src="" width="250" height="376" />
                      <title>清除观看历史</title>
                      <subtitle>长按可删除单个历史</subtitle>
                   </lockup>`;
    docText += `
                </section>
             </grid>
          </collectionList>
       </stackTemplate>
    </document>`;
    console.log("docText:"+docText);
    callback((new DOMParser).parseFromString(docText, "application/xml"));
}

function removeHistory(seriesID) {
    console.log("remove history: "+seriesID);
    let history = localStorage.getItem('history');
    if (typeof history === 'undefined') {
        var data = {};
    } else {
        data = JSON.parse(history);
        if (data[seriesID]) {
            delete data[seriesID];
            localStorage.setItem('history', JSON.stringify(data));
            refreshHistory();
        }
    }
}

function clearHistory() {
    localStorage.removeItem('history');
    localStorage.removeItem('progress');
    refreshHistory();
}
