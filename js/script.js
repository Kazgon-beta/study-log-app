//----------------------------------html紐づけ-----------------------//

//入力欄
const dateInput = document.querySelector('#dateInput');
const contentInput = document.querySelector('#learningContentInput');
const topicInput = document.querySelector('#topicInput');
const timeInput = document.querySelector('#timeInput');

//ボタン
const addButton = document.querySelector('#addButton');

//目標設定
const startDateInput = document.querySelector('#startDateInput');
const goalDateInput = document.querySelector('#goalDateInput');
const pacePerDay = document.querySelector('#pacePerDay');
const pacePerWeek = document.querySelector('#pacePerWeek');
const pacePerMonth = document.querySelector('#pacePerMonth');
const goalMessage = document.querySelector('#goalMessage');

//表示エリア
const totalAll = document.querySelector('#totalAll');
const remain1000 = document.querySelector('#remain1000');
const totalMonth = document.querySelector('#totalMonth');
const remainMonth = document.querySelector('#remainMonth');
const totalWeek = document.querySelector('#totalWeek');
const diffWeek = document.querySelector('#diffWeek');
const commentWeek = document.querySelector('#commentWeek');

//一覧エリア
const logList = document.querySelector('#logList');
// ---------------------------------------------------------------------------------//

//配列
let logs = [];

//目標設定(localStorageで保存できるように)
let settings = {
  goalDate: '',
  startDate: '',
};

//1日のミリ秒数
const MS_PER_DAY = 1000 * 60 * 60 * 24;

//ログ読み込み関数
function loadLogs() {
  const savedLogs = localStorage.getItem('logs');

  if (savedLogs) {
    logs = JSON.parse(savedLogs);
  }
}
//セッティング読み込み関数
function loadSettings() {
  const savedSettings = localStorage.getItem('settings');
  if (savedSettings) {
    settings = JSON.parse(saved);
  }
  startDateInput.value = settings.startDate || '';
  goalDateInput.value = settings.goalDate || '';
}

//JSONに変換して保存(学習ログ)
function saveLogs() {
  localStorage.setItem('logs', JSON.stringify(logs));
}
//JSONにして保存(開始日、期限日）
function saveSettings() {
  localStorage.setItem('settings', JSON.stringify(settings));
}

//開始日が入力された時の関数
startDateInput.addEventListener('change', () => {
  settings.startDate = startDateInput.value;
  saveSettings();
  renderAll();
});
//期限日が入力された時の関数
goalDateInput.addEventListener('change', () => {
  settings.goalDate = goalDateInput.value;
  saveSettings();
  renderAll();
});

//追加するボタンが押された時の関数
addButton.addEventListener('click', () => {
  const date = dateInput.value;
  const content = contentInput.value;
  const topic = topicInput.value;
  const time = Number(timeInput.value); //数値型に直す

  const log = {
    date: date,
    content: content,
    topic: topic,
    time: time,
  };

  logs.push(log);

  //保存する
  saveLogs();

  //表示を更新
  renderAll();

  //入力欄を空にする
  dateInput.value = '';
  contentInput.value = '';
  topicInput.value = '';
  timeInput.value = '';
});

//ログ描画用関数
function renderLogs() {
  //一覧表示する場所
  logList.innerHTML = '';

  //ログを一つずつ取り出す
  logs.forEach((log, index) => {
    //li要素を作る
    const li = document.createElement('li');

    //表示する文字
    const text = document.createElement('span');
    text.textContent = `${log.date}|${log.content}|${log.topic}|${log.time}分`;

    //削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';

    //クリックされたらindexのログを消す
    deleteButton.addEventListener('click', () => {
      logs.splice(index, 1); //配列から削除
      saveLogs(); //保存しなおして
      renderAll(); //ダッシュボードと一覧を更新
    });

    //画面に追加
    logList.appendChild(li);
    li.appendChild(text);
    li.appendChild(deleteButton);
  });
}

//その日の0時に揃えてざっくり計算ができるようにする
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// YYYY-MM-DDをdateに変換する。
function parseDateYMD(ymd) {
  const [y, m, d] = ymd.split('-').map(Number); //map(新出)元の配列は崩さず、新しい配列をつくる。
  return new Date(y, m - 1, d); //月を-1しているのは1月のことを0月と捉えるから、その形に合わせるため。
}

