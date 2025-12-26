//入力欄
const dateInput = document.querySelector('#dateInput');
const contentInput = document.querySelector('#leaningContentInput')
const topicInput = document.querySelector('#topicInput');
const timeInput = document.querySelector('#timeInput');

//ボタン
const addButton = document.querySelector('#addButton');

//表示エリア
const totalAll = document.querySelector('#totalAll');
const totalMonth = document.querySelector('#totalMonth');
const totalWeek = document.querySelector('#totalWeek');

//一覧エリア
const logList = document.querySelector('#logList');

//配列
let logs = [];

function loadLogs(){
    const savedLogs = localStorage.getItem('logs');

    if(savedLogs){
        logs = JSON.parse(savedLogs);
    }
}

addButton.addEventListener('click', () => {
    const date = dateInput.value;
    const content =contentInput.value;
    const topic = topicInput.value;
    const time = Number(timeInput.value);

    //console.log(date);
    //console.log(topic);
    //console.log(time);

    const log = {
        date:date,
        content:content,
        topic:topic,
        time:time
    }

    logs.push(log);

    //保存する
    saveLogs();

    //表示を更新
    renderAll();

    //入力欄を空にする
    dateInput.value='';
    contentInput.value='';
    topicInput.value='';
    timeInput.value='';
});

//描画用関数
function renderLogs(){
    //一覧表示する場所
    logList.innerHTML = '';

    //ログを一つずつ取り出す
    logs.forEach((log,index) =>{
        //li要素を作る
        const li = document.createElement('li');

        //表示する文字
        const text = document.createElement('span');
        text.textContent = `${log.date}|${log.content}|${log.topic}|${log.time}分`;

        //削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';

        //クリックされたらindexのログを消す
        deleteButton.addEventListener('click',() => {
            logs.splice(index,1);//配列から削除
            saveLogs();//保存しなおして
            renderAll();//ダッシュボードと一覧を更新
        })
        
        //画面に追加
        logList.appendChild(li);
        li.appendChild(text);
        li.appendChild(deleteButton);
        

    });
}

//1日のミリ秒数
const MS_PER_DAY=1000*60*60*24;

function sumTimes(targetLogs){
    //指定されたログ配列のtimeを合計する
    return targetLogs.reduce((total,log) => total + log.time,0);
}

function isSameMonth(a,b){
    //a,bが同じ「年・月」か
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function daysDiff(from,to){
    //from-to の「日数差」を返す（小数あり）
    return(from - to)/MS_PER_DAY
}

function renderDashboard(){
    const today = new Date();

    //総合学習時間
    const sumAll = sumTimes(logs);

    //今月の学習時間
    const monthLogs = logs.filter((log) =>{
        const logDate = new Date(log.date);
        return isSameMonth(logDate,today);
    });
    const sumMonth =sumTimes(monthLogs);

    //直近7日間の学習時間
    const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return daysDiff(today,logDate) <= 7;
    });
    const sumWeek =sumTimes(weekLogs);

    //表示
    totalAll.textContent = sumAll;
    totalMonth.textContent = sumMonth;
    totalWeek.textContent = sumWeek;
}

function renderAll(){
    renderLogs();
    renderDashboard();
}


function saveLogs(){
    localStorage.setItem('logs',JSON.stringify(logs));
}

loadLogs();
renderAll();
