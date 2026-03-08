import React, { useEffect, useMemo, useRef, useState } from 'react';
import { submitQuizAnswer, speechToText } from '../api/judgeApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceRecorder from '../components/VoiceRecorder';
import { useJudgeStore } from '../store/judgeStore';
import './QuizPage.css';

// 模拟问答题数据 - 按分类组织
const mockQuizzesByCategory = {
    'HTML': [
        {
            id: 'html1',
            title: 'HTML5 新增的语义化标签',
            difficulty: 'Easy',
            category: 'HTML',
            question: `请列举 HTML5 中新增的语义化标签，并说明它们的作用。`,
            tags: ['HTML5', '语义化', '标签'],
            points: 10,
            referenceAnswer: `**HTML5 新增的语义化标签：**
1. **<header>**：页面或区域的头部
2. **<nav>**：导航链接
3. **<article>**：独立的内容
4. **<section>**：文档中的节
5. **<aside>**：侧边栏内容
6. **<footer>**：页面或区域的底部`,
            hints: ['header、nav、footer', 'article、section、aside']
        },
        {
            id: 'html2',
            title: '块级元素和行内元素的区别',
            difficulty: 'Easy',
            category: 'HTML',
            question: `请说明块级元素和行内元素的区别，并各举3个例子。`,
            tags: ['元素类型', '布局'],
            points: 10,
            referenceAnswer: `**区别：**
1. 块级元素独占一行，行内元素不换行
2. 块级元素可设置宽高，行内元素不可以
3. 块级元素可包含块级和行内，行内只能包含行内

**块级：** div、p、h1-h6
**行内：** span、a、img`,
            hints: ['独占一行 vs 不换行', '可设置宽高 vs 不可设置']
        }
    ],
    'CSS': [
        {
            id: 'css1',
            title: 'CSS 盒模型',
            difficulty: 'Easy',
            category: 'CSS',
            question: `请解释 CSS 盒模型的组成部分，以及标准盒模型和 IE 盒模型的区别。`,
            tags: ['盒模型', '布局', '基础'],
            points: 10,
            referenceAnswer: `**盒模型组成：**
1. Content（内容）
2. Padding（内边距）
3. Border（边框）
4. Margin（外边距）

**区别：**
- 标准盒模型：width = content
- IE盒模型：width = content + padding + border`,
            hints: ['四个组成部分', 'box-sizing 属性']
        },
        {
            id: 'css2',
            title: 'BFC（块级格式化上下文）',
            difficulty: 'Medium',
            category: 'CSS',
            question: `请说明什么是 BFC（块级格式化上下文），如何触发 BFC，以及 BFC 的应用场景。`,
            tags: ['BFC', '布局', '格式化上下文'],
            points: 15,
            referenceAnswer: `**什么是 BFC：**

BFC（Block Formatting Context，块级格式化上下文）是 Web 页面中一个独立的渲染区域，内部元素的布局不会影响到外部元素。

**如何触发 BFC：**

1. **根元素**：html 元素
2. **浮动元素**：float 不为 none
3. **绝对定位元素**：position 为 absolute 或 fixed
4. **display 属性**：inline-block、table-cell、flex、grid 等
5. **overflow 属性**：不为 visible（如 hidden、auto、scroll）

**BFC 的特性和应用：**

1. **防止外边距重叠**
   \`\`\`css
   .container {
       overflow: hidden; /* 创建 BFC */
   }
   \`\`\`

2. **清除浮动**
   \`\`\`css
   .parent {
       overflow: hidden; /* 包含浮动子元素 */
   }
   \`\`\`

3. **防止文字环绕**
   \`\`\`css
   .sidebar { float: left; }
   .content { overflow: hidden; } /* 不被浮动元素覆盖 */
   \`\`\`

4. **自适应两栏布局**
   \`\`\`css
   .left { float: left; width: 200px; }
   .right { overflow: hidden; } /* 自适应剩余宽度 */
   \`\`\``,
            keywords: ['BFC', '格式化上下文', '浮动', 'overflow', '外边距重叠', '清除浮动'],
            hints: [
                'BFC 是独立的渲染区域',
                'overflow: hidden 可以触发',
                '可用于清除浮动',
                '防止 margin 重叠',
                '实现自适应布局'
            ]
        },
        {
            id: 'css3',
            title: 'Flex 布局',
            difficulty: 'Medium',
            category: 'CSS',
            question: `请说明 Flex 布局的主要属性及其作用。`,
            tags: ['Flex', '布局', '响应式'],
            points: 15,
            referenceAnswer: `**容器属性：**
1. flex-direction：主轴方向
2. justify-content：主轴对齐
3. align-items：交叉轴对齐
4. flex-wrap：换行

**项目属性：**
1. flex-grow：放大比例
2. flex-shrink：缩小比例
3. flex-basis：默认大小`,
            hints: ['容器属性 vs 项目属性', '主轴和交叉轴']
        },
        {
            id: 'css4',
            title: 'CSS 选择器优先级',
            difficulty: 'Medium',
            category: 'CSS',
            question: `请说明 CSS 选择器的优先级规则，以及如何计算优先级。`,
            tags: ['选择器', '优先级', '权重'],
            points: 15,
            referenceAnswer: `**优先级规则（从高到低）：**

1. **!important**：最高优先级
2. **内联样式**：style 属性（权重 1000）
3. **ID 选择器**：#id（权重 100）
4. **类、属性、伪类选择器**：.class、[attr]、:hover（权重 10）
5. **元素、伪元素选择器**：div、::before（权重 1）
6. **通配符、子选择器、相邻选择器**：*、>、+（权重 0）

**计算方法：**
- 统计各类选择器的数量
- 从左到右比较权重值
- 权重相同时，后定义的优先

**示例：**
\`\`\`css
div.class #id       /* 权重：100 + 10 + 1 = 111 */
.class1.class2      /* 权重：10 + 10 = 20 */
div p               /* 权重：1 + 1 = 2 */
\`\`\``,
            keywords: ['优先级', '权重', 'important', 'ID选择器', '类选择器'],
            hints: [
                '!important 最高',
                'ID > 类 > 元素',
                '权重可以累加',
                '后定义的覆盖先定义的'
            ]
        },
        {
            id: 'css5',
            title: 'CSS 清除浮动',
            difficulty: 'Medium',
            category: 'CSS',
            question: `为什么需要清除浮动？请说明浮动导致的问题，并列出至少三种常见的清除浮动方法。`,
            tags: ['清除浮动', '布局', 'float', 'BFC', 'clearfix'],
            points: 15,
            referenceAnswer: `**为什么需要清除浮动？**

浮动元素（float）会脱离标准文档流，导致父元素高度塌陷，使背景、边框无法包裹内容，并对后续布局产生影响。因此需要清除浮动，让父元素重新包含浮动子元素。

---

## **常见清除浮动的方法**

### **1. clearfix（伪元素清除浮动，最推荐）**

\`\`\`css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
\`\`\`

**优点：** 兼容性好、不影响布局结构  
**缺点：** 需要额外的类名  

---

### **2. overflow 触发 BFC**

\`\`\`css
.container {
  overflow: auto; /* 或 hidden */
}
\`\`\`

**优点：** 简单、无需额外标记  
**缺点：** overflow 可能隐藏溢出内容或产生滚动条  

---

### **3. display: flow-root（现代方案）**

\`\`\`css
.container {
  display: flow-root;
}
\`\`\`

**优点：** 最简洁，天然生成 BFC  
**缺点：** 不支持 IE（但现代浏览器支持良好）

---

### **4. 添加空元素清除浮动（不推荐）**

\`\`\`html
<div style="clear: both;"></div>
\`\`\`

**缺点：** 破坏语义、增加无意义 DOM

---

**总结**  
float 会导致父元素高度塌陷。最推荐的清除方式是 clearfix 或 flow-root，overflow 可用于简单场景，空元素清除方式已不常用。
`,
            keywords: ['浮动', '清除浮动', 'clearfix', 'overflow', 'flow-root'],
            hints: [
                '浮动会导致父元素高度塌陷',
                'clearfix 是最常用的解决方案',
                'overflow 会触发 BFC',
                'flow-root 是最现代的清除方式'
            ]
        },
        {
            id: 'css6',
            title: 'CSS 垂直居中的方案',
            difficulty: 'Easy',
            category: 'CSS',
            question: `常见的垂直居中方案有哪些？请至少列举三种常见的实现方式，并说明各自的优缺点。`,
            tags: ['垂直居中', '布局', 'flex', 'transform', 'grid'],
            points: 10,
            referenceAnswer: `## 常见的垂直居中方案

---

### **1. Flex 垂直居中（最常用）**
\`\`\`css
.parent {
  display: flex;
  align-items: center;
}
\`\`\`

**优点：** 简单、语义清晰、现代浏览器支持好  
**缺点：** IE9- 不支持

---

### **2. position + transform 垂直居中**
\`\`\`css
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
\`\`\`

**优点：** 精准控制位置，不依赖其他属性  
**缺点：** 父元素必须是定位元素；对响应式布局不如 flex 方便

---

### **3. line-height 垂直居中（仅适用于单行文本）**
\`\`\`css
.text {
  line-height: 200px; /* 等于父容器高度 */
}
\`\`\`

**优点：** 简单  
**缺点：** 只能用于单行文字，无法用于块级元素

---

### **4. Grid 垂直居中（现代方案）**
\`\`\`css
.parent {
  display: grid;
  place-items: center;
}
\`\`\`

**优点：** 最简洁，自动水平 + 垂直居中  
**缺点：** IE 不支持

---

### **5. table-cell 垂直居中（老旧方案）**
\`\`\`css
.parent {
  display: table-cell;
  vertical-align: middle;
}
\`\`\`

**优点：** 兼容性好（包括 IE）  
**缺点：** 破坏布局语义，不推荐用于现代项目

---

**总结**  
Flex 和 Grid 是当前最推荐的垂直居中方案，position+transform 更灵活，line-height 和 table-cell 属于旧方案，用于兼容性场景。
`,
            keywords: ['垂直居中', 'flex', 'transform', 'grid', 'line-height'],
            hints: [
                'flex 是最常用的方法',
                'position + transform 不依赖容器的高度',
                'grid 的 place-items 可以快速居中'
            ]
        },
        {
            "id": "css7",
            "title": "CSS 性能优化方法",
            "difficulty": "Medium",
            "category": "CSS",
            "question": "如果要做优化，CSS 提高性能的方法有哪些？请列举并简要说明。",
            "tags": ["CSS", "性能优化", "关键CSS", "异步加载", "选择器", "重排重绘"],
            "points": 10,
            "referenceAnswer": "## CSS 提高性能的主要方法\n\n---\n\n### **1. 内联首屏关键 CSS**\n- 将首屏渲染所需的最小 CSS 内联到 HTML `<head>` 中，使浏览器在解析完 HTML 后即可立即渲染内容。\n- 避免因等待外部 CSS 文件下载而延迟首屏显示。\n- **注意**：仅内联“关键”CSS（通常几百字节到几KB），避免过大影响 HTML 体积和初始拥塞窗口；其余 CSS 仍应外链以利用缓存。\n\n---\n\n### **2. 异步加载非关键 CSS**\n为避免非关键 CSS 阻塞页面渲染，可采用以下方式异步加载：\n\n- **动态插入 `<link>` 标签（通过 JS）**\n  ```js\n  const myCSS = document.createElement(\"link\");\n  myCSS.rel = \"stylesheet\";\n  myCSS.href = \"mystyles.css\";\n  document.head.appendChild(myCSS);\n  ```\n\n- **使用 `media=\"noexist\"` + `onload` 切换**\n  ```html\n  <link rel=\"stylesheet\" href=\"mystyles.css\" media=\"noexist\" onload=\"this.media='all'\">\n  ```\n  浏览器会异步下载该文件，不阻塞渲染，加载完成后启用。\n\n- **使用 `rel=\"alternate stylesheet\"` + `onload` 切换**\n  ```html\n  <link rel=\"alternate stylesheet\" href=\"mystyles.css\" onload=\"this.rel='stylesheet'\">\n  ```\n\n---\n\n### **3. 压缩 CSS 资源**\n- 使用构建工具（如 Webpack、Rollup、Gulp）对 CSS 进行压缩（minify），去除空格、注释、冗余代码，减小文件体积，加快传输速度。\n\n---\n\n### **4. 优化 CSS 选择器**\n- CSS 匹配规则从右向左进行，复杂嵌套会显著降低匹配效率。\n- **建议**：\n  - 避免超过三层的嵌套选择器；\n  - ID 选择器本身已唯一，无需再嵌套；\n  - 尽量少用通配符 `*`、属性选择器 `[type=\"text\"]` 和 `:nth-child` 等低效选择器。\n\n---\n\n### **5. 避免使用昂贵的 CSS 属性**\n- 某些属性（如 `box-shadow`、`border-radius`、`filter`、`opacity`、`transform` 以外的动画）会触发重绘甚至重排，影响渲染性能。\n- 动画优先使用 `transform` 和 `opacity`，它们可由 GPU 加速，且不会触发重排。\n\n---\n\n### **6. 不要使用 `@import`**\n- `@import` 会阻塞并行下载，导致 CSS 文件串行加载，增加页面加载时间。\n- 应始终使用 `<link rel=\"stylesheet\">` 引入外部样式表。\n\n---\n\n### **7. 其他优化技巧**\n- **减少重排（reflow）和重绘（repaint）**：避免频繁读写布局属性（如 `offsetWidth`、`clientHeight`）。\n- **利用继承**：对可继承的属性（如 `color`、`font-size`）避免重复声明。\n- **CSS Sprites**：将多个小图标合并为一张图，通过 `background-position` 定位，减少 HTTP 请求。\n- **Base64 内联小图标**：对极小的图片（如 <2KB）转为 Base64 内联，减少请求（但注意会增大 HTML/CSS 体积，慎用）。\n\n---\n\n### **总结**\nCSS 性能优化核心在于：**减少阻塞、缩小体积、提升解析与渲染效率**。结合关键 CSS 内联、异步加载、选择器简化和现代动画实践，可显著提升页面加载速度与用户体验。",
            "keywords": ["CSS优化", "关键CSS", "异步加载", "选择器性能", "重排重绘", "@import", "CSS压缩"],
            "hints": [
                "首屏关键CSS建议内联，其余异步加载",
                "避免使用@import，它会阻塞并行下载",
                "动画优先使用transform和opacity，性能更好"
            ]
        },
        {
            id: 'css8',
            title: '两栏布局：左边定宽，右边自适应方案',
            difficulty: 'Easy',
            category: 'CSS',
            question: `如何实现两栏布局：左边定宽，右边自适应？请至少列举三种常见的实现方式，并说明各自的优缺点。`,
            tags: ['两栏布局', '布局', 'flex', 'float', 'grid'],
            points: 10,
            referenceAnswer: `## 两栏布局：左边定宽，右边自适应方案

---

### **1. Flex 布局（最推荐）**
\`\`\`css
.container {
  display: flex;
}
.left {
  width: 200px;
}
.right {
  flex: 1;
}
\`\`\`

**优点：** 代码简洁、语义清晰、易维护、响应式友好  
**缺点：** IE9- 不支持

---

### **2. Float + margin 布局（经典方案）**
\`\`\`css
.left {
  float: left;
  width: 200px;
}
.right {
  margin-left: 200px;
}
\`\`\`

**优点：** 兼容性好（支持 IE6+）  
**缺点：** 需要清除浮动；HTML 结构有顺序要求；不够语义化

---

### **3. Float + BFC 布局**
\`\`\`css
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden; /* 触发 BFC */
}
\`\`\`

**优点：** 不需要计算 margin 值；右侧自动适应  
**缺点：** 需要清除浮动；overflow 可能影响内容显示

---

### **4. Position 绝对定位**
\`\`\`css
.container {
  position: relative;
}
.left {
  position: absolute;
  width: 200px;
}
.right {
  margin-left: 200px;
}
\`\`\`

**优点：** 精确控制位置  
**缺点：** 脱离文档流；高度不易控制；不推荐用于常规布局

---

### **5. Grid 布局（现代方案）**
\`\`\`css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}
\`\`\`

**优点：** 最简洁强大；适合复杂布局  
**缺点：** IE 不支持（IE10/11 需要前缀）

---

### **6. Calc 计算宽度**
\`\`\`css
.left {
  float: left;
  width: 200px;
}
.right {
  float: left;
  width: calc(100% - 200px);
}
\`\`\`

**优点：** 灵活计算宽度  
**缺点：** 需要清除浮动；calc 兼容性 IE9+

---

**总结**  
Flex 和 Grid 是现代项目的首选方案，Float + margin/BFC 适用于需要兼容老旧浏览器的场景。Position 方案不推荐用于常规两栏布局。
`,
            keywords: ['两栏布局', 'flex', 'float', 'grid', '自适应', 'BFC'],
            hints: [
                'flex 布局是最简单的方法',
                'float + margin 是经典的老方案',
                'grid 的 grid-template-columns 可以快速实现'
            ]
        },

    ],
    'JavaScript': [
        {
            id: 'q1',
            title: 'JavaScript 的数据类型有哪些？',
            difficulty: 'Easy',
            category: 'JavaScript',
            question: `请列举 JavaScript 中的所有数据类型，并简要说明每种类型的特点。`,
            tags: ['数据类型', '基础'],
            points: 10,
            referenceAnswer: `JavaScript 有 8 种数据类型：

**基本数据类型（7种）：**
1. **Number**：数字类型，包括整数和浮点数
2. **String**：字符串类型
3. **Boolean**：布尔类型，true/false
4. **Undefined**：未定义类型
5. **Null**：空类型
6. **Symbol**：符号类型（ES6新增）
7. **BigInt**：大整数类型（ES2020新增）

**引用数据类型（1种）：**
8. **Object**：对象类型，包括普通对象、数组、函数、日期等

**特点：**
- 基本类型存储在栈中，按值访问
- 引用类型存储在堆中，按引用访问
- 使用 typeof 可以检测大部分类型（但 null 会返回 'object'）`,
            hints: [
                '基本类型有7种',
                '引用类型主要是Object',
                'ES6新增了Symbol',
                'ES2020新增了BigInt'
            ]
        },
        {
            id: 'q2',
            title: 'typeof 类型判断',
            difficulty: 'Medium',
            category: 'JavaScript',
            question: `typeof 是否能正确判断类型？instanceof 能正确判断对象的原理是什么？`,
            tags: ['typeof', 'instanceof', '类型判断', '原型链'],
            points: 15,
            referenceAnswer: `## typeof 类型判断

---

### **typeof 的判断结果**

\`\`\`javascript
typeof 1              // 'number'
typeof '1'            // 'string'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof Symbol()       // 'symbol'
typeof 10n            // 'bigint'
typeof function(){}   // 'function'

// 注意以下特殊情况
typeof null           // 'object' ❌ （历史遗留bug）
typeof []             // 'object' ❌ （无法区分数组）
typeof {}             // 'object'
typeof new Date()     // 'object' ❌ （无法区分具体对象类型）
\`\`\`

**typeof 的局限性：**
1. **null 判断错误**：\`typeof null\` 返回 \`'object'\`（JavaScript 的历史 bug）
2. **无法区分对象类型**：数组、日期、正则等都返回 \`'object'\`
3. **只能准确判断基本类型**（除了 null）和 function

---

### **instanceof 的原理**

**作用：** 判断对象是否是某个构造函数的实例

\`\`\`javascript
[] instanceof Array        // true
[] instanceof Object       // true
new Date() instanceof Date // true
\`\`\`

**原理：** instanceof 通过**原型链**判断，检查右侧构造函数的 \`prototype\` 是否出现在左侧对象的原型链上。

\`\`\`javascript
// instanceof 的实现原理
function myInstanceof(left, right) {
  // 获取对象的原型
  let proto = Object.getPrototypeOf(left);
  // 获取构造函数的 prototype
  let prototype = right.prototype;
  
  // 沿着原型链查找
  while (true) {
    if (proto === null) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}
\`\`\`

**instanceof 的局限性：**
1. **无法判断基本类型**：\`1 instanceof Number\` 返回 \`false\`
2. **跨 iframe 失效**：不同 iframe 的对象原型链不同
3. **可以被修改**：手动修改 \`prototype\` 会影响判断结果

---

### **更准确的类型判断方法**

\`\`\`javascript
// 使用 Object.prototype.toString.call()
Object.prototype.toString.call(1)          // '[object Number]'
Object.prototype.toString.call('1')        // '[object String]'
Object.prototype.toString.call(true)       // '[object Boolean]'
Object.prototype.toString.call(null)       // '[object Null]' ✅
Object.prototype.toString.call(undefined)  // '[object Undefined]'
Object.prototype.toString.call([])         // '[object Array]' ✅
Object.prototype.toString.call({})         // '[object Object]'
Object.prototype.toString.call(new Date()) // '[object Date]' ✅
Object.prototype.toString.call(/regex/)    // '[object RegExp]'
Object.prototype.toString.call(function(){}) // '[object Function]'
\`\`\`

---

**总结：**
- \`typeof\` 适合判断基本类型（除了 null），但无法区分对象类型
- \`instanceof\` 通过原型链判断对象类型，但无法判断基本类型
- \`Object.prototype.toString.call()\` 是最准确的类型判断方法`,
            keywords: ['typeof', 'instanceof', '类型判断', '原型链', 'Object.prototype.toString'],
            hints: [
                'typeof null 返回的是 "object"',
                'instanceof 基于原型链查找',
                'Object.prototype.toString.call() 是最准确的判断方法'
            ]
        },







        {
            id: 'q2',
            title: '解释 JavaScript 的闭包（Closure）',
            difficulty: 'Medium',
            category: 'JavaScript',
            question: `什么是闭包？闭包的应用场景有哪些？请举例说明。`,
            tags: ['闭包', '作用域', '核心概念'],
            points: 15,
            referenceAnswer: `**闭包定义：**
闭包是指有权访问另一个函数作用域中变量的函数。

**应用场景：**
1. 数据私有化
2. 函数柯里化
3. 防抖节流
4. 模块化`,
            hints: [
                '函数嵌套是关键',
                '内部函数访问外部变量',
                '可以实现数据私有化'
            ]
        },
        {
            id: 'q3',
            title: 'Promise 的三种状态及状态转换',
            difficulty: 'Medium',
            category: 'JavaScript',
            question: `请说明 Promise 的三种状态，以及状态之间如何转换？`,
            tags: ['Promise', '异步', '状态'],
            points: 15,
            referenceAnswer: `**Promise 的三种状态：**
1. Pending（进行中）
2. Fulfilled（已成功）
3. Rejected（已失败）

**状态转换特点：**
- 单向性：只能从 Pending 转换
- 不可逆：状态改变后不会再变
- 唯一性：只能转换一次`,
            hints: [
                '三种状态：pending、fulfilled、rejected',
                '状态转换是单向且不可逆的'
            ]
        },
        {
            id: 'q4',
            title: 'var、let、const 的区别',
            difficulty: 'Easy',
            category: 'JavaScript',
            question: `请详细说明 var、let、const 三种变量声明方式的区别。`,
            tags: ['变量声明', 'ES6', '作用域'],
            points: 10,
            referenceAnswer: `**主要区别：**
1. 作用域：var 函数作用域，let/const 块级作用域
2. 变量提升：var 存在，let/const 不存在
3. 重复声明：var 允许，let/const 不允许
4. 修改值：const 不可修改（基本类型）`,
            hints: [
                'var 是函数作用域',
                'let 和 const 是块级作用域'
            ]
        },
        {
            id: 'q5',
            title: '事件循环（Event Loop）机制',
            difficulty: 'Hard',
            category: 'JavaScript',
            question: `请详细解释 JavaScript 的事件循环机制。`,
            tags: ['Event Loop', '异步', '宏任务', '微任务'],
            points: 20,
            referenceAnswer: `**执行顺序：**
1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 重复步骤 2-3

**宏任务：** setTimeout、setInterval
**微任务：** Promise.then、MutationObserver`,
            hints: [
                '同步代码先执行',
                '微任务优先于宏任务'
            ]
        }
    ],
    'React': [
        {
            id: 'react1',
            title: 'react 和 vue的理解',
            difficulty: 'Medium',
            category: 'React',
            question: `请谈谈你对 React 和 Vue 的理解，可以从使用方式、底层实现、生态和社区这几个方面展开。`,
            tags: ['React', 'Vue', '框架对比'],
            points: 15,
            referenceAnswer: `## 使用上
- **React**：用 Hooks（useState、useEffect）管理状态和副作用，用 JSX 描述 UI，本质就是 JavaScript。
- **Vue 3**：用 Composition API 在 setup 里写逻辑，用模板语法（v-if、v-for）描述 UI，更接近 HTML。

## 底层实现
- **Vue**：基于 Proxy 实现响应式，数据变化时精确追踪依赖，只更新相关组件。
- **React**：通过 setState 手动触发更新，会重新执行组件函数生成新虚拟 DOM，然后 Diff 对比后更新真实 DOM。

## 生态
- **Vue**：官方维护核心生态，像 Vue Router、Pinia 都是官方的，开箱即用。
- **React**：社区驱动，React Router、Redux 这些都是社区维护，选择多但需要自己搭配。

## 总结
Vue 上手快、整合度高，React 更灵活、生态更强大。我两个都用过，会根据项目复杂度和团队情况选择`,
            hints: ['使用方式差异', '响应式与渲染机制', '生态与社区对比']
        },
        {
            id: 'react2',
            title: 'react 是如何实现状态更新的（react渲染流程）',
            difficulty: 'Medium',
            category: 'React',
            question: `请详细说明 React 是如何实现状态更新的，并结合渲染流程进行说明。`,
            tags: ['React', '状态更新', '渲染流程'],
            points: 15,
            referenceAnswer: `

## 1. 触发更新
- 通过 \`setState\` 或 \`useState\` 触发更新
- React 给组件打上标记，表示需要重新渲染

## 2. Render 阶段（可中断）
- 重新执行组件函数或 \`render\` 方法，生成新的 JSX

### 两个核心角色：
- **Scheduler（调度器）**：按优先级排序任务，优先级高的先执行
- **Reconciler（协调器）**：
  - 构建新的 Fiber 树
  - Diff 算法对比新旧节点的 tag 和 key
  - 标记 DOM 操作（增、删、改、移动）
  - 收集所有变更形成 effectList
- **特点**：可中断，根据优先级调度

## 3. Commit 阶段（不可中断）
- **Renderer（渲染器）**：将 effectList 同步到真实 DOM
- 必须一次性完成，不能中断

## 总结
触发更新 → Diff 找出变化 → 更新 DOM`,
            hints: ['更新调度', '调和阶段', '提交阶段']
        },
        {
            id: 'react3',
            title: 'useState 原理',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 useState 的实现原理，包括 Hook 链表、更新队列和闭包现象。`,
            tags: ['useState', 'Hooks', '状态管理'],
            points: 15,
            referenceAnswer: `\`\`\`javascript
function App() {
  if (someCondition) {
    const [name, setName] = useState('小明')  // 可能不执行
  }
  const [age, setAge] = useState(18)
}
\`\`\`

当 \`someCondition\` 为 true 时，调用顺序是 hook1 → hook2，没问题。

但当 \`someCondition\` 为 false 时，第一个 useState 被跳过了，age 的 useState 变成了第1次调用，React 会把 hook1（存的是 name）的值给 age，**对应关系全乱了**。

> 简单记：**React 没有"名字"来识别 hook，只有"顺序"，所以顺序不能变。**

---

## 2. 两个阶段的通俗版解释

我用一个生活比喻来说：

### Mount（首次渲染）—— 相当于"建档"

你第一次去医院，护士给你建一个档案：
\`\`\`
你的fiber（病历本）
  └── memoizedState（第一页）
        hook1: { memoizedState: '小明', queue: [], next: → hook2 }
        hook2: { memoizedState: 18,     queue: [], next: null }
\`\`\`

做了什么事：
1. 创建 hook 对象
2. 把初始值（\`'小明'\`、\`18\`）写进去
3. 给每个 hook 准备一个空的更新队列（queue）
4. hook 之间用 next 串成链表

### Update（更新）—— 相当于"改档案"

你调用了 \`setAge(19)\`，发生了什么：

**第一步：排队**
\`\`\`
setAge(19) 被调用
  → 创建一个 update 对象：{ action: 19 }
  → 塞进 hook2 的 queue 里
  → 通知 React："这个组件需要重新渲染"
\`\`\`

**第二步：重新渲染时处理队列**
\`\`\`
组件函数重新执行
  → 执行到第2个 useState
  → React 发现 hook2 的 queue 里有一个 update
  → 取出来计算：新 state = 19
  → 更新 hook2.memoizedState = 19
  → 返回 [19, setAge]
  
  话术：useState 的原理可以从 mount 和 update 两个阶段来说。
Mount 阶段： 组件首次渲染时，React 会为每个 useState 调用创建一个 hook 对象，
挂载到当前 fiber 的 memoizedState 上。多个 hook 之间通过 next 指针形成单向链表——这也是为什么 hooks 不能写在条件语句里，
因为 React 靠调用顺序来匹配 hook。初始值存到 hook.memoizedState，同时初始化一个 update queue 挂到 hook.queue 上。
Update 阶段： 当调用 setState 时，React 创建一个 update 对象，加入 hook.queue.pending，这个队列是环形链表结构。
然后调用 scheduleUpdateOnFiber 触发调度。到组件重新渲染时，React 会遍历这个环形链表，依次计算每个 update，最终得到新的 state。
如果 setState 传的是函数，就把上一次的 state 作为参数传入；如果是值，就直接替换。
还有一个优化点：React 有批量更新（batching） 机制，在同一个事件回调里多次 setState 不会触发多次渲染，而是合并到一次更新中。
\`\`\``,
            hints: ['Hook 顺序', '更新队列', '闭包陷阱']
        },
        {
            id: 'react4',
            title: 'useEffect 和 useLayoutEffect',
            difficulty: 'Medium',
            category: 'React',
            question: `请对比 useEffect 和 useLayoutEffect 的执行时机、使用场景和注意事项。`,
            tags: ['useEffect', 'useLayoutEffect', '副作用'],
            points: 15,
            referenceAnswer: `## 1. useEffect 怎么模拟类组件生命周期？
useEffect 通过**第二个参数（依赖数组）**来控制执行时机：

- 空数组 [] -> 相当于 componentDidMount，只在首次渲染后执行一次
- 传入依赖 [a, b] -> 相当于 componentDidMount + componentDidUpdate，首次渲染和依赖变化时都会执行
- 不传第二个参数 -> 每次渲染后都执行
- 返回一个清理函数 -> 相当于 componentWillUnmount，会在组件卸载前或下次 effect 执行前调用，用来清除定时器、取消订阅等

## 2. 什么是副作用？
副作用就是组件渲染过程之外的操作，比如数据请求、订阅、手动操作 DOM、设置定时器这些。React 函数组件里通过 useEffect 来处理副作用。

## 3. useEffect 和 useLayoutEffect 的区别？
这个要从 React 的渲染流程说起。React 更新组件分两步：

第一步：在内存中算出新的 DOM
第二步：浏览器把 DOM 绘制到屏幕上

\`\`\`
React 算出新 DOM
    ↓
【useLayoutEffect 在这里执行】← 用户还没看到画面
    ↓
浏览器绘制到屏幕（用户看到了）
    ↓
【useEffect 在这里执行】← 用户已经看到画面了
\`\`\`

- useLayoutEffect：插在这两步之间，DOM 算好了但还没画到屏幕上，同步执行，会阻塞浏览器渲染
- useEffect：在浏览器绘制完成之后异步执行，不会阻塞渲染

### 实际场景举例
如果我在 useEffect 里修改一个元素的位置，用户会先看到元素在原位置闪一下，再跳到新位置，因为浏览器已经画过一次了。换成 useLayoutEffect，浏览器还没画就已经改好了，用户直接看到最终结果，不会闪烁。

### 一句话总结
平时用 useEffect 就够了，只有遇到画面闪烁这类 DOM 布局相关的问题时才换成 useLayoutEffect。`,
            hints: ['执行时机', '绘制前后', '场景选择']
        },
        {
            id: 'react5',
            title: 'react 组件间通信',
            difficulty: 'Medium',
            category: 'React',
            question: `请列举 React 常见的组件通信方式，并说明各自适用场景。`,
            tags: ['组件通信', 'props', 'context'],
            points: 15,
            referenceAnswer: `- props
- redux
- useContext
- cookie,localstorage, sessioStorage

子组件如何向父组件传值？

props 里面穿一个 setState 函数，子组件拿着这个 setState 去更新 state，间接达到一个

子传父的作用.`,
            hints: ['props', 'Context', '状态管理库']
        },
        {
            id: 'react6',
            title: 'react 合成时间的理解（事件处理、批量更新）',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 React 合成事件机制，以及事件处理中的批量更新行为。`,
            tags: ['合成事件', '事件处理', '批量更新'],
            points: 15,
            referenceAnswer: `

## 什么是合成事件

React 不直接监听子元素的事件,而是监听父元素的事件。为了解决浏览器兼容问题,React 把 DOM 原生事件封装为合成事件,原来事件是小写的,合成事件加上了 \`on\` 用驼峰命名法。

## 事件委托机制

React 利用事件委托,原本需要绑定在**子元素**的事件委托给**父元素**,让父元素负责事件监听和处理。

- **React 16**: 事件绑定到 \`document\` 上
- **React 17**: 事件绑定到 \`root\` 组件上,有利于多个 React 版本共存

## DOM 事件流三个阶段

1. **事件捕获阶段**: 事件从最外层(document)向下传播到目标元素
2. **目标阶段**: 事件到达实际触发事件的元素
3. **事件冒泡阶段**: 事件从目标元素向上冒泡回 document

## 一句话总结

React 合成事件本质上做了两件事:一是封装原生事件解决浏览器兼容问题,二是利用事件委托统一在顶层节点管理所有事件,减少了事件监听器的数量,提升了性能。`,
            hints: ['事件委托', '批量更新', '自动批处理']
        },
        {
            id: 'react7',
            title: 'diff 算法',
            difficulty: 'Medium',
            category: 'React',
            question: `请解释 React Diff 算法的核心思想，以及它如何降低比对复杂度。`,
            tags: ['Diff', '调和', '虚拟DOM'],
            points: 15,
            referenceAnswer: `可从同层比较、key 的作用、不同类型节点处理策略展开。`,
            hints: ['同层比较', 'key', '复杂度优化']
        },
        {
            id: 'react8',
            title: 'react 生命周期',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 React 生命周期（以 class 组件为主），并补充函数组件对应方案。`,
            tags: ['生命周期', 'class组件', '函数组件'],
            points: 15,
            referenceAnswer: `请按挂载、更新、卸载阶段说明，并补充 useEffect 的映射关系。`,
            hints: ['挂载更新卸载', '生命周期方法', 'Hooks 对应']
        },
        {
            id: 'react9',
            title: 'class 组件和 function 组件的理解',
            difficulty: 'Medium',
            category: 'React',
            question: `请对比 class 组件与 function 组件在状态、副作用、复用和心智模型上的差异。`,
            tags: ['class组件', 'function组件', 'Hooks'],
            points: 15,
            referenceAnswer: `请结合历史演进说明为何函数组件成为主流。`,
            hints: ['状态管理方式', '逻辑复用', '代码组织']
        },
        {
            id: 'react10',
            title: 'jsx的理解',
            difficulty: 'Easy',
            category: 'React',
            question: `请说明你对 JSX 的理解，包括本质、语法特点和编译过程。`,
            tags: ['JSX', '编译', '语法糖'],
            points: 10,
            referenceAnswer: `可从 JSX 到 React.createElement/JSX Runtime 的转换过程说明。`,
            hints: ['语法糖', '编译转换', '表达式插值']
        },
        {
            id: 'react11',
            title: 'react 优化',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 React 常见性能优化手段，并分别给出适用场景。`,
            tags: ['性能优化', 'memo', '渲染优化'],
            points: 15,
            referenceAnswer: `可从减少重渲染、长列表优化、代码分割、缓存计算等方面展开。`,
            hints: ['memo/useMemo/useCallback', '虚拟列表', '懒加载']
        },
        {
            id: 'react12',
            title: '什么是 fiber 树',
            difficulty: 'Medium',
            category: 'React',
            question: `请解释什么是 Fiber 树，它和传统递归调和有什么区别。`,
            tags: ['Fiber', '调和', '调度'],
            points: 15,
            referenceAnswer: `请描述 Fiber 节点结构、双缓存树（current/workInProgress）等核心概念。`,
            hints: ['Fiber 节点', '双缓存树', '可中断']
        },
        {
            id: 'react13',
            title: 'fiber 有特性，优点（并发？）',
            difficulty: 'Hard',
            category: 'React',
            question: `请说明 Fiber 架构的主要特性和优势，并解释它与并发能力的关系。`,
            tags: ['Fiber', '并发', '优先级调度'],
            points: 20,
            referenceAnswer: `可从可中断渲染、任务优先级、时间切片与响应性提升角度说明。`,
            hints: ['可中断', '优先级', '并发渲染']
        },
        {
            id: 'react14',
            title: 'react 如何实现增量渲染',
            difficulty: 'Hard',
            category: 'React',
            question: `请解释 React 如何实现增量渲染，以及这一能力在用户体验上的价值。`,
            tags: ['增量渲染', 'Fiber', '调度'],
            points: 20,
            referenceAnswer: `请结合时间切片、任务拆分、可恢复渲染等机制作答。`,
            hints: ['时间切片', '任务拆分', '渲染可恢复']
        }
    ],
    'RN': [
        {
            id: 'rn1',
            title: 'React Native 的核心组件有哪些？',
            difficulty: 'Easy',
            category: 'RN',
            question: `请列举 React Native 常用的核心组件，并说明它们的用途。`,
            tags: ['RN', '核心组件', '基础'],
            points: 10,
            referenceAnswer: `**常用核心组件：**
1. **View**：基础容器组件
2. **Text**：文本展示
3. **Image**：图片展示
4. **ScrollView**：可滚动容器
5. **TextInput**：文本输入
6. **Pressable/Touchable**：交互点击
7. **FlatList/SectionList**：列表渲染`,
            hints: ['View/Text/Image', 'ScrollView/TextInput', 'FlatList/SectionList']
        },
        {
            id: 'rn2',
            title: 'React Native 与 Web 开发的差异',
            difficulty: 'Medium',
            category: 'RN',
            question: `请说明 React Native 与 Web 前端开发在布局、样式、事件和性能方面的主要差异。`,
            tags: ['RN', '差异', '性能'],
            points: 15,
            referenceAnswer: `**主要差异：**
1. **布局系统**：RN 只有 Flex，Web 有多种布局方式
2. **样式单位**：RN 使用无单位的数值（类似 dp），Web 使用 px/rem
3. **样式作用域**：RN 样式是 JS 对象，Web 是 CSS
4. **事件模型**：RN 使用 onPress 等事件，Web 使用 DOM 事件
5. **性能关注点**：RN 关注 JS-UI 线程交互、列表虚拟化等`,
            hints: ['Flex 是唯一布局', '样式是 JS 对象', 'onPress 事件']
        }
    ]
};

