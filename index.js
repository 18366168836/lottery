const childProcess = require('child_process')
const path = require('path')
const DONE = require('./const').done

const cp = childProcess.spawn('npm.cmd', ['run', 'start'], {
	cwd: path.resolve(__dirname, './server')
})
cp.on('error', (e) => {
	console.log(e.stack)
})
cp.stdout.on('data', data => {
	const str = data.toString()
	console.log('data: ', str)
	// if (new RegExp('^'+DONE).test(str)) {
	// 	console.log('开始启动抽奖页面')
	// 	const pageProcess = childProcess.spawn('npm.cmd', ['run', 'dev'], {
	// 		cwd: path.resolve(__dirname, './product')
	// 	})
	// 	pageProcess.on('error', (e) => {
	// 		console.log(e.stack)
	// 	})
	// 	pageProcess.stdout.on('data', data => {
	// 		console.log('pageProcess:', data.toString())
	// 	})
	// 	pageProcess.stderr.on('data', data => {
	// 		console.log('pageProcess error data--->', data.toString())
	// 	})
	// }
})
cp.stderr.on('data', data => {
	console.log('cp error data===> ', data.toString())
})