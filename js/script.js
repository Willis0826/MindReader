var bg1,bg2,bg3;

$(document).ready(function () {
  bg1 = document.getElementsByClassName('full-res-bg1')[0];
  bg2 = document.getElementsByClassName('full-res-bg2')[0];

  $("body").mousemove(function(event){
    UpdateBgPosByPercent(event.clientX/$(window).width(), event.clientY/$(window).height());
  });

});

var activedMesBoxArray = [];
var message_array_A = [{type:'A',content:'I say balabalabala'},
                       {type:'B',content:'A say balabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabala'},
                       {type:'A',content:'I say balabalabala'}];

function ShowUpMsgBox(){
  document.getElementById('greeting').style.display = "none";
  document.getElementById('question').style.display = "block";
}

//新增留言
function AddNewMes(mesBox){
  var mes_input = $(mesBox).find('.msg_input')[0];
  //109 ~ 114在一開始可以先跳過
  //這幾行可以幫助妳對html物件綁定一個記號，透過記號妳以後可以知道要對誰進行資料的更新。
  if(mesBox.dataset.userId == 2){
    message_array_A.push({type:"A",content:mes_input.value});
  }
  else if(mesBox.dataset.userId == 3){
    message_array_B.push({type:"A",content:mes_input.value});
  }
  //一開始我們從外面呼叫的時候，把自己的整個mesBox都傳入了函式，所以我們可以獲的很多妳需要的資訊。
  //像是我們可以用childNodes的方式，找到我們要產生新的字串的地方。
  //用innerHTML的方式插入textarea的value。 value 是我們input的內容。
  mesBox.childNodes[1].childNodes[0].innerHTML += '<div class="msg_A">'+ mes_input.value +'</div>';
  $(mes_input).val("");//最後把輸入視窗的textarea清空。
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
