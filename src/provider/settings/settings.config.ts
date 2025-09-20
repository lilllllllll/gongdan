/**
 * MineAdmin is committed to providing solutions for quickly building web applications
 * Please view the LICENSE file that was distributed with this source code,
 * For the full copyright and license information.
 * Thank you very much for using MineAdmin.
 *
 * @Author X.Mo<root@imoi.cn>
 * @Link   https://github.com/mineadmin
 */
import type { SystemSettings } from "#/global";

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
const globalConfigSettings: SystemSettings.all = {
  /**
   * 请在此处编写或去官网文档站粘贴配置代码
   * https://www.mineadmin.com/useDoc/globalConfigSettings
   */
  // 应用配置
  app: {
    colorMode: "light", // 强制明亮模式
    useLocale: "en_US", // 使用英语
    primaryColor: "#409EFF", // 自定义红色主题
    enableWatermark: false, // 启用水印
    watermarkText: "客户服务管理系统", // 自定义水印文字
    pageAnimate: "ma-slide-right", // 淡入动画
  },

  // 欢迎页配置
  welcomePage: {
    name: "CustomerManage",
    path: "/customer/manage",
    title: "全部客户",
  },

  // 侧边栏配置
  mainAside: {
    showIcon: true,
    showTitle: false, // 隐藏主菜单标题
    enableOpenFirstRoute: true, // 自动打开第一个路由
  },

  // 标签栏配置
  tabbar: {
    enable: false,
    mode: "card", // 卡片模式
  },
  toolBars:[
    { name: "search", show: true },
    { name: "notification", show: false },
    { name: "translate", show: false },
    { name: "settings", show: false },
  ],
  // 版权信息
  copyright: {
    enable: true,
    company: "客户服务管理系统",
    website: "https://mycompany.com",
    putOnRecord: "京ICP备12345678号",
  },
};

export default globalConfigSettings;
