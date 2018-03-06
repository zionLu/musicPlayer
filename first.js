/*var playbtn = document.getElementById("play");
var pausebtn = document.getElementById("pause");
var nextbtn = document.getElementById("next");
var musicName = document.getElementById("musicName")
var audioTag = document.getElementById("music");
var musicList = document.getElementById("list");*/
var count = 0; //用于记录当前播的是第几首（flag）
var listIsInside = true;//用于记录歌单是否处于隐藏状态（flag）
var ang = 0;//图标旋转角度
var spinning = null;//图标旋转动画


//总加载
window.onload =function(){//注意要带括号！！！
	setVol();//音量显示加载
	setBtn();//按键(类按键，如进度条，音量条，歌单)事件总加载
	loadList();//歌单加载
	setList();//歌单css样式DOM重载
	setPlayerWidth();//操控界面css样式DOM重载
	setVolFild();//音量条样式重载
	slideRunning();//进度条动画
	showNow();//显示当前时间进程
	setAudioAPI();
	spectrogram(); /*频谱分析图动画*/
	change();/*背景切换*/
}

//按键(类按键，如进度条，音量条，歌单)事件总加载
function setBtn(){
	document.getElementById("play").onclick=setPlayBtn;

	document.getElementById("pause").onclick=setPauseBtn;

	document.getElementById("next").onclick=setNextBtn;

	document.getElementById("list").onclick=setListMoving;

	document.getElementById("skip").onmousemove = showSkip;
	document.getElementById("skip").onmouseout = unShowSkip;
	document.getElementById("skip").onclick = skip;

	document.getElementById("volFild").onclick = setVilFild;
}


//播放键事件加载
function setPlayBtn(){
	document.getElementById("music").play();//audio标签播放方法
	spin();//图标旋转开始
	document.getElementById("play").style.display = "none";//隐藏播放键
	document.getElementById("pause").style.display = "block";//显示暂停键
}

//暂停键事件加载
function setPauseBtn(){
	document.getElementById("music").pause();//audio标签暂停方法
	document.getElementById("play").style.display = "block";//显示播放键
	document.getElementById("pause").style.display = "none";//隐藏暂停键
	clearTimeout(spinning);//停止图标旋转动画
}

//切歌键事件加载
function setNextBtn(){
	if(spinning == null) spin();//先触发事件，否则clearTimeOut会找不到spinning
	clearTimeout(spinning);//切歌，歌单跳歌，都会触发playbtn.onclick()事件，导致spin动画效果叠加，这里需要先清除效果
	count++;//计数，下一首
	if (count == fileName.length) {count = 0;}//列表循环播放
	document.getElementById("music").setAttribute("src","music/"+fileName[count]);//更改audio标签src属性
	document.getElementById("musicName").innerHTML = fileName[count];//将歌名显示更改为当前歌名
	ang = 0;//旋转角置零
	document.getElementById("play").onclick();//触发播放键事件
}

//歌单css样式DOM重载（神他妈DOM不能读外部式css样式）
function setList(){//外部式css样式不能通过cssDOM读取，因此在这里从新设置一次
	var elem = document.getElementById("list");
	elem.style.position = "absolute";
	elem.style.left = "98%";
	elem.style.cursor = "pointer";
}

//歌单唤出与收回事件加载
function setListMoving(){
	if (listIsInside == true) {//歌单隐藏中
		listOut();//弹出
		listIsInside = false;//flag标记变量改变，为下一次动作做标记
		document.getElementById("list").style.cursor = "auto";//改变鼠标指针形状
		return true;
	}
	if (listIsInside == false) {//歌单显示中
		listIn();//收走
		listIsInside = true;//flag标记变量改变，为下一次动作做标记
		document.getElementById("list").style.cursor = "pointer";//改变鼠标指针形状
		return true;
	}

}

