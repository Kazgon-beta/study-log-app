//入力欄
const dateInput = document.querySelector('#dateInput');
const contentInput = document.querySelector('#learningContentInput');
const topicInput = document.querySelector('#topicInput');
const timeInput = document.querySelector('#timeInput');

//ボタン
const addButton = document.querySelector('#addButton');

//表示エリア
const totalAll = document.querySelector('#totalAll');
const totalMonth = document.querySelector('#totalMonth');
const totalWeek = document.querySelector('#totalWeek');

//表示エリア機能追加
const remain1000 = document.querySelector('#remain1000');
const remainMonth = document.querySelector('#remainMonth');

//目標設定
const goalDateInput = document.querySelector('#goalDateInput');
const pacePerDay = document.querySelector('#pacePerDay');
const pacePerWeek = document.querySelector('#pacePerWeek');
const pacePerMonth = document.querySelector('#pacePerMonth');
const goalMessage = document.querySelector('#goalMessage'); 

const diffWeek = document.querySelector('#diffWeek');
const commentWeek = document.querySelector('#commentWeek');

//一覧エリア
const logList = document.querySelector('#logList');

//配列
let logs = [];

//目標設定(localStorageで保存できるように)
let settings = {
    goalDate:''
};

function loadLogs(){
    const savedLogs = localStorage.getItem('logs');

    if(savedLogs){
        logs = JSON.parse(savedLogs);
    }
}

function loadSettings(){
    const saved = localStorage.getItem('settings');
    if(saved){
        settings = JSON.parse(saved)
    }
    goalDateInput.value = settings.goalDate || '';
}

goalDateInput.addEventListener('change', () => {
    settings.goalDate = goalDateInput.value;
    saveSettings();
    renderAll();
})

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

function startOfDay(d){
    return new Date(d.getFullYear(),d.getMonth(),d.getDate());
}

//今日を含めて「今月あと何日あるか」
function daysRemainingInMonth(d){
    const today0 = startOfDay(d);
    const lastDay = new Date(today0.getFullYear(),today0.getMonth()+1,0);
    const diffDays = Math.floor((lastDay-today0)/MS_PER_DAY);
    return diffDays + 1;
}

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


    //1000時間＝60000分
    const GOAL_MINUTES = 1000*60;
    //残り分数
    const remainMinutes=GOAL_MINUTES-sumAll;
    //残り時間（表示用）マイナス表示を防ぎ、少しでも残っていたら１時間と表示するようにする。
    const remainHours = Math.max(0,Math.ceil(remainMinutes/60));

    //今月の学習時間
    const monthLogs = logs.filter((log) =>{
        const logDate = new Date(log.date);
        return isSameMonth(logDate,today);
    });
    const sumMonth =sumTimes(monthLogs);

    //直近7日間の学習時間
    const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        const diff = daysDiff(today,logDate);
        return diff >= 0 && diff <= 7;
    });
    const sumWeek =sumTimes(weekLogs);


    //期限日が設定されてる？（されてなかったらpaceは-表示）
    if(!settings.goalDate){
        pacePerDay.textContent = '-';
        pacePerWeek.textContent = '-';
        pacePerMonth.textContent = '-';
        remainMonth.textContent = '-';
        diffWeek.textContent = '-';
        goalMessage.textContent = '果てしない道のりも、全てはここから始まる。（期限日を設定してください。）';
    }else{
        const goalDate = new Date(settings.goalDate);

        //期限日まであと何日か？
        const diffDays = Math.ceil((goalDate-today)/MS_PER_DAY);

        if(diffDays <= 0){
            pacePerDay.textContent = '-';
            pacePerWeek.textContent = '-';
            pacePerMonth.textContent = '-';
            remainMonth.textContent = '-';
            diffWeek.textContent = '-';
            commentWeek.textContent = '-';
            goalMessage.textContent = '過去はもうない。未来はまだ来ない。果てしない今の積み重ねが未来なのだ。（期限日が過去になっています。）'
        }else{
            const perDayMinutes = Math.max(0, Math.ceil(remainMinutes / diffDays));
            const perWeekHours = Math.max(0, Math.ceil((perDayMinutes * 7) / 60));
            const perMonthHours = Math.max(0, Math.ceil((perDayMinutes * 30) / 60));
            //今月の目標達成まで(時間)
            const remainMinutesClamped = Math.max(0,remainMinutes);//念の為（超過しているなら0になるように）
            const daysLeftThisMonth = daysRemainingInMonth(today);

            //今月の目標（分）：1日目安　* 今月の残り日数（ただし、総残りを超えない）
            const monthTargetMinutes = Math.min(remainMinutesClamped,perDayMinutes*daysLeftThisMonth);

            //今月の目標達成まで残り（分）
            const remainMonthMinutes = monthTargetMinutes - sumMonth;

            //表示は時間だけ
            const remainMonthHours = Math.max(0,Math.ceil(remainMonthMinutes/60));
            remainMonth.textContent = remainMonthHours;

            //目標との差分+コメント
            const weekTargetMinutes = Math.min(remainMinutesClamped,perDayMinutes*7);//今週の目標
            const diffMinutes = sumWeek - weekTargetMinutes;//+なら目標達成、-なら学習時間が不足しているということ。
            const diffHoursAbs = Math.ceil(Math.abs(diffMinutes)/60);//差分を整数に置き換える
            //表示用
            pacePerDay.textContent = perDayMinutes;
            pacePerWeek.textContent = perWeekHours;
            pacePerMonth.textContent = perMonthHours;

            goalMessage.textContent =`期限まであと ${diffDays}日。今のペース目安を出しています。`;

            console.log({ diffWeek, commentWeek });

            //目標との差分に対してのコメント表示
            if(diffHoursAbs === 0){
                diffWeek.textContent = '0';
                commentWeek.textContent = '有言実行。画無失理。パーフェクトヒューマンとは君のことだ。（目標達成です！おめでとう！）';
            }else if(diffMinutes > 0){
                diffWeek.textContent = `+${diffHoursAbs}`;
                commentWeek.textContent = '予言しよう。君はいずれ「秀才」と呼ばれるようになるだろう。知の貯金を増やすが良い。（目標よりプラスです！すごい！）'; 
            }else{
                diffWeek.textContent = `-${diffHoursAbs}`;
                commentWeek.textContent = '人生は一筋縄にはいかない。大切なのは諦めないことだ。（少し不足気味。明日からちょい足しでがんばろう！）';
            }
        }

    }

    //表示
    totalAll.textContent = sumAll;
    remain1000.textContent = remainHours;
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

function saveSettings(){
    localStorage.setItem('settings',JSON.stringify(settings));
}

loadLogs();
loadSettings();
renderAll();

