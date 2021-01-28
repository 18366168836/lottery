/**
 * 奖品设置
 * type: 唯一标识，0是默认特别奖的占位符，其它奖品不可使用
 * count: 奖品数量
 * title: 奖品描述
 * text: 奖品标题
 * img: 图片地址
 */
const prizes = [
  {
    type: 1,
    count: 1,
    text: "一等奖",
    title: "Iphone12",
    img: "../img/1.jpg"
  },
  {
    type: 2,
    count: 2,
    text: "二等奖",
    title: "Ipad",
    img: "../img/2.jpg"
  },
  {
    type: 3,
    count: 3,
    text: "三等奖",
    title: "HUAWEI FreeBuds Pro",
    img: "../img/3.jpg"
  },
  {
    type: 4,
    count: 4,
    text: "三等奖",
    title: "苏泊尔多功能养生壶×2",
    img: "../img/4.jpg"
  },
  {
    type: 5,
    count: 30,
    text: "阳光普照",
    title: "苏泊尔多功能养生壶",
    img: "../img/4.jpg"
  },
];

/**
 * 一次抽取的奖品个数与prizes对应
 */
const EACH_COUNT = [1, 2, 3, 4, 10];

/**
 * 卡片公司名称标识
 */
const COMPANY = "";

module.exports = {
  prizes,
  EACH_COUNT,
  COMPANY
};












































































































































































































































