//歌单唤出动画
function listOut(){
	var elem = document.getElementById("list");
	var x = parseInt(elem.style.left);//获取歌单right属性
	if (x == 0) {//动画终结标记
		
		return true;
	}
	if (x > 0) {//未终结前，每次左移
		x--;
	}
	elem.style.left = x+"%";//重设歌单的right属性
	movement = setTimeout("listOut()",2);

}

//歌单收回动画
function listIn(){//思路大致同上
	var elem = document.getElementById("list");
	var x = parseInt(elem.style.left);
	if (x == 98) {
		
		return true;
	}
	if (x < 98) {
		x++;
	}
	elem.style.left = x+"%";
	movement = setTimeout("listIn()",2);
}


//歌单加载
function loadList(){
	var fileNeedToAdd;
	for (var i = 0; i < fileName.length; i++) {//关联musicName.js中的fileName数组
		fileNeedToAdd = document.createElement("p");//创建<p>节点
		fileNeedToAdd.innerHTML = fileName[i];//设置节点内容
		fileNeedToAdd.setAttribute("class","musicNameInList");//设置class
		fileNeedToAdd.setAttribute("title",""+i);//设置title(这里的用意主要是用于onclick事件更改audio标签src)
		fileNeedToAdd.onclick = function(){
			if(spinning == null) spin();//先触发事件，否则clearTimeOut会找不到spinning
			clearTimeout(spinning);//切歌，歌单跳歌，都会触发playbtn.onclick()事件，导致spin动画效果叠加，这里需要先清除效果
			document.getElementById("music").setAttribute("src","music/"+fileName[parseInt(this.title)]);//更改audio标签src属性(此处不能单纯用fileName[i]或者设全局变量，因为触发这个onclick事件时，局部变量往往已经释放，全局变量也往往变成遍历的最后一值，皆非所需值)
			document.getElementById("play").onclick();//触发播放键事件
			count = parseInt(this.title);//利用title改变count
			ang = 0;//转角置零
			document.getElementById("musicName").innerHTML = fileName[count];//更改当前播放歌名
		}
		document.getElementById("list").appendChild(fileNeedToAdd);//将该节点作为子节点添加进歌单

	}
}

//进度条css样式DOM重载
function setSlide(){//外部式css样式不能通过cssDOM读取，因此在这里从新设置一次
	var elem = document.getElementById("slide");
	elem.style.position = "absolute";
	elem.style.left = "-100%";
}

//进度条动画
function slideRunning(){
	var elem = document.getElementById("slide");
	var x = parseFloat(elem.style.left);//获取进度条left属性
	var rate = document.getElementById("music").currentTime/document.getElementById("music").duration;//计算当前歌曲播放进度
	if (rate == 1) {//播放至结尾，切歌
		document.getElementById("next").onclick();
	}
	rate = rate - 1; 
	rate *= 100;
	rate += "%";
	elem.style.left = rate;//利用计算的进度重设进度条的left
	movement = setTimeout("slideRunning()",100);
}

function setPlayerWidth(){//重设操控界面的宽度(等下计算进度条长度和跳跃时间会用到)
	document.getElementById("player").style.width = "512px";
}

//显示跳跃时间
function showSkip(event){//火狐Firefox中使用了不同的事件对象模型，不同于IE Dom，用的是W3C Dom。Firefox DOM中并无event（http://blog.sina.com.cn/s/blog_7e5841350101dgq9.html）
	var e = event || window.event;
	var pointing = e.clientX - (window.innerWidth - parseFloat(document.getElementById("player").style.width))/2 ;//当前指针所在位置相对于进度条左端的长度（这里的0.3可能需要改动）
	var long = parseFloat(document.getElementById("player").style.width);//计算进度条总长
	var current = document.getElementById("music").duration * pointing / long;//由此换算出当前比例并应用于歌长
	var sec = parseInt(current)%60;//计秒
	var min = (parseInt(current)-sec)/60;//计分
	if(min<10) min="0"+min;
	if(sec<10) sec="0"+sec;//未满10，前置“0”
	document.getElementById("skipTo").innerHTML= min + ":" + sec;//最后显示出来
}
 //鼠标移开时不显示
