var bgStart,bg1,bg2;
var isDebugMode = true;

$(document).ready(function () {
  bgStart = document.getElementsByClassName('full-res-bgStart')[0];
  bg1 = document.getElementsByClassName('full-res-bg1')[0];
  bg2 = document.getElementsByClassName('full-res-bg2')[0];
  bg1.style.display = "none";
  bg2.style.display = "none";
});

//遊戲
var questionPool;
var greenBtn = document.getElementById('greenBtn');
greenBtn.onclick = InitChecking;//開始事件
var redBtn = document.getElementById('redBtn');
redBtn.onclick = ShowUpGreeting;
var againBtn = document.getElementById('againBtn');
againBtn.onclick = ShowUpGreeting;
//不可到達描述
function Exclude(id,bool){
  this.id = id;
  this.bool = bool;
}
//問題的回答
function QuestionResult(id, bool){
  this.id = id;
  this.bool = bool;
}
//問題類別
function Question(id,topic,excludeList,confirmPoint, denyPoint){
  this.id = id;
  this.topic = topic;
  this.excludeList = excludeList;
  this.confirmPoint = confirmPoint;
  this.denyPoint = denyPoint;
}
//問題池
function QuestionPool(){
  this.pool = [];
  this.poolCount = 0;
  this.answerPool = null;
  this.isMapReady = false;
  this.holdingQuestionIndex = 0;
}
QuestionPool.prototype.addQuestion = function (question) {
  this.pool.push(question);
  this.poolCount++;
};
QuestionPool.prototype.addAnswerPool = function (pool) {
  this.answerPool = pool;
  this.isMapReady = true;
}
QuestionPool.prototype.DivPoolByExclude = function (exclude) {
  //遍歷所有Question
  if(this.isMapReady){
    for(var i = 0; i < this.pool.length; i++){
      for(var exListIndex = 0; exListIndex < this.pool[i].excludeList.length; exListIndex++){
        if(this.pool[i].excludeList[exListIndex].id == exclude.id && this.pool[i].excludeList[exListIndex].bool == exclude.bool){
          this.pool.splice(i, 1);//刪除該index元素
          i--;//index調整
          break;
        }
      }
    }
  }
};
QuestionPool.prototype.findQuestionIndexById = function (questionId) {
  var questionIndex = null;
  for(var i = 0; i < this.pool.length; i++){
    if(this.pool[i].id == questionId){
      questionIndex = i;
      break;
    }
  }
  return questionIndex;//回傳Index
};
QuestionPool.prototype.InitChecking = function () {

  //this.RandomQuestion(Math.floor(Math.random() * this.pool.length));//隨機出題
  this.RandomQuestion(1);//從第一題開始，固定結構
};
QuestionPool.prototype.RandomQuestion = function(recommandQuestionId){
  if(this.pool.length != 0 && recommandQuestionId != null){
    var recommandQuestionIndex = this.findQuestionIndexById(recommandQuestionId);
    this.holdingQuestionIndex = recommandQuestionIndex;//依照建議進行出題
    var question = this.pool[this.holdingQuestionIndex];
    greenBtn.onclick = this.ConfirmQuestionByIndex.bind(this);
    redBtn.onclick = this.DenyQuestionByIndex.bind(this);
    AddMsg('msg_B', question.topic);
  }
  else{//答案
    bg2.className += " full-res-bg2-shine ";
    var _answer, _answer_img;
    var _rdaa,_maa,_saa,_aa;
    _rdaa = this.answerPool.bestAnswer.RDAApoint;
    _maa = this.answerPool.bestAnswer.MAApoint;
    _saa = this.answerPool.bestAnswer.SAApoint;
    _aa = this.answerPool.bestAnswer.AApoint;
    if(_rdaa >= _maa && _rdaa >= _saa && _rdaa >= _aa){
      _answer = '技術助理';
      _answer_img = 'img/RDAA.png';
    }
    else if(_maa >= _rdaa && _maa >= _saa && _maa >= _aa){
      _answer = '行銷助理';
      _answer_img = 'img/MAA.png';
    }
    else if(_saa >= _rdaa && _saa >= _maa && _saa >= _aa) {
      _answer = '協銷助理';
      _answer_img = 'img/SAA.png';
    }
    else if(_aa >= _rdaa && _aa >= _maa && _aa >= _saa){
      _answer = '行政助理';
      _answer_img = 'img/AA.png';

    }
    document.getElementById('effect_star').className += " in";
    setTimeout(function(){document.getElementById('effect_star').className = '';},1000)
    AddMsg('msg_B', "<img width='80px' src=" + _answer_img + "><span class='yellow-mark'>" + _answer + "</span>");
    againBtn.style.display = "inline-block";
    greenBtn.style.display = "none";
    redBtn.onclick = WrongAnswerRecord;//line 257
  }
}
QuestionPool.prototype.ConfirmQuestionByIndex = function(){
  this.answerPool.answerList[0].RDAApoint += this.pool[this.holdingQuestionIndex].confirmPoint[0];
  this.answerPool.answerList[0].MAApoint += this.pool[this.holdingQuestionIndex].confirmPoint[1];
  this.answerPool.answerList[0].SAApoint += this.pool[this.holdingQuestionIndex].confirmPoint[2];
  this.answerPool.answerList[0].AApoint += this.pool[this.holdingQuestionIndex].confirmPoint[3];
  var recommandQuestionId = this.answerPool.reflashAnswer(new QuestionResult(this.pool[this.holdingQuestionIndex].id, true));
  this.DivPoolByExclude(new Exclude(this.pool[this.holdingQuestionIndex].id, true));//排除
  this.pool.splice(this.holdingQuestionIndex, 1);//刪除該index元素
  this.RandomQuestion(recommandQuestionId);//下一個問題
}
QuestionPool.prototype.DenyQuestionByIndex = function () {
  //拒絕之後，要依照權重來決定是否刪除該答案，並且重新設定第二解為答案
  var recommandQuestionId = this.answerPool.reflashAnswer(new QuestionResult(this.pool[this.holdingQuestionIndex].id, false));
  this.DivPoolByExclude(new Exclude(this.pool[this.holdingQuestionIndex].id, false));//排除
  this.pool.splice(this.holdingQuestionIndex, 1);//刪除該index元素
  this.RandomQuestion(recommandQuestionId);//下一個問題
};