//今日を含めて「今月あと何日あるか」
function daysRemainingInMonth(d) {
  const start0 = startOfDay(d);
  const lastDay = new Date(start0.getFullYear(), start0.getMonth() + 1, 0); //これ面白い。ひと月先の0日を指定することで、1月前の最終日にしている。
  const diffDays = (lastDay - start0) / MS_PER_DAY;
  return diffDays + 1;
}
//指定されたログ配列のtimeを合計する
function sumTimes(targetLogs) {
  return targetLogs.reduce((total, log) => total + log.time, 0);
}
//a,bが同じ「年・月」か判断する
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
//from-to の「日数差」を返す（小数あり）
function daysDiff(from, to) {
  return (from - to) / MS_PER_DAY;
}
//ダッシュボード描画用
function renderDashboard() {
  //１　基準日、設定日の読み取り
  //今日
  const today = new Date();
  //ざっくり今日
  const today0 = startOfDay(today);
  //開始日
  const startDate = settings.startDate
    ? parseDateYMD(settings.startDate)
    : null;
  //終了日
  const goalDate = settings.goalDate ? parseDateYMD(settings.goalDate) : null;
  //「今月」の基準日:開始日があらば開始日、なければ今日
  const baseMonthDate = startDate ?? today; //いらない？

  //2 実績の集計（期限がなくても出せる値）
  //総合学習時間
  const sumAll = sumTimes(logs);
  //今月の学習時間
  const monthLogs = logs.filter((log) => {
    const logDate = parseDateYMD(log.date);
    return isSameMonth(logDate, today);
  });
  const sumMonth = sumTimes(monthLogs);
  //直近7日間の学習時間
  const weekLogs = logs.filter((log) => {
    const logDate = parseDateYMD(log.date);
    const diff = daysDiff(today, logDate);
    return diff >= 0 && diff <= 7;
  });
  const sumWeek = sumTimes(weekLogs);

  //３　1000時間ゴールの残り
  //1000時間＝60000分
  const GOAL_MINUTES = 1000 * 60;
  //残り分数
  const remainMinutes = GOAL_MINUTES - sumAll;
  //残り時間（表示用）マイナス表示を防ぎ、少しでも残っていたら１時間と表示するようにする。
  const remainHours = Math.max(0, Math.ceil(remainMinutes / 60));
  //マイナス表示を防止
  const remainMinutesClamped = Math.max(0, remainMinutes);

  //４　期限日が設定されてる？（されてなかったらpaceは-表示）
  if (!settings.goalDate) {
    //この書き方で良いか確認。
    pacePerDay.textContent = '-';
    pacePerWeek.textContent = '-';
    pacePerMonth.textContent = '-';
    remainMonth.textContent = '-';
    diffWeek.textContent = '-';
    commentWeek.textContent = '-';
    goalMessage.textContent = '期限日を設定してください。';
  } else {
    //５　期限日がある場合のペース計算
    const diffDays = Math.ceil(
      (startOfDay(goalDate) - startOfDay(today)) / MS_PER_DAY,
    );
    //残り日数がマイナスになっている時＝期限日が過去に設定されている。
    if (diffDays <= 0) {
      pacePerDay.textContent = '-';
      pacePerWeek.textContent = '-';
      pacePerMonth.textContent = '-';
      remainMonth.textContent = '-';
      diffWeek.textContent = '-';
      commentWeek.textContent = '-';
      goalMessage.textContent = '期限日が過去になっています。';
    } else {
      const perDayMinutes = Math.max(0, Math.ceil(remainMinutes / diffDays)); //分表記
      const perWeekHours = Math.max(0, Math.ceil((perDayMinutes * 7) / 60)); //時間表記
      const perMonthHours = Math.max(0, Math.ceil((perDayMinutes * 30) / 60));

      //表示用
      pacePerDay.textContent = perDayMinutes;
      pacePerWeek.textContent = perWeekHours;
      pacePerMonth.textContent = perMonthHours;
      goalMessage.textContent = `期限まであと ${diffDays}日。今のペース目安を出しています。`;

      //６　月差分（B方式：今月実績 - 今月目標）
      // 開始日が無いなら月差分は出せない
      if (!settings.startDate) {
        remainMonth.textContent = '-';
        diffWeek.textContent = '-';
        commentWeek.textContent = '開始日を設定してください。';
      } else {
        const startDate0 = startOfDay(parseDateYMD(settings.startDate));

        // 今日が開始日より前なら計算できない
        if (today0 < startDate0) {
          remainMonth.textContent = '-';
          diffWeek.textContent = '-';
          commentWeek.textContent = '開始日が未来になっています。';
        } else {
          // 開始日〜今日の経過日数（両端含む）
          const elapsedDays =
            Math.floor((today0 - startDate0) / MS_PER_DAY) + 1;

          // 比較対象の日数：開始〜6日は累計、7日目以降は7日固定
          const targetDays = Math.min(7, elapsedDays);

          // 比較期間の開始日
          const windowStart =
            elapsedDays < 7
              ? startDate0 // 1〜6日目：開始日〜今日
              : new Date(today0.getTime() - MS_PER_DAY * 6); // 7日目以降：直近7日（今日含む）

          // 比較期間の実績（分）
          const windowLogs = logs.filter((log) => {
            const d = startOfDay(parseDateYMD(log.date));
            return d >= windowStart && d <= today0;
          });
          const windowSum = sumTimes(windowLogs);

          // 比較期間の目標（分）
          const weekTargetMinutes = Math.min(
            remainMinutesClamped,
            perDayMinutes * targetDays,
          );

          // 差分（分）：実績 - 目標
          const diffMinutes = windowSum - weekTargetMinutes;
          const diffHoursAbs = Math.ceil(Math.abs(diffMinutes) / 60);

          if (diffHoursAbs === 0) {
            diffWeek.textContent = '0';
            commentWeek.textContent =
              elapsedDays < 7
                ? `開始${elapsedDays}日目：累計ノルマ達成！`
                : '目標達成です！おめでとう！';
          } else if (diffMinutes > 0) {
            diffWeek.textContent = `+${diffHoursAbs}`;
            commentWeek.textContent =
              elapsedDays < 7
                ? `開始${elapsedDays}日目：累計ノルマよりプラス！すごい！`
                : '目標よりプラスです！すごい！';
          } else {
            diffWeek.textContent = `-${diffHoursAbs}`;
            commentWeek.textContent =
              elapsedDays < 7
                ? `開始${elapsedDays}日目：累計で少し不足。明日ちょい足しでOK！`
                : '少し不足気味。明日からちょい足しでがんばろう！';
          }

          // 今月の範囲（月初〜月末）
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
          );
          //６　月差分
          // 対象開始日：max(月初, 開始日)
          const effectiveStart = startOfDay(
            startDate0 > monthStart ? startDate0 : monthStart,
          );
          const effectiveEnd = startOfDay(monthEnd);

          // 今月が開始日より前なら対象0（例：開始日が来月）
          let monthTargetMinutes = 0;

          if (effectiveStart <= effectiveEnd) {
            // 両端含む日数
            const daysScope =
              Math.floor((effectiveEnd - effectiveStart) / MS_PER_DAY) + 1;

            // 今月目標（分）= 1日ノルマ × 対象日数
            const monthTargetMinutesRaw = perDayMinutes * daysScope;

            // 念のため「総残り」を超えないようにクランプ
            monthTargetMinutes = Math.min(
              remainMinutesClamped,
              monthTargetMinutesRaw,
            );
            //差分
            const diffMonthMinutes = sumMonth - monthTargetMinutes;
            //時間変換表示
            const diffMonthHoursAbs = Math.ceil(
              Math.abs(diffMonthMinutes) / 60,
            );
            if (diffMonthHoursAbs === 0) {
              remainMonth.textContent = '0';
            } else if (diffMonthMinutes > 0) {
              remainMonth.textContent = `+${diffMonthHoursAbs}`;
            } else {
              remainMonth.textContent = `-${diffMonthHoursAbs}`;
            }
          }
        }
      }
    }
  }
  //表示
  totalAll.textContent = sumAll;
  remain1000.textContent = remainHours;
  totalMonth.textContent = sumMonth;
  totalWeek.textContent = sumWeek;
}
//描画指示用
function renderAll() {
  renderLogs();
  renderDashboard();
}

loadLogs();
loadSettings();
renderAll();
