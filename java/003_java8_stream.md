## 一、stream是什么
stream 是java8中提供的一套对特定集合数据进行快速处理的API。所有实现了Collection接口的数据，还有数组都可以使用这个套API。它和lambada表达式结合可以大大提升编码效率。当需要对数据集合进行遍历、聚合操作时都可以考虑使用这套函数。
## 二、函数式接口和lambada表达式
    1. 什么是函数式接口 
        -只有一个抽象方法的接口，或者有使用default关键字修饰方法的接口。能使用@FunctionalInterface注解且编译器不报错的就是一个合法的函数式接口
2.常见的lambada表达式样本
```java
package com.example.demo.FunctionDemo;

/**
 * @auther hcy
 * @create 2019-11-07 10:42
 * @Description
 */
public class LambadaDemo {

    public static void main(String[] args) {
        //参数声明，类型一样时可以忽略类型。只有一个参数时可以省略包裹参数的（）。`->` 后面的就是实现接口的执行逻辑。
        create((a,b) -> a+b);
        create((String a,String b) -> a+b);
        //多行语句时需要使用`{}`将代码块包裹。单行语句时可以忽略`{}`和`;`
        create((a,b) -> {
            System.out.println(a + b );
            return  a+b;
        });
        //方法引用 `::`表示调用方法。build()方法为static，可以通过类名调用；build2()方法是非static的，只能通过实例化对象调用。
        create(LambadaDemo::build);
        create(new LambadaDemo()::build2);
        // 这个地方我没搞懂，create()方法需要接收一个MyInterface，为什么可以直接传入String.concat()方法
        // 通过调试发现，这个执行过程是create()先执行了LambadaDemo::build,然后又执行了String::concat。
        //当参数和返回值一致时就可以这样连续的链式调用。不建议这么写，不好理解
        String msg = create(String::concat);
        System.out.println( "msg---" + msg );
    }
    public static String create(MyInterface inter){
        System.out.println("1");
        return inter.build("hcy","ni hao");
    }
    public static String build(String name,String message){
        return name +"build"+ message ;
    }
    public String build2(String name,String message){
        return  name +"build2"+ message ;
    }
    @FunctionalInterface
    public interface MyInterface{
        String build(String name,String message);
    }
}
```
## 三、stream的相关操作
    1. stream在设计上有三大特点：1.自己不存储元素；2.不改变源对象；3.所有操作都是延迟执行的。
    2. stream的操作分为3个步骤：1.创建stream；2.中间操作；3.终止操作，在未调用终止操作前不会有结果返回。
常用api
| 方法 | 描述 | 操作类型 |
|----|----|----|
|map|将元素按指定的属性映射为多个map|中间操作|
|filter|过滤，按指定逻辑来过滤元素|中间操作|
|mapToInt|将元素按指定属性求和，对应的还有mapToLong、mapToDouble等|中间操作|
|sorted|排序|中间操作|
|peek|遍历流，和forEach差不多，区别是它不会结束流|中间操作|
|collect|采集数据返回一个新的结果，这个是一个非常牛B的函数|终值操作|
|forEach|遍历流|终值操作|
|toArray|将流转换为数组返回|终值操作|
所有的中间操作流返回的都是一个新的中间操作流，在未调用终值操作前所有的数据都不会被处理。示例代码：
```java
package com.example.demo.FunctionDemo;

import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @auther hcy
 * @create 2019-11-07 11:31
 * @Description
 */
public class StreamDemo {
    private static List<Apple> list = new ArrayList<>();

    static {
        list.add(new Apple(1,"red","湖北",500));
        list.add(new Apple(2,"red","湖北",400));
        list.add(new Apple(3,"green","湖南",300));
        list.add(new Apple(4,"green","上海",200));
        list.add(new Apple(5,"green","上海",700));
    }
    //湖北的苹果有多少
    @Test
    public void test1(){
        long sum =  list.stream().filter(a -> Objects.equals("湖北",a.getOrigin())).mapToInt(a -> a.getWeight()).sum();
        System.out.println( sum );
    }
    //各个城市最大的苹果是多少
    @Test
    public void test2(){
        list.stream().collect( Collectors.groupingBy( a -> a.getOrigin(),Collectors.maxBy(new Comparator<Apple>() {
            @Override
            public int compare(Apple o1, Apple o2) {
                return o1.getWeight()-o2.getWeight();
            }
        }) ) ).forEach( (k,v) -> System.out.println( k + ":" + v ) );
    }
    //所有苹果中最大的是多少
    @Test
    public void test3(){
        Apple a = list.stream().max(new Comparator<Apple>() {
            @Override
            public int compare(Apple o1, Apple o2) {
                return o1.getWeight()-o2.getWeight();
            }
        }).get();
        System.out.println( a.toString() );
    }
    //各个城市各有多少苹果
    @Test
    public void test4(){
        list.stream().collect( Collectors.groupingBy( a -> a.getOrigin(),Collectors.summingInt( a ->a.getWeight()) ) ).forEach( (k,v) -> System.out.println( k + ":" + v ) );
    }
}
```
