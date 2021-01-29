import {USERS,SPRIZE, PRIZES, LEADERS} from './default'
const __key__ = "__KEY____"
export const getData = () => {
	const str = localStorage.getItem(__key__)
	const store = typeof str === 'string' && str.length ? JSON.parse(str) : {}
	return store
}
const detect = (luckys) => {
	const result = {}
	Object.keys(luckys).forEach(key => {
		const data = luckys[key].data
		data.forEach(name => {
			if (!result[name]) {
				result[name] = 1
			} else {
				result[name] += 1
			}
		})
	})
	const ret = {}
	Object.keys(result).forEach(name => {
		if (result[name] > 1) {
			ret[name] = result[name]
		}
	})
	if (Object.keys(ret).length === 0) {
		console.log('没有重复')
	} else {
		console.log('重复：', ret)
	}
	
}
export const setData = (type, data) => {
	const store = getData()
	if (!store[type]) {
		const prize = type === -1 ? SPRIZE:  PRIZES.find(item => item.type === type)
		store[type] = {
			type,
			title: prize ? prize.text : '特别奖',
			data: []
		}
	}
	store[type].data = store[type].data.concat(data)
	detect(store)
	localStorage.setItem(__key__, JSON.stringify(store))
}
export const reset = () => {
	localStorage.setItem(__key__, JSON.stringify({}))
}


export const getLeftUser = (luckys) => {
	const luckySet = Object.keys(luckys).reduce((ret, key) => {
		const data = luckys[key].data
		ret = ret.concat(data)
		return ret
	}, [])
	const all = USERS.filter(item => {
		return luckySet.indexOf(item) === -1
	})
	return all
}

export const getLeftLeader = (luckys) => {
	const luckySet = Object.keys(luckys).reduce((ret, key) => {
		const data = luckys[key].data
		ret = ret.concat(data)
		return ret
	}, [])
	const all = LEADERS.filter(item => {
		return luckySet.indexOf(item) === -1
	})
	return all
}

export const getCurrentPrize = (currentIndex) => {
	if (currentIndex === -1) {
		return SPRIZE
	}
	return PRIZES[currentIndex]
}
function download(filename, text) {
	var pom = document.createElement("a");
	pom.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(text)
	  );
	pom.setAttribute("download", filename);
	if (document.createEvent) {
		var event = document.createEvent("MouseEvents");
		event.initEvent("click", true, true);
		pom.dispatchEvent(event);
	} else {
		pom.click();
	}
}
export const exportData = () => {
	const store = getData()
	let str = ''
	Object.keys(store).sort((a, b) => a - b).map(key => {
		const item = store[key]
		str += item.title
		str += '\n'
		str += item.data.join('、')
		str += '\n'
	})
	download('中奖名单', str)
}