//该option并不能直接使用，我用他来标记一些常用属性方法的使用特性
//https://www.bilibili.com/video/av36013027/?p=4
//从第二个option开始按图类型来说明属性
// P4 讲解的是折线图，明天开始看P5
// P10 讲解散点图，直接系基本完结。明天开始看P11 饼图  2019-03-10
option = {
    title : {
        text: '某地区蒸发量和降水量',
        subtext: '纯属虚构'
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['蒸发量','降水量']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    xAxis : [//设置x轴线的相关配置
        {   name:'月份',//坐标轴名称
            axisLabel:{//设置轴线标签的样式
                show:true,//控制标签显示
                clickable : true,//控制标签可以被点击
                interval:2,//控制各个条目的显示间隔
                margin:-20,//控制标签和X轴线的距离，负值可以跑到图表里面去
                textStyle:{
                    color:'#333'//设置文字样式
                },
                formatter:'{value}hcy'//格式化文字，在每个值后面添加一个hcy，这里也可以接收一个方法
            },
            axisLine:{
                onZero:false//定义轴线的起始位置不是从0开始
            },
            scale:true,//让结果在最大和最小值间适应，也可以为数组，控制最大和最小的范围
            boundaryGap : false,//控制轴线左右和上下的留白，category类型默认为true，value默认为false，可以为一个数组
            type : 'category',//坐标轴有三种类型：category，value和time，value和time默认会自动缩放适应，time必须为时间格式
            data : ['1月',{
                value:'2月',
                itemStyle:{}
            },'3月']//data属性，category类型特有的，值一般为一个字符串数组，也能传入对象来设置条目样式
        }
    ],
    yAxis : [
        {   name:'月份',//坐标轴名称
            splitNumber:2,//控制轴线分段数，只对value和time类型有用
            type : 'value'
        },
        {   name:'xiaoliang',//设置两条Y轴
            type : 'value',
            axisLabel : {
                formatter: '{value} hcy'
            }
        }
    ],
    series : [//控制数据
        {
            name:'蒸发量',
            type:'bar',//控制图表类型，不填不会显示
            stack:'成交',//堆叠图，根据名称堆叠，也就是name的值
            showAllSymbol:true,//echarts默认会自动计算距离来隐藏显示不下的条目，此时label也会一同因此，
                                // 如果需要指定列的label显示可以使用这个属性
            smooth:true,//平滑曲线，部分主题已经对折线图做了这个设置
            legendHoverLink:true,//是否启用图例（legend）hover时的联动响应（高亮显示）
            symbol:'star5',//设置拐点的样式，系统内置8种，可以查api。start比较特别，start+数字可以显示为任意个角的星星，例如star9就是9角星
            symbolSize:20,//设置拐点大小
            itemStyle: {//控制值的样式
                normal: {//值样式的控制有两种，一是normal，正常显示；emphasis为强调显示，例如鼠标移入时显示
                    areaStyle: {//设置填，在折线图中该属性会将折线图变为面积图
                        type: 'default',//折线图中只有这个值，意思为默认填充
                        color:'#666'
                    },
                    lineStyle:{//控制线的样式
                        color:'red',
                        width:10,
                    },
                    label:{//控制label的样式
                        show:true,//是否显示
                        position:'bottom',//如果设置显示，必须设置位置，否则不显示
                        formatter:'{a}:{b}:{c}'//三个模板变量分别表示名称，类目，值。也可以是一个方法
                    }
                },
            },
            yAxisIndex:1,//使用第二条轴线。对应Y周数组，
            data:[2.0, 4.9,{//data就是数据，一般来说它会是一个数组，也可以是一个对象来强化或者说强调某个值的显示
                value:15,   //data种如果存在中断也就是不存在的数据，应该使用'-'，而不是0，此时折线图会中断，避免视觉误导
                symbolSize:20

            }, 23.2],
            markPoint : {
                data : [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'降水量',
            type:'bar',
            data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
            markPoint : {
                data : [
                    {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
                    {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name : '平均值'}
                ]
            }
        }
    ]
};

//柱状图
/**
 * 柱状图的配置和折线图极为相似，下面列举几个常用的个性化配置，
 * 基本都在series中
 */
option = {
    title : {
        text: '某地区蒸发量和降水量',
        subtext: '纯属虚构'
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['蒸发量','降水量']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    xAxis : [
        {
            type : 'category',
            data : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'蒸发量',
            type:'bar',
            xAxis.gridIndex            barGap:'100%',//柱间距离，默认为柱形宽度的30%，可设固定值，也可以为负值。为负值时两个柱形会重合，通过颜色和透明的的调配可以做出柱形堆积的效果
            barCategoryGap:'1%',//类目间柱形距离，默认为类目间距的20%，可设固定值
            barWidth:10,//柱形宽度，不设时自适应
            barMaxWidth:100,//柱形宽度最大宽度，宽度会自适应，但是不会超过这个最大宽度。可以避免数据量少的柱形太宽不好看
            barMinHeight:50,//柱形对小高度。当值小于设定数值时高度会统一调整为这个值的高度。避免因为数值太小导致柱形太低无法点击。该配置可能带来视觉误差
            itemStyle:{//itemStyle和折现图基本一致
                normal:{//常规显示
                    barBorderColor:'rgba(0,0,0,0)',
                    color:'rgba(0,0,0,0)'
                },
                emphasis:{//鼠标移入时的显示
                    barBorderColor:'rgba(0,0,0,0)',
                    color:'rgba(0,0,0,0)'
                }
            },

            data:[0, 1700, 1400, 1200, 300, 0],
            markPoint : {
                data : [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'生活费',
            type:'bar',
            stack: '总量',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[2900, 1200, 300, 200, 900, 300]
        }
    ]
};

/**
 * title 组件，定义图例的标题。
 * 注意：echarts中有一个概念叫多级控制：类似css层叠样式表。当多个属性操作同一个元素时，最精确的那一个生效(层级最多的那个)！
 */
option = {
    title : {
        text: '某地区蒸发量\n和降水量',//标题名，'\n'可以控制换行
        subtext: '纯属虚构',//副标题
        link:'www.baodu.com',//点击主标题时的文本超链接
        sublink:'https:www.baidu.com',//点击副标题时的文本超链接
        show:true,//控制标题显示
        x:'center',//x,y都是按九宫格样式设计的，参数支持'center' | 'left' | 'right' | {number}，number为固定数值，默认在左上侧
        y:'left',
        textAlign:'center',//也是按九宫格样式设计，但是只支持'center' | 'left' | 'right' ，不支持数值，默认根据x设置自动调整
        textStyle:{//文本样式
            fontSize: 18,
            fontWeight: 'bolder',
            color: '#333'
        }
    },
};
/**
 *legend 组件，定义图例，每个option只能有一个图例
 */
option = {
    legend: {
        selectedMode:'multiple',//定义图例的点击是单选还是多选。可选值：single(单选)，multiple(多选)
        data: [//对应series中的name值，如果索引不到该项图例会显示为灰色。可以通过传入对线的方式来自定义外观，例如下面的自定义icon和颜色
            {
                name:'蒸发量',
                icon : 'image://../asset/ico/favicon.png',
                textStyle:{fontWeight:'bold', color:'green'}
            },
            '降水量','最高气温', '最低气温'
        ],
        x:'left',//控制图例的位置，可选为：'center' | 'left' | 'right' | {number}，
        y:'top',//可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
        orient:'vertical',//控制图例项是水平排列还是垂直排列。默认为水平布局，可选为：'horizontal'(水平) | 'vertical'（垂直）
        formatter:'{name}hcy'//可接受模板变量'{name}'，也能接受一个{Function}
    },
};
/**
 *dataZoom 组件，用于控制数据区域缩放，仅对直角坐标系图标有效
 */
option = {
    dataZoom : {
        show : true,//是否显示
        realtime : true,//缩放变化是否实时显示，该功能比较消耗资源，尤其是在动态加载数据时
        zoomLock:true,//数据缩放锁，锁定后缩放区域大小不能被改变
        orient: 'horizontal',   // 布局方式，默认为水平布局，可选为：'horizontal' | 'vertical'
        x: 0,//分别控制datazoom组件的位置，高度，颜色等等，一般不设置，直接使用默认值就好
        y: 36,
        height: 20,
        backgroundColor: 'rgba(221,160,221,0.5)',
        dataBackgroundColor: 'rgba(138,43,226,0.5)',
        fillerColor: 'rgba(38,143,26,0.6)',
        handleColor: 'rgba(128,43,16,0.8)',
        //xAxisIndex:[],//有多个数据时，用来指定组件在拖拽过程中可以控制那些数据。可接受数值和数组，对应series中的数值下标。默认控制全部
        //yAxisIndex:[],
        start : 40,//数据缩放，选择起始比例，默认为0（%），end默认为100%
        end : 60
    },
};
/**
 *tooltip 组件，提示框，鼠标悬浮交互时的信息提示。该组件支持多级控制，在data等中也能单独定义它
 */
option = {
    tooltip : {         //
        trigger: 'axis',//可选为：'item' | 'axis'，定义提示框的触发条件，是进入那一列就出发，还是进入那个柱形才触发，折线图会对应的列和点
        show: true,   //定义提示框是否显示，默认显示
        showDelay: 0,//显示延迟，添加显示延迟可以避免频繁切换，特别是在详情内容需要异步获取的场景，单位ms
        hideDelay: 50,//隐藏延迟，单位ms
        transitionDuration:0,//动画变换时长，单位s。注意这里是秒，其实这个属性用到的机会不高
        enterable:true,//鼠标是否可以进入提示框中，默认为false。
        backgroundColor : 'rgba(255,0,255,0.7)',//下面分别是定义背景色，边框线的颜色，倒角，宽度，边距等
        borderColor : '#f50',
        borderRadius : 8,
        borderWidth: 2,
        padding: 10,    // [5, 10, 15, 20]
        position : function(p) {//定义提示框的出现位置，默认为鼠标周围10px自适应
            // 位置回调
            // console.log && console.log(p);
            return [p[0] + 10, p[1] - 10];
        },
        textStyle : {//设置提示框中的文本样式
            color: 'yellow',
            decoration: 'none',
            fontFamily: 'Verdana, sans-serif',
            fontSize: 15,
            fontStyle: 'italic',
            fontWeight: 'bold'
        },
        formatter: function (params,ticket,callback) {//提示框中的内容，支持异步加载。因为异步加载的返回时间不确定性，所以
            console.log(params)                       //function提供了参数ticket，只有当ticket一致时才开始回调,(ticket只是一个标识，不一样也可以)
            var res = 'Function formatter : <br/>' + params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
                res += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
            }
            setTimeout(function (){
                // 设置延迟，配合showDelay可以避免因为鼠标滑过而发出数据请求，避免后端服务器压力
                callback(ticket, res);
            }, 1000)
            return 'loading';
        }
        //formatter: "Template formatter: <br/>{b}<br/>{a}:{c}<br/>{a1}:{c1}"//当然formatter也支持模板变量
                                //其中变量a、b、c、d在不同图表类型下代表数据含义为：
        //折线（区域）图、柱状（条形）图、K线图 : a（系列名称），b（类目值），c（数值）, d（无）
        //散点图（气泡）图 : a（系列名称），b（数据名称），c（数值数组）, d（无）
        //地图 : a（系列名称），b（区域名称），c（合并数值）, d（无）
        //饼图、雷达图、仪表盘、漏斗图: a（系列名称），b（数据项名称），c（数值）, d（饼图：百分比 | 雷达图：指标名称）
        //力导向图, 和弦图 :节点 : a（系列名称），b（节点名称），c（节点值）, d(节点类目索引)；
        //                  边 : a（系列名称），b（边名称，默认为大端节点名称-小端节点名称），c（link.value）, d(大端节点 name 或者 index), e(小端节点 name 或者 index)
    },
};

/**
 * K线图，K线图和折线图很像，区别时K线图的data中的每个值都是一个有4个值的数组。通过itemStyle可以定义阴线和阳线的颜色。
 * 而阴阳线会有echarts自己来判断处理。
 * 通过K线图的样式设计我们可以很简单的将K线图修改为瀑布图(一种变形的柱状图)
 */
series : [
    {
        name:'上证指数',
        type:'k',
        itemStyle:{
            normal:{
                color:'#666',
                color0:'#f50'
            }
        },
        data:[ // 开盘，收盘，最低，最高
            [2320.26,2302.6,2287.3,2362.94],
            [2300,2291.3,2288.26,2308.38]
        ]
    }
]
/**
 * 散点图、气泡图 ：用于在二维直角坐标系中展示更多维度的数据。
 * 散点图的特点在于它的data。在data中每个元素都是一个有两个以上数值的对象，对象前面两个数组决定了点在直角坐标系中的位置，
 * 后面的数值可以用于做差异化显示，例如根据值的不同改变点的大小和颜色等。
 * 下面的option中列举了根据数值改变颜色和大小的方法，以及对数据缩放区域的控制方法
 */

option = {
    series : [
        {
            name:'scatter1',
            type:'scatter',//使用散点图
            symbolSize: function(value){
                return value[2]
            },
            itemStyle:{
                normal:{
                    color:function(params){//itemStyle和color都支持多级控制，
                        if(params.data){//因为color会纳入legend的索引中，因此通过判断是否有data来确定是否是serise.data中的多级控制需要的颜色
                            if(params.data[3] >40){//如果data第4个元素的值大于40就将点设置为红色
                                return 'red'
                            }else{
                                return 'green'
                            }

                        }

                    },

                }

            },
            large: true,//默认false，该属性会关闭echarts对每个点的细节渲染。当数据量较大时可以考虑关闭来提升性能
            largeThreshold:'10',//当large设置为true时这个属性才能使用，默认为2000.它用于控制当echarts渲染器中的点超过阈值时才开始隐藏细节
            data: [//data中的每个元素可以是数组也能是对象，但是每元素必须包含2个及以上的数值才可以
                {
                    value : [10, 25, 5]     //[xValue, yValue, rValue]，数组内依次为横值，纵值，大小(可选)
                },
                [12, 15, 1]
            ],

           /* data: [
                [5,5,10],
                [10,10,30]
            ]*/
        }
    ]
};

/**
 *饼图，环形图，兰丁格尔图等都是这个类型。
 * 兰丁格尔图尽量使用area面积模式，如果可以尽量少用兰丁格尔图，该图型造成的视觉误差较大
 */
option = {
    series : [
        {
            name:'访问来源',//和图例数组中的值对应
            type:'pie',//申明图表类型
            radius : '55%',//定义大小，当参数为数组是会呈现为圆环图['10%','50%'],也能接受固定值。计算公式为：min(width, height) / 2 * 75%，
            center: ['50%', '60%'],//控制饼图中心的位置，可以接受数值。计算公式为min(width, height) * 50%
            clockWise:false,//显示是否顺时针，饼图各区域的显示顺序是按data数组的顺序，顺时针显示的。echarts基于视觉美学建议将数组从大到小先排列。觉得麻烦可以无视，我就没觉得有多大差别
            // roseType:'area',//南丁格尔玫瑰图模式，接受值有两种：'radius'（半径） | 'area'（面积）
            selectedMode:'single',//选中模式，默认关闭，可选single，multiple，配合下面的selectedOffset可以在扇区被选中时从饼图中分离
            selectedOffset:10,//选中时的扇区偏移量
            startAngle:0,//开始角度, 饼图（90）、仪表盘（225），有效输入范围：[-360,360]，当部分数值占比很小时可以降低startAngle来优化视觉引导线的角度
            itemStyle:{//itemStyle中的borderWidth和barBorderColor用于控制扇区边框线和颜色，因为未知原因我的设置了没有效果
                normal:{
                    borderWidth:2,
                    barBorderColor:'white',
                    label:{//控制label的位置等样式
                        show: true,//是否显示
                        position:'outer'// 可选参数'outer'（外部） | 'inner'（内部）， 控制label在扇区内还是扇区外显示
                    },
                    labelLine:{//视觉引导线
                        show: true,//是否显示，一般position:'inner'时会设置隐藏引导线
                        length:10,//引导线的长度
                        lineStyle:{//设置线的样式
                            type:'solid'
                        }
                    }
                }
            },
            data:[//data中的元素同样支持对象，配合透明色可以做出半圆的效果
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'}
            ]
        }
    ]
};

/**
 * 仪表盘，和饼图类型，目前(echarts2)只支持单一指针，可以考虑使用多图嵌套来实现多指针效果
 */
option = {
    series : [
        {
            name:'业务指标',
            type:'gauge',//申明使用仪表盘类型
            startAngle:180,//仪表盘将垂直正上方的位置视为0度，startAngle和endAngle分别表示仪表盘的开始位置和结束位置
            endAngle:-90,
            min:50,//min，max，splitNumber 和直接坐标系中的axis差不多，分别定义最大，最小和分段数，取值范围为0到100，splitNumber没有限制，默认为10
            max:200,
            splitNumber:10,
            axisLine: {            // 坐标轴线
                show: true,        // 默认显示，属性show控制显示与否
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.2, 'lightgreen'],[0.4, 'orange'],[0.8, 'skyblue'],[1, '#ff4500']],//颜色数组中的第一个值表示仪表盘的颜色区域比例
                    width: 30//盘环的宽度
                }
            },
            axisTick: {            // 坐标轴小标记
                show: true,        // 属性show控制显示与否，默认不显示
                splitNumber: 5,    // 每份split细分多少段
                length :8,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: '#eee',
                    width: 1,
                    type: 'solid'
                }
            },
            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                show: true,
                formatter: function(v){//在指定的分段区域下方给定相应的文本提示
                    switch (v+''){
                        case '10': return '弱';
                        case '30': return '低';
                        case '60': return '中';
                        case '90': return '高';
                        default: return '';
                    }
                },
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    color: '#333'
                }
            },
            splitLine: {           // 分隔线
                show: true,        // 默认显示，属性show控制显示与否
                length :30,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: '#eee',
                    width: 2,
                    type: 'solid'
                }
            },
            pointer : {//设置仪表盘指针
                length : '80%',//设置指针长度，百分比相对的是仪表盘的外半径
                width : 8,//控制指针最宽处，
                color : 'auto'//控制指针颜色，可以为固定值，auto表示颜色随指针指向区域的颜色变化而变化
            },
            title : {//仪表盘标题
                show : true,//是否显示
                offsetCenter: ['-65%', -10],       // x, y，单位，px标题定位，数组为横纵相对仪表盘圆心坐标偏移，支持百分比（相对外半径），
                textStyle: {       // 其余属性默认使用全局文本样式，
                    color: '#333',
                    fontSize : 15
                }
            },
            detail : {//仪表盘详情，仪表盘可以在图里面定义一个区域实时显示指针指向区域的详细信息。这里就是用来定义它的样式的
                show : true,//show控制显示与否，
                backgroundColor: 'rgba(0,0,0,0)',//背景色
                borderWidth: 0,//边线宽度
                borderColor: '#ccc',//边框颜色
                width: 100,//文本框的宽度和高
                height: 40,
                offsetCenter: ['-60%', 10],       // x, y，文本框的相对位置，相对中心点
                formatter:'{value}%',//formatter方式
                textStyle: {       // 其余属性默认使用全局文本样式，
                    color: 'auto',//文本颜色，可以为固定值，auto表示颜色随指针指向区域的颜色变化而变化
                    fontSize : 30//文本大小
                }
            },
            data:[{value: 50, name: '完成率'}]
        }
    ]
};
/**
 * 漏斗图，和直接坐标系很像，可以通过x，y，x2，y2来控制图形位置，但是需要注意漏斗图默认的每组数据板块高度永远都是一致的。
 * 如果要定义不同的板块高度，只能通过多图拼接来实现
 */
