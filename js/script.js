var bg1,bg2,bg3;

$(document).ready(function () {
  bg1 = document.getElementsByClassName('full-res-bg1')[0];
  bg2 = document.getElementsByClassName('full-res-bg2')[0];

});

var activedMesBoxArray = [];
var message_array_A = [
                      ];
//遊戲
var questionPool;
var greenBtn = document.getElementById('greenBtn');
greenBtn.onclick = InitChecking;//開始事件
var redBtn = document.getElementById('redBtn');
redBtn.onclick = ShowUpGreeting;
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
function Question(id,topic,excludeList){
  this.id = id;
  this.topic = topic;
  this.excludeList = excludeList;
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
  greenBtn.innerHTML = "是的";
  redBtn.innerHTML = "不是";
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
    AddMsg('msg_B', '你的答案有' + this.answerPool.bestAnswer.probability + '的機率是 : <span class="yellow-mark">' + this.answerPool.bestAnswer.title + "</span><br>我猜中了嗎 ?");
    greenBtn.innerHTML = "再來一次";
    greenBtn.onclick = InitChecking;
    redBtn.onclick = WrongAnswerRecord;
  }
}
QuestionPool.prototype.ConfirmQuestionByIndex = function(){
  var recommandQuestionId = this.answerPool.reflashAnswer(new QuestionResult(this.pool[this.holdingQuestionIndex].id, true));
  this.DivPoolByExclude(new Exclude(this.pool[this.holdingQuestionIndex].id, true));//排除
  this.pool.splice(this.holdingQuestionIndex, 1);//刪除該index元素
  this.RandomQuestion(recommandQuestionId);//下一個問題
}
QuestionPool.prototype.DenyQuestionByIndex = function () {
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
      console.log(this.answerList[i].title + " 目前機率 : " + this.answerList[i].probability);
    }
  }
  var recommandQuestionId = this.bestAnswer.recommandQuestionId();
  console.log(recommandQuestionId);
  return recommandQuestionId;
};

function InitChecking(){
  questionPool = new QuestionPool();
  questionPool.addQuestion(new Question(1,"第一題 : 這個工作需要常常與人接觸嗎 ?",[]));
  questionPool.addQuestion(new Question(2,"第二題 : 工作的地點通常在辦公室裡嗎 ?",[]));
  questionPool.addQuestion(new Question(3,"第三題 : 這是一個領月薪的工作嗎 ?",[]));
  questionPool.addQuestion(new Question(4,"第四題 : 這個職業特別注重整潔 ?",[]));
  questionPool.addQuestion(new Question(5,"第五題 : 這個職業的人非常重視紀律嗎 ?",[]));
  questionPool.addQuestion(new Question(6,"第六題 : 這是一個生活規律，薪資穩定的職業 ?",[]));
  questionPool.addQuestion(new Question(7,"第七題 : 出國機會多嗎 ?",[]));
  questionPool.addQuestion(new Question(8,"第八題 : 需要領導能力 ?",[]));
  questionPool.addQuestion(new Question(9,"第九題 : 這個職業的人會常常上電視嗎 ?",[]));
  questionPool.addQuestion(new Question(10,"第十題 : 這份工作文筆能力很重要嗎 ?",[]));
  questionPool.addQuestion(new Question(11,"第十一題 : 做這個工作口條要好嗎？",[]));
  questionPool.addQuestion(new Question(12,"第十二題 : 這個職業有制服嗎 ?",[]));
  questionPool.addQuestion(new Question(13,"第十三題 : 這個工作對體能有一定要求 ?",[]));
  questionPool.addQuestion(new Question(14,"第十四題 : 這個職業周休二日嗎 ?",[]));
  questionPool.addQuestion(new Question(15,"第十五題 : 要通過國家考試才可以做這份工作嗎 ?",[]));
  questionPool.addQuestion(new Question(16,"第十六題 : 這個工作要熟悉至少兩種語言 ?",[]));
  questionPool.addQuestion(new Question(17,"第十七題 : 這個職業的人對植物的生長有一定的了解嗎 ?",[]));
  questionPool.addQuestion(new Question(18,"第十八題 : 這個工作要有天馬行空的想像力 ?",[]));
  questionPool.addQuestion(new Question(19,"第十九題 : 這個工作必須了解程式語言嗎 ?",[]));

  var answerPool = new AnswerPool();
  answerPool.AddAnswer(new Answer("軍人", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, true), new QuestionResult(4, false), new QuestionResult(5, true), new QuestionResult(13, true)]));
  answerPool.AddAnswer(new Answer("空服人員", [new QuestionResult(1, true),new QuestionResult(3, true), new QuestionResult(6, false), new QuestionResult(7, true), new QuestionResult(8, false), new QuestionResult(9, false)]));
  answerPool.AddAnswer(new Answer("記者", [new QuestionResult(1, true), new QuestionResult(6, false), new QuestionResult(7, true), new QuestionResult(8, false), new QuestionResult(9, true), new QuestionResult(10, true)]));
  answerPool.AddAnswer(new Answer("業務", [new QuestionResult(1, true), new QuestionResult(6, false), new QuestionResult(7, false), new QuestionResult(11, true)]));
  answerPool.AddAnswer(new Answer("警察", [new QuestionResult(1, true), new QuestionResult(3, true), new QuestionResult(6, true), new QuestionResult(12, true), new QuestionResult(13, false), new QuestionResult(19, false)]));
  answerPool.AddAnswer(new Answer("翻譯", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, false), new QuestionResult(15, false), new QuestionResult(16, true)]));
  answerPool.AddAnswer(new Answer("農夫", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, false), new QuestionResult(17, true)]));
  answerPool.AddAnswer(new Answer("銀行員", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, true), new QuestionResult(18, false), new QuestionResult(19, false)]));
  answerPool.AddAnswer(new Answer("工程師", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, true), new QuestionResult(18, false), new QuestionResult(19, true)]));
  answerPool.AddAnswer(new Answer("廚師", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, true), new QuestionResult(4, true)]));
  answerPool.AddAnswer(new Answer("建築師", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, true), new QuestionResult(4, false), new QuestionResult(5, false)]));
  answerPool.AddAnswer(new Answer("攝影師", [new QuestionResult(1, true), new QuestionResult(6, false), new QuestionResult(7, false), new QuestionResult(11, false)]));
  answerPool.AddAnswer(new Answer("廣告設計", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, true), new QuestionResult(18, true)]));
  answerPool.AddAnswer(new Answer("運動員", [new QuestionResult(1, false), new QuestionResult(2, false), new QuestionResult(3, false), new QuestionResult(17, false)]));
  answerPool.AddAnswer(new Answer("老師", [new QuestionResult(1, true), new QuestionResult(6, true), new QuestionResult(12, false)]));
  answerPool.AddAnswer(new Answer("作者", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, false), new QuestionResult(15, false), new QuestionResult(16, true)]));
  answerPool.AddAnswer(new Answer("律師", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(14, false), new QuestionResult(15, true)]));
  answerPool.AddAnswer(new Answer("藝人", [new QuestionResult(1, true), new QuestionResult(6, false), new QuestionResult(7, true), new QuestionResult(8, false), new QuestionResult(9, true), new QuestionResult(10, false)]));
  answerPool.AddAnswer(new Answer("導遊", [new QuestionResult(1, true), new QuestionResult(6, false), new QuestionResult(7, true), new QuestionResult(8, true)]));
  answerPool.AddAnswer(new Answer("醫生", [new QuestionResult(1, true), new QuestionResult(6, true), new QuestionResult(12, true), new QuestionResult(13, false)]));


  questionPool.addAnswerPool(answerPool);
  questionPool.InitChecking();
}