function unShowSkip(){
	document.getElementById("skipTo").innerHTML = "";
}

//跳跃
function skip(event){//计算道理同showSkip
	var e = event || window.event;
	var pointing = e.clientX - (window.innerWidth - parseFloat(document.getElementById("player").style.width))/2  ;
	var long = parseFloat(document.getElementById("player").style.width);
	var current = document.getElementById("music").duration * pointing / long;
	document.getElementById("music").currentTime = current;//改变audio标签播放进度
}

//显示当前时间进程
function showNow(){//思路基本相同
	var elem = document.getElementById("now");
	var sec = parseInt(document.getElementById("music").currentTime)%60;
	var	min = (parseInt(document.getElementById("music").currentTime)-sec)/60;
	if(min<10) min="0"+min;
	if(sec<10) sec="0"+sec;
	elem.innerHTML = min + ":" + sec;
	timeRunning = setTimeout("showNow()",100);
}

//图标旋转
function spin(){
	var elem = document.getElementById("img");
	elem.style.transform = "rotate("+ang+"deg)";//重设转角
	elem.style.msTransform = "rotate("+ang+"deg)";/* IE 9 */
	elem.style.mozTransform = "rotate("+ang+"deg)";/* Firefox */
	elem.style.webkitTransform = "rotate("+ang+"deg)";/* Safari and Chrome */
	elem.style.oTransform = "rotate("+ang+"deg)";/* Opera */
	ang+=0.3;//转角递增
	spinning = setTimeout("spin()",20);
}

//音量条样式重载
function setVolFild(){
	document.getElementById("volFild").style.width = "15%";
	document.getElementById("volFild").style.left = "82%";
}

//音量显示加载
function setVol(){
	var elem = document.getElementById("vol");
	
	elem.style.width = parseInt(document.getElementById("music").volume*parseInt(document.getElementById("volFild").width))+"%";//将audio标签的volume百分比换算成音量条填充高度
	document.getElementById("volum").innerHTML = "vol:"+document.getElementById("music").volume*100;//显示当前音量
}

//音量调节事件加载
function setVilFild(event){//思路同进度条
	var e = event || window.event;
	var pointing = e.clientX - (window.innerWidth - parseFloat(document.getElementById("player").style.width))/2 - parseFloat(document.getElementById("volFild").style.left)/100 * parseFloat(document.getElementById("player").style.width) ;
	var long = 0.15 * 512;
	var volume = pointing / long;
	document.getElementById("music").volume = volume;
	document.getElementById("vol").style.width = volume*parseInt(document.getElementById("volFild").style.width)+"%";
	document.getElementById("volum").innerHTML = "vol:"+parseInt(document.getElementById("music").volume*100.0);
}

/************************************************************************************/
//以下为背景自动变换相关代码
var fade = 0;//用于标记消失的背景
var appear = 1;//用于标记出现的背景
var pic = document.getElementsByClassName("bg");//获取各张图片
for (var i = 1; i < pic.length; i++) {//初始化各图片的透明值
	pic[i].style.opacity = "0";
}
pic[0].style.opacity = "1";

function change(){//交替大周期
	changeWile();
	
	changeCurcit = setTimeout("change()",10000);
}

function changeWile(){//交替期(跟交替大周期的关系感觉就像细胞分裂期和整个分裂周期)
	var x = parseFloat(pic[fade].style.opacity);
	var y = parseFloat(pic[appear].style.opacity);
	if (x<=0.0||y>=1.0) {//消失者透明度递减，出现者透明度递增
		fade++;
		appear++;
		if (fade == pic.length) {fade = 0;}
		if(appear == pic.length) {appear = 0;}
		return true;
	}
	x -= 0.05;
	y += 0.05;
	pic[fade].style.opacity = x+"";
	pic[appear].style.opacity = y+"";
	changeing = setTimeout("changeWile()",30);
}



//注意，DOM获取样式是XXX.style.XXX，不是XXX.XXX
//注意，DOM获取样式，返回的是一个字符串

