/**
 * 奖品设置
 * type: 唯一标识，0是默认特别奖的占位符，其它奖品不可使用
 * count: 奖品数量
 * title: 奖品描述
 * text: 奖品标题
 * img: 图片地址
 */
const prizes = [
//   {
//     type: 0,
//     count: 0,
//     title: "",
//     text: "特别奖"
//   },
  {
    type: 1,
    count: 5,
    text: "钻石苹果奖",
    title: "水晶小苹果",
    img: "../img/1.jpg"
  },
  {
    type: 2,
    count: 15,
    text: "人才辈出奖",
    title: "大容量笔袋",
    img: "../img/2.jpg"
  },
  {
    type: 3,
    count: 25,
    text: "星光璀璨奖",
    title: "加厚皮笔记本",
    img: "../img/3.jpg"
  },
  {
    type: 4,
    count: 50,
    text: "真我风采奖",
    title: "得力金属笔筒",
    img: "../img/4.jpg"
  },
];

/**
 * 一次抽取的奖品个数与prizes对应
 */
const EACH_COUNT = [5, 5, 10, 20];

/**
 * 卡片公司名称标识
 */
const COMPANY = "";

module.exports = {
  prizes,
  EACH_COUNT,
  COMPANY
};












































































































































































































































































