//入力欄
const dateInput = document.querySelector('#dateInput');
const topicInput = document.querySelector('#topicInput');
const timeInput = document.querySelector('#timeInput');

//ボタン
const addButton = document.querySelector('#addButton');

//表示エリア
const totalTime = document.querySelector('#totalTime');
const logList = document.querySelector('#logList');

//配列
let logs = [];

function loadLogs(){
    const saveLogs = localStorage.getItem('logs');

    if(saveLogs){
        logs = JSON.parse(saveLogs);
        rendeerLogs();
    }
}

addButton.addEventListener('click', () => {
    const date = dateInput.value;
    const topic = topicInput.value;
    const time = Number(timeInput.value);

    //console.log(date);
    //console.log(topic);
    //console.log(time);

    const log = {
        date:date,
        topic:topic,
        time:time
    }

    logs.push(log);

    //保存する
    saveLogs();

    //console.log(logs);
    //表示を更新
    rendeerLogs();

    //入力欄を空にする
    dateInput.value='';
    topicInput.value='';
    timeInput.value='';
});

//描画用関数
function rendeerLogs(){
    //一覧表示する場所
    logList.innerHTML = '';

    //合計時間をリセット
    let total = 0;

    //ログを一つずつ取り出す
    logs.forEach((log) =>{
        //li要素を作る
        const li = document.createElement('li');

        //表示する文字
        li.textContent = `${log.date}|${log.topic}|${log.time}分`;
        
        //画面に追加
        logList.appendChild(li);

        //合計時間を加算
        total += log.time;

    });

    //合計時間を画面に表示
    totalTime.textContent = total;
}

function saveLogs(){
    localStorage.setItem('logs',JSON.stringify(logs));
}

loadLogs();