function AddMsg(inner_class,text){
  var questionContainer = document.getElementsByClassName("msg_body")[0];
  if(questionContainer != null){
    questionContainer.innerHTML += "<div class='msg_line_holder'><div class=" + inner_class + ">" + text + "</div></div>";
  }

  var questionContainer = document.getElementsByClassName('msg_main_msg')[0];
  if(questionContainer != null){
    questionContainer.innerHTML = "<h3 class='inner-msg'>" + text + "</h3>";
  }
}

/*
questionPool.addQuestion(new Question(5,"第五題",[new Exclude(1,false), new Exclude(2,true)]));
questionPool.addQuestion(new Question(6,"第六題",[new Exclude(1,true), new Exclude(3,false)]));
questionPool.addQuestion(new Question(7,"第七題",[new Exclude(1,true), new Exclude(3,true)]));
*/
/*
questionPool.DivPoolByExclude(new Exclude(1, true));
questionPool.DivPoolByExclude(new Exclude(2, true));
*/


//開始對話
function ShowUpMsgBox(){
  document.getElementById('greeting').style.display = "none";
  document.getElementById('question').style.display = "block";
  UpdateImgPos();
}
//我想想 點擊，回到一開始的畫面
function ShowUpGreeting(){
  document.getElementById('greeting').getElementsByClassName('contain-white')[0].style.background = "rgba(0,0,0,.8)";
  document.getElementById('greeting').style.display = "block";
  document.getElementById('question').style.display = "none";
}
//機器人猜錯
function WrongAnswerRecord(){
  //紀錄使用者錯誤回報
  console.log(JSON.stringify(questionPool));
  AddMsg("temp", "什麼 ! 我答錯了嗎 ? <br>下一次我會想得更清楚的，再一次。");
}

function UpdateImgPos(){
  //人物
  bg1.style.left = "50%";
  bg1.style.marginLeft = "-" + (bg1.getClientRects()[0].width / 2.0) + "px"; //置中
  bg1.style.bottom = "250px";
  //水晶球
  bg2.style.width = "450px";
  bg2.style.height = "450px";
  bg2.style.left = "50%";
  bg2.style.marginLeft = "-" + (bg2.getClientRects()[0].width / 2.0) + "px";
  bg2.style.padding = (bg2.getClientRects()[0].width / 4.5) + "px";
  bg2.style.bottom = "50%";
  bg2.style.marginBottom = "-375px";
}

//更新留言的內容
function UpdateMesBoxContent(){

}
