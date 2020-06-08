#### 2020-02-05
    slice               /slaɪs/         n. 薄片；部分；菜刀，火铲 vi. 切开；割破
    go 中是一种数据类型，类似java中的数组，但是它的长度是可变的。
    defer               /dɪˈfɜː(r)/     vi. 推迟；延期；服从
    defer延迟执行，defer的执行时机是在return执行后，但是方法实际返回前。多个defer的执行顺序是先进后出
    convert             /kənˈvɜːt/      vt. 使转变；转换…；n. 皈依者；改变宗教信仰者
    strconv 提供的方法可以将部分基本类型转换为字符串类型，我猜测这个词是string+convert 合成的
    note                /nəʊt/          n. 笔记；票据；便笺；vt. 注意；记录；注解
    const               /'kɒnst/        n. 常量，常数
    go 中使用const申明常量，js中也是，效果类似java中的final修饰变量.
    但是注意：go中的const只能修饰基本类型，不能修饰struct，值在编译时就确定了，不允许中途修改；
    js中的const可以修饰基本类型和结构体，当修饰结构体时允许修改结构体的属性字段值；
    java中的final表示的是内存地址不可变，并非值不可变。
    return 关键字在go和java中都是返回值的，go的方法允许传入变量指针，但是不能返回值不能是指针类型，返回的只能是指针对应的值。
    struct              英 /strʌkt/         n. 结构；结构体；
    go是并非纯面向对象的语言，它通过struct来实现面向对象。
    range               英 /reɪndʒ/         n. 范围；幅度；排；山脉
    go 中用for range 来实现遍历操作。
    continue            英 /kənˈtɪnjuː/     vi. 继续，延续；仍旧，连续
    跳出当前循环的关键字
    fall                英 /fɔːl/           n. 落下；跌倒；（雪、岩石等的）降落；（数量等的）减少；
    through             英 /θruː/           穿过，通过，和on等一样是介词
    fallthrough 下降，合成词。go中的switch和java相比，省略了每个case都要写break的设定，默认任何case匹配到就退出switch。如果要继续执行后的case，可以在后面添加fallthrough
    cap                 英 /kæp/            n. 盖；帽子 vt. 覆盖；胜过
    cap() go内置方法，用于返回slice容量
    complex             英 /ˈkɒmpleks/      n. 复合体; adj. 复杂的；合成的
    complex 是go中的一个预定义标识符，在做复数相关操作时需要用到它。暂时用不到复数，记住单词就好
    real                美 /ˈriːəl/         n. 现实；实数 adv. 真正地
    real() go内置方法，用于返回复数的实数部分。
    iota  微量、极少量的意思，它是go中的一个预定义标识符。也叫常量计数器，初始值为0，每次iota出现都会将计数器归零。
    panic               英 /ˈpænɪk/         n. 恐慌，惊慌；
    go中的一种错误，或者说是异常。未处理的panic会导致程序退出，也就是我们常说的宕机
    recover             英 /rɪˈkʌvə(r)/     vt. 恢复；弥补；重新获得
    recover() go内置方法，只能在defer中使用，用于在发生panic是执行补救逻辑。类似try catch，但是recover允许再次panic
    uintprt go中的一个预定义标识符，表示一种特殊的指针类型。是一个不存在和合成词，不知道怎么读。可以确认的是它和unsafe包有关，
    java和go中都有unsafe这个包，都是不安全的，不建议使用。记住这个词组，需要用到的时候再去研究。
    break go中的break默认会跳出当前循环(和java一样)，也可以在break后指定标签，跳出标签对应的for循环(和java一样，但是写法不一样，不实用)
    fold                英 /fəʊld/          n. 褶层；褶痕；v. 折叠；可折叠；包；倒闭
    strings.EqualFold() 比较两个字符串是否相同，不区分大小写，"=="比较是区分大小写的
    binary              英 /ˈbaɪnəri/       adj. [数] 二进制的；二元的，二态的
    binarySearch 二分查找法，经典算法之一。二分查找的前提是数据必须是有序的。
    judge               英 /dʒʌdʒ/          n. 法官；裁判员；鉴定人 v. 判断；猜测
    typeJudge 类型断言，go中可以通过type.(x)来做参数类型判断。
    monster             英 /ˈmɒnstə(r)/     n. 怪物；巨人，巨兽；残忍的人adj. 巨大的，庞大的
    demo中遇到的一个单词，顺道记忆一下
    kind                英 /kaɪnd/          n. 种类；性质 adj. 和蔼的；宽容的
    kind是reflect包下的一个方法，用于获取变量类型的数据类型。基本kind()和TypeOf()得到的结果是一样的，自定义struct一般得到的结果是不一样的(不是绝对的)。
##### 2020-02-26 开始整理java基础词汇
    prime               英 /praɪm/          n. 初期；青年；全盛时期 adj. 主要的；最好的；基本的
    tax                 英 /tæks/           n. 税金；重负 
    cashier             英 /kæˈʃɪə(r)/      n. 出纳员；收银员
    letter              英 /'letə/          n. 字母，文字,信
    generate            英 /'dʒenəreɪt/     vt.生成，使形成；发生；
    count               英 /kaʊnt/          计数，数量，计算
    count不只是计数，还有数量、计算等含义，sql中的关键字
    bubble              英 /'bʌb(ə)l/       冒泡，经典算法之一
    original            英 /ə'ridʒənəl/     n. 原件；原型，vt.原始的
    origin 原点、起源、开端， git clone远端仓库后默认的仓库名词就是origin
    answer              英 /'ɑːnsə/         回答；答案;符合
    command             英 /kə'mɑːnd/       命名，指令，指挥
    amount              英 /ə'maʊnt/        数量，总计，合计
    balance             英 /'bæl(ə)ns/      余额，平衡，使平衡
    percent             英 /pə'sent/        百分比
    profile             英 /'prəʊfaɪl/      外形，轮廓
    score               英 /skɔː/           分数，成绩
    salary              英 /'sælərɪ/        工资，薪水
    variable            英 /'veərɪəb(ə)l/   变量
    var 应该就是这个单词简写来的。
    iterator            英 /ɪtə'reɪtə/      迭代器
    entry               英 /ˈentrɪ/         进入，入口，条目。编码中一般翻译为 键值对
    notify              美 /'notə'fai/      通告，通知，公布
    browser             英 /'braʊzə/        浏览器
    protocol            美 /'protə'kɔl/     协议
    
    如下是简写合成词，词典中查不到：
    dest----目标    pos----位置     src----源     temp----临时    sqrt----开平方根