//答案
function Answer(title, questionResultList){
  this.title = title;
  this.probability = 0;
  this.correctCount = 0;
  this.RDAApoint = 0;
  this.MAApoint = 0;
  this.SAApoint = 0;
  this.AApoint = 0;
  this.questionResultList = questionResultList;
  this.questionOriginCount = questionResultList.length;
}
Answer.prototype.calcProbabilityByQuestionResult = function (q) {
  for (var i = 0; i < this.questionResultList.length; i++) {
    if(this.questionResultList[i].id == q.id){
      if(this.questionResultList[i].bool == q.bool){
        this.questionResultList.splice(i, 1);//刪除該結果元素，以保持代問問題為最新
        this.correctCount++;
      }
      else{
        this.questionResultList.splice(i, 1);//刪除該結果元素，以保持代問問題為最新
        this.correctCount = 0;
      }
    }
  }
  this.probability = this.correctCount / this.questionOriginCount;
};
Answer.prototype.recommandQuestionId = function(){
  if(this.questionResultList.length != 0){
    return this.questionResultList[0].id;//從最前方選取問題
  }
  else{
    //正確數量 等於 題目數量
    //解答機率等於 1
    return null;
  }
}
//答案池
function AnswerPool(){
  this.bestAnswer = null;
  this.secondAnswer = null;//第二個可能的答案
  this.answerList = []
  this.answerTotalCount = 0;
}
AnswerPool.prototype.AddAnswer = function (answer) {
  this.answerList.push(answer);
  this.bestAnswer = answer;//預設最佳答案為最後一個加入答案池的答案
  this.secondAnswer = answer;//預設第二答案
  this.answerTotalCount++;
};
AnswerPool.prototype.reflashAnswer = function (questionResult) {
  for(var i = 0 ; i < this.answerList.length ; i++){
    if(this.answerList[i] != null){//Safty Check
      this.answerList[i].calcProbabilityByQuestionResult(questionResult);
      if(this.answerList[i].probability > this.bestAnswer.probability){//出現更動
        this.secondAnswer = this.bestAnswer;
        this.bestAnswer = this.answerList[i];
      }
      if(isDebugMode){
        console.log(this.answerList[i].title + " 目前機率 : " + this.answerList[i].probability);
      }
    }
  }
  var recommandQuestionId = this.bestAnswer.recommandQuestionId();
  if(isDebugMode){
    console.log(recommandQuestionId);
  }
  return recommandQuestionId;
};

