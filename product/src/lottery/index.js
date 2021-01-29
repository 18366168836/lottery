// import "./index.css";
// import "../css/animate.min.css";
import "./canvas.js";
import { PRIZES, USERS, LEADERS} from './default.js'
import { addQipao,  showPrizeList, setPrizeData, resetPrize } from "./prizeList"
import { NUMBER_MATRIX } from "./config.js"
import {setData, getData, getLeftLeader, getLeftUser,  reset, exportData, getCurrentPrize}  from './data.js'

const ROTATE_TIME = 3000;
const BASE_HEIGHT = 1080;
let leaders = [...LEADERS]
let TOTAL_CARDS,
	btns = {
		enter: document.querySelector("#enter"),
		lotteryBar: document.querySelector("#lotteryBar")
	},
	ROW_COUNT = 7,
	COLUMN_COUNT = 17,

	HIGHLIGHT_CELL = [],
	// 当前的比例
	Resolution = 1;

let camera, scene, renderer, controls, threeDCards = [],
	targets = {
		table: [],
		sphere: []
	}

let selectedCardIndex = [],
	rotate = false,
	// 当前抽的奖项，从最低奖开始抽，直到抽到大奖
	currentPrizeIndex, // 为-1是代表特别奖
	// 正在抽奖
	isLotting = false,
	currentLuckys = [];

const basicData = {
	users: [], //所有人员
	luckyUsers: {}, //已中奖人员
	leftUsers: [], //未中奖人员
}
window.basicData = basicData

initAll();

/**
 * 初始化所有DOM
 */
function initAll() {
	HIGHLIGHT_CELL = createHighlight();

	TOTAL_CARDS = ROW_COUNT * COLUMN_COUNT;

	const oldData = getData()

	// 读取当前已设置的抽奖结果
	basicData.luckyUsers = oldData;
	basicData.leftUsers = getLeftUser(oldData); // 获取剩余的用户

	let prizeIndex = PRIZES.length - 1;
	for (; prizeIndex > -1; prizeIndex--) {
		const prizeItem = PRIZES[prizeIndex]
		if (oldData[prizeItem.type] && oldData[prizeItem.type].data.length >= prizeItem.count) {
			continue;
		}
		currentPrizeIndex = prizeIndex;
		break;
	}
	if (currentPrizeIndex === undefined) {
		currentPrizeIndex = -1
	}
	showPrizeList(currentPrizeIndex);
	const curPrize = getCurrentPrize(currentPrizeIndex)
	let curLucks = basicData.luckyUsers[curPrize.type] ? basicData.luckyUsers[curPrize.type].data : [];
	setPrizeData(currentPrizeIndex, curLucks ? curLucks.length : 0, true);

	basicData.users = USERS;

	initCards();
	animate();
	shineCard();
}

function initCards() {
	let member = basicData.users,
		showCards = [],
		length = member.length;

	let isBold = false,
		showTable = basicData.leftUsers.length === basicData.users.length,
		index = 0,
		totalMember = member.length,
		position = {
			x: (100 * COLUMN_COUNT - 20) / 2,
			y: (180 * ROW_COUNT - 20) / 2
		};

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 3000;

	scene = new THREE.Scene();

	for (let i = 0; i < ROW_COUNT; i++) {
		for (let j = 0; j < COLUMN_COUNT; j++) {
			isBold = HIGHLIGHT_CELL.includes(j + "-" + i);
			var element = createCard(
				member[index % length],
				isBold,
				index,
				showTable
			);

			var object = new THREE.CSS3DObject(element);
			object.position.x = Math.random() * 4000 - 2000;
			object.position.y = Math.random() * 4000 - 2000;
			object.position.z = Math.random() * 4000 - 2000;
			scene.add(object);
			threeDCards.push(object);
			//

			var object = new THREE.Object3D();
			object.position.x = j * 120 - position.x;
			object.position.y = -(i * 180) + position.y;
			targets.table.push(object);
			index++;
		}
	}

	// sphere

	var vector = new THREE.Vector3();

	for (var i = 0, l = threeDCards.length; i < l; i++) {
		var phi = Math.acos(-1 + (2 * i) / l);
		var theta = Math.sqrt(l * Math.PI) * phi;
		var object = new THREE.Object3D();
		object.position.setFromSphericalCoords(800 * Resolution, phi, theta);
		vector.copy(object.position).multiplyScalar(2);
		object.lookAt(vector);
		targets.sphere.push(object);
	}

	renderer = new THREE.CSS3DRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("container").appendChild(renderer.domElement);

	//

	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener("change", render);

	bindEvent();

	if (showTable) {
		switchScreen("enter");
	} else {
		switchScreen("lottery");
	}
}