const PENDING_QUIZ_KEY = 'js-oj:pendingQuizId';
const SELECTED_QUIZ_KEY = 'js-oj:selectedQuizId';
const CATEGORY_ORDER = ['JavaScript', 'React', 'RN'];
const CATEGORY_META = {
    'HTML': { icon: '📄', color: '#e34c26' },
    'CSS': { icon: '🎨', color: '#264de4' },
    'JavaScript': { icon: '⚡', color: '#f7df1e' },
    'React': { icon: '⚛️', color: '#61dafb' },
    'RN': { icon: '📱', color: '#00c2ff' }
};
const buildCategoryList = (quizMap) => {
    const names = Object.keys(quizMap);
    const orderedNames = [
        ...CATEGORY_ORDER.filter((name) => names.includes(name)),
        ...names.filter((name) => !CATEGORY_ORDER.includes(name))
    ];
    return orderedNames.map((name) => ({
        name,
        quizzes: quizMap[name] || [],
        icon: CATEGORY_META[name]?.icon || '📚',
        color: CATEGORY_META[name]?.color || '#667eea'
    }));
};
const buildExpandedCategories = (categories) =>
    categories.reduce((acc, category) => {
        acc[category.name] = false;
        return acc;
    }, {});

const QuizPage = () => {
    // 将分类数据转换为扁平的题目列表
    const allQuizzes = Object.values(mockQuizzesByCategory).flat();
    const categoryList = useMemo(() => buildCategoryList(mockQuizzesByCategory), []);

    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectionReady, setIsSelectionReady] = useState(false);
    const { reviewQueue, addToReviewQueue, getReviewStatus, dailyAttempts, logDailyAttempt } = useJudgeStore();
    const answerBlockRef = useRef(null);

    // 分类展开/折叠状态
    const [expandedCategories, setExpandedCategories] = useState(() => buildExpandedCategories(categoryList));

    // AI 分析相关状态
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const filteredQuizzes = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return allQuizzes;
        return allQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(keyword));
    }, [allQuizzes, searchTerm]);

    useEffect(() => {
        setCurrentQuizIndex(0);
    }, [searchTerm]);

    useEffect(() => {
        setExpandedCategories((prev) => {
            const next = { ...prev };
            let changed = false;
            categoryList.forEach(({ name }) => {
                if (next[name] === undefined) {
                    next[name] = false;
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [categoryList]);

    const currentQuiz = filteredQuizzes[currentQuizIndex] || filteredQuizzes[0];

    const progressStats = useMemo(() => {
        const total = allQuizzes.length;
        if (!total) return { reviewed: 0, unreviewed: 0, total: 0, attemptedToday: 0 };
        let reviewed = 0;
        const todayKey = new Date().toISOString().slice(0, 10);
        allQuizzes.forEach((quiz) => {
            const status = getReviewStatus('quiz', quiz.id);
            if (status === 'reviewed') reviewed += 1;
        });
        const attemptedToday = Object.keys(dailyAttempts?.quiz?.[todayKey] || {}).length;
        return { reviewed, unreviewed: total - reviewed, total, attemptedToday };
    }, [allQuizzes, getReviewStatus, dailyAttempts]);

    // 切换分类展开/折叠
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // 选择题目
    const selectQuiz = (quizId) => {
        const index = filteredQuizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
            setCurrentQuizIndex(index);
            setUserAnswer('');
            setShowAnswer(false);
            setAnalysisResult(null);
        }
    };

    useEffect(() => {
        try {
            const pendingId = window.localStorage.getItem(PENDING_QUIZ_KEY);
            const savedId = window.localStorage.getItem(SELECTED_QUIZ_KEY);
            const targetId = pendingId || savedId;
            if (!targetId) return;

            const index = allQuizzes.findIndex((quiz) => quiz.id === targetId);
            if (index !== -1) {
                const targetQuiz = allQuizzes[index];
                setCurrentQuizIndex(index);
                setUserAnswer('');
                setShowAnswer(false);
                setAnalysisResult(null);
                setExpandedCategories((prev) => ({
                    ...prev,
                    [targetQuiz.category]: true
                }));
            }

            if (pendingId) {
                window.localStorage.removeItem(PENDING_QUIZ_KEY);
            }
        } catch (err) {
            console.warn('读取待跳转题目失败:', err);
        } finally {
            setIsSelectionReady(true);
        }
    }, []);

    useEffect(() => {
        if (!isSelectionReady) return;
        if (!currentQuiz?.id) return;
        try {
            window.localStorage.setItem(SELECTED_QUIZ_KEY, currentQuiz.id);
        } catch (err) {
            console.warn('保存当前题目失败:', err);
        }
    }, [currentQuiz?.id, isSelectionReady]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return '#52c41a';
            case 'medium':
                return '#faad14';
            case 'hard':
                return '#f5222d';
            default:
                return '#666';
        }
    };

    const getCategoryColor = (category) => CATEGORY_META[category]?.color || '#667eea';
    const getCategoryIcon = (category) => CATEGORY_META[category]?.icon || '📚';

    const reviewStatus = currentQuiz ? getReviewStatus('quiz', currentQuiz.id) : 'unreviewed';
    const isInReviewQueue = currentQuiz ? Boolean(reviewQueue?.quiz?.[currentQuiz.id]) : false;

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            alert('请先输入你的答案');
            return;
        }

        try {
            setIsAnalyzing(true);
            setAnalysisResult(null);

            console.log('🚀 开始提交答案到 AI 分析...');
            console.log('题目 ID:', currentQuiz.id);
            console.log('答案长度:', userAnswer.length);

            const result = await submitQuizAnswer(currentQuiz.id, userAnswer);

            console.log('✅ AI 分析返回结果:', result);

            if (result.success && result.hasAIAnalysis) {
                setAnalysisResult(result);
                addToReviewQueue('quiz', {
                    id: currentQuiz.id,
                    title: currentQuiz.title
                });
                logDailyAttempt('quiz', {
                    id: currentQuiz.id,
                    title: currentQuiz.title
                });
            } else {
                alert('AI 分析服务暂时不可用，请稍后重试');
            }
        } catch (error) {
            console.error('❌ 提交答案失败:', error);
            alert('提交失败: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNextQuiz = () => {
        if (currentQuizIndex < allQuizzes.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
            setUserAnswer('');
            setShowAnswer(false);
            setAnalysisResult(null);
        }
    };

    const handlePrevQuiz = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1);
            setUserAnswer('');
            setShowAnswer(false);
            setAnalysisResult(null);
        }
    };

    const handleReset = () => {
        setUserAnswer('');
        setShowAnswer(false);
        setAnalysisResult(null);
    };

    const progressReviewed = progressStats.total ? (progressStats.reviewed / progressStats.total) * 100 : 0;
    const progressUnreviewed = Math.max(0, 100 - progressReviewed);
    const referenceAnswerMarkdown = (analysisResult?.quiz?.referenceAnswer ?? currentQuiz?.referenceAnswer ?? '').trim();
    const referenceAnswerContent = referenceAnswerMarkdown || '> 暂无参考答案（由后端配置）';
    const handleToggleAnswer = () => {
        setShowAnswer((prev) => {
            const next = !prev;
            if (next) {
                window.requestAnimationFrame(() => {
                    answerBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
            return next;
        });
    };

    const handleVoiceInput = async (audioData) => {
        try {
            console.log('🎤 开始语音识别...');

            const result = await speechToText(audioData);

            if (result.success && result.text) {
                console.log('✅ 语音识别成功:', result.text);
                setUserAnswer(prev => {
                    const newText = prev ? prev + ' ' + result.text : result.text;
                    return newText;
                });
            } else {
                alert('语音识别失败，请重试');
            }
        } catch (error) {
            console.error('❌ 语音识别失败:', error);
            alert('语音识别失败: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="quiz-page">
            <section className="quiz-topbar">
                <div className="quiz-progress">
                    <div className="progress-stats">
                        <span className="progress-item passed">已复习 {progressStats.reviewed}</span>
                        <span className="progress-item unattempted">未复习 {progressStats.unreviewed}</span>
                        <span className="progress-total">总计 {progressStats.total}</span>
                    </div>
                    <div className="progress-bar">
                        <span className="progress-segment passed" style={{ width: `${progressReviewed}%` }} />
                        <span className="progress-segment unattempted" style={{ width: `${progressUnreviewed}%` }} />
                    </div>
                </div>
                <div className="quiz-today-progress">
                    <span className="today-label">今日进度</span>
                    <span className="today-count">{progressStats.attemptedToday}</span>
                    <span className="today-unit">题</span>
                </div>
                <div className="quiz-filters">
                    <input
                        className="quiz-search"
                        type="text"
                        placeholder="搜索题目..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>
            <div className="quiz-container">
                {/* 移动端侧边栏切换按钮（仅在小屏显示） */}
                <button
                    className="mobile-sidebar-toggle"
                    onClick={() => setIsMobileSidebarOpen(prev => !prev)}
                >
                    {isMobileSidebarOpen ? '✕ 收起题目列表' : '📚 展开题目列表'}
                </button>

                {/* 左侧：分类题目列表 */}
                <aside className={`quiz-sidebar${isMobileSidebarOpen ? ' mobile-open' : ''}`}>
                    <h3 className="quiz-list-title">📚 题目分类</h3>
                    <div className="quiz-categories">
                        {categoryList.map(category => (
                            <div key={category.name} className="category-section">
                                {/* 分类标题 */}
                                <div
                                    className="category-header"
                                    onClick={() => toggleCategory(category.name)}
                                    style={{ borderLeftColor: category.color }}
                                >
                                    <div className="category-title">
                                        <span className="category-icon">{category.icon}</span>
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-count">
                                            ({category.quizzes.length})
                                        </span>
                                    </div>
                                    <span className={`category-arrow ${expandedCategories[category.name] ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>

                                {/* 题目列表 */}
                                {expandedCategories[category.name] && (
                                    <div className="quiz-items">
                                        {category.quizzes
                                            .filter((quiz) => {
                                                if (!searchTerm.trim()) return true;
                                                return quiz.title.toLowerCase().includes(searchTerm.trim().toLowerCase());
                                            })
                                            .map((quiz, index) => {
                                                const globalIndex = filteredQuizzes.findIndex(q => q.id === quiz.id);
                                                return (
                                                    <div
                                                        key={quiz.id}
                                                        className={`quiz-item ${currentQuizIndex === globalIndex ? 'active' : ''}`}
                                                        onClick={() => { selectQuiz(quiz.id); setIsMobileSidebarOpen(false); }}
                                                    >
                                                        <div className="quiz-item-header">
                                                            <span className="quiz-number">#{index + 1}</span>
                                                            <span
                                                                className="quiz-difficulty"
                                                                style={{ color: getDifficultyColor(quiz.difficulty) }}
                                                            >
                                                                {quiz.difficulty}
                                                            </span>
                                                        </div>
                                                        <div className="quiz-title">{quiz.title}</div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 右侧：题目详情和答题区 */}
                <main className="quiz-main">
                    {currentQuiz && (
                        <>
                            {/* 题目信息 */}
                            <div className="quiz-detail">
                                <div className="quiz-detail-header">
                                    <h2>{currentQuiz.title}</h2>
                                    <div className="quiz-review-tools">
                                        <span className={`review-status ${reviewStatus}`}>
                                            {reviewStatus === 'reviewed' ? '已复习' : '未复习'}
                                        </span>
                                        <button
                                            className={`review-btn ${isInReviewQueue ? 'in-queue' : ''}`}
                                            onClick={() => addToReviewQueue('quiz', { id: currentQuiz.id, title: currentQuiz.title })}
                                            disabled={isInReviewQueue}
                                        >
                                            {isInReviewQueue ? '已在复习队列' : '放入复习队列'}
                                        </button>
                                    </div>
                                    <div className="quiz-badges">
                                        <span
                                            className="badge badge-difficulty"
                                            style={{ backgroundColor: getDifficultyColor(currentQuiz.difficulty) }}
                                        >
                                            {currentQuiz.difficulty}
                                        </span>
                                        <span
                                            className="badge badge-category"
                                            style={{ backgroundColor: getCategoryColor(currentQuiz.category) }}
                                        >
                                            {getCategoryIcon(currentQuiz.category)} {currentQuiz.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="quiz-tags">
                                    {currentQuiz.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="quiz-question">
                                    <div className="quiz-question-header">
                                        <h3>📋 题目</h3>
                                        <button
                                            type="button"
                                            className="btn-answer-toggle"
                                            onClick={handleToggleAnswer}
                                        >
                                            {showAnswer ? '隐藏答案' : '显示答案'}
                                        </button>
                                    </div>
                                    <p className="question-text">{currentQuiz.question}</p>
                                </div>

                                {/* 参考答案 */}
                                {showAnswer && (
                                    <div className="reference-answer" ref={answerBlockRef}>
                                        <h3>📖 参考答案</h3>
                                        <div className="answer-content">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                className="answer-markdown"
                                            >
                                                {referenceAnswerContent}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 答题区 */}
                            <div className="answer-section">
                                <div className="answer-header">
                                    <h3>✍️ 你的答案</h3>
                                    <VoiceRecorder onTranscriptReceived={handleVoiceInput} />
                                </div>
                                <textarea
                                    className="answer-textarea"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="在此输入你的答案... 或点击右上角语音输入按钮 🎤"
                                    rows={10}
                                />

                                <div className="answer-actions">
                                    <button className="btn btn-secondary" onClick={handleReset}>
                                        清空
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmitAnswer}
                                        disabled={!userAnswer.trim() || isAnalyzing}
                                    >
                                        {isAnalyzing ? '🤖 AI 分析中...' : '🤖 AI 分析'}
                                    </button>
                                </div>
                            </div>

                            {/* AI 分析结果 */}
                            {analysisResult && analysisResult.hasAIAnalysis && (
                                <div className="ai-analysis-section">
                                    <h3>🤖 AI 分析结果</h3>

                                    <div className="ai-analysis-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h2: ({node, ...props}) => <h2 className="ai-h2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="ai-h3" {...props} />,
                                                ul: ({node, ...props}) => <ul className="ai-ul" {...props} />,
                                                li: ({node, ...props}) => <li className="ai-li" {...props} />,
                                                p: ({node, ...props}) => <p className="ai-p" {...props} />,
                                                strong: ({node, ...props}) => <strong className="ai-strong" {...props} />
                                            }}
                                        >
                                            {analysisResult.aiAnalysis}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* 导航按钮 */}
                            <div className="quiz-navigation">
                                <button
                                    className="btn btn-nav"
                                    onClick={handlePrevQuiz}
                                    disabled={currentQuizIndex === 0}
                                >
                                    ← 上一题
                                </button>
                                <span className="quiz-progress">
                                    {currentQuizIndex + 1} / {allQuizzes.length}
                                </span>
                                <button
                                    className="btn btn-nav"
                                    onClick={handleNextQuiz}
                                    disabled={currentQuizIndex === allQuizzes.length - 1}
                                >
                                    下一题 →
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default QuizPage;
