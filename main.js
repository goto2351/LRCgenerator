var isPlaying = false;//再生状態
var isEditing = false;//行が編集中かどうか
var file;
var reader = new FileReader();
var music = new Audio();
var lyric_array = [];//時刻と歌詞の格納
music.volume = 0.3;
//現在時刻を表示
music.addEventListener('timeupdate', function(){
    document.getElementById('timeLabel').value = music.currentTime.toFixed(2);
    document.getElementById('timebar').value = (music.currentTime / music.duration) * 100;
})
//ファイルの読み込み
function loadMusic(){
    file = document.getElementById('targetFile').files[0];
    reader.onload = function(evt){
        music.src = reader.result;
    }
    reader.readAsDataURL(file);
    document.getElementById('playButton').disabled = false;
}
//再生/一時停止ボタンの処理を再生状態によって切り替える
function playButton_click(){
    if(isPlaying === true){
        //再生中の時は一時停止
        pauseMusic();
        document.getElementById('playButton').value = "▶";
    }else{
        playMusic();
        document.getElementById('playButton').value = "||";
    }
}
//再生ボタンの処理
function playMusic(){
    music.play();
    isPlaying = true;
}
//一時停止ボタン
function pauseMusic(){
    music.pause();
    isPlaying = false;
}
//シークバーの値が変わったときの時刻変更
function setTime(){
    var v = document.getElementById('timebar').value;
    var newTime;
    newTime = (v/100) * music.duration;
    music.currentTime = newTime;
}
//Enterキーで歌詞を追加する
document.getElementById('lyric').addEventListener('keypress', onKeyPress);
function onKeyPress(e){
    if(e.keyCode === 13){
        addLyric();
    }
}
//歌詞の追加
function addLyric(){
    var newline = [music.currentTime, document.getElementById('lyric').value];
    lyric_array.push(newline);
    //時刻順にソート
    lyric_array.sort(function(a,b){return(a[0] - b[0]);});
    updateTable();
    //歌詞の入力欄を空にする
    document.getElementById('lyric').value = "";
}
//表で指定された歌詞の削除
function deleteLyric(obj){
    //削除ボタンの押された行を取得
    var line = obj.parentNode.parentNode;
    var index = line.sectionRowIndex - 1;
    //歌詞データの当該行をnullにする
    lyric_array[index][0] = null;
    lyric_array[index][1] = null;
    //nullにした行をトップにして削除
    lyric_array.sort(function(a,b){return(a[0] - b[0]);});
    lyric_array.shift();
    //新しい配列に基づいて表を更新する
    updateTable();
}
//表の特定の行にテキストボックスを作る
function editLyric(obj){
    //他の行を編集中の時は新たに編集状態にしない
    if(isEditing !== true){
        //クリックされた行を取得
        var line = obj.parentNode.parentNode;
        var index = line.sectionRowIndex;
        
        isEditing = true;
        var table = document.getElementById('lyricTable');
        table.rows[index].cells[1].innerHTML = '<input type="text" value="'+lyric_array[index - 1][1]+'" id="table_textBox">';
        
        //enterキーで確定する
        document.getElementById('table_textBox').addEventListener('keypress', {line_index: index, handleEvent: lyric_keyPress});
    }        
}
//歌詞の変更を確定する
function lyric_keyPress(e){
    //enterキーのとき
    if(e.keyCode === 13){
        //歌詞データを変更
        lyric_array[this.line_index - 1][1] = document.getElementById('table_textBox').value
        //表を再描画
        updateTable();
        isEditing = false;
    }
}
//表の書き換え
function updateTable(){
    var table = document.getElementById('lyricTable');
    //見出し以外全ての行を削除する
    while(table.rows.length > 1) table.deleteRow(1);
    //配列に従って行を追加していく
    for(var i = 0; i < lyric_array.length; i++){
        //末尾に行を追加
        var row = table.insertRow(-1);
        //セルを追加
        var cell_time = row.insertCell(-1);
        var cell_lyric = row.insertCell(-1);
        var cell_delete = row.insertCell(-1);
        //セルに内容を書き込む
        cell_time.innerHTML = lyric_array[i][0];
        cell_lyric.innerHTML = '<p onclick=editLyric(this)>' + lyric_array[i][1] + '</p>';
        cell_delete.innerHTML = '<input type="button" value="削除" id="deleteButton" onclick=deleteLyric(this)>'
    }
}
//lrcファイル用テキストを生成してコピーする
function exportLyric(){
    var lrcText = "";
    for(var i = 0; i < lyric_array.length; i++){
        var lrc_time;
        var lrc_lyric;
        //時刻をlrcの形式に変換する
        var m = Math.floor(lyric_array[i][0] / 60);//分
        var s1 = Math.floor(lyric_array[i][0] - m * 60);//秒
        var s2 = Math.floor((lyric_array[i][0] - (m * 60 + s1)).toFixed(2) * 100);
        //文字列型に変換
        var m_str = ('00' + m.toString()).slice(-2);
        var s1_str = ('00' + s1.toString()).slice(-2);
        var s2_str = ('00' + s2.toString()).slice(-2);
        //時刻部分を生成
        lrc_time = "[" + m_str + ":" + s1_str + ":" + s2_str + "]";
        //歌詞部分
        lrc_lyric = lyric_array[i][1];
        //テキストに行を追加
        lrcText += lrc_time + lrc_lyric + '\n';
    }
    //クリップボードにコピーする
    if(navigator.clipboard){
        navigator.clipboard.writeText(lrcText);
    }
}