function setLotteryStatus(status = false) {
  	isLotting = status;
}

/**
 * 事件绑定
 */
function handleEvent (target) {
	
    // 如果正在抽奖，则禁止一切操作
    if (isLotting) {
		addQipao("抽慢一点点～～");
		return false;
    }

    
    switch (target) {
	  // 显示数字墙
	  case "resetCards": 
		resetCard()
		break;
      case "welcome":
        switchScreen("enter");
		rotate = false;
        break;
      // 进入抽奖
      case "enter":
        removeHighlight();
        addQipao(`马上抽取[${getCurrentPrize(currentPrizeIndex).title}],不要走开。`);
        // rotate = !rotate;
        rotate = true;
        switchScreen("lottery");
        break;
      // 重置
      case "reset":
        let doREset = window.confirm( "是否确认重置数据，重置后，当前已抽的奖项全部清空？" );
        if (!doREset) {
          	return;
        }
        addQipao("重置所有数据，重新抽奖");
        addHighlight();
        resetCard();
        // 重置所有数据
        currentLuckys = [];
        basicData.leftUsers = Object.assign([], basicData.users);
        basicData.luckyUsers = {};
		currentPrizeIndex = PRIZES.length - 1;
		leaders = [...LEADERS]

        resetPrize(currentPrizeIndex);
        reset();
        switchScreen("enter");
        break;
      // 抽奖
      case "lottery":
		if (btns.lotteryBar.classList.contains("none")) {
			return handleEvent('enter')
		}
		const curPrize = getCurrentPrize(currentPrizeIndex)
		const curLuckys = basicData.luckyUsers[curPrize.type]
		if (currentPrizeIndex === 0 && curLuckys && Array.isArray(curLuckys.data) && curPrize.count <= curLuckys.data.length) {
			resetCard()
			return addQipao(`奖品已经抽完了。`);
		} else {
			addQipao(`正在抽取[${curPrize.title}],调整好姿势`);
		}
        setLotteryStatus(true);
		
        //更新剩余抽奖数目的数据显示
        changePrize();
        resetCard().then(res => {
          // 抽奖
		  lottery();
		  
		});
		
        
        break;
      case "save":
		resetCard().then(res => {
            // 将之前的记录置空
            currentLuckys = [];
		});
		exportData();
		addQipao(`数据已保存到EXCEL中。`);
        break;
    }
}
function bindEvent() {
	document.querySelector("#menu").addEventListener("click", (e) => {
		e.stopPropagation();
		let target = e.target.id;
		handleEvent(target)
	});
	window.addEventListener("keyup", (e) => {
		console.log('e', e)
		let target = ''
		switch(e.key) {
			case ' ': target = 'lottery'; break
			case 'r': target = 'reset'; break
			case 'd': target = 'save'; break
			case 'w': target = 'welcome'; break
			case 'h': target = 'resetCards'; break
			
			// case ' ': target = ''; break
			// case ' ': target = ''; break
		}
		// e.stopPropagation();
		// let target = e.target.id;
		if (target) {
			handleEvent(target)
		}
		
	});

	window.addEventListener("resize", onWindowResize, false);
}

function switchScreen(type) {
	switch (type) {
		case "enter":
			btns.enter.classList.remove("none");
			btns.lotteryBar.classList.add("none");
			transform(targets.table, 2000);
		break;
		default:
			btns.enter.classList.add("none");
			btns.lotteryBar.classList.remove("none");
			transform(targets.sphere, 2000);
		break;
	}
}

/**
 * 创建元素
 */
