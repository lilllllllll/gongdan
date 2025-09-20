/**
 * MineAdmin is committed to providing solutions for quickly building web applications
 * Please view the LICENSE file that was distributed with this source code,
 * For the full copyright and license information.
 * Thank you very much for using MineAdmin.
 *
 * @Author X.Mo<root@imoi.cn>
 * @Link   https://github.com/mineadmin
 */
import type { MaProTableColumns, MaProTableExpose } from "@mineadmin/pro-table";
import { ElTag } from "element-plus";
import { UserLoginLog } from "~/base/api/log.ts";
import { ResultCode } from "@/utils/ResultCode.ts";
import { useMessage } from "@/hooks/useMessage.ts";

const customerType = {
  0: { text: "个人客户", color: "info" },
  1: { text: "单位客户", color: "success" },
  2: { text: "政府客户", color: "primary" },
};
const customerSource = {
  0: { text: "官网注册", color: "info" },
  1: { text: "老客户推荐", color: "success" },
  2: { text: "广告投放", color: "primary" },
};
const customerLevel = {
  0: { text: "高", color: "success" },
  1: { text: "中", color: "info" },
  2: { text: "低", color: "danger" },
};
const customerStage = {
  0: { text: "潜在客户", color: "warning" },
  1: { text: "意向客户", color: "primary" },
  2: { text: "成交客户", color: "success" },
};
export default function getColumns(t: any): MaProTableColumns[] {
  const dictStore = useDictStore();
  const msg = useMessage();
  return [
    // 多选列
    {
      type: "selection",
      showOverflowTooltip: false,
      label: () => t("crud.selection"),
    },
    // 索引序号列
    { type: "index", width: 50 },
    // 普通列
    { label: () => "客户名称", prop: "username", minWidth: 150 },
    // { label: () => t('baseLoginLog.os'), prop: 'os' },
    { label: () => "联系人", prop: "ip", minWidth: 150 },
    { label: () => "电话", prop: "browser", minWidth: 150 },
    {
      label: () => "客户类型",
      prop: "status",
      cellRender: ({ row }) => (
        <ElTag type={customerType[row.status].color}>
          {customerType[row.status].text}
        </ElTag>
      ),
      minWidth: 150,
    },
    {
      label: () => "客户来源",
      prop: "status",
      cellRender: ({ row }) => (
        <ElTag type={customerSource[row.status].color}>
          {customerSource[row.status].text}
        </ElTag>
      ),
      minWidth: 150,
    },
    {
      label: () => "客户阶段",
      prop: "status",
      cellRender: ({ row }) => (
        <ElTag type={customerStage[row.status].color}>
          {customerStage[row.status].text}
        </ElTag>
      ),
      minWidth: 150,
    },
    {
      label: () => "客户等级",
      prop: "status",
      cellRender: ({ row }) => (
        <ElTag type={customerLevel[row.status].color}>
          {customerLevel[row.status].text}
        </ElTag>
      ),
      minWidth: 150,
    },
    {
      label: () => "所属行业",
      prop: "status",
      minWidth: 150,
    },
    {
      label: () => "区域",
      prop: "status",
      minWidth: 150,
    },
    {
      label: () => "所属部门",
      prop: "status",
      minWidth: 150,
    },
    {
      label: () => "所属人",
      prop: "status",
      minWidth: 150,
    },
    {
      label: () => "客户编号",
      prop: "status",
      minWidth: 150,
    },

    { label: () => "创建时间", prop: "login_time", minWidth: 150 },
    // 操作列
    {
      width: 150,
      fixed: "right",
      type: "operation",
      label: () => t("crud.operation"),
      operationConfigure: {
        type: "tile",
        actions: [
           {
            name: "edit",
            text: () => '详情',
            onClick: ({ row }, proxy: MaProTableExpose) => {

            },
          },
          {
            name: "edit",
            text: () => '编辑',
            onClick: ({ row }, proxy: MaProTableExpose) => {

            },
          },
          // {
          //   name: "del",
          //   icon: "mdi:delete",
          //   linkProps: { underline: "never" },
          //   text: () => t("crud.delete"),
          //   onClick: ({ row }, proxy: MaProTableExpose) => {
          //     msg.delConfirm(t("crud.delDataMessage")).then(async () => {
          //       const response = await UserLoginLog.delete([row.id]);
          //       if (response.code === ResultCode.SUCCESS) {
          //         msg.success(t("crud.delSuccess"));
          //         await proxy.refresh();
          //       }
          //     });
          //   },
          // },
        ],
      },
    },
  ];
}