/******************************************************************************************/

//以下为web audio API相关代码(用于频谱分析，就是那个音乐一响就一直在动的东西)
//详见https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
var context;
//var source;
var analyser;
var output;
function setAudioAPI(){
	/*
		if (window.AudioContext) {context = new AudioContext();}
		else if (window.webkitAudioContext) {context = new webkitAudioContext();}
		else if (window.safariAudioContext) {context = new safariAudioContext();}
		else{return false;}
		var audio = document.getElementById("music");
		//if(!context.createMediaElementSource||!context.createAnalyser){return false;}

		source = context.createMediaElementSource(audio);
		analyser = context.createAnalyser();
		source.connect(analyser);
		analyser.connect(context.destination);
		var length = analyser.frequencyBinCount;
		output = new Uint8Array(length);
	*/
}
//为后来的每个小块样式设置做准备
var gb = new Array();
var gb0 = document.getElementsByClassName("gb0");
var gb1 = document.getElementsByClassName("gb1");
var gb2 = document.getElementsByClassName("gb2");
var gb3 = document.getElementsByClassName("gb3");
var gb4 = document.getElementsByClassName("gb4");
var gb5 = document.getElementsByClassName("gb5");
var gb6 = document.getElementsByClassName("gb6");
var gb7 = document.getElementsByClassName("gb7");
var gb8 = document.getElementsByClassName("gb8");
var gb9 = document.getElementsByClassName("gb9");

function spectrogram(){//就是将不同频率域内的噪度值赋给不同的小块，使之可视化(当然要周期性刷新并重新赋值咯)
	try{
		analyser.getByteFrequencyData(output);
	}catch(error){
		return false;
	}
	//if (!analyser.getByteFrequencyData) {return false;}
	gb[0] = 0;
	for (var i = 0; i < 93; i++) {
		gb[0] += output[i];
	}
	gb0[0].style.height = gb0[1].style.height = gb[0]/94/2 + "%";

	gb[1] = 0;
	for (var i = 93; i < 187; i++) {
		gb[1] += output[i];
	}
	gb1[0].style.height = gb1[1].style.height = gb[1]/94/2 + "%";

	gb[2] = 0;
	for (var i = 187; i < 281; i++) {
		gb[2] += output[i];
	}
	gb2[0].style.height = gb2[1].style.height = gb[2]/94/2 + "%";

	gb[3] = 0;
	for (var i = 281; i < 375; i++) {
		gb[3] += output[i];
	}
	gb3[0].style.height = gb3[1].style.height = gb[3]/94/2 + "%";

	gb[4] = 0;
	for (var i = 375; i < 469; i++) {
		gb[4] += output[i];
	}
	gb4[0].style.height = gb4[1].style.height = gb[4]/94/2 + "%";

	gb[5] = 0;
	for (var i = 469; i < 563; i++) {
		gb[5] += output[i];
	}
	gb5[0].style.height = gb5[1].style.height = gb[5]/94/2 + "%";

	gb[6] = 0;
	for (var i = 563; i < 657; i++) {
		gb[6] += output[i];
	}
	gb6[0].style.height = gb6[1].style.height = gb[6]/94/2 + "%";

	gb[7] = 0;
	for (var i = 657; i < 751; i++) {
		gb[7] += output[i];
	}
	gb7[0].style.height = gb7[1].style.height = gb[7]/94/2 + "%";

	gb[8] = 0;
	for (var i = 751; i < 854; i++) {
		gb[8] += output[i];
	}
	gb8[0].style.height = gb8[1].style.height = gb[8]/94/2 + "%";

	gb[9] = 0;
	for (var i = 854; i < 939; i++) {
		gb[9] += output[i];
	}
	gb9[0].style.height = gb9[1].style.height = gb[9]/94/2 + "%";

	setTimeout("spectrogram()",20);
}

//啊，好可怕，要不是有大神指导恐怕还不能这么快做出这个频谱图来
//似乎弄的东西太多了......