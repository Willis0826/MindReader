var bg1,bg2,bg3;

$(document).ready(function () {
  bg1 = document.getElementsByClassName('full-res-bg1')[0];
  bg2 = document.getElementsByClassName('full-res-bg2')[0];

  $("body").mousemove(function(event){
    UpdateBgPosByPercent(event.clientX/$(window).width(), event.clientY/$(window).height());
  });

});

var activedMesBoxArray = [];
var message_array_A = [
                      ];
//遊戲
var questionPool;
var greenBtn = document.getElementById('greenBtn');
greenBtn.onclick = InitChecking;//開始事件
var redBtn = document.getElementById('redBtn');
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
QuestionPool.prototype.InitChecking = function () {
  AddMsg('msg_A','開始吧 !');
  greenBtn.innerHTML = "是的";
  redBtn.innerHTML = "不是";
  this.RandomQuestion();
};
QuestionPool.prototype.RandomQuestion = function(){
  if(this.pool.length != 0){
    this.holdingQuestionIndex = Math.floor(Math.random() * this.pool.length);
    var question = this.pool[this.holdingQuestionIndex];
    greenBtn.onclick = this.ConfirmQuestionByIndex.bind(this);
    redBtn.onclick = this.DenyQuestionByIndex.bind(this);
    AddMsg('msg_B', question.topic);
  }
  else{//答案
    AddMsg('msg_B', '我知道了 !');
    AddMsg('msg_B', '你的答案有' + this.answerPool.bestAnswer.probability + '的機率是，' + this.answerPool.bestAnswer.title);
    AddMsg('msg_B', '我是不是猜中了你心中的答案呢 ? 再來一次嗎')
    greenBtn.innerHTML = "再來一次";
    greenBtn.onclick = InitChecking;
  }
}
QuestionPool.prototype.ConfirmQuestionByIndex = function(){
  AddMsg('msg_A', '是的');
  this.answerPool.reflashAnswer(new QuestionResult(this.pool[this.holdingQuestionIndex].id, true));
  this.DivPoolByExclude(new Exclude(this.pool[this.holdingQuestionIndex].id, true));//排除
  this.pool.splice(this.holdingQuestionIndex, 1);//刪除該index元素
  this.RandomQuestion();//下一個問題
}
QuestionPool.prototype.DenyQuestionByIndex = function () {
  AddMsg('msg_A', '不是');
  this.answerPool.reflashAnswer(new QuestionResult(this.pool[this.holdingQuestionIndex].id, false));
  this.DivPoolByExclude(new Exclude(this.pool[this.holdingQuestionIndex].id, false));//排除
  this.pool.splice(this.holdingQuestionIndex, 1);//刪除該index元素
  this.RandomQuestion();//下一個問題
};

//答案
function Answer(title, questionResultList){
  this.title = title;
  this.probability = 0;
  this.correctCount = 0;
  this.questionResultList = questionResultList;
}
Answer.prototype.calcProbabilityByQuestionResult = function (q) {
  for (var i = 0; i < this.questionResultList.length; i++) {
    if(this.questionResultList[i].id == q.id){
      if(this.questionResultList[i].bool == q.bool){
        this.correctCount++;
      }
    }
  }
  this.probability = this.correctCount / this.questionResultList.length;
};
//答案池
function AnswerPool(){
  this.bestAnswer = null;
  this.answerList = []
  this.answerTotalCount = 0;
}
AnswerPool.prototype.AddAnswer = function (answer) {
  this.answerList.push(answer);
  this.bestAnswer = answer;
  this.answerTotalCount++;
};
AnswerPool.prototype.reflashAnswer = function (questionResult) {
  for(var i = 0 ; i < this.answerList.length ; i++){
    if(this.answerList[i] != null){
      this.answerList[i].calcProbabilityByQuestionResult(questionResult);
      this.bestAnswer = this.answerList[i].probability > this.bestAnswer.probability ? this.answerList[i] : this.bestAnswer;
      console.log(this.answerList[i].probability);
    }
  }
};

function InitChecking(){
  questionPool = new QuestionPool();
  questionPool.addQuestion(new Question(1,"第一題 : 這個工作需要面對人群嗎 ?",[]));
  questionPool.addQuestion(new Question(2,"第二題 : 這個工作通常周休二日 ?",[]));
  questionPool.addQuestion(new Question(3,"第三題 : 這個工作有制服嗎 ?",[]));
  questionPool.addQuestion(new Question(4,"第四題 : 這個工作會接觸大量數字嗎 ?",[]));
  var answerPool = new AnswerPool();
  answerPool.AddAnswer(new Answer("廚師", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(3, true), new QuestionResult(4, false)]));
  answerPool.AddAnswer(new Answer("老師", [new QuestionResult(1, true), new QuestionResult(2, true), new QuestionResult(3, false), new QuestionResult(4, false)]));
  answerPool.AddAnswer(new Answer("工程師", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(3, false), new QuestionResult(4, false)]));
  answerPool.AddAnswer(new Answer("銀行員", [new QuestionResult(1, false), new QuestionResult(2, true), new QuestionResult(3, true), new QuestionResult(4, true)]));
  questionPool.addAnswerPool(answerPool);
  questionPool.InitChecking();
}

function AddMsg(inner_class,text){
  var questionContainer = document.getElementsByClassName("msg_body")[0];
  if(questionContainer != null){
    questionContainer.innerHTML += "<div class='msg_line_holder'><div class=" + inner_class + ">" + text + "</div></div>";
    questionContainer.scrollTop = questionContainer.scrollHeight;
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
}

//更新留言的內容
function UpdateMesBoxContent(){

}

//背景圖片
function UpdateBgPosByPercent(x_percent, y_percent){
  var bg1_x = (x_percent - 0.5) * 40;
  var bg1_y = -35 -(y_percent - 0.5) * 40;
  var bg2_x = (x_percent - 0.5) * 10;
  var bg2_y = -10 -(y_percent - 0.5) * 10;

  bg1.style.left = bg1_x + "px";
  bg1.style.bottom = bg1_y + "px";
  bg2.style.left = bg2_x + "px";
  bg2.style.bottom =  bg2_y + "px";
}
