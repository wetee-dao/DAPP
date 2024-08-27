#!/bin/sh

# 来源于网络，用于获取当前shell文件的路径
SOURCE="$0"
while [ -h "$SOURCE"  ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /*  ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"

cd "$DIR/../"
current=`date "+%Y%m%d-%H_%M_%S"`
ENV=`git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3`
TAG="$ENV.$current"

if [ $# -gt 0 ]; then
  TAG="$1.$current"
fi

# 编译
npm run build

# 登录镜像库
docker login -u=suixu@jxspy.com -p=Jx201501 registry.cn-hangzhou.aliyuncs.com

# 编译镜像
docker buildx build \
  --platform linux/amd64 \
  --push -t "registry.cn-hangzhou.aliyuncs.com/asyoume/baas_ui:$TAG" .

# 提交代码
git commit -a -m "构建  $TAG"
git tag -a $TAG -m "环境 $TAG"
git push origin $TAG