option = {
    series : [
        {
            name:'漏斗图',
            type:'funnel',//图表类型
            width: '40%',//宽度
            sort:'none',//数据排序， 可以取ascending, descending。none表示不排序，这种情况可以显示出一些奇怪的图形，echarts 2.0官网文档中并没有给出这个值，原因未知
            gap:20,//各个板块间的间距
            data:[
                {value:60, name:'访问'},
                {value:40, name:'咨询'},
                {value:20, name:'订单'},
                {value:80, name:'点击'},
                {value:100, name:'展现'}
            ]
        }
    ]
}
/**
 * 地图，echarts所有图标中的扛把子，我系统学习echarts也是冲着它来的。
 * echarts的地图加载需要依赖web服务器。地图给人的感觉是高大上的，但是echarts已经帮我们做了细节封装。
 * 基础使用起来和普通图形差不多，感觉echarts最重要的部分应该还是在事件交互那一块。
 * roamController 缩放漫游组件仅对map类型的地图有效，但是在echarts 3版本后貌似取消了这个组件。这里直接忽略它
 */
/**
 *  这一段js代码就是一个最小化的地图初始化。js执行后会将武汉市的地图显示在div中
 */
var myChart = echarts.init( document.getElementById('main') );//配置地图显示在哪个dom中
var option ={
    series: [{
        type: 'map',//申明图表类型为地图
        mapType: '湖北|武汉市',//重点，mapType的默认参数为'china';默认情况下可以接受的参数为world，china和全国34个省市自治区。
        //如果想要加载市级地图需要使用‘子区域模式’，例如“湖北|武汉市”。它的原理是echarts默认加载的china-main-city-map.js中有一个全局变量
        //cityMap，当读到'武汉市'时，它对应的key为'420100'。此时echarts会加载对应名称的json文件。同事echarts支持svg的矢量格式，可以用来做自绘地图
        data:[
        ]
    }],
}
myChart.setOption(option);
/**
 *  这个option用来记录常见的配置参数
 */
