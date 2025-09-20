<script setup lang="ts" name="customerManage">
import type { UserLoginVo } from "~/base/api/log.ts";
import { UserLoginLog } from "~/base/api/log.ts";
import type {
  MaProTableExpose,
  MaProTableOptions,
  MaProTableSchema,
} from "@mineadmin/pro-table";
import type { Ref } from "vue";
import getColumns from "./data/column.tsx";
import getSearchItems from "./data/search.tsx";
import { ResultCode } from "@/utils/ResultCode.ts";
import { useMessage } from "@/hooks/useMessage.ts";
defineOptions({
  name: "customerManage", // 组件名，MineAdmin 通过此名识别缓存
});

const t = useTrans().globalTrans;
const proTableRef = ref<MaProTableExpose>() as Ref<MaProTableExpose>;
const selections: Ref<UserLoginVo[]> = ref([]);
const msg = useMessage();
const multiple = ref(true);
const searchData = ref<{ [key: string]: any; username: string }>({
  username: "",
});
async function clickDelete() {
  const ids = selections.value.map((value: UserLoginVo) => value.id);
  msg.confirm(t("crud.delMessage")).then(async () => {
    const res = await UserLoginLog.delete(ids);
    if (res.code === ResultCode.SUCCESS) {
      proTableRef.value.refresh();
    }
  });
}

const options = ref<MaProTableOptions>({
  // 表格距离底部的像素偏移适配
  adaptionOffsetBottom: 231,
  header: {
    show: false,
  },
  toolbar: false,

  // 表格参数
  tableOptions: {
    size: "large",
    pagination: {
      background: true,
    },
    on: {
      // 表格选择事件
      onSelectionChange: (selection: any[]) => (selections.value = selection),
    },
  },
  searchOptions: {
    foldRows: 0,
  },
  // 请求配置
  requestOptions: {
    api: UserLoginLog.page,
  },
});
// 架构配置
const schema = ref<MaProTableSchema>({
  // 搜索项
  searchItems: getSearchItems(t),
  // 表格列
  tableColumns: getColumns(t),
});

const getClient = () => {
  proTableRef.value?.search(searchData.value);
};
const handleDelete = () => {};
</script>

<template>
  <div class="mine-layout">
    <MaProTable ref="proTableRef" :options="options" :schema="schema">
      <template #search>
        <!-- <template #default="scope"></template> -->

        <div class="handleBox">
          <div class="handleBox_left">
            <el-button type="primary" class="handleBox_left_btn"
              ><ma-svg-icon name="i-ep:Plus" class="ma_icon" />添加</el-button
            >
            <el-button class="handleBox_left_btn">
              <ma-svg-icon
                name="i-ep:download"
                class="ma_icon"
              />导入</el-button
            >
            <el-button class="handleBox_left_btn"
              ><ma-svg-icon name="i-ep:upload" class="ma_icon" />导出</el-button
            >
            <el-dropdown size="large">
              <el-button type="primary" plain class="handleBox_left_btn">
                批量操作<ma-svg-icon name="i-ep:arrow-down" class="ml-2.5" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- <el-dropdown-item :disabled="single" @click="handleEdit">编辑</el-dropdown-item> -->
                  <el-dropdown-item :disabled="multiple" @click="handleDelete"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="handleBox_right flex">
            <el-form-item prop="username">
              <el-input
                v-model="searchData.username"
                placeholder="搜索客户名称或编码"
                class="input-with-select"
                @keyup.enter="getClient"
              >
                <template #append>
                  <el-button type="primary" @click="getClient"
                    ><ma-svg-icon
                      name="i-ep:search"
                      class="ma_icon"
                    />搜索</el-button
                  >
                </template>
              </el-input>
            </el-form-item>

            <el-button class="handleBox_right_btn" icon=""
              ><ma-svg-icon
                name="i-ep:refresh-left"
                class="ma_icon"
              />筛选</el-button
            >
          </div>
        </div>
      </template>
    </MaProTable>
  </div>
</template>

<style scoped lang="scss"></style>