function createElement(css, text) {
	let dom = document.createElement("div");
	dom.className = css || "";
	dom.innerHTML = text || "";
	return dom;
}

/**
 * 创建名牌
 */
function createCard(user, isBold, id, showTable) {
	var element = createElement();
	element.id = "card-" + id;

	if (isBold) {
		element.className = "element lightitem";
		if (showTable) {
			element.classList.add("highlight");
		}
	} else {
		element.className = "element";
		element.style.backgroundColor =
		"rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
	}


	element.appendChild(createElement("name", user[1]));
	const last = user.substring(1).split('').join('<br/>')
	element.appendChild(createElement("details", last));
	return element;
}

function removeHighlight() {
	document.querySelectorAll(".highlight").forEach(node => {
		node.classList.remove("highlight");
	});
}

function addHighlight() {
	document.querySelectorAll(".lightitem").forEach(node => {
		node.classList.add("highlight");
	});
}

/**
 * 渲染地球等
 */
function transform(targets, duration) {
  // TWEEN.removeAll();
	for (var i = 0; i < threeDCards.length; i++) {
		var object = threeDCards[i];
		var target = targets[i];

		new TWEEN.Tween(object.position)
		.to(
			{
			x: target.position.x,
			y: target.position.y,
			z: target.position.z
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();

		new TWEEN.Tween(object.rotation)
		.to(
			{
			x: target.rotation.x,
			y: target.rotation.y,
			z: target.rotation.z
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();

		// new TWEEN.Tween(object.rotation)
		//     .to({
		//         x: target.rotation.x,
		//         y: target.rotation.y,
		//         z: target.rotation.z
		//     }, Math.random() * duration + duration)
		//     .easing(TWEEN.Easing.Exponential.InOut)
		//     .start();
	}

	new TWEEN.Tween(this)
		.to({}, duration * 2)
		.onUpdate(render)
		.start();
}

function rotateBall() {
	return new Promise((resolve, reject) => {
		scene.rotation.y = 0;
		new TWEEN.Tween(scene.rotation)
		.to(
			{
			y: Math.PI * 8
			},
			ROTATE_TIME
		)
		.onUpdate(render)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start()
		.onComplete(() => {
			resolve();
		});
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function animate() {
  // 让场景通过x轴或者y轴旋转
  // rotate && (scene.rotation.y += 0.088);

	requestAnimationFrame(animate);
	TWEEN.update();
	controls.update();

  // 渲染循环
  // render();
}

function render() {
  	renderer.render(scene, camera);
}

function selectCard(duration = 600) {
	rotate = false;
	let width = currentLuckys.length >= 15 ? 102 : 160,
		tag = -(currentLuckys.length - 1) / 2,
		locates = [];

	// 计算位置信息, 大于5个分两排显示
	if (currentLuckys.length > 5) {
		let yPosition = [-87, 87],
		l = selectedCardIndex.length,
		mid = Math.ceil(l / 2);
		tag = -(mid - 1) / 2;
		for (let i = 0; i < mid; i++) {
		locates.push({
			x: tag * width * Resolution,
			y: yPosition[0] * Resolution
		});
		tag++;
		}

		tag = -(l - mid - 1) / 2;
		for (let i = mid; i < l; i++) {
			locates.push({
				x: tag * width * Resolution,
				y: yPosition[1] * Resolution
			});
			tag++;
		}
	} else {
		for (let i = selectedCardIndex.length; i > 0; i--) {
			locates.push({
				x: tag * width * Resolution,
				y: 0 * Resolution
			});
			tag++;
		}
	}

	let text = currentLuckys
	addQipao(
		`恭喜${text.join("、")}获得${getCurrentPrize(currentPrizeIndex).title}, 新的一年必定旺旺旺。`
	);

	selectedCardIndex.forEach((cardIndex, index) => {
		changeCard(cardIndex, currentLuckys[index]);
		var object = threeDCards[cardIndex];
		new TWEEN.Tween(object.position)
		.to(
			{
			x: locates[index].x,
			y: locates[index].y * Resolution,
			z: 2200
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();

		new TWEEN.Tween(object.rotation)
		.to(
			{
				x: 0,
				y: 0,
				z: 0
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();

		object.element.classList.add("prize");
		tag++;
	});

	new TWEEN.Tween(this)
		.to({}, duration * 2)
		.onUpdate(render)
		.start()
		.onComplete(() => {
		// 动画结束后可以操作
			setLotteryStatus();
		});
}

/**
 * 重置抽奖牌内容
 */
function resetCard(duration = 500) {
	if (currentLuckys.length === 0) {
		return Promise.resolve();
	}

	selectedCardIndex.forEach(index => {
		let object = threeDCards[index],
		target = targets.sphere[index];

		new TWEEN.Tween(object.position)
		.to(
			{
			x: target.position.x,
			y: target.position.y,
			z: target.position.z
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();

		new TWEEN.Tween(object.rotation)
		.to(
			{
			x: target.rotation.x,
			y: target.rotation.y,
			z: target.rotation.z
			},
			Math.random() * duration + duration
		)
		.easing(TWEEN.Easing.Exponential.InOut)
		.start();
	});

	return new Promise((resolve, reject) => {
		new TWEEN.Tween(this)
		.to({}, duration * 2)
		.onUpdate(render)
		.start()
		.onComplete(() => {
			selectedCardIndex.forEach(index => {
				let object = threeDCards[index];
				object.element.classList.remove("prize");
			});
			resolve();
		});
	});
}

/**
 * 抽奖
 */
function lottery() {
	rotateBall().then(() => {
		// 将之前的记录置空
		currentLuckys = [];
		selectedCardIndex = [];
		// 当前同时抽取的数目,当前奖品抽完还可以继续抽，但是不记录数据
		const curPrize = getCurrentPrize(currentPrizeIndex)
		const totalCount = curPrize.count
		let luckys = basicData.luckyUsers[curPrize.type] ? basicData.luckyUsers[curPrize.type].data : [];

		let perCount = curPrize.per,
			leftCount = basicData.leftUsers.length;

		if (perCount + (Array.isArray(luckys) ? luckys.length : 0) > totalCount) {
			perCount = totalCount - luckys.length
		}
		if (Array.isArray(luckys) && luckys.length >= totalCount) {
			return
		} 
		
		if (leftCount === 0) {
			console.log('人员已抽完，现在重新设置所有人员可以进行二次抽奖！')
			addQipao("人员已抽完，现在重新设置所有人员可以进行二次抽奖！");
			const nextGroups = [...basicData.luckyUsers[4].data, ...basicData.luckyUsers[5].data]
			basicData.leftUsers = nextGroups;
			leftCount = basicData.leftUsers.length;
		}
		for (let i = 0; i < perCount; i++) { 
			let luckyId = random(leftCount);
			let name = basicData.leftUsers[luckyId]
			if (currentPrizeIndex <3 && currentPrizeIndex > -1) {
				let index
				if (currentPrizeIndex === 2 && luckys.length === 2) {
					index = random(leaders.length)
				}
				if (currentPrizeIndex === 1 && luckys.length === 1) {
					index = random(leaders.length)
				}
				if (currentPrizeIndex === 0 && luckys.length === 0) {
					index = random(leaders.length)
				}
				
				if (index === undefined) {
					if (LEADERS.includes(name)) {
						i--
						continue
					}
				} else {
					const leader = leaders[index]
					leaders.splice(index, 1)
					let leftIndex = basicData.leftUsers.indexOf(leader)
					if (leftIndex !== -1) {
						luckyId = leftIndex
						name = basicData.leftUsers[luckyId]
					}
				}
			}
			
			if (currentPrizeIndex === 3 || currentPrizeIndex === 4 || currentPrizeIndex === -1) {
				if (LEADERS.includes(name)) {
					i--
					continue
				}
			}
			basicData.leftUsers.splice(luckyId, 1)
			currentLuckys.push(name);
			leftCount--;

			let cardIndex = random(TOTAL_CARDS);
			while (selectedCardIndex.includes(cardIndex)) {
				cardIndex = random(TOTAL_CARDS);
			}
			selectedCardIndex.push(cardIndex);
		}

		// console.log(currentLuckys);
		selectCard();
		// 抽奖后保存抽奖数据
		saveData();
	});
}

/**
 * 保存上一次的抽奖结果
 */
function saveData() {
	const curPrize = getCurrentPrize(currentPrizeIndex)
	let type = curPrize.type
	if (!basicData.luckyUsers[type] || !Array.isArray(basicData.luckyUsers[type].data)) {
		basicData.luckyUsers[type] = {
			type,
			data: []
		}
	}
	let	curLucky = basicData.luckyUsers[type].data

	curLucky = curLucky.concat(currentLuckys);
	basicData.luckyUsers[type].data = curLucky;

	if (curPrize.count <= curLucky.length) {
		currentPrizeIndex--;
		if (currentPrizeIndex < -1) {
			currentPrizeIndex = -1;
		}
	}

	if (currentLuckys.length > 0) {
		// todo by xc 添加数据保存机制，以免服务器挂掉数据丢失
		return setData(type, currentLuckys);
	}
}

function changePrize() {
	const curPrize = getCurrentPrize(currentPrizeIndex)
	let luckys = basicData.luckyUsers[curPrize.type] ? basicData.luckyUsers[curPrize.type].data : [];
	const count = curPrize.count
	let luckyCount = (luckys ? luckys.length : 0) + curPrize.per;
	luckyCount = luckyCount > count ? count : luckyCount
	// 修改左侧prize的数目和百分比
	setPrizeData(currentPrizeIndex, luckyCount);
}

/**
 * 随机抽奖
 */
function random(num) {
	// Math.floor取到0-num-1之间数字的概率是相等的
	return Math.floor(Math.random() * num);
}

/**
 * 切换名牌人员信息
 */
function changeCard(cardIndex, user) {
	if (!user) {
		return
	}
	let card = threeDCards[cardIndex].element;
	const first = user[0]
	const last = user.substring(1).split('').join('<br/>')
	card.innerHTML = `<div class="name">${first}</div><div class="details">${last}</div>`;
}

/**
 * 切换名牌背景
 */
function shine(cardIndex, color) {
	let card = threeDCards[cardIndex].element;
	card.style.backgroundColor = color || "rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
}

/**
 * 随机切换背景和人员信息
 */
function shineCard() {
	let maxCard = 10,
		maxUser;
	let shineCard = 10 + random(maxCard);

	setInterval(() => {
		// 正在抽奖停止闪烁
		if (isLotting) {
			return;
		}
		maxUser = basicData.leftUsers.length;
		for (let i = 0; i < shineCard; i++) {
			let index = random(maxUser),
				cardIndex = random(TOTAL_CARDS);
			// 当前显示的已抽中名单不进行随机切换
			if (selectedCardIndex.includes(cardIndex)) {
				continue;
			}
			shine(cardIndex);
			changeCard(cardIndex, basicData.leftUsers[index]);
		}
	}, 500);
}


function createHighlight() {
	let year = '2021'//new Date().getFullYear() + "";
	let step = 4,
		xoffset = 1,
		yoffset = 1,
		highlight = [];

	year.split("").forEach(n => {
		highlight = highlight.concat(
			NUMBER_MATRIX[n].map(item => `${item[0] + xoffset}-${item[1] + yoffset}`)
		)
		xoffset += step;
	})
	return highlight;
}




window.onload = function() {

	let music = document.querySelector("#music");

	let rotated = 0,
		stopAnimate = false,
		musicBox = document.querySelector("#musicBox");

	function animate() {
		requestAnimationFrame(function() {
			if (stopAnimate) {
				return;
			}
			rotated = rotated % 360;
			musicBox.style.transform = "rotate(" + rotated + "deg)";
			rotated += 1;
			animate();
		});
	}

	musicBox.addEventListener( "click", function(e) {
		if (music.paused) {
			music.play().then(() => {
				stopAnimate = false;
				animate();
			},() => {
				addQipao("背景音乐自动播放失败，请手动播放！");
			});
		} else {
			music.pause();
			stopAnimate = true;
		}
	},false);

	setTimeout(function() {
		musicBox.click();
	}, 1000);
};
