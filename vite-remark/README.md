使用Vite创建一个最基础的vue模板。
yarn add vite
在生成的项目中安装依赖。
yarn add unocss @unocss/reset
如果要图标预设
@iconify/json
如果要深色模式
@vueuse/core
如果要Unocss的属性化模式（就在unocss里） @unocss/preset-attributify


# 记录一下遇到textarea标签一个神奇的地方。
<textarea>
    </textarea>
开标签和闭标签没有紧挨着，显示的时候多出这些空白符