function InitChecking(){
  bg2.className = "full-res-bg2";
  questionPool = new QuestionPool();
  questionPool.addQuestion(new Question(1,"比起照著前人做事，你更喜歡創新挑戰的工作 ?",[],[0,1,0,0]));//[rdaa , maa , saa , aa]
  questionPool.addQuestion(new Question(2,"比起彈性的工作時間，你更喜歡規律的工作時間 ?",[],[0,1,0,0]));
  questionPool.addQuestion(new Question(3,"你是否是個富有豐富想像力並且勇於實現的人",[],[0,1,0,0]));
  questionPool.addQuestion(new Question(4,"對於市場分析你是否有興趣",[],[0,1,0,0]));
  questionPool.addQuestion(new Question(5,"是否有社群行銷(粉絲專頁)經營的經驗",[],[0,1,0,0]));
  questionPool.addQuestion(new Question(6,"對於藝術美術是否客觀敏銳",[],[0,1,0,0]));
  questionPool.addQuestion(new Question(7,"本身對於程式語言有所接觸了解",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(8,"本身是否為資訊相關科系背景",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(9,"是否有完整系統開發的經驗",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(10,"是否對於科技產業有熱誠",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(11,"比起同儕，你是否更能靠邏輯釐清事情因果",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(12,"對於軟體測試是否有興趣",[],[1,0,0,0]));
  questionPool.addQuestion(new Question(13,"比起整天坐在辦公室，你更喜歡出外跑活動",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(14,"喜歡新鮮感，追求變化，嘗試新奇事物",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(15,"可因應突發狀況隨機應變，反應良好",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(16,"喜歡與人相處，就算是不大熟的朋友也能很健談",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(17,"樂於迎合他人以留給別人良好的印象",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(18,"就算被不講理或冷漠的對待，也能保持高EQ，情緒不輕易受影響",[],[0,0,1,0]));
  questionPool.addQuestion(new Question(19,"行事小心保守，不喜歡突破常規做事",[],[0,0,0,1]));
  questionPool.addQuestion(new Question(20,"較不會有自己的主見，不太干涉他人想法",[],[0,0,0,1]));
  questionPool.addQuestion(new Question(21,"想法實際，遵循慣例，喜歡接受指示做事",[],[0,0,0,1]));
  questionPool.addQuestion(new Question(22,"重視穩定，喜歡規律的的行程規劃",[],[0,0,0,1]));
  questionPool.addQuestion(new Question(23,"比起冒險行事，更喜歡穩紮穩打",[],[0,0,0,1]));
  questionPool.addQuestion(new Question(24,"個性較委婉含蓄，不喜歡交際應酬",[],[0,0,0,1]));
  var answerPool = new AnswerPool();
  answerPool.AddAnswer(new Answer("答案", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, true), new QuestionResult(4, false), new QuestionResult(5, true), new QuestionResult(6, true), new QuestionResult(7, true), new QuestionResult(8, true), new QuestionResult(9, true), new QuestionResult(10, true), new QuestionResult(11, true), new QuestionResult(12, true), new QuestionResult(13, true), new QuestionResult(14, true), new QuestionResult(15, true), new QuestionResult(16, true), new QuestionResult(17, true), new QuestionResult(18, true), new QuestionResult(19, true), new QuestionResult(20, true), new QuestionResult(21, true), new QuestionResult(22, true), new QuestionResult(23, true), new QuestionResult(24, true)]));

  //按鈕復原
  againBtn.style.display = "none";
  againBtn.parentNode.className = "col-xs-6 text-center";
  againBtn.style.marginLeft = "0px";
  greenBtn.style.display = "block";
  redBtn.style.display = "block";
  questionPool.addAnswerPool(answerPool);
  questionPool.InitChecking();
}

function AddMsg(inner_class,text){
  var questionContainer = document.getElementsByClassName('msg_main_msg')[0];
  var questionContainerParent = document.getElementById('question');
  if(questionContainer != null){
    questionContainerParent.style.transition = "none";
    questionContainerParent.style.opacity = 0;
    questionContainer.innerHTML = "<h3 class='inner-msg'>" + text + "</h3>";
    setTimeout(function(){
      questionContainerParent.style.transition = "all .5s ease-in-out";
      questionContainerParent.style.opacity = 1;
    }, 200);
  }
}

/*
questionPool.DivPoolByExclude(new Exclude(1, true));
questionPool.DivPoolByExclude(new Exclude(2, true));
*/


//開始對話
function ShowUpMsgBox(){
  document.getElementById('greeting').style.display = "none";
  document.getElementById('question').style.display = "table-cell";
  bg1.style.display = "block";
  bg2.style.display = "table";
  UpdateImgPos();
  InitChecking();//略過 greeting，直接 RandomQuestion
}
//我想想 點擊，回到一開始的畫面
function ShowUpGreeting(){
  document.getElementById('greeting').getElementsByClassName('contain-white')[0].style.background = "rgba(0,0,0,.8)";
  document.getElementById('greeting').style.display = "block";
  document.getElementById('question').style.display = "none";
}
//機器人猜錯
function WrongAnswerRecord(){
  bg2.className = "full-res-bg2";
  //紀錄使用者錯誤回報
  console.log(JSON.stringify(questionPool));
  //按鈕置中
  againBtn.parentNode.className = "col-xs-12 text-center";
  againBtn.style.marginLeft = "20px";
  redBtn.style.display = "none";//red button hiddeen
  AddMsg("temp", "什麼 ! 我答錯了嗎 ? <br>下一次我會想得更清楚的，再一次。");
}

function UpdateImgPos(){
  //bgStart
  bgStart.style.display = "none";
  //人物
  bg1.style.display = "block";
  bg1.style.left = "50%";
  bg1.style.marginLeft = "-" + (bg1.getClientRects()[0].width / 2.0) + "px"; //置中
  bg1.style.bottom = "250px";
  //水晶球
  bg2.style.zIndex = "1000";
  bg2.style.display = "table";
  bg2.style.width = "450px";
  bg2.style.height = "450px";
  bg2.style.left = "50%";
  bg2.style.marginLeft = "-" + (bg2.getClientRects()[0].width / 2.0) + "px";
  bg2.style.padding = (bg2.getClientRects()[0].width / 4.5) + "px";
  bg2.style.paddingTop = (bg2.getClientRects()[0].width / 10) + "px";
  bg2.style.bottom = "50%";
  bg2.style.marginBottom = "-375px";
}

//更新留言的內容
function UpdateMesBoxContent(){

}