var option = {
    series: [{
        name: 'mapSer',//映射图例legend中的值
        type: 'map',//申明图表类型
        roam: false,//是否开启滚轮缩放和拖拽漫游。默认为false（关闭），true（开启），'scale'（仅开启滚轮缩放），'move'（仅开启拖拽漫游）
        scaleLimit:{max:1, min:0.5},//当roam:true时有效，用于控制滚轮缩放的最大值和最小值
        selectedMode:'single',//选中模式，默认为null(关闭)；single(单选)，multiple(多选)。可以考虑在多选或单选时做相应的事件交互
        hoverable:'false',//当鼠标移入对应板块时出现高亮显示。默认为ture
        dataRangeHoverLink:'false',//是否启用值域漫游组件（dataRange）hover时的联动响应，默认开启
        nameMap:{'湖北':'hc'},//自定义地区的名称映射，使用场景很有限
        label: {//鼠标移入时的提示信息是否配置
            show: false,
        },
        data: data
    }]
}

/**
 * echarts中各基本图例在各个版本中的用法差不多，但是map和一些和map配套使用的组件改动较大。
 * 我入门使用的是echarts2，但是现在echarts4都出来了，3则是现在主流的版本。因此组件只做简介。
 * roamController 缩放漫游组件仅对map类型的地图有效，但是在echarts 3版本后貌似取消了这个组件。直接忽略它
 * dataRange  值域漫游组件，可以配合map和散点图使用。map在小型项目的使用场景并不多，因此我非常建议在散点图中使用该组件
 * toolbox 工具箱组件。所有组件中实用性最高的组件，其重点在于属性feature的设置。尤其是dataZoom和散点图的配合使用。
 * (因为早期我并不会使用散点图，但是了解散点图+lable+ataZoom后发现它的数据展现能力真的堪称最强)
 * dataView 数组缩放组件
 * dataView 数组试图组件
 *
 */
