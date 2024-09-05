<template>
  <div class="setting-wrap">
    <div class="back-box" @click="goBack">
      <div class="back-icon icon">&#xe625;</div>
      <div class="back-label">Back</div>
    </div>
    <div class="setting-box">
      <el-tabs :tab-position="(tabPosition as any)" style="height: 100%">
        <el-tab-pane label="基本设置">
          <div class="setting-contain-box">
            <div class="setting-title">基本设置</div>
            <div class="setting-base-box">
              <!-- left -->
              <div class="setting-context-box">
                <div class="setting-sub-title">邮箱</div>
                <div class="setting-input-box">
                  <el-input v-model="userInfo.mail" placeholder="请输入邮箱"></el-input>
                </div>

                <div class="setting-sub-title">昵称</div>
                <div class="setting-input-box">
                  <el-input v-model="userInfo.nick" placeholder="请输入昵称"></el-input>
                </div>

                <div class="setting-sub-title">个人简介</div>
                <div class="setting-textarea-box">
                  <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="userInfo.desc">
                  </el-input>
                </div>

                <div class="setting-sub-title">国家/地区</div>
                <div class="setting-textarea-box">
                  <el-select v-model="userInfo.country" placeholder="请选择">
                    <el-option v-for="item in countryList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </div>

                <div class="setting-sub-title">所在省市</div>
                <div class="flex-box setting-textarea-box">
                  <div>
                    <el-select v-model="userInfo.province" placeholder="请选择" @change="provinceChange">
                      <el-option v-for="item in provinceList" :key="item.code" :label="item.name" :value="item.code">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="padding-left">
                    <el-select v-model="userInfo.city" placeholder="请选择" :disabled="isDisabled" @change="cityChange">
                      <el-option v-for="item in cityList" :key="item.code" :label="item.name" :value="item.code">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="padding-left">
                    <el-select v-model="userInfo.area" placeholder="请选择" :disabled="isAreaDisabled" @change="areaChange">
                      <el-option v-for="item in areaList" :key="item.code" :label="item.name" :value="item.code">
                      </el-option>
                    </el-select>
                  </div>
                </div>

                <div class="setting-sub-title">街道地址</div>
                <div class="setting-input-box">
                  <el-input v-model="userInfo.address" placeholder="请输入详细地址"></el-input>
                </div>

                <div class="setting-sub-title">联系电话</div>
                <div class="flex-box setting-textarea-box">
                  <!-- <div class="zone-box">
                    <el-input
                      v-model="userInfo.code"
                      placeholder="区号"
                    ></el-input>
                  </div> -->
                  <div class="tel-box">
                    <el-input v-model="userInfo.tel" placeholder="请输入联系电话"></el-input>
                  </div>
                </div>
              </div>
            </div>
            <div class="submit">提交</div>
          </div>
        </el-tab-pane>
        <!-- <el-tab-pane label="配置管理">配置管理</el-tab-pane>
        <el-tab-pane label="角色管理">角色管理</el-tab-pane> -->
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  getCurrentInstance,
  toRefs,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import {
  zmGetProvinces,
  zmGetcities,
  zmGetareas,
  codeToName,
} from "../../utils/zmRegion";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "Home",
  components: {},
  setup() {
    const router = useRouter();
    const {
      appContext: {
        config: { globalProperties },
      },
    } = getCurrentInstance() as any;
    const data = reactive({
      tabPosition: "left",
      userInfo: {
        mail: "",
        nick: "",
        desc: "",
        country: "",
        province: "",
        city: "",
        area: "",
        address: "",
        tel: "",
        avatar: "",
      },
      options: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
      ],
      countryList: [
        {
          value: 1,
          label: "中国",
        },
      ],
      provinceList: zmGetProvinces(),
      cityList: [
        {
          code: "",
          name: "",
          provinceCode: "",
        },
      ],
      areaList: [
        {
          code: "",
          name: "",
          cityCode: "",
          provinceCode: "",
        },
      ],
      fullWidth: document.documentElement.clientWidth, // 获取屏幕宽度
      isDisabled: true, // 市 是否可选
      isAreaDisabled: true, // 地区 是否可选
      enabled: false, // 用户信息是否可以查询
    });
    // 输入事件
    const inputChange = (e: any, key: keyof typeof data.userInfo) => {
      data.userInfo[key] = e;
    };
    // 选择省时的事件
    const provinceChange = (e: any) => {
      data.userInfo.province = e;
      data.cityList = zmGetcities(e);
      data.isDisabled = false;
      if (data.userInfo.city) {
        data.userInfo.city = "";
      }
      data.isAreaDisabled = true;
      if (data.userInfo.area) {
        data.userInfo.area = "";
      }
    };
    // 选择城市时的事件
    const cityChange = (e: any) => {
      data.userInfo.city = e;
      data.areaList = zmGetareas(e);
      data.isAreaDisabled = false;

      if (data.userInfo.area) {
        data.userInfo.area = "";
      }
    };
    // 选择区的事件
    const areaChange = (e: any) => {
      data.userInfo.area = e;
    };

    // 监听屏幕宽度 来调整tabs的标题样式
    const handleResize = () => {
      data.fullWidth = document.documentElement.clientWidth;
    };

    onMounted(() => {
      data.userInfo.country = data.countryList[0].label;
      window.addEventListener("resize", handleResize);
      // 获取已有的用户数据
      if (window.localStorage.getItem("userInfo")) {
        let localUser: any = window.localStorage.getItem("userInfo");
        let localInfo = JSON.parse(localUser);
        console.log(codeToName(localInfo.city));
        let addrList = localInfo.area
          ? codeToName(localInfo.area).items
          : localInfo.city
            ? codeToName(localInfo.city).items
            : [];
        console.log(66, localInfo.province, addrList);
        if (localInfo.province != (addrList[0] && addrList[0].code)) {
          addrList = [];
        }
        data.userInfo = {
          mail: localInfo.mail || "",
          nick: localInfo.nick || "",
          desc: localInfo.desc || "",
          country: "中国",
          province: localInfo.province || "",
          city: (addrList[1] && addrList[1].name) || "",
          area: (addrList[2] && addrList[2].name) || "",
          address: localInfo.address || "",
          tel: localInfo.tel || "",
          avatar: localInfo.avatar || "",
        };
        if (data.userInfo.province) {
          data.cityList = zmGetcities(data.userInfo.province);
          data.isDisabled = false;
        }
        if (data.userInfo.city) {
          data.areaList = zmGetareas(addrList[1].code);
          data.isAreaDisabled = false;
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    watch(
      () => data.fullWidth,
      () => {
        if (data.fullWidth < 768) {
          data.tabPosition = "top";
          return;
        }
        data.tabPosition = "left";
      }
    );

    // 上传图片之前
    const beforeUpload = (file: any) => {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isSVG = file.type === "image/svg+xml";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG && !isPNG && !isSVG) {
        ElMessage.error("头像上传只能是图片!");
      }
      if (!isLt2M) {
        ElMessage.error("上传头像图片大小不能超过 2MB!");
      }
      return (isJPG || isPNG || isSVG) && isLt2M;
    };

    const fnUploadRequest = (options: any) => {
      // console.log(99, options);
      let file = options.file; // 拿到 file
      // 上传文件,这里是上传到OSS的 uploads文件夹下
      globalProperties.$imgUpload(file).then((res: any) => {
        data.userInfo.avatar = res.data.url;
      });
    };

    return {
      ...toRefs(data),
      provinceChange,
      cityChange,
      areaChange,
      beforeUpload,
      fnUploadRequest, 
      inputChange,
      goBack: () => {
        router.back();
      },
    };
  },
});
</script>

<style lang="scss" src="../../assets/styles/setting.scss" scoped></style>