var option = {
    toolbox: {
        show : true,
        orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
                                   // 'horizontal' ¦ 'vertical'
        x: 'right',                // 水平安放位置，默认为全图右对齐，可选为：
                                   // 'center' ¦ 'left' ¦ 'right'
                                   // ¦ {number}（x坐标，单位px）
        y: 'top',                  // 垂直安放位置，默认为全图顶端，可选为：
                                   // 'top' ¦ 'bottom' ¦ 'center'
                                   // ¦ {number}（y坐标，单位px）
        color : ['#1e90ff','#22bb22','#4b0082','#d2691e'],
        backgroundColor: 'rgba(0,0,0,0)', // 工具箱背景颜色
        borderColor: '#ccc',       // 工具箱边框颜色
        borderWidth: 0,            // 工具箱边框线宽，单位px，默认为0（无边框）
        padding: 5,                // 工具箱内边距，单位px，默认各方向内边距为5，
        showTitle: true,
        feature : {//最重要的配置项，用于自定义工具箱中的内容
            mark : {//辅助线标志，不实用
                show : true,
                title : {
                    mark : '辅助线-开关',
                    markUndo : '辅助线-删除',
                    markClear : '辅助线-清空'
                },
                lineStyle : {
                    width : 1,
                    color : '#1e90ff',
                    type : 'dashed'
                }
            },
            dataZoom : {//数据发、缩放组件。单独使用在大规模数据中也非常合适
                show : true,
                title : {
                    dataZoom : '区域缩放',
                    dataZoomReset : '区域缩放-后退'
                }
            },
            dataView : {//数据视图组件。
                show : true,//是否显示
                title : '数据视图',//名称
                readOnly: true,//是否只读
                lang : ['数据视图', '关闭', '刷新'],//定义dataView中的三个话术的名称
                optionToContent: function(opt) {//定义数据视图的显示方式，可以通过动态拼接的方式来为视图添加样式。
                    var axisData = opt.xAxis[0].data;//数据视图的div默认会携带一个class.echarts-dataview.
                    var series = opt.series;//我们可以通过这份class数据动态给视图添加样式
                    var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                        + '<td>时间</td>'
                        + '<td>' + series[0].name + '</td>'
                        + '<td>' + series[1].name + '</td>'
                        + '</tr>';
                    for (var i = 0, l = axisData.length; i < l; i++) {
                        table += '<tr>'
                            + '<td>' + axisData[i] + '</td>'
                            + '<td>' + series[0].data[i] + '</td>'
                            + '<td>' + series[1].data[i] + '</td>'
                            + '</tr>';
                    }
                    table += '</tbody></table>';
                    return table;
                }
            },
            magicType: {//动态类型切换
                show : true,
                title : {
                    line : '动态类型切换-折线图',
                    bar : '动态类型切换-柱形图',
                    stack : '动态类型切换-堆积',
                    tiled : '动态类型切换-平铺'
                },
                type : ['line', 'bar', 'stack', 'tiled']
            },
            restore : {
                show : true,
                title : '还原',
                color : 'black'
            },
            saveAsImage : {
                show : true,
                title : '保存为图片',
                type : 'jpeg',
                lang : ['点击本地保存']
            },
            myTool : {
                show : true,
                title : '自定义扩展方法',
                icon : 'image://../asset/ico/favicon.png',//所有的工具箱中的图标都支持icon，可以自定义样式
                onclick : function (){//自定义功能回到。也能通过 echarts.setOption()来重新设置图表中的值
                    alert('myToolHandler')
                }
            }
        }
    },